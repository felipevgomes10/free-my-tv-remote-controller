# 08: Out of reach: Sem conexão, not linked, revoked

**What to build:** Everything the Web Remote shows when it can't control the TV, against a fake bridge.
- **Sem conexão:** "Sem conexão com a TV", with the controls disabled, whenever the connection is lost or can't be made. The page reconnects by itself and returns to the controls when the TV is back.
- **Turning the TV on:** the Sem conexão screen offers to try turning the TV on, as a power key to the TV's last address, and says so when it didn't work.
- **Not linked:** a screen saying the Home isn't linked to the TV and that the Owner fixes it in Settings → FMTV Controller.
- **Revoked:** a screen saying this phone is no longer paired, offering to pair again.
- **Version:** when told to reload, the page reloads once. It never loops.
- **No replay:** a key pressed without a live connection is dropped, never sent later.
- **Opening with the TV off:** a network-first service worker keeps a copy of the page (ADR 0004). When the bridge answers, every open loads the page it serves; when it doesn't, the saved copy opens on Sem conexão instead of Safari's error page.

Design these screens in this repository's `design.pen` first.

The spec is `.scratch/web-remote/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 06, 07 and 09 live in free-my-tv; 03, 04, 05 and 08 in free-my-tv-remote-controller.

**Blocked by:** 03 (The Web Remote's controls, against a fake bridge)

**Status:** resolved

- [x] The screens match their design
- [x] Losing the fake bridge shows Sem conexão and disables the controls; bringing it back returns to the controls without a reload
- [x] Trying to turn the TV on reports failure when nothing answers
- [x] Not linked and revoked each show their own screen, revoked offering to pair again
- [x] A reload request reloads once, even if the next hello asks again
- [x] Keys pressed while disconnected never reach the fake bridge after reconnecting
- [x] Opened with the bridge down, the saved page shows Sem conexão; with the bridge up again, the next open loads the page the bridge serves, not the saved one
- [x] JSON examples exist for the state messages, and the page's tests read them

## Comments

**2026-10-26, done.** One connection is kept for as long as the page is open (`connection.ts`): lost or never made, it shows Sem conexão and tries again after 1, 2, 4, then every 5 seconds, and at once when the page becomes visible again. Two additions to the protocol, both in `protocol/`: `state` now carries `not-linked` and `revoked`, and a `reload` message; and a `wake` key, which "Tentar ligar a TV" sends instead of `power`, so it can never turn off a TV that happens to be on when the bridge answers. The header keeps the last TV's name while out of reach. 12 new tests, 39 in all; the fake bridge can go down and come back.

The service worker is built from `src/service-worker.js` with every file of the build to keep. In the browser pane with `npm run preview`: once installed, stopping the server and reopening showed the saved page on Sem conexão; rebuilding, restarting and reopening loaded the new build's JS from the network, swapped the cache for the new version and connected. Navigations wait 3 seconds for the network before using the copy, since an unreachable TV can leave a request hanging.
