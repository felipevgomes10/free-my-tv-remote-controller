# 13: Em alta hoje and the Title screen

**What to build:** On Assistir, **Em alta hoje** (backdrops from TMDB's image server, name, kind and genre), and the **Title** screen from `design.pen` opened from it: backdrop, age rating, kind, year, genre, duration or seasons, rating, synopsis, **Ver trailer na TV**, and **Onde assistir** with each service's offer and **Abrir na TV**. Messages for no TMDB token and offline. Examples for `list` of `trending`, `title`, and the `open`s of a service and a trailer.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** 11 (The Assistir tab: Continuar assistindo)

**Status:** ready-for-agent

- [ ] Em alta hoje and the Title screen match `design.pen` with the examples
- [ ] TMDB pictures load from TMDB's image server, never through the bridge
- [ ] Abrir na TV and Ver trailer na TV send their `open` examples; `failed` is shown
- [ ] No token and offline each show their own message
- [ ] The examples exist and the page's tests read them
