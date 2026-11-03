import { useState } from "preact/hooks";
import { useActions, useCompanion } from "../companion";
import { tick } from "../haptics";
import { shortcutKey, useShortcuts } from "../shortcuts";
import { HapticFeedback } from "./HapticFeedback";
import { Icon } from "./Icon";
import { ShortcutSheet } from "./ShortcutSheet";

export function ShortcutRow({ onAdd }: { onAdd: () => void }) {
  const { status } = useCompanion();
  const { items, saved, remove, move } = useShortcuts();
  const { run, busy, failed } = useActions();
  const [editing, setEditing] = useState(false);
  return (
    <section class="shortcuts" aria-label="Atalhos">
      <header class="section-header">
        <h2 class="shortcuts-title">Atalhos</h2>
        <button type="button" class="shortcut-text-button" onClick={() => items.length ? setEditing(true) : onAdd()}>{items.length ? "Editar" : "Adicionar"}</button>
      </header>
      {items.length ? (
        <fieldset class="control-group shortcut-row" disabled={status !== "ready"} aria-label="Atalhos de apps e entradas">
          {items.map((item) => {
            const key = shortcutKey(item);
            return <button type="button" key={key}
              class={`shortcut${busy.has(key) ? " busy" : ""}${failed.has(key) ? " failed" : ""}`}
              aria-label={`Abrir ${item.label}`} aria-busy={busy.has(key)}
              onClick={() => {
                tick();
                void run(key, { type: "open", [item.kind === "app" ? "package" : "input"]: item.target });
              }}>
              {item.label}<HapticFeedback />
            </button>;
          })}
        </fieldset>
      ) : <p class="section-help">Segure um app ou entrada na aba Apps para adicionar aqui.</p>}
      {!saved && <p class="shortcut-warning" role="status">Os atalhos só serão mantidos enquanto o controle estiver aberto. Não deu para salvar neste aparelho.</p>}
      {editing && <ShortcutSheet title="Editar atalhos" onClose={() => setEditing(false)}>
        <p class="section-help">Use as setas para mudar a ordem. Os atalhos ficam salvos neste aparelho.</p>
        <ol class="shortcut-edit-list">
          {items.map((item, index) => {
            const key = shortcutKey(item);
            return <li key={key}>
              <span class="shortcut-edit-label">{item.label}<small>{item.kind === "app" ? "App" : "Entrada"}</small></span>
              <button type="button" class="shortcut-tool" aria-label={`Mover ${item.label} para antes`} disabled={index === 0} onClick={() => move(key, -1)}><Icon name="chevronUp" size={22} /></button>
              <button type="button" class="shortcut-tool" aria-label={`Mover ${item.label} para depois`} disabled={index === items.length - 1} onClick={() => move(key, 1)}><Icon name="chevronDown" size={22} /></button>
              <button type="button" class="shortcut-tool" aria-label={`Remover ${item.label} dos atalhos`} onClick={() => remove(key)}><Icon name="remove" size={22} /></button>
            </li>;
          })}
        </ol>
        {!items.length && <p class="section-help">Nenhum atalho. Adicione apps e entradas na aba Apps.</p>}
        <button type="button" class="pill-button" onClick={onAdd}><Icon name="add" size={20} />Adicionar atalhos</button>
        <button type="button" class="pill-button shortcut-done" onClick={() => setEditing(false)}>Concluir</button>
      </ShortcutSheet>}
    </section>
  );
}
