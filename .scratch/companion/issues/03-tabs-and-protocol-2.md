# 03: The tabs and protocol version 2

**What to build:** FMTV Controller's three tabs and the plumbing every companion feature uses, against the fake bridge.
- **The tab bar** from `design.pen`: Controle, Apps and Assistir, floating at the bottom; Controle opens first; the tabs other than Controle say why they're empty while the bridge isn't ready.
- **Protocol 2** (ADR 0006): requests with an `id` and their answers, lists pushed again when they change, `done`/`failed` for actions, a request unanswered after a few seconds shown as failed. Protocol version 2 in `hello`, with the examples in `protocol/examples` and the README updated.
- **Pictures:** a helper that fetches `GET /pictures/{id}` with `Authorization: Bearer <credential>`, keeps blob URLs for as long as the page is open, and shows a plain tile while loading.
- **The fake bridge** (tests and `npm run dev`) answers the new messages with the examples.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] The tab bar matches `design.pen` on an iPhone-sized viewport, Controle first
- [x] Apps and Assistir say why they're empty while the bridge isn't ready
- [x] A request without an answer in time shows as failed; a push replaces a list
- [x] Pictures are fetched with the credential in a header, never in the URL, and each once
- [x] `hello` says protocol 2; `protocol/README.md` and its examples describe every new message
- [x] Tests drive the page against the fake bridge only

## Comments

**2026-10-26, done.** `TabBar` and `TabPage` give the three tabs from `design.pen`; the Controls tab is the first-release screen above the bar, and Apps and Assistir show their title and, until the bridge is ready, why they're empty. `connectBridge` gains `request`: an `id` from the counter keys use, the answer resolved by that `id`, `failed` turned into a `RequestFailed` with its reason, and a 5-second timeout; pending requests fail when the bridge stops being ready or the connection closes. `useConnection` keeps every list it's sent, answered or pushed. `pictures.tsx` fetches `/pictures/{id}` with `Authorization: Bearer`, once per id, into blob URLs, behind a plain tile. Protocol 2: `hello` and `reload` examples now say 2, and `list-request`, `list-answer`, `list-pushed`, `done` and `failed` are new; `protocol/README.md` describes them and pictures. Both fake bridges answer lists and actions. 12 new tests, 51 in all; in the browser pane the bar sits under the controls and Apps opens empty with the TV ready.
