import type { Key, KeyAction } from "./protocol";

/** How far a finger may drift before a touch stops being a tap or a hold. */
export const SLOP_PX = 10;
/** Each this many pixels of a swipe move the TV's focus one more step. */
export const STEP_PX = 48;
/** Touching still for this long is holding OK. */
export const HOLD_MS = 450;

export type Direction = "up" | "down" | "left" | "right";

export type TouchpadOutput = {
  key: (key: Key, action: KeyAction) => void;
};

/**
 * Turns one finger on the Touchpad into keys: a tap presses OK, touching still
 * holds OK, and a swipe moves the focus one step per STEP_PX along its main axis.
 */
export class TouchpadGestures {
  private start: { x: number; y: number } | undefined;
  private origin = { x: 0, y: 0 };
  private moved = false;
  private holding = false;
  private holdTimer: ReturnType<typeof setTimeout> | undefined;

  constructor(private readonly output: TouchpadOutput) {}

  down(x: number, y: number) {
    this.cancel();
    this.start = { x, y };
    this.origin = { x, y };
    this.holdTimer = setTimeout(() => {
      this.holding = true;
      this.output.key("ok", "hold-start");
    }, HOLD_MS);
  }

  move(x: number, y: number) {
    if (!this.start || this.holding) return;
    if (!this.moved && Math.hypot(x - this.start.x, y - this.start.y) < SLOP_PX) return;
    if (!this.moved) {
      this.moved = true;
      clearTimeout(this.holdTimer);
    }
    for (;;) {
      const dx = x - this.origin.x;
      const dy = y - this.origin.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < STEP_PX) return;
      const direction: Direction =
        Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up";
      if (direction === "right" || direction === "left") this.origin.x += Math.sign(dx) * STEP_PX;
      else this.origin.y += Math.sign(dy) * STEP_PX;
      this.output.key(direction, "press");
    }
  }

  up() {
    if (!this.start) return;
    if (this.holding) this.output.key("ok", "hold-end");
    else if (!this.moved) this.output.key("ok", "press");
    this.holding = false;
    this.cancel();
  }

  /** The touch was taken away (another gesture, the app hidden): end a hold, press nothing. */
  cancel() {
    clearTimeout(this.holdTimer);
    if (this.holding) this.output.key("ok", "hold-end");
    this.start = undefined;
    this.moved = false;
    this.holding = false;
  }
}
