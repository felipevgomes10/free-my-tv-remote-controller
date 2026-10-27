---
status: accepted
---

# A dedicated button opens the App Switcher over the app

The Controls tab gains a **Multitarefas** button that asks the Home to show the App Switcher over the app currently visible on the TV, keeping that app visible underneath. It sends an explicit request over the existing authenticated WebSocket (ADR 0006), rather than two Home key presses: the first Home press already replaces the app with the Home, losing the context this button is meant to preserve.

The request only opens the App Switcher; repeating it leaves the same overlay open. Back dismisses it on the TV. The Apps tab's Abertos remains a separate way to switch or close apps directly from the phone. Home double press and assigned Shortcut Buttons retain their existing behaviour.

## Consequences

- The Home owns the overlay, focus and dismissal; the phone keeps using its Touchpad and existing keys to navigate it.
- The app must remain visible as a live surface. A screenshot or an opaque Home screen does not satisfy this decision.
- An unavailable overlay produces a failure on the phone; there is no automatic fallback through Home presses.
- This is an additive protocol-2 request. An older bridge's `unknown-request` is shown as an instruction to update the Home. The page and Home ship together through the existing pinned page bundle.

Implementation and acceptance: [spec](../../.scratch/app-switcher-overlay/spec.md). The TV-side decision is [Home ADR 0016](../../../free-my-tv/docs/adr/0016-the-controller-opens-the-app-switcher-as-an-overlay.md).
