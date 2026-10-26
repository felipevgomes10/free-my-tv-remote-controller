# 11: The Assistir tab: Continuar assistindo

**What to build:** The Assistir tab from `design.pen` with **Continuar assistindo**: each entry's picture with its progress bar, title, episode line, app and time left ("Netflix, faltam 18 min"); a tap sends `open` of the entry. The search box and Em alta hoje come with tickets 13 and 15. Examples for `list` of `up-next` and its `open`.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** 03 (The tabs and protocol version 2)

**Status:** resolved

- [x] Continuar assistindo matches `design.pen` with the example list
- [x] Entries without a title read "Continuar no <app>"
- [x] A tap sends the entry's `open` example; a push replaces the list
- [x] The examples exist and the page's tests read them

## Comments

**2026-10-26, done.** `WatchTab` replaces the empty Assistir tab with Continuar assistindo, left out while the Up Next Tray is empty: each entry's still with a white progress bar, its title (or "Continuar no <app>"), the episode line when known, and the app with the time left, written as the TV writes it ("faltam 18 min", "faltam 1h12"); a tap sends `open` with `upNext`, with the busy and failed marks of `useActions`. The Home sends `minutesLeft` and `progress` rather than milliseconds, and the picture is the title's still (`upnext:<entry>`) or, without one, the app's banner, as on the TV. Examples `list-up-next` and `open-up-next`, and their row in the protocol README. The dev bridge lists three entries with coloured stills. 4 new tests, 72 in all.
