import {
  type Answer,
  type BridgeMessage,
  type BridgeState,
  type Key,
  type KeyAction,
  type ListName,
  type PageMessage,
  PROTOCOL_VERSION,
  type Request,
} from "./protocol";

/** How long a request waits for the Home's answer before it is told it failed. */
export const REQUEST_TIMEOUT_MS = 5000;

export type BridgeEvents = {
  onState: (state: BridgeState, tvName: string) => void;
  /** The bridge asked for a newer page. */
  onReload: () => void;
  /** The connection couldn't be made, or was lost. */
  onClosed: () => void;
  /** A list the Home sent, as an answer or because it changed. */
  onList?: (of: ListName, items: unknown[]) => void;
};

export type Bridge = {
  /** Sends a key if the bridge is ready; otherwise drops it and returns false, never queueing it for later. */
  sendKey: (key: Key, action: KeyAction) => boolean;
  /**
   * Asks the Home something (ADR 0006). Resolves with its answer; rejects when the bridge isn't
   * ready, when the connection is lost, or after REQUEST_TIMEOUT_MS without an answer.
   */
  request: (request: Request) => Promise<Answer>;
  close: () => void;
};

export class RequestFailed extends Error {
  constructor(readonly reason: string) {
    super(reason);
  }
}

/** The page's side of one connection to the Home's bridge. */
export function connectBridge(url: string, credential: string, events: BridgeEvents): Bridge {
  const socket = new WebSocket(url);
  const pending = new Map<number, { resolve: (answer: Answer) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();
  let ready = false;
  let closed = false;
  let nextId = 1;

  const send = (message: PageMessage) => socket.send(JSON.stringify(message));

  const settle = (id: number) => {
    const waiting = pending.get(id);
    if (waiting) {
      clearTimeout(waiting.timer);
      pending.delete(id);
    }
    return waiting;
  };

  const failAll = (reason: string) => {
    for (const id of [...pending.keys()]) settle(id)?.reject(new RequestFailed(reason));
  };

  socket.addEventListener("open", () => send({ type: "hello", protocol: PROTOCOL_VERSION, credential }));
  socket.addEventListener("message", (event) => {
    const message = parse(event.data);
    if (!message) return;
    if (message.type === "state") {
      const { state, tvName } = message as { state: BridgeState; tvName: string };
      ready = state === "ready";
      if (!ready) failAll(state);
      events.onState(state, tvName);
      return;
    }
    if (message.type === "reload") return events.onReload();
    if (message.type === "list") {
      const { of, items } = message as { of: ListName; items: unknown[] };
      events.onList?.(of, items);
    }
    const id = (message as { id?: unknown }).id;
    if (typeof id !== "number" || message.type === "ack") return;
    const waiting = settle(id);
    if (!waiting) return;
    if (message.type === "failed") waiting.reject(new RequestFailed(String((message as { reason?: unknown }).reason ?? "failed")));
    else waiting.resolve(message as Answer);
  });
  socket.addEventListener("close", () => {
    ready = false;
    failAll("closed");
    if (!closed) events.onClosed();
  });

  return {
    sendKey(key, action) {
      if (!ready || socket.readyState !== WebSocket.OPEN) return false;
      send({ type: "key", id: nextId++, key, action });
      return true;
    },
    request(request) {
      if (!ready || socket.readyState !== WebSocket.OPEN) return Promise.reject(new RequestFailed("not-ready"));
      const id = nextId++;
      return new Promise<Answer>((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(new RequestFailed("timeout"));
        }, REQUEST_TIMEOUT_MS);
        pending.set(id, { resolve, reject, timer });
        send({ ...request, id } as PageMessage);
      });
    },
    close() {
      closed = true;
      ready = false;
      failAll("closed");
      socket.close();
    },
  };
}

function parse(data: unknown): BridgeMessage | undefined {
  if (typeof data !== "string") return undefined;
  try {
    const message = JSON.parse(data);
    return message && typeof message.type === "string" ? (message as BridgeMessage) : undefined;
  } catch {
    return undefined;
  }
}

/** The bridge lives on the same address that served the page. */
export function bridgeUrl(location: Location): string {
  const scheme = location.protocol === "https:" ? "wss:" : "ws:";
  return `${scheme}//${location.host}/remote`;
}
