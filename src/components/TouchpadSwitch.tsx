import { useLayoutEffect, useRef } from "preact/hooks";

// Same geometry and warm-up as the prototype checked on the owner's iOS 26.6.2.
const WIDTH = 2048;
const HEIGHT = 1024;
const TRACKING_MS = 240;

type Props = {
  enabled: boolean;
  onStart: (id: number, x: number, y: number) => boolean;
  onMove: (id: number, x: number, y: number) => number;
  onEnd: (id: number) => void;
  onCancel: (id: number) => void;
};

/** Native touch ownership is required for Safari's drag haptics; never simulate a click. */
export function TouchpadSwitch({ enabled, onStart, onMove, onEnd, onCancel }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const current = useRef<{ id: number; started: number; high: boolean } | undefined>(undefined);
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const reset = () => {
    clearTimeout(resetTimer.current);
    current.current = undefined;
    if (input.current) input.current.style.transform = "";
  };

  useLayoutEffect(() => {
    if (!enabled) reset();
    window.addEventListener("blur", reset);
    const onHidden = () => { if (document.hidden) reset(); };
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      reset();
      window.removeEventListener("blur", reset);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [enabled]);

  const position = (x: number, y: number, high: boolean) => {
    const element = input.current!;
    const box = element.parentElement!.getBoundingClientRect();
    element.style.transform = `translate(${x - box.left - box.width / 2 - WIDTH * (high ? .8 : .2)}px, ${y - box.top - box.height / 2 - HEIGHT / 2}px)`;
  };

  const stopPointerCopy = (event: PointerEvent) => {
    // Touch events own the native path. Mouse users retain the ordinary pointer path.
    if (event.pointerType !== "mouse") event.stopPropagation();
  };

  const finish = (event: TouchEvent, cancelled: boolean) => {
    const gesture = current.current;
    if (!gesture || Array.from(event.touches).some((touch) => touch.identifier === gesture.id)) return;
    current.current = undefined;
    if (cancelled) onCancel(gesture.id);
    else onEnd(gesture.id);
    // Let WebKit finish the original touchend before restoring the idle hit area.
    resetTimer.current = setTimeout(() => {
      if (!current.current && input.current) input.current.style.transform = "";
    }, 0);
  };

  return (
    <input ref={input} class="touchpad-switch" type="checkbox" {...{ switch: "" }}
      aria-hidden="true" tabIndex={-1} disabled={!enabled}
      onPointerDown={stopPointerCopy} onPointerMove={stopPointerCopy}
      onPointerUp={stopPointerCopy} onPointerCancel={stopPointerCopy}
      onLostPointerCapture={stopPointerCopy}
      onTouchStart={(event) => {
        if (!enabled || current.current || event.touches.length !== 1) return;
        const touch = event.changedTouches[0];
        if (!touch || !onStart(touch.identifier, touch.clientX, touch.clientY)) return;
        clearTimeout(resetTimer.current);
        input.current!.checked = false;
        current.current = { id: touch.identifier, started: performance.now(), high: false };
        position(touch.clientX, touch.clientY, false);
      }}
      onTouchMove={(event) => {
        const gesture = current.current;
        if (!enabled || !gesture) return;
        const touch = Array.from(event.touches).find((touch) => touch.identifier === gesture.id);
        if (!touch) return;
        const steps = onMove(gesture.id, touch.clientX, touch.clientY);
        // Navigation is immediate. Only haptic geometry waits for native touch tracking.
        if (performance.now() - gesture.started < TRACKING_MS) return;
        if (steps) gesture.high = !gesture.high;
        position(touch.clientX, touch.clientY, gesture.high);
      }}
      onTouchEnd={(event) => finish(event, false)}
      onTouchCancel={(event) => finish(event, true)}
      onClick={(event) => event.stopPropagation()}
    />
  );
}
