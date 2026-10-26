# Keys reach the TV through its own ADB, driven by the Home

ADR 0001 sent keys through the TV Remote Service, but that service refuses its command connection from the TV itself: from `127.0.0.1`, from the TV's own IPv4 and IPv6 alike, while pairing works (free-my-tv's Web Remote ticket 01). Nothing else lets an app put a key into another app: Android keeps key injection for the system, and the key filter's accessibility access can move the focus in standard views but not in YouTube or Netflix, which show it nothing to move. So the Home is an ADB client of the TV's own ADB daemon on `127.0.0.1:5555`, the network debugging the Home's Setup already needs, and passes each key as `cmd input keyevent`, about 50–80 ms each. Every key goes this way, so the Home's own screens, Home pressed twice and held, and the Shortcut Buttons behave exactly as with the Remote.

## Considered Options

- **Accessibility and public APIs only**: no ADB, but no arrows or OK inside YouTube or Netflix, which is a remote that can't navigate.
- **A bridge on an always-on device** (a Raspberry Pi speaking the TV Remote protocol, or a Bluetooth board paired as a remote): real keys everywhere, but one more device to keep running.
- **A native iPhone app** talking to the TV Remote Service directly, as another device: real keys, but signed by Apple, either renewed every 7 days or with a paid developer account, and installed phone by phone instead of from a QR code.

## Consequences

- **Linking is the TV's own "Allow debugging?" prompt**, accepted once with the Remote for the Home's ADB key ("Sempre permitir neste computador"). It's lost if the Owner revokes debugging authorisations, and then the Home asks again.
- **Network debugging must stay on.** It already must, for Setup and Restore. Whether the TCL turns it back on after a reboot is unverified (`service.adb.tcp.port` isn't persisted); when it's off, the Web Remote says the Home isn't linked and the Home's Settings says why.
- **Holding is approximated.** `cmd input` on Android 12 can't keep a key down, so a `hold-start` becomes a long press (`--longpress`) and `hold-end` does nothing: enough for Edit Mode and the Notification Panel, not for a key held for seconds.
- **The ADB port is no more exposed than before**: it was already open on the home network, and every new computer or app still has to be allowed on the TV's screen.
