import { useLayoutEffect, useMemo, useRef, useState } from "preact/hooks";
import { TouchpadGestures } from "../gestures";
import { capture } from "../capture";
import { tick } from "../haptics";
import type { Key, KeyAction } from "../protocol";

type Point = { x: number; y: number };
type TrailPoint = Point & { time: number; id: number };
const TRAIL_MS = 220;
const MAX_TRAIL_POINTS = 48;

export function Touchpad({ send, enabled = true }: { send: (key: Key, action: KeyAction) => void; enabled?: boolean }) {
  const surface = useRef<HTMLDivElement>(null);
  const [light, setLight] = useState<Point>();
  const [trail, setTrail] = useState<{ points: TrailPoint[]; time: number }>({ points: [], time: 0 });
  const [used, setUsed] = useState(false);
  const touching = useRef<number | undefined>(undefined);
  const history = useRef<TrailPoint[]>([]);
  const frame = useRef<number | undefined>(undefined);
  const nextPoint = useRef(0);

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

  const clearFeedback = () => {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = undefined;
    history.current = [];
    setTrail({ points: [], time: 0 });
    setLight(undefined);
  };

  useLayoutEffect(() => {
    if (!enabled) {
      touching.current = undefined;
      gestures.cancel();
      clearFeedback();
    }
    return () => {
      touching.current = undefined;
      gestures.cancel();
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      frame.current = undefined;
      history.current = [];
    };
  }, [enabled, gestures]);

  const fadeTrail = (time: number) => {
    const points = history.current.filter((point) => time - point.time < TRAIL_MS);
    history.current = points;
    setTrail({ points, time });
    frame.current = points.length > 1 ? requestAnimationFrame(fadeTrail) : undefined;
  };

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
        clearFeedback();
        capture(surface.current!, event.pointerId);
        const p = at(event);
        touching.current = event.pointerId;
        history.current = [{ ...p, time: performance.now(), id: nextPoint.current++ }];
        setUsed(true);
        setLight(p);
        gestures.down(p.x, p.y);
      }}
      onPointerMove={(event) => {
        if (touching.current !== event.pointerId) return;
        const p = at(event);
        setLight(p);
        const previous = history.current.at(-1);
        if (!previous || previous.x !== p.x || previous.y !== p.y) {
          const time = performance.now();
          history.current = [
            ...history.current.filter((point) => time - point.time < TRAIL_MS),
            { ...p, time, id: nextPoint.current++ },
          ].slice(-MAX_TRAIL_POINTS);
          if (frame.current === undefined) frame.current = requestAnimationFrame(fadeTrail);
        }
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
        clearFeedback();
      }}
      onLostPointerCapture={(event) => {
        if (touching.current !== event.pointerId) return;
        touching.current = undefined;
        gestures.cancel();
        clearFeedback();
      }}
    >
      {trail.points.length > 1 && (
        <svg class="touchpad-trail" aria-hidden="true">
          {trail.points.slice(1).map((point, index) => {
            const previous = trail.points[index];
            return (
              <line
                key={point.id}
                x1={previous.x}
                y1={previous.y}
                x2={point.x}
                y2={point.y}
                opacity={0.16 * (1 - (trail.time - previous.time) / TRAIL_MS) ** 2}
              />
            );
          })}
        </svg>
      )}
      {light && <span class="touchpad-light" aria-hidden="true" style={{ left: `${light.x}px`, top: `${light.y}px` }} />}
      {!used && enabled && <p class="touchpad-hint">Deslize para mover. Toque para OK.</p>}
    </div>
  );
}
