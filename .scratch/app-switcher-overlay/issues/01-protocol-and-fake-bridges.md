# 01: Define the dedicated App Switcher request

**Status:** ready-for-agent

**Blocked by:** None.

**What to build:** Add the `open-app-switcher` protocol-2 contract from the [spec](../spec.md) to `protocol/README.md`, executable examples and the test/dev fake bridges. This is a companion request with an `id`, not a `Key`. The Home consumes these examples from the page bundle.

- [ ] Examples cover the request, same-ID `done`, and `failed` with `overlay-unavailable`, `busy` and `error`; document older bridges' existing `unknown-request`.
- [ ] Document show-only/idempotent semantics and that `done` means the overlay is shown, not merely queued.
- [ ] Reuse the current authenticated, ready-only request path and ID counter; keep protocol version 2.
- [ ] Fake bridges model success, pending, failure and no response without pretending to prove live TV visibility.
- [ ] Tests consume the JSON examples; `npm test` and `npm run build` pass.
- [ ] Make a local page/protocol bundle available for Home tests; record its path and checksum under Comments. No publication is required by this ticket.

## Comments
