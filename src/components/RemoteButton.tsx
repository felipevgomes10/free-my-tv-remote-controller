import type { ComponentChildren } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { tick } from "../haptics";
import type { Key, KeyAction } from "../protocol";

export const BUTTON_HOLD_MS = 500;
export const REPEAT_DELAY_MS = 400;
export const REPEAT_EVERY_MS = 120;

/**
 * How a button behaves under the finger:
 * - press: one press when released over it.
 * - hold: a press, or hold-start and hold-end when held, as Home on the Remote.
 * - repeat: presses while held, as volume on the Remote.
 */
export type Behaviour = "press" | "hold" | "repeat";

type Props = {
  label: string;
  keyName: Key;
  behaviour?: Behaviour;
  send: (key: Key, action: KeyAction) => void;
  class?: string;
  children: ComponentChildren;
};

export function RemoteButton({ label, keyName, behaviour = "press", send, class: className, children }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const holding = useRef(false);
  const down = useRef(false);

  const stop = () => {
    clearTimeout(timer.current);
    clearInterval(timer.current);
  };
  useEffect(() => stop, []);

  const emit = (action: KeyAction) => {
    tick();
    send(keyName, action);
  };

  const onPointerDown = (event: PointerEvent) => {
    const button = event.currentTarget as HTMLButtonElement;
    if (button.matches(":disabled")) return;
    button.setPointerCapture?.(event.pointerId);
    down.current = true;
    holding.current = false;
    if (behaviour === "repeat") {
      emit("press");
      timer.current = setTimeout(() => {
        timer.current = setInterval(() => emit("press"), REPEAT_EVERY_MS);
      }, REPEAT_DELAY_MS);
    } else if (behaviour === "hold") {
      timer.current = setTimeout(() => {
        holding.current = true;
        emit("hold-start");
      }, BUTTON_HOLD_MS);
    }
  };

  const onPointerUp = () => {
    if (!down.current) return;
    down.current = false;
    stop();
    if (behaviour === "repeat") return;
    if (holding.current) emit("hold-end");
    else emit("press");
  };

  const onPointerCancel = () => {
    if (!down.current) return;
    down.current = false;
    stop();
    if (holding.current) emit("hold-end");
  };

  return (
    <button
      type="button"
      class={className ?? "round-button"}
      aria-label={label}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
    </button>
  );
}
