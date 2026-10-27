# FMTV Controller: a dedicated Multitarefas button

**Status:** ready-for-agent

**Decision date:** 2026-10-26. See [ADR 0008](../../docs/adr/0008-a-dedicated-button-opens-the-app-switcher-over-the-app.md) and the [Home spec](../../../free-my-tv/.scratch/app-switcher-overlay/spec.md).

## Problem Statement

Opening the App Switcher with Home twice first takes the owner away from the app. Abertos in the Apps tab offers direct phone actions but does not show the TV's App Switcher. The Controller needs a dedicated button that opens it while the app remains visible on the TV.

## Behaviour

- Add a **Multitarefas** button to the Controls tab's main button group, beside the existing navigation controls. Keep the current visual language and touch-target sizing; use an overlapping-windows icon and the accessible name `Multitarefas`. It is always present, independently of Shortcut Button assignments and whether Abertos is empty.
- A tap sends one `open-app-switcher` request. It never sends Home or Android's system Recents key, and does not change the phone's tab.
- The Home displays its App Switcher over the app visible when it handles the request. The live app remains identifiable through the uncovered area/translucent backdrop. A frozen screenshot, black screen or the Home replacing the app is a failure.
- Repeated requests are show-only: they do not toggle, stack overlays or reset focus. The button is disabled while its request is pending and whenever the connection is not `ready`.
- After opening, the Touchpad, OK and Back navigate/dismiss the overlay using existing keys. Home dismisses it and goes Home normally. Existing volume and playback controls retain their meaning.
- Back returns input to the underlying app without relaunching it. Selecting an Open App dismisses the overlay and switches to that app. With no Open Apps the overlay shows an empty state and Back still works. Over the Home, it overlays the Home itself.
- Abertos, single/double/held Home and assigned Shortcut Buttons keep their existing behaviour. The dedicated button works without configuring a Shortcut Button.

## Shared protocol contract

This section and the Home spec define the same additive protocol-2 contract. The Controller owns the eventual executable JSON examples in `protocol/examples/`; both projects consume them through the existing page bundle.

```json
{"type":"open-app-switcher","id":42}
{"type":"done","id":42}
{"type":"failed","id":42,"reason":"overlay-unavailable"}
```

- No package, key sequence or presentation field: the target is the TV's current surface when the Home handles the request.
- Use the shared request/key ID counter. Only a Paired Phone on a `ready` connection may invoke it; other connections follow the bridge's existing rejection/ignore rules.
- `done` means the overlay is shown and ready for navigation, or was already shown. Merely queuing an Android operation is not success. It does not promise a later dismissal notification.
- `failed` with `overlay-unavailable` means the service/window is unavailable or could not show; `busy` means an incompatible operation such as Force stop is in progress; `error` covers an unexpected failure. Leave the current TV surface intact on failure.
- Existing `unknown-request` from an older bridge means the Home needs updating. Keep protocol version 2; no capability negotiation is required for this addition.
- Use the existing 5-second request timeout. Show a concise pt-BR error and allow a fresh tap. Do not replay on reconnect or retry automatically: a lost response may follow a successful opening.

## Error copy

| Failure | Message |
| --- | --- |
| `overlay-unavailable` | Não foi possível abrir o multitarefas. Confira a preparação do Home na TV. |
| `busy` | A TV está concluindo outra ação. Tente novamente. |
| `unknown-request` | Atualize o Home para usar o botão Multitarefas. |
| Timeout / `error` | Não foi possível confirmar a abertura do multitarefas. Tente novamente. |

Reuse the existing connection screens for unpaired, revoked, not-linked and unreachable states. Do not add a new pairing flow.

## Implementation and verification

Reuse the companion request/action infrastructure in `src/companion.tsx`; the button is an action, not a new member of `Key`. Extend the dev/test fake bridges and protocol examples. Test one request per tap, pending/disabled states, success, every failure above, timeout, no replay and unchanged Home/Touchpad behaviour. `npm test` and `npm run build` must pass for implementation.

The real TV check must establish live app visibility, Back returning to the same app state, selection and key isolation; a fake bridge cannot prove those. The Home spec owns that matrix. Package the page and examples together for Home validation with `-PwebRemoteZip=<path>` before publishing or updating the pinned release.

## Tickets and boundaries

Tickets restart at 01 in each repository. Dependencies always name the repository and link the file.

1. [01: Protocol contract and fake bridges](issues/01-protocol-and-fake-bridges.md).
2. [02: Dedicated button](issues/02-multitarefas-button.md).
3. [03: Integrated page bundle](issues/03-integrated-page-bundle.md).

The Home owns the overlay and its TV validation. This feature does not replace the system Recents screen, change the Open App Limit, add phone-side app previews, change keyboard scope or require a new design file. These documents plan implementation; the button and protocol examples are not implemented by this documentation change.
