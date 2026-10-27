# FMTV Controller: the companion features

**Status:** ready-for-agent

**Scope decision, 2026-10-26:** The Owner chose to leave out Teclado after the TV experiments (ADR 0007). Tickets 17 and 18 are `wontfix`; the active scope below excludes typing into TV apps.

## Problem Statement

The first release of FMTV Controller replaced the Remote: a Touchpad, the buttons, Pairing. But a Household Member still does on the phone what the Remote does badly, the slow way: typing a search one letter at a time on the TV's keyboard grid, scrolling to an app that isn't in the App Tray, finding the HDMI input the console is on, pressing Home twice to see what's open, or walking through Explorar with arrows. Everything the phone is good at — a real keyboard, a list to scroll with the thumb, a search box — is left unused, and the phone can't even show what's on the TV.

## Solution

FMTV Controller grows from one screen to three tabs, as `design.pen` shows: **Controle**, **Apps** and **Assistir**, in a floating tab bar at the bottom.

**Controle** keeps the Touchpad and the buttons, and gains:
- a row of the **Shortcut Buttons**, each doing what the Owner assigned to it on the Remote.

**Apps** lists what is on the TV:
- **Abertos**: the Open Apps, most recent first, each opening with a tap or closing with its ✕; an app playing music says "Tocando" and has no ✕, as in the App Switcher;
- **Entradas**: the Inputs by the names the Owner gave them, each switching the TV to it;
- **Todos os apps**: every installed app with its App Banner, App Tray first, each opening on the TV.

**Assistir** is for what to watch:
- a search box for movies and series, from Explorar's TMDB;
- **Continuar assistindo**: the Up Next Tray's entries with their picture, episode, app and time left, each resuming on the TV;
- **Em alta hoje**: Explorar's trending Titles of the day;
- a **Title** screen with its facts, **Ver trailer na TV**, and **Onde assistir**, each service opening the Title in its app on the TV.

The phone asks the Home for all of this rather than sending keys (ADR 0006): the Home already knows the apps, the Inputs, the Open Apps and Up Next, and opens any of them in one step. Teclado was removed from scope after the prototype and UHID follow-up failed to provide the intended typing flow across the target apps (ADR 0007).

## User Stories

### Tabs

1. As a Household Member, I want three tabs, Controle, Apps and Assistir, at the bottom of FMTV Controller, so that the controls stay one tap away from everything else.
2. As a Household Member, I want FMTV Controller to open on Controle, so that the remote is always what I see first.
3. As a Household Member, I want the tab I'm on highlighted, so that I know where I am.
4. As a Household Member, I want the tabs to work only when the TV is reachable and the Home linked, and to say so otherwise, so that I never tap something that can't happen.
5. As a Household Member, I want a tap on an app, an Input, an entry or a service to show the TV is doing it, so that I don't tap twice.

### Teclado — removed from scope

Stories 6–14 are retired by the Owner's decision in ADR 0007. Their original acceptance criteria and the measured compatibility findings remain in tickets 02, 17 and 18. The remaining story numbers are kept stable.

### Botões de atalho

15. As a Household Member, I want the Shortcut Buttons in a row on Controle, under the Touchpad, so that I can open Netflix or the console's Input as with the Remote.
16. As a Household Member, I want each one to show what the Owner assigned to it (an app's or an Input's name), so that the phone matches the Remote.
17. As a Household Member, I want a tap to do exactly what that button does on the Remote, so that there's one behaviour to learn.
18. As a Household Member, I want the row to scroll sideways when the buttons don't fit, so that none is lost on a small iPhone.

### Apps abertos

19. As a Household Member, I want to see the Open Apps, most recent first, with their App Banners, so that I know what is running.
20. As a Household Member, I want to switch the TV to an Open App with a tap, so that I go back to it where I left it.
21. As a Household Member, I want to close an Open App with its ✕, so that I free the TV's memory from the sofa.
22. As a Household Member, I want an app playing music to say "Tocando" and have no ✕, so that I can't stop the music by mistake.
23. As a Household Member, I want the list to change as apps open and close on the TV, so that it's never stale.

### Entradas

24. As a Household Member, I want the Inputs by the names the Owner gave them, with their port, so that I find the console by name.
25. As a Household Member, I want the Inputs the Owner hid to stay hidden on the phone, so that the phone matches the TV.
26. As a Household Member, I want a tap on an Input to switch the TV to it, so that I don't cycle through sources.

### Todos os apps

27. As a Household Member, I want every installed app with its App Banner, the App Tray's apps first and in its order, so that the phone looks like the Home.
28. As a Household Member, I want a tap on an app to open it on the TV, so that I skip the scrolling.
29. As a Household Member, I want an app installed or removed on the TV to show up on the phone, so that the list is never stale.

### Continuar assistindo

30. As a Household Member, I want the Up Next Tray's entries with their picture, episode, app and time left, so that I see what I was watching.
31. As a Household Member, I want a tap on an entry to resume it on the TV, the way the Home does, so that I'm back in a couple of seconds.
32. As a Household Member, I want an entry that finishes or is removed on the TV to disappear on the phone, so that the list matches the Home.

### Explorar no celular

33. As a Household Member, I want Em alta hoje, Explorar's trending Titles of the day, with their backdrop, name, kind and genre, so that I find something to watch from the sofa.
34. As a Household Member, I want to search movies and series by name, in Portuguese, so that I find a Title someone told me about.
35. As a Household Member, I want search results as I type, with their year and kind, so that I tell apart titles with the same name.
36. As a Household Member, I want a Title's screen with its backdrop, age rating, kind, year, genre, duration or seasons, rating and synopsis, so that I can decide without the TV.
37. As a Household Member, I want Onde assistir, each service marked "Incluído na assinatura" or "Alugar ou comprar", with Abrir na TV, so that I start watching in one tap.
38. As a Household Member, I want a service whose app isn't on the TV to open its Play Store page on the TV, as Explorar does, so that I can install it.
39. As a Household Member, I want Ver trailer na TV to play the Trailer on the TV, in the Home, so that everyone in the room sees it.
40. As a Household Member, I want a clear message when Explorar has no TMDB token or the TV is offline, so that I know why Assistir is empty.

### Pictures and pace

41. As a Household Member, I want pictures to appear without holding up the lists, so that the tabs feel quick.
42. As a Household Member, I want pictures loaded once and reused while FMTV Controller is open, so that scrolling back costs nothing.
43. As the Owner, I want pictures and lists only for Paired Phones, so that a guest on the Wi-Fi can't see what we watch.

## Implementation Decisions

**One feature, two projects, as before.** This repository holds the page, its design and the protocol; free-my-tv holds what the Home answers. Tickets for each live in its own tracker, numbered across both.

**Protocol version 2** (ADR 0006).
- Requests from the page carry a `type`, an `id` and their fields; the Home answers each with the same `id`. Lists the Home can change on its own are pushed again as they change.
- New page → bridge messages:
  - `list`, with `of`: `shortcuts`, `open-apps`, `inputs`, `apps`, `up-next`, `trending`.
  - `search`, with `query`.
  - `title`, with `kind` and `tmdbId`.
  - `open`, with what to open: an app (`package`), an Input (`input`), an Open App, a Shortcut Button (`shortcut`), an Up Next entry (`upNext`), a Where to Watch option (`kind`, `tmdbId`, `service`), or a Title's trailer (`kind`, `tmdbId`).
  - `close-app`, with `package`.
- New bridge → page messages: `list` (the same `of`, its items), `search-results`, `title`, `done` or `failed` for an `open` or `close-app`.
- Every message has JSON examples in `protocol/examples`, read by both projects' tests, as in the first release.
- Items name pictures by an opaque `picture` id; the page fetches `GET /pictures/{id}` from the bridge with `Authorization: Bearer <credential>`, keeps it as a blob URL for as long as it's open, and shows a plain tile while it loads. TMDB pictures are full `https://image.tmdb.org/...` URLs the page loads directly.

**The Home, in free-my-tv.**
- **Reachable from the bridge:** the app library, the Input Tray, Multitasking and Explorar move from `MainActivity` to `HomeApplication`, beside the Up Next Tray and the Shortcut Buttons, so they live as long as the process and the bridge can use them while the TV shows another app. The Home's screens keep using the same instances.
- **The bridge's answers** reuse what the Home's screens do: `AllAppsStateHolder.open` / `AppLibrary` for apps and the App Tray's order, `InputTray.select` (hidden Inputs left out), `Multitasking.switchTo` and `close` (playing apps refused, closing through Settings' Force stop, ADR 0010), `ShortcutButtons.perform`, `UpNextTray.select`, `Explorar.watch` and the Home's Trailer screen.
- **Pictures** are rendered by `AppArtworkLoader` (banners as PNG; icon-on-colour composited into a 16:9 PNG) and the Up Next Tray's local artwork files, served only to Paired Phones, cached in memory with the Home's budget (free-my-tv ADR 0004) in mind.
- **Search** adds TMDB's `search/multi` in `pt-BR` to the Home's `Tmdb`, movies and series only, with Explorar's token.
- **Opening a Title's trailer** from the phone opens the Home on Explorar's Trailer screen for that Title, like the Home's own Ver trailer.

**The page.**
- A tab bar from `design.pen`; Controle stays the first screen and the only one shown while not ready.
- The Shortcut Buttons row, the Apps tab, the Assistir tab and the Title screen follow `design.pen` (`controls.jpg`, `apps.jpg`, `watch.jpg`, `title.jpg`), with the keyboard button and sheet omitted by ADR 0007.
- Lists are kept per connection and replaced by each push; a request that gets no answer within a few seconds shows the failure, never a spinner forever.

## Testing Decisions

- **The page**, against the fake bridge, as in the first release: each tab renders the protocol's example lists, each tap sends the right request, `done`/`failed` show what they should, pushes replace lists, pictures are fetched with the credential header and never with it in the URL. Prior art: `tests/controls.test.tsx`, `tests/out-of-reach.test.tsx`.
- **The Home**, against `FakeTvPlatform` on the JVM, with the protocol's examples from the pinned zip: each request is answered with the example's shape, `open` calls the right Home action, playing apps aren't closed, hidden Inputs aren't listed, requests from phones that aren't ready are ignored, pictures need a Paired Phone's credential. Prior art: `WebRemoteBridgeTest`, `ApkDropTest`, `MultitaskingTest`, `InputTrayTest`, `UpNextTrayTest`.
- **The whole** is checked on the TV with an iPhone by the last ticket.

## Out of Scope

- Teclado: typing into fields in TV apps, its button/sheet and the proposed `text` / `text-field` messages (Owner decision, ADR 0007).
- Editing on the phone what the Owner edits on the TV: pinning or reordering the App Tray, renaming or hiding Inputs, reassigning Shortcut Buttons, removing Up Next entries.
- Installing or uninstalling apps from the phone.
- Explorar's week view and its movie/series filter on the phone; Em alta hoje is the day's trending, all kinds.
- Playing anything on the phone, trailers included.
- Voice input, other than the iPhone keyboard's own dictation typing into the field.

## Further Notes

- **Typing experiment concluded.** Ticket 02 and the UHID follow-up found no satisfactory typing flow across the target apps. The Owner chose to leave the feature out; ADR 0007 records the results and tickets 17/18 are `wontfix`.
- **The prefactor comes first.** Ticket 01 moves the Home's apps, Inputs, Open Apps and Explorar to the Application without changing any behaviour; every Home ticket depends on it.
- **Releases.** The page's protocol examples reach the Home's tests through a page release; until one is published, the Home's tickets build with `-PwebRemoteZip=<path>`, and the last ticket releases both, with the Owner's go-ahead.
