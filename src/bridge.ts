import { PROTOCOL_VERSION, type BridgeMessage, type Key, type KeyAction, type PageMessage } from "./protocol";

export type BridgeEvents = {
  onReady: (tvName: string) => void;
  onClosed: () => void;
};

export type Bridge = {
  /** Sends a key if the bridge is ready; otherwise drops it and returns false, never queueing it for later. */
  sendKey: (key: Key, action: KeyAction) => boolean;
  close: () => void;
};

/** The page's side of one connection to the Home's bridge. */
export function connectBridge(url: string, credential: string, events: BridgeEvents): Bridge {
  const socket = new WebSocket(url);
  let ready = false;
  let nextId = 1;

  const send = (message: PageMessage) => socket.send(JSON.stringify(message));

  socket.addEventListener("open", () => send({ type: "hello", protocol: PROTOCOL_VERSION, credential }));
  socket.addEventListener("message", (event) => {
    const message = parse(event.data);
    if (message?.type === "state" && message.state === "ready") {
      ready = true;
      events.onReady(message.tvName);
    }
  });
  socket.addEventListener("close", () => {
    ready = false;
    events.onClosed();
  });

  return {
    sendKey(key, action) {
      if (!ready || socket.readyState !== WebSocket.OPEN) return false;
      send({ type: "key", id: nextId++, key, action });
      return true;
    },
    close: () => socket.close(),
  };
}

function parse(data: unknown): BridgeMessage | undefined {
  if (typeof data !== "string") return undefined;
  try {
    return JSON.parse(data) as BridgeMessage;
  } catch {
    return undefined;
  }
}

/** The bridge lives on the same address that served the page. */
export function bridgeUrl(location: Location): string {
  const scheme = location.protocol === "https:" ? "wss:" : "ws:";
  return `${scheme}//${location.host}/remote`;
}
