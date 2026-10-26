# 05: The Shortcut Buttons row

**What to build:** On Controle, under the Touchpad, the row of Shortcut Buttons from `design.pen`, each named after what the Owner assigned to it (an app's or an Input's name, or Home's App Switcher), scrolling sideways when they don't fit. A tap sends `open` with the `shortcut`, with a haptic tick and the button showing the TV is doing it. Examples for `list` of `shortcuts` and the `open`.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** 03 (The tabs and protocol version 2)

**Status:** ready-for-agent

- [ ] The row matches `design.pen` and scrolls sideways on a narrow iPhone
- [ ] Each button shows its assignment from the example list
- [ ] A tap sends the `open` example for that button; `failed` is shown
- [ ] The examples exist and the page's tests read them
