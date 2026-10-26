import { useMemo, useRef, useState } from "preact/hooks";
import { type Direction, TouchpadGestures } from "../gestures";
import { tick } from "../haptics";
import type { Key, KeyAction } from "../protocol";

type Light = { x: number; y: number; trail?: Direction };

export function Touchpad({ send, enabled = true }: { send: (key: Key, action: KeyAction) => void; enabled?: boolean }) {
  const surface = useRef<HTMLDivElement>(null);
  const [light, setLight] = useState<Light>();
  const [used, setUsed] = useState(false);
  const touching = useRef(false);

  const gestures = useMemo(
    () =>
      new TouchpadGestures({
        key: (key, action) => {
          tick();
          send(key, action);
        },
        step: (trail) => setLight((current) => current && { ...current, trail }),
      }),
    [send],
  );

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
        if (!enabled) return;
        surface.current!.setPointerCapture?.(event.pointerId);
        const p = at(event);
        touching.current = true;
        setUsed(true);
        setLight(p);
        gestures.down(p.x, p.y);
      }}
      onPointerMove={(event) => {
        if (!touching.current) return;
        const p = at(event);
        setLight((current) => current && { ...current, ...p });
        gestures.move(p.x, p.y);
      }}
      onPointerUp={() => {
        touching.current = false;
        gestures.up();
        setLight(undefined);
      }}
      onPointerCancel={() => {
        touching.current = false;
        gestures.cancel();
        setLight(undefined);
      }}
    >
      {light && (
        <>
          {light.trail && (
            <span class={`touchpad-trail trail-${light.trail}`} style={{ left: `${light.x}px`, top: `${light.y}px` }} />
          )}
          <span class="touchpad-light" style={{ left: `${light.x}px`, top: `${light.y}px` }} />
        </>
      )}
      {!used && enabled && <p class="touchpad-hint">Deslize para mover. Toque para OK.</p>}
    </div>
  );
}
