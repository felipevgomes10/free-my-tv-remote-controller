# 05: The Shortcut Buttons row

**What to build:** On Controle, under the Touchpad, the row of Shortcut Buttons from `design.pen`, each named after what the Owner assigned to it (an app's or an Input's name, or Home's App Switcher), scrolling sideways when they don't fit. A tap sends `open` with the `shortcut`, with a haptic tick and the button showing the TV is doing it. Examples for `list` of `shortcuts` and the `open`.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** 03 (The tabs and protocol version 2)

**Status:** resolved

- [x] The row matches `design.pen` and scrolls sideways on a narrow iPhone
- [x] Each button shows its assignment from the example list
- [x] A tap sends the `open` example for that button; `failed` is shown
- [x] The examples exist and the page's tests read them

## Comments

**2026-10-26, done.** `companion.tsx` holds what every tab shares: `useList` asks for a list each time the bridge becomes ready and follows its pushes; `useActions` runs an action, marking it busy until the TV answers and failed for 2.5 s after a `failed` or a timeout. `ShortcutRow` sits between the Touchpad and the buttons, scrolls sideways, and hides when the Home lists no buttons. Request ids share the keys' counter, as the protocol says, so the controls' tests now compare keys without their ids. Examples `list-shortcuts` and `open-shortcut`; the protocol README gains a table of each feature's lists and `open` fields. 5 new tests, 56 in all; in the browser pane the row matches `design.pen`, running off the edge.
