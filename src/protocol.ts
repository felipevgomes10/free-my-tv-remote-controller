/** The messages between the page and the Home's bridge; `protocol/README.md` is their contract. */

export const PROTOCOL_VERSION = 2;

export type Key =
  | "up"
  | "down"
  | "left"
  | "right"
  | "ok"
  | "back"
  | "home"
  | "play-pause"
  | "volume-up"
  | "volume-down"
  | "mute"
  | "power"
  | "wake";

export type KeyAction = "press" | "hold-start" | "hold-end";

/** What the Home can list for the companion features (ADR 0006). */
export type ListName = "shortcuts" | "open-apps" | "inputs" | "apps" | "up-next" | "trending";

export type Hello = { type: "hello"; protocol: number; credential: string };
export type KeyMessage = { type: "key"; id: number; key: Key; action: KeyAction };
/** A request the Home answers by its `id`; each companion feature adds its fields. */
export type Request = { type: "list"; of: ListName } | { type: string; [field: string]: unknown };
export type PageMessage = Hello | KeyMessage | (Request & { id: number });

export type BridgeState = "ready" | "not-linked" | "revoked";
export type State = { type: "state"; state: BridgeState; tvName: string };
export type Reload = { type: "reload"; protocol: number };
export type Ack = { type: "ack"; id: number };
/** A list, answering a request (with its `id`) or pushed again because it changed (without one). */
export type ListMessage = { type: "list"; id?: number; of: ListName; items: unknown[] };
export type Done = { type: "done"; id: number };
export type Failed = { type: "failed"; id: number; reason: string };
/** Any answer to a request: these, or a feature's own (`search-results`, `title`…), always with the request's `id`. */
export type Answer = { type: string; id: number; [field: string]: unknown };
export type BridgeMessage = State | Reload | Ack | ListMessage | Done | Failed | Answer;
