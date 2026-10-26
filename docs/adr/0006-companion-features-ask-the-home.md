---
status: accepted
---

# The companion features ask the Home, over the same WebSocket

Typing, opening an app, switching Inputs, the App Switcher, the Shortcut Buttons, Continuar assistindo and Explorar could each be driven with keys, as the first release does: arrows and OK through the Home's screens. Instead the page asks the Home directly, which already knows the apps, Inputs, Open Apps and Up Next entries and can open any of them in one step. The requests and their answers travel on the WebSocket the page already keeps, as new message types next to `key`, each with an `id` its answer repeats; the protocol becomes version 2, so a page and a bridge of different versions meet the existing `reload`. Pictures (app banners, Up Next stills, Title posters) are the one exception: the page fetches them over HTTP from the bridge with the Paired Phone's credential in an `Authorization` header, never in the URL, and shows them as blob URLs.

## Considered Options

- **Keys only**, navigating the Home's screens from the phone: nothing new on the bridge, but every action is a dozen keys the phone can't see land, and the phone could never list what's on the TV.
- **An HTTP API next to the WebSocket** (`GET /apps`, `POST /apps/{id}/open`…): familiar, but a second authenticated surface, and the TV couldn't push changes (an app opened or closed, an Up Next entry finished) without the WebSocket anyway.

## Consequences

- The Home answers only Paired Phones whose bridge state is `ready`; a request from any other connection is ignored, like a key.
- Lists the Home can change on its own (Open Apps, Up Next) are pushed again when they change, not polled.
- Explorar's TMDB token stays on the TV (free-my-tv's ADR 0008): the phone asks the Home, which asks TMDB. TMDB's pictures, whose paths are public, come straight from TMDB's image server to the phone; only pictures that live on the TV (app banners, Up Next stills) go through the bridge.
- The bridge's WebSocket frames stay small (it drops anything over 64 KB), which is one more reason pictures never travel on it.
- The Home's apps, Inputs, Open Apps and Explorar must live as long as its process, not only while its screen is open, for the bridge to reach them.
