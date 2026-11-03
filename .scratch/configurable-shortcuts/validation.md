# Validation — 2026-11-03

- `npm test -- --reporter=dot`: 10 files, 147 tests passed.
- `npm run build`: TypeScript and Vite production bundle passed.
- Chromium with the development fake bridge, 390 × 844 and 320 × 568: mouse hold, right click, adding apps and Inputs, direct `open` with the Input id, ordering, removal and persistence after reloading passed.
- Native dialog: Escape dismissal, return of focus to the triggering app/edit button, focus staying within the modal on repeated Tab presses, and bounds within the 320 × 568 viewport passed.
- Chromium touch emulation using CDP touch events: stationary hold opens the sheet, releasing the finger keeps it open, adding preserves the chosen target, no accidental `open` crosses the WebSocket, and a new backdrop tap dismisses it.
- Browser validation found and fixed focus loss on dialog unmount and touch-release clicks dismissing the freshly opened sheet. The latter has a regression test.
- Keyboard context action, duplicates across Abertos/Todos os apps, gesture cancellation, malformed/blocked storage, empty-list persistence, action failures and duplicate-launch prevention are covered by the tests.
- Screenshots are in `evidence/`.

This is a local Controller implementation. No release, APK installation or physical phone/TV acceptance was performed. The existing protocol 2 app/Input open actions are reused; Home source and pinned Controller version are unchanged.
