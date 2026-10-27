# 02: Add the Multitarefas button to the Controls tab

**Status:** resolved

**Blocked by:** [Controller 01: Protocol and fake bridges](01-protocol-and-fake-bridges.md).

**What to build:** A dedicated **Multitarefas** action in the Controls tab's main button group, following the [spec](../spec.md) and ADR 0008. Use the existing companion action feedback, an overlapping-windows icon, accessible name `Multitarefas`, and the existing controls' visual language and target sizing.

- [x] The button is present without Shortcut Button configuration, including with an empty Abertos list.
- [x] One tap sends exactly one `open-app-switcher` request and no Home/Recents keys; the phone stays on Controle.
- [x] Pending and non-ready states disable it; duplicate taps cannot queue extra actions.
- [x] `done` clears pending; all specified failures and the 5-second timeout show the spec's pt-BR messages and allow a fresh tap.
- [x] Disconnect clears pending; reconnect never replays the action. A successful response does not leave a false persistent "open" state on the button.
- [x] Existing Touchpad, Back, Home, volume, playback and Abertos actions still work.
- [x] Fake-bridge interaction tests, `npm test` and `npm run build` pass; verify layout on a narrow phone viewport.

## Comments

**2026-10-26:** Implemented and verified in source. See the feature validation results for the local bundle, shared-example tests and remaining physical TV acceptance. No release published.
