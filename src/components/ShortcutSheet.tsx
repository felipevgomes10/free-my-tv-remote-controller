import type { ComponentChildren } from "preact";
import { useId, useLayoutEffect, useRef } from "preact/hooks";
import { Icon } from "./Icon";

/** Native modal keeps focus inside, dismisses on Escape and restores focus to its trigger. */
export function ShortcutSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ComponentChildren }) {
  const ref = useRef<HTMLDialogElement>(null);
  const backdropPressed = useRef(false);
  const titleId = useId();
  const outside = (event: MouseEvent) => {
    const bounds = ref.current!.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  useLayoutEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={ref} class="shortcut-sheet" aria-labelledby={titleId} onClose={onClose}
    onPointerDown={(event) => { backdropPressed.current = event.target === event.currentTarget && outside(event); }}
    onPointerCancel={() => { backdropPressed.current = false; }}
    onClick={(event) => {
      // The finger that opened this sheet may release over its backdrop. Only a new tap closes it.
      const dismiss = backdropPressed.current && event.target === event.currentTarget && outside(event);
      backdropPressed.current = false;
      if (dismiss) onClose();
    }}>
    <header class="section-header">
      <h2 class="section-title" id={titleId}>{title}</h2>
      <button type="button" class="shortcut-tool" aria-label="Fechar edição de atalhos" onClick={onClose}><Icon name="close" size={22} /></button>
    </header>
    {children}
  </dialog>;
}
