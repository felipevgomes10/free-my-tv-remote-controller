/** The messages between the page and the Home's bridge; `protocol/README.md` is their contract. */

export const PROTOCOL_VERSION = 1;

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
  | "power";

export type KeyAction = "press" | "hold-start" | "hold-end";

export type Hello = { type: "hello"; protocol: number; credential: string };
export type KeyMessage = { type: "key"; id: number; key: Key; action: KeyAction };
export type PageMessage = Hello | KeyMessage;

export type State = { type: "state"; state: "ready"; tvName: string };
export type Ack = { type: "ack"; id: number };
export type BridgeMessage = State | Ack;
