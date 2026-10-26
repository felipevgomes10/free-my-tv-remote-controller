# 03: The Web Remote's controls, against a fake bridge

**What to build:** The Web Remote's main screen, working end to end against a fake bridge that speaks the protocol.
- **The Touchpad:** swiping moves the focus one step, a longer swipe several, a tap presses OK, and touching and holding is holding OK. A tap is never mistaken for a short swipe.
- **The buttons:** Voltar; Home, where two quick presses are two Home presses and holding is holding Home; play/pause; volume up and down, repeating while held; mute; power.
- **Haptics:** a tick for each step and press where Safari allows it, and the controls work the same without one.
- **The page:** pt-BR, full screen from the Home Screen, portrait on every iPhone, clear of the notch and the home indicator. It never scrolls, zooms or selects text.
- **The protocol:** the key messages (intention plus press, hold start or hold end, and their acknowledgement) are defined with JSON examples that free-my-tv's tests will also read.

Start by designing the controls screen in a new `design.pen` in this repository, matching the Home's dark, Apple TV–style look. Set up the project with Preact, TypeScript and Vite.

The spec is `.scratch/web-remote/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 06, 07 and 09 live in free-my-tv; 03, 04, 05 and 08 in free-my-tv-remote-controller.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The controls screen matches its design on an iPhone-sized viewport
- [ ] Each gesture and button sends the right intention and direction to the fake bridge
- [ ] A tap sends OK, never a move; holding sends a hold start then a hold end
- [ ] Volume repeats while held and stops on release
- [ ] The page doesn't scroll, zoom or select text under the Touchpad
- [ ] JSON examples exist for every key message, and the page's tests read them
- [ ] Tests drive the rendered page against the fake bridge only, never its components' internals
