# 09: The Apps tab: Abertos

**What to build:** **Abertos** at the top of the Apps tab, from `design.pen`: the Open Apps, most recent first, a tap switching to one, its ✕ closing it; an app playing music shows "Tocando" and has no ✕; the help line says what closing does. Examples for `list` of `open-apps`, its `open` and `close-app`.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** 07 (The Apps tab: Todos os apps and Entradas)

**Status:** resolved

- [x] Abertos matches `design.pen`; a playing app has no ✕
- [x] A tap sends the `open` example; ✕ sends `close-app`, and the card goes once the TV confirms
- [x] The examples exist and the page's tests read them

## Comments

**2026-10-26, done.** Abertos opens the Apps tab when the TV lists any Open App: a row of App Banners that scrolls sideways, "Mais recente primeiro", each label under its banner, "Tocando" with its sound wave for a playing app, which has no ✕, and the help line. A tap sends `open` with `package` (the same `open-app` example: opening an Open App is opening the app, as the App Switcher does); the ✕ sends `close-app`, and the card leaves once the TV answers `done`, or stays marked when it answers `failed`. Examples `list-open-apps` and `close-app`, and their rows in the protocol README. The dev bridge lists three Open Apps, Spotify playing. 5 new tests, 68 in all.
