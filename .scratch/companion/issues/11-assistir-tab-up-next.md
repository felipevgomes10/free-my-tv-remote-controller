# 11: The Assistir tab: Continuar assistindo

**What to build:** The Assistir tab from `design.pen` with **Continuar assistindo**: each entry's picture with its progress bar, title, episode line, app and time left ("Netflix, faltam 18 min"); a tap sends `open` of the entry. The search box and Em alta hoje come with tickets 13 and 15. Examples for `list` of `up-next` and its `open`.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** 03 (The tabs and protocol version 2)

**Status:** ready-for-agent

- [ ] Continuar assistindo matches `design.pen` with the example list
- [ ] Entries without a title read "Continuar no <app>"
- [ ] A tap sends the entry's `open` example; a push replaces the list
- [ ] The examples exist and the page's tests read them
