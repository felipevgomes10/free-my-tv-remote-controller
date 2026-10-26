# The protocol between FMTV Controller and the Home's bridge

The page and the bridge inside the Home talk over one WebSocket per open FMTV Controller, at `/remote` on the bridge's address. Every message is a JSON object with a `type`. The examples in [`examples/`](examples) are the contract: this repository's tests check that the page produces and understands them, and free-my-tv's tests check that the bridge does. Change an example and both sides' tests must agree again.

## Pairing

Pairing is one HTTP request, before any WebSocket: `POST /pair` with a JSON body.

| | Status | Example | Meaning |
| --- | --- | --- | --- |
| Request | | [`pair-request.json`](examples/pair-request.json) | The Pairing Code the TV shows and the name the Household Member gave the phone. |
| Success | `200` | [`pair-success.json`](examples/pair-success.json) | The Paired Phone's credential, which the page keeps and sends in every `hello`. |
| Wrong code | `401` | [`pair-wrong-code.json`](examples/pair-wrong-code.json) | The code isn't the one on the TV. |
| Pairing closed | `409` | [`pair-closed.json`](examples/pair-closed.json) | Parear aparelho isn't open on the TV. |
| Too many tries | `429` | [`pair-too-many-tries.json`](examples/pair-too-many-tries.json) | The TV changed the code after too many wrong ones. |

## Version

`protocol` is `2` since the companion features (ADR 0006); version 1 had only keys. The page sends it in its `hello`; a bridge that doesn't speak it answers `reload` (see below).

## Page → bridge

| Message | Example | Meaning |
| --- | --- | --- |
| `hello` | [`hello.json`](examples/hello.json) | First message on every connection: the protocol version and the Paired Phone's credential. |
| `key` | [`key-press.json`](examples/key-press.json), [`key-hold-start.json`](examples/key-hold-start.json), [`key-hold-end.json`](examples/key-hold-end.json), [`key-wake.json`](examples/key-wake.json) | One key, as an intention plus a direction. `id` grows by one on each connection, starting at 1. |

Keys are intentions, not key codes: `up`, `down`, `left`, `right`, `ok`, `back`, `home`, `play-pause`, `volume-up`, `volume-down`, `mute`, `power`, `wake`. `power` toggles, as on the Remote; `wake` only ever turns the TV on, and is what "Tentar ligar a TV" sends, so it can't turn off a TV that was on.

Each key comes with an `action`:

- `press`: pressed and released.
- `hold-start`: held down, as when holding OK enters Edit Mode on the Home.
- `hold-end`: the held key was released.

Pressing Home twice is two `press`es; the Home recognises it as with the Remote. A key the page couldn't send because the connection was down is dropped, never sent later.

## Requests and answers (version 2)

The companion features ask the Home rather than send keys (ADR 0006). A request is any message with a `type` and an `id`; the Home answers it with a message carrying the same `id`. `id`s share one counter with keys, growing by one on each connection. A request the Home doesn't answer within 5 seconds is a failure for the page, and requests are only answered once the bridge is `ready`.

| Message | Example | Meaning |
| --- | --- | --- |
| `list` (request) | [`list-request.json`](examples/list-request.json) | Asks for one of the Home's lists: `of` is `shortcuts`, `open-apps`, `inputs`, `apps`, `up-next` or `trending`. Each list's items are described with its feature. |
| `list` (answer) | [`list-answer.json`](examples/list-answer.json) | The list, with the request's `id`. |
| `list` (pushed) | [`list-pushed.json`](examples/list-pushed.json) | The same list again, without an `id`, whenever it changes on the TV. The page replaces what it shows. |
| `done` | [`done.json`](examples/done.json) | An action (an `open`, a `close-app`…) was carried out on the TV. |
| `close-app` | [`close-app.json`](examples/close-app.json) | Closes an Open App on the TV, as the App Switcher's ✕ does. The bridge answers `done` once it is closed, or `failed` with `playing` for an app playing music, which can't be closed. |
| `failed` | [`failed.json`](examples/failed.json) | An action or request couldn't be carried out; `reason` says why. |

### The companion's lists and actions

Each feature's list items and `open` fields. An `open` names its target by exactly one field.

| Feature | List (`of`) | Example | Items | `open` by |
| --- | --- | --- | --- | --- |
| Shortcut Buttons | `shortcuts` | [`list-shortcuts.json`](examples/list-shortcuts.json) | `shortcut` (the button: `netflix`, `globoplay`, `prime-video`, `disney-plus`, `youtube`, `input`) and `label` (what the Owner assigned to it) | `shortcut` ([`open-shortcut.json`](examples/open-shortcut.json)): does what the Remote's button does |
| Abertos | `open-apps` | [`list-open-apps.json`](examples/list-open-apps.json) | `package`, `label`, `picture` (its App Banner, or its icon on a colour) and `playing` (it plays music, so it can't be closed); most recently used first | `package` ([`open-app.json`](examples/open-app.json)): switches the TV back to it |
| Todos os apps | `apps` | [`list-apps.json`](examples/list-apps.json) | `package`, `label`, `picture` (its App Banner, or its icon on a colour) and `inTray`; App Tray first, in its order, then the rest by name | `package` ([`open-app.json`](examples/open-app.json)): opens the app, as its tile does |
| Entradas | `inputs` | [`list-inputs.json`](examples/list-inputs.json) | `input`, `name` (the Owner's, or the device's), `port` and `kind` (`hdmi` or `antenna`); hidden Inputs left out | `input` ([`open-input.json`](examples/open-input.json)): switches the TV to it |

### Pictures

Items name the Home's pictures (App Banners, Up Next stills) by an opaque `picture` id. The page fetches `GET /pictures/{id}` from the bridge with `Authorization: Bearer <credential>`, never with the credential in the URL; the bridge answers `401` to anything else. TMDB's pictures are full `https://image.tmdb.org/…` URLs instead, loaded straight from TMDB.

## Bridge → page

| Message | Example | Meaning |
| --- | --- | --- |
| `state` | [`state-ready.json`](examples/state-ready.json) | The bridge is ready for keys, and the TV's name to show. |
| `state` | [`state-not-linked.json`](examples/state-not-linked.json) | The Home isn't linked to the TV's ADB (ADR 0005): keys can't reach the TV until the Owner links it. The connection stays open, and a `ready` follows once it is linked. |
| `state` | [`state-revoked.json`](examples/state-revoked.json) | The credential belongs to no Paired Phone: never paired, or revoked by the Owner. The bridge closes the connection after it. |
| `reload` | [`reload.json`](examples/reload.json) | The bridge doesn't speak the page's protocol version; `protocol` is the one it speaks. The page reloads once to get the page the Home serves now. |
| `ack` | [`ack.json`](examples/ack.json) | The key with this `id` was passed on to the TV Remote Service. |

A bridge may send `state` again at any time, as Linking or the Paired Phones change.
