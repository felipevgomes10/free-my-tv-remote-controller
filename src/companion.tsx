import { createContext } from "preact";
import { useCallback, useContext, useEffect, useRef, useState } from "preact/hooks";
import { RequestFailed } from "./bridge";
import type { Status } from "./connection";
import type { Answer, ListName, Request } from "./protocol";

/** What the companion features share: the connection's state, the Home's lists, and a way to ask it (ADR 0006). */
export type Companion = {
  status: Status;
  lists: Partial<Record<ListName, unknown[]>>;
  request: (request: Request) => Promise<Answer>;
};

export const CompanionContext = createContext<Companion>({
  status: "connecting",
  lists: {},
  request: () => Promise.reject(new RequestFailed("not-ready")),
});

export const useCompanion = () => useContext(CompanionContext);

/** One of the Home's lists: asked for each time the bridge becomes ready, then kept current by its pushes. */
export function useList<T>(of: ListName): T[] | undefined {
  const { status, lists, request } = useCompanion();
  useEffect(() => {
    if (status === "ready") request({ type: "list", of }).catch(() => {});
  }, [status, of, request]);
  return lists[of] as T[] | undefined;
}

/** How long a failed action stays marked. */
export const FAILED_MARK_MS = 2500;

/**
 * Runs actions on the TV (an `open`, a `close-app`…) and remembers, by key, which are on their way
 * and which just failed, so a tile can show the TV is doing it and never be tapped twice.
 */
export function useActions() {
  const { request } = useCompanion();
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [failed, setFailed] = useState<Set<string>>(new Set());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const change = (set: (update: (current: Set<string>) => Set<string>) => void, key: string, on: boolean) =>
    set((current) => {
      const next = new Set(current);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });

  const run = useCallback(
    async (key: string, message: Request): Promise<boolean> => {
      if (busy.has(key)) return false;
      change(setBusy, key, true);
      change(setFailed, key, false);
      try {
        await request(message);
        return true;
      } catch {
        change(setFailed, key, true);
        clearTimeout(timers.current.get(key));
        timers.current.set(key, setTimeout(() => change(setFailed, key, false), FAILED_MARK_MS));
        return false;
      } finally {
        change(setBusy, key, false);
      }
    },
    [request, busy],
  );

  return { run, busy, failed };
}
