# The protocol between FMTV Controller and the Home's bridge

The page and the bridge inside the Home talk over one WebSocket per open FMTV Controller, at `/remote` on the bridge's address. Every message is a JSON object with a `type`. The examples in [`examples/`](examples) are the contract: this repository's tests check that the page produces and understands them, and free-my-tv's tests check that the bridge does. Change an example and both sides' tests must agree again.

## Version

`protocol` is `1`. The page sends it in its `hello`; a bridge that doesn't speak it answers `reload` (see below).

## Page → bridge

| Message | Example | Meaning |
| --- | --- | --- |
| `hello` | [`hello.json`](examples/hello.json) | First message on every connection: the protocol version and the Paired Phone's credential. |
| `key` | [`key-press.json`](examples/key-press.json), [`key-hold-start.json`](examples/key-hold-start.json), [`key-hold-end.json`](examples/key-hold-end.json) | One key, as an intention plus a direction. `id` grows by one on each connection, starting at 1. |

Keys are intentions, not key codes: `up`, `down`, `left`, `right`, `ok`, `back`, `home`, `play-pause`, `volume-up`, `volume-down`, `mute`, `power`.

Each key comes with an `action`:

- `press`: pressed and released.
- `hold-start`: held down, as when holding OK enters Edit Mode on the Home.
- `hold-end`: the held key was released.

Pressing Home twice is two `press`es; the Home recognises it as with the Remote. A key the page couldn't send because the connection was down is dropped, never sent later.

## Bridge → page

| Message | Example | Meaning |
| --- | --- | --- |
| `state` | [`state-ready.json`](examples/state-ready.json) | The bridge is ready for keys, and the TV's name to show. |
| `ack` | [`ack.json`](examples/ack.json) | The key with this `id` was passed on to the TV Remote Service. |
