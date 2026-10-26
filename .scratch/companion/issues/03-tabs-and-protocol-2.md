# 03: The tabs and protocol version 2

**What to build:** FMTV Controller's three tabs and the plumbing every companion feature uses, against the fake bridge.
- **The tab bar** from `design.pen`: Controle, Apps and Assistir, floating at the bottom; Controle opens first; the tabs other than Controle say why they're empty while the bridge isn't ready.
- **Protocol 2** (ADR 0006): requests with an `id` and their answers, lists pushed again when they change, `done`/`failed` for actions, a request unanswered after a few seconds shown as failed. Protocol version 2 in `hello`, with the examples in `protocol/examples` and the README updated.
- **Pictures:** a helper that fetches `GET /pictures/{id}` with `Authorization: Bearer <credential>`, keeps blob URLs for as long as the page is open, and shows a plain tile while loading.
- **The fake bridge** (tests and `npm run dev`) answers the new messages with the examples.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The tab bar matches `design.pen` on an iPhone-sized viewport, Controle first
- [ ] Apps and Assistir say why they're empty while the bridge isn't ready
- [ ] A request without an answer in time shows as failed; a push replaces a list
- [ ] Pictures are fetched with the credential in a header, never in the URL, and each once
- [ ] `hello` says protocol 2; `protocol/README.md` and its examples describe every new message
- [ ] Tests drive the page against the fake bridge only
