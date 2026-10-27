import { useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { TouchpadGestures } from "../gestures";
import { capture } from "../capture";
import { hasNativeSwitchHaptics, tick } from "../haptics";
import { TouchpadSwitch } from "./TouchpadSwitch";
import type { Key, KeyAction } from "../protocol";

type Point = { x: number; y: number };

export function Touchpad({ send, enabled = true }: { send: (key: Key, action: KeyAction) => void; enabled?: boolean }) {
  const surface = useRef<HTMLDivElement>(null);
  const [light, setLight] = useState<Point>();
  const [used, setUsed] = useState(false);
  const touching = useRef<number | undefined>(undefined);

  const gestures = useMemo(
    () =>
      new TouchpadGestures({
        key: (key, action) => {
          tick();
          send(key, action);
        },
      }),
    [send],
  );

  useLayoutEffect(() => {
    const interrupt = () => {
      touching.current = undefined;
      gestures.cancel();
      setLight(undefined);
    };
    const onHidden = () => { if (document.hidden) interrupt(); };
    if (!enabled) {
      touching.current = undefined;
      gestures.cancel();
      setLight(undefined);
    }
    window.addEventListener("blur", interrupt);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      touching.current = undefined;
      gestures.cancel();
      window.removeEventListener("blur", interrupt);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [enabled, gestures]);

  const at = (x: number, y: number) => {
    const box = surface.current!.getBoundingClientRect();
    return { x: x - box.left, y: y - box.top };
  };

  const start = (id: number, x: number, y: number) => {
    if (!enabled || touching.current !== undefined) return false;
    const p = at(x, y);
    touching.current = id;
    setUsed(true);
    setLight(p);
    gestures.down(p.x, p.y);
    return true;
  };
  const move = (id: number, x: number, y: number) => {
    if (!enabled || touching.current !== id) return 0;
    const p = at(x, y);
    setLight(p);
    return gestures.move(p.x, p.y);
  };
  const end = (id: number, cancelled = false) => {
    if (touching.current !== id) return;
    touching.current = undefined;
    if (cancelled) gestures.cancel();
    else gestures.up();
    setLight(undefined);
  };

  return (
    <div
      ref={surface}
      class={`touchpad${enabled ? "" : " disabled"}`}
      role="application"
      aria-disabled={!enabled}
      aria-label="Área de toque: deslize para mover, toque para OK"
      onPointerDown={(event) => {
        if (start(event.pointerId, event.clientX, event.clientY)) capture(event.target as Element, event.pointerId);
      }}
      onPointerMove={(event) => {
        move(event.pointerId, event.clientX, event.clientY);
      }}
      onPointerUp={(event) => {
        end(event.pointerId);
      }}
      onPointerCancel={(event) => {
        end(event.pointerId, true);
      }}
      onLostPointerCapture={(event) => {
        end(event.pointerId, true);
      }}
    >
      {light && <span class="touchpad-light" aria-hidden="true" style={{ left: `${light.x}px`, top: `${light.y}px` }} />}
      {!used && enabled && <p class="touchpad-hint">Deslize para mover. Toque para OK.</p>}
      {hasNativeSwitchHaptics() && <TouchpadSwitch enabled={enabled} onStart={start} onMove={move}
        onEnd={(id) => end(id)} onCancel={(id) => end(id, true)} />}
    </div>
  );
}
