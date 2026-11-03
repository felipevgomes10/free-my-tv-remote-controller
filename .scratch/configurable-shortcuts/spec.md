# Configurable shortcuts on the Web Remote

Requested 2026-11-03. The Controls tab has its own ordered list of apps and Inputs, independent of the physical Remote's Shortcut Buttons. This replaces the inherited button row described in `.scratch/companion/issues/05-shortcut-buttons-row.md`.

- Hold an app in Todos os apps or Abertos, or an Input in Entradas, to offer **Adicionar aos atalhos**. A short tap keeps opening the item on the TV.
- Holding, scrolling, cancellation and leaving the tab must never accidentally open the item or add it. Context menu and Shift+F10 offer the same action.
- No duplicates for the same kind and target, even when an app appears in both sections.
- **Editar** on Controls offers earlier/later arrows and removal. Apps and Inputs share one ordered list.
- Persist additions, order and removals in this browser on this phone, including an empty list. Start empty with guidance to Apps. Report unavailable storage while keeping the in-memory list usable.
- Reuse protocol 2's `open` with `package` or `input`; no bridge changes or physical Remote reassignment.
- Validate production build, regression tests, and mobile browser layouts. Physical phone/TV acceptance and publication are separate from the local implementation.
