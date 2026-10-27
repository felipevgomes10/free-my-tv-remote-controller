import { useActions, useCompanion, useList } from "../companion";
import { tick } from "../haptics";
import { HapticFeedback } from "./HapticFeedback";

type Shortcut = { shortcut: string; label: string };

/** The Shortcut Buttons, each doing what the Owner assigned to it on the Remote. */
export function ShortcutRow() {
  const { status } = useCompanion();
  const shortcuts = useList<Shortcut>("shortcuts");
  const { run, busy, failed } = useActions();
  if (!shortcuts?.length) return null;

  return (
    <fieldset class="control-group shortcut-row" disabled={status !== "ready"} aria-label="Botões de atalho">
      {shortcuts.map(({ shortcut, label }) => (
        <button
          type="button"
          key={shortcut}
          class={`shortcut${busy.has(shortcut) ? " busy" : ""}${failed.has(shortcut) ? " failed" : ""}`}
          aria-label={`Abrir ${label}`}
          aria-busy={busy.has(shortcut)}
          onClick={() => {
            tick();
            void run(shortcut, { type: "open", shortcut });
          }}
        >
          {label}
          <HapticFeedback />
        </button>
      ))}
    </fieldset>
  );
}
