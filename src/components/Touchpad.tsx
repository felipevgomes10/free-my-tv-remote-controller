import { useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { TouchpadGestures } from "../gestures";
import { capture } from "../capture";
import { tick } from "../haptics";
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
    if (!enabled) {
      touching.current = undefined;
      gestures.cancel();
      setLight(undefined);
    }
    return () => {
      touching.current = undefined;
      gestures.cancel();
    };
  }, [enabled, gestures]);

  const at = (event: PointerEvent) => {
    const box = surface.current!.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  };

  return (
    <div
      ref={surface}
      class={`touchpad${enabled ? "" : " disabled"}`}
      role="application"
      aria-disabled={!enabled}
      aria-label="Área de toque: deslize para mover, toque para OK"
      onPointerDown={(event) => {
        if (!enabled || touching.current !== undefined) return;
        capture(surface.current!, event.pointerId);
        const p = at(event);
        touching.current = event.pointerId;
        setUsed(true);
        setLight(p);
        gestures.down(p.x, p.y);
      }}
      onPointerMove={(event) => {
        if (touching.current !== event.pointerId) return;
        const p = at(event);
        setLight(p);
        gestures.move(p.x, p.y);
      }}
      onPointerUp={(event) => {
        if (touching.current !== event.pointerId) return;
        touching.current = undefined;
        gestures.up();
        setLight(undefined);
      }}
      onPointerCancel={(event) => {
        if (touching.current !== event.pointerId) return;
        touching.current = undefined;
        gestures.cancel();
        setLight(undefined);
      }}
      onLostPointerCapture={(event) => {
        if (touching.current !== event.pointerId) return;
        touching.current = undefined;
        gestures.cancel();
        setLight(undefined);
      }}
    >
      {light && <span class="touchpad-light" aria-hidden="true" style={{ left: `${light.x}px`, top: `${light.y}px` }} />}
      {!used && enabled && <p class="touchpad-hint">Deslize para mover. Toque para OK.</p>}
    </div>
  );
}
