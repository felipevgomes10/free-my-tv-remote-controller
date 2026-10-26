# 03: The Web Remote's controls, against a fake bridge

**What to build:** The Web Remote's main screen, working end to end against a fake bridge that speaks the protocol.
- **The Touchpad:** swiping moves the focus one step, a longer swipe several, a tap presses OK, and touching and holding is holding OK. A tap is never mistaken for a short swipe.
- **The buttons:** Voltar; Home, where two quick presses are two Home presses and holding is holding Home; play/pause; volume up and down, repeating while held; mute; power.
- **Haptics:** a tick for each step and press where Safari allows it, and the controls work the same without one.
- **The page:** pt-BR, full screen from the Home Screen, portrait on every iPhone, clear of the notch and the home indicator. It never scrolls, zooms or selects text.
- **A Home Screen app:** a web app manifest and Safari's iOS tags make it **FMTV Controller** on the Home Screen: standalone, portrait, black background and theme, a black-translucent status bar, a viewport covering the whole screen with the content inside the safe areas, and the app icon from `design.pen` at 180, 192 and 512 px.
- **The protocol:** the key messages (intention plus press, hold start or hold end, and their acknowledgement) are defined with JSON examples that free-my-tv's tests will also read.

Start by designing the controls screen in a new `design.pen` in this repository, matching the Home's dark, Apple TV–style look. Set up the project with Preact, TypeScript and Vite.

The spec is `.scratch/web-remote/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 06, 07 and 09 live in free-my-tv; 03, 04, 05 and 08 in free-my-tv-remote-controller.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] The controls screen matches its design on an iPhone-sized viewport
- [x] Each gesture and button sends the right intention and direction to the fake bridge
- [x] A tap sends OK, never a move; holding sends a hold start then a hold end
- [x] Volume repeats while held and stops on release
- [x] The page doesn't scroll, zoom or select text under the Touchpad
- [x] JSON examples exist for every key message, and the page's tests read them
- [ ] Added to the Home Screen in the iOS Simulator's Safari (not checked: this Mac has no Xcode, so no iOS Simulator; the manifest, the iOS tags and the icons are served and checked by curl; the real iPhone checks it in 09), it shows as FMTV Controller with its icon and opens standalone, in portrait, with nothing under the notch or the home indicator
- [x] Tests drive the rendered page against the fake bridge only, never its components' internals

## Comments

**2026-10-26, done.** The page is Preact, TypeScript and Vite; 26 KB of JS, 10 KB gzipped. The controls follow `design.pen` without the tab bar, the keyboard button and the Shortcut Buttons row, which belong to the companion features after the first release. 17 tests drive the rendered page against a mock-socket bridge and compare what crosses the WebSocket with `protocol/examples/`. `npm run dev` runs a fake bridge inside Vite, so the page can be tried from a phone; in the browser pane a 250 px swipe printed five `right press`es and the buttons their keys. Tests caught a double `hold-end` on releasing a held Touchpad, fixed.
