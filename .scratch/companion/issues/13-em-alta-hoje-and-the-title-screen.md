# 13: Em alta hoje and the Title screen

**What to build:** On Assistir, **Em alta hoje** (backdrops from TMDB's image server, name, kind and genre), and the **Title** screen from `design.pen` opened from it: backdrop, age rating, kind, year, genre, duration or seasons, rating, synopsis, **Ver trailer na TV**, and **Onde assistir** with each service's offer and **Abrir na TV**. Messages for no TMDB token and offline. Examples for `list` of `trending`, `title`, and the `open`s of a service and a trailer.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** 11 (The Assistir tab: Continuar assistindo)

**Status:** resolved

- [x] Em alta hoje and the Title screen match `design.pen` with the examples
- [x] TMDB pictures load from TMDB's image server, never through the bridge
- [x] Abrir na TV and Ver trailer na TV send their `open` examples; `failed` is shown
- [x] No token and offline each show their own message
- [x] The examples exist and the page's tests read them

## Comments

**2026-10-26, done.** Em alta hoje follows Continuar assistindo on Assistir: a row of TMDB backdrops loaded straight from TMDB, each with its name and "Filme, suspense"; a missing token or a TV offline each get their own message, through `useListAnswer`, which now tells why a list didn't come. A tap opens `TitleScreen` over the tabs, with the backdrop and name at once, then asks `title` for the rest: the age rating in ClassInd's colours, "Filme, 2025, Suspense", "2 h 08 min" or the seasons, the rating, the synopsis, Ver trailer na TV when there's a trailer, and Onde assistir, each service with its app's banner (or its name on a plain tile), its offer, and Abrir na TV when it has an app; both buttons send `open` with `kind` and `tmdbId` plus `service` or `trailer`, marked when the TV fails them. Examples `list-trending`, `title-request`, `title`, `open-service` and `open-trailer`, and their rows in the protocol README. The fake bridge can now fail one list (`list:<of>`) and answer a feature's request (`replies`); the dev bridge has trending Titles and a Title screen. 8 new tests, 80 in all.
