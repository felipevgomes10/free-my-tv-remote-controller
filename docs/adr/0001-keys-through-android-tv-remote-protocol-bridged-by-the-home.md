# Keys reach the TV through the Android TV Remote protocol, bridged by the Home

A browser can't make another app on the TV receive a key: Android reserves key injection for system apps, the Home's accessibility key filter can only see keys and trigger global actions, and Safari can't open the TLS sockets that Google TV's own remote protocol (v2, the one Google's phone remote uses) needs. So the Home runs a small bridge: it serves the Web Remote's page on the home network, as APK Drop does, and passes each key on to the TV's remote service at `127.0.0.1`, which delivers it to whatever app is on screen.

## Considered Options

- **The Home calls the TV's own ADB daemon over localhost** (`input keyevent`): it controls everything, but network debugging would have to stay on for good, leaving ADB open on the home network.
- **The Home's accessibility service only**: no D-pad or OK inside other apps, so not a remote.
- **The bridge on the owner's computer or a Raspberry Pi**: no changes to the Home, but the Web Remote would stop working whenever that machine is off, and Safari would refuse an HTTPS page calling a plain-HTTP address on the network.

## Consequences

- The Web Remote only works while the Home is alive, so turning the TV on from it is best-effort.
- The Home pairs once with the TV's remote service, and Setup must never disable that service.
- The bridge counts against the Home's memory budget (free-my-tv ADR 0004).
