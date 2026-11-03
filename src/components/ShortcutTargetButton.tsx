import type { ComponentChildren } from "preact";
import { useEffect, useRef } from "preact/hooks";
import type { Shortcut } from "../shortcuts";

export const SHORTCUT_HOLD_MS = 550;

/** A tap opens on the TV; a stationary hold or context menu offers a shortcut. */
export function ShortcutTargetButton({ item, onOpen, onShortcut, children, ...props }: {
  item: Shortcut;
  onOpen: () => void;
  onShortcut: (item: Shortcut) => void;
  children: ComponentChildren;
  class: string;
  "aria-label": string;
  "aria-busy": boolean;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointer = useRef<{ id: number; x: number; y: number } | undefined>(undefined);
  const suppressClick = useRef(false);
  const cancel = () => {
    clearTimeout(timer.current);
    pointer.current = undefined;
  };
  useEffect(() => {
    const onVisibility = () => { if (document.hidden) cancel(); };
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancel();
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  return <button type="button" {...props} aria-haspopup="dialog"
    onFocus={() => { suppressClick.current = false; }}
    onPointerDown={(event) => {
      if (!event.isPrimary || event.button !== 0) { cancel(); return; }
      cancel();
      suppressClick.current = false;
      pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
      timer.current = setTimeout(() => {
        suppressClick.current = true;
        cancel();
        onShortcut(item);
      }, SHORTCUT_HOLD_MS);
    }}
    onPointerMove={(event) => {
      const start = pointer.current;
      if (start?.id === event.pointerId && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) {
        suppressClick.current = true;
        cancel();
      }
    }}
    onPointerUp={cancel}
    onPointerCancel={() => { suppressClick.current = true; cancel(); }}
    onPointerLeave={cancel}
    onLostPointerCapture={cancel}
    onContextMenu={(event) => {
      event.preventDefault();
      cancel();
      onShortcut(item);
      suppressClick.current = true;
    }}
    onKeyDown={(event) => {
      if (event.key === "Enter" || event.key === " ") suppressClick.current = false;
      if (event.key === "ContextMenu" || (event.shiftKey && event.key === "F10")) {
        event.preventDefault();
        cancel();
        onShortcut(item);
      }
    }}
    onClick={(event) => {
      if (suppressClick.current) { event.preventDefault(); return; }
      suppressClick.current = false;
      onOpen();
    }}
  >{children}</button>;
}
