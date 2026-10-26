# 07: The Apps tab: Todos os apps and Entradas

**What to build:** The Apps tab from `design.pen`, without Abertos yet: **Entradas** as cards with the Owner's names and their port, and **Todos os apps** as a grid of App Banners, App Tray first. A tap sends `open` of the app or the Input. Lists replaced by pushes. Examples for `list` of `apps` and `inputs` and their `open`s.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** 03 (The tabs and protocol version 2)

**Status:** resolved

- [x] The tab matches `design.pen` with the example lists
- [x] A tap on an app or an Input sends its `open` example
- [x] A pushed list replaces what's shown
- [x] The examples exist and the page's tests read them

## Comments

**2026-10-26, done.** `AppsTab` shows Entradas as cards (name, and port when it differs) and Todos os apps as a grid of App Banners from the Home's pictures, each label under its banner, since an icon-on-colour banner carries no name; a tap opens it with the busy and failed marks of `useActions`; Entradas is left out when the TV lists none. Examples `list-apps`, `list-inputs`, `open-app`, `open-input`, and their rows in the protocol README. The dev bridge serves sample apps, Inputs and coloured banners. A slow first render failed a test once under parallel files: async queries now wait up to 3 s (`tests/setup.ts`). 7 new tests, 63 in all.
