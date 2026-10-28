import { useCallback, useEffect, useRef, useState } from "preact/hooks";
import { type Bridge, connectBridge, RequestFailed } from "./bridge";
import { type Answer, type Key, type KeyAction, type ListName, PROTOCOL_VERSION, type Request } from "./protocol";
import { loadTvName, saveTvName } from "./storage";

export type Status =
  | "connecting"
  | "ready"
  | "out-of-reach"
  | "turning-on"
  | "turn-on-failed"
  | "not-linked"
  | "revoked";

/** Waits between tries to reach the bridge again, growing up to the last one. */
export const RECONNECT_DELAYS_MS = [1000, 2000, 4000, 5000];
/** Let a previously working connection return from phone suspension before showing an outage. */
export const RESUME_TIMEOUT_MS = 2000;
/** How long "Tentar ligar a TV" waits for the bridge before saying the TV didn't answer. */
export const TURN_ON_TIMEOUT_MS = 5000;

const RELOADED_FOR = "fmtv-controller.reloaded-for";

/** How the page reloads itself; tests watch it, since jsdom can't reload. */
export const page = { reload: () => location.reload() };

/**
 * Keeps one connection to the bridge for as long as the page is open: tries
 * again by itself when it's lost, and never queues keys while it is.
 */
export function useConnection(url: string, credential: string) {
  const [status, setStatus] = useState<Status>("connecting");
  const [tvName, setTvName] = useState(loadTvName);
  /** The Home's lists, as last answered or pushed on this connection. */
  const [lists, setLists] = useState<Partial<Record<ListName, unknown[]>>>({});
  const current = useRef<Status>("connecting");
  const bridge = useRef<Bridge>(undefined);
  const retry = useRef<ReturnType<typeof setTimeout>>(undefined);
  const turnOn = useRef<ReturnType<typeof setTimeout>>(undefined);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const suspended = useRef(false);
  const resuming = useRef(false);
  const attempt = useRef(0);
  const waking = useRef(false);
  const stopped = useRef(false);

  const set = (next: Status) => {
    current.current = next;
    setStatus(next);
  };

  const connect = useCallback(() => {
    clearTimeout(retry.current);
    bridge.current?.close();
    if (stopped.current) return;
    bridge.current = connectBridge(url, credential, {
      onState(state, name) {
        clearTimeout(resumeTimer.current);
        resuming.current = false;
        if (state !== "ready" || document.visibilityState === "visible") suspended.current = false;
        setTvName(name);
        saveTvName(name);
        if (state === "ready") {
          attempt.current = 0;
          clearTimeout(turnOn.current);
          forgetReload();
          if (waking.current) {
            waking.current = false;
            bridge.current?.sendKey("wake", "press");
          }
        }
        set(state);
      },
      onReload() {
        clearTimeout(resumeTimer.current);
        suspended.current = false;
        resuming.current = false;
        if (reloadOnce()) return;
        bridge.current?.close();
        set("out-of-reach");
      },
      onList(of, items) {
        setLists((lists) => ({ ...lists, [of]: items }));
      },
      onClosed() {
        if (current.current === "revoked") return;
        if (suspended.current || resuming.current) set("connecting");
        else if (current.current !== "turning-on" && current.current !== "turn-on-failed") set("out-of-reach");
        if (suspended.current && document.visibilityState === "hidden") return;
        const delay = RECONNECT_DELAYS_MS[Math.min(attempt.current, RECONNECT_DELAYS_MS.length - 1)];
        attempt.current++;
        retry.current = setTimeout(() => {
          if (current.current !== "revoked") connect();
        }, delay);
      },
    });
  }, [url, credential]);

  useEffect(() => {
    stopped.current = false;
    connect();
    // A suspended socket may still look open. Revalidate it immediately on return,
    // keeping the controls in place, disabled, during a short reconnection window.
    const onVisible = () => {
      if (document.visibilityState === "hidden") {
        suspended.current = suspended.current || current.current === "ready" || resuming.current;
        if (suspended.current) {
          clearTimeout(retry.current);
          clearTimeout(resumeTimer.current);
          resuming.current = false;
        }
        return;
      }
      if (suspended.current) {
        suspended.current = false;
        resuming.current = true;
        set("connecting");
        resumeTimer.current = setTimeout(() => {
          resuming.current = false;
          if (current.current === "connecting") set("out-of-reach");
        }, RESUME_TIMEOUT_MS);
        attempt.current = 0;
        connect();
        return;
      }
      if (current.current === "out-of-reach" || current.current === "turn-on-failed") {
        attempt.current = 0;
        connect();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped.current = true;
      document.removeEventListener("visibilitychange", onVisible);
      clearTimeout(retry.current);
      clearTimeout(turnOn.current);
      clearTimeout(resumeTimer.current);
      bridge.current?.close();
    };
  }, [connect]);

  const send = useCallback((key: Key, action: KeyAction) => {
    bridge.current?.sendKey(key, action);
  }, []);

  /** Best-effort: if the bridge answers within TURN_ON_TIMEOUT_MS, sends `wake`, which never turns a TV off. */
  const tryTurnOn = useCallback(() => {
    waking.current = true;
    set("turning-on");
    attempt.current = 0;
    connect();
    clearTimeout(turnOn.current);
    turnOn.current = setTimeout(() => {
      waking.current = false;
      if (current.current === "turning-on") set("turn-on-failed");
    }, TURN_ON_TIMEOUT_MS);
  }, [connect]);

  const request = useCallback(
    (message: Request): Promise<Answer> => bridge.current?.request(message) ?? Promise.reject(new RequestFailed("not-ready")),
    [],
  );

  return { status, tvName, send, tryTurnOn, lists, request };
}

/** Reloads once for a newer page; returns false if this page already did, so it never loops. */
function reloadOnce(): boolean {
  try {
    if (sessionStorage.getItem(RELOADED_FOR) === String(PROTOCOL_VERSION)) return false;
    sessionStorage.setItem(RELOADED_FOR, String(PROTOCOL_VERSION));
  } catch {
    return false;
  }
  page.reload();
  return true;
}

function forgetReload() {
  try {
    sessionStorage.removeItem(RELOADED_FOR);
  } catch {
    // Nothing kept.
  }
}
