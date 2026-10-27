import type { ComponentChildren } from "preact";
import { useLayoutEffect, useRef } from "preact/hooks";
import { capture } from "../capture";
import { tick } from "../haptics";
import { HapticFeedback } from "./HapticFeedback";
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
  disabled?: boolean;
};

export function RemoteButton({ label, keyName, behaviour = "press", send, class: className, children, disabled = false }: Props) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const holding = useRef(false);
  const down = useRef(false);
  const pointer = useRef<number | undefined>(undefined);
  const pointerClick = useRef(false);

  const stop = () => {
    clearTimeout(timer.current);
    clearInterval(timer.current);
  };

  const emit = (action: KeyAction) => {
    tick();
    send(keyName, action);
  };

  const onPointerDown = (event: PointerEvent) => {
    const button = event.currentTarget as HTMLButtonElement;
    if (button.matches(":disabled") || down.current || event.button > 0) return;
    capture(event.target as Element, event.pointerId);
    pointerClick.current = true;
    pointer.current = event.pointerId;
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

  const onPointerUp = (event: PointerEvent) => {
    if (!down.current || pointer.current !== event.pointerId) return;
    down.current = false;
    stop();
    if (behaviour === "repeat") return;
    if (holding.current) emit("hold-end");
    else emit("press");
  };

  const cancel = () => {
    if (!down.current) return;
    down.current = false;
    stop();
    if (holding.current) emit("hold-end");
    holding.current = false;
  };

  useLayoutEffect(() => {
    if (disabled) cancel();
    const onHidden = () => { if (document.hidden) cancel(); };
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      cancel();
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [disabled, send, keyName]);

  return (
    <button
      type="button"
      class={className ?? "round-button"}
      aria-label={label}
      disabled={disabled}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={(event) => { if (pointer.current === event.pointerId) cancel(); }}
      onLostPointerCapture={(event) => { if (pointer.current === event.pointerId) cancel(); }}
      onClick={(event) => {
        const fromPointer = pointerClick.current;
        pointerClick.current = false;
        if (event.detail === 0 && !fromPointer && !(event.currentTarget as HTMLButtonElement).matches(":disabled")) emit("press");
      }}
      onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") pointerClick.current = false; }}
      onContextMenu={(event) => event.preventDefault()}
    >
      {children}
      <HapticFeedback disabled={disabled} />
    </button>
  );
}
