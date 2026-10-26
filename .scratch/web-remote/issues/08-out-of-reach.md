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

**Status:** ready-for-agent

- [ ] The screens match their design
- [ ] Losing the fake bridge shows Sem conexão and disables the controls; bringing it back returns to the controls without a reload
- [ ] Trying to turn the TV on reports failure when nothing answers
- [ ] Not linked and revoked each show their own screen, revoked offering to pair again
- [ ] A reload request reloads once, even if the next hello asks again
- [ ] Keys pressed while disconnected never reach the fake bridge after reconnecting
- [ ] Opened with the bridge down, the saved page shows Sem conexão; with the bridge up again, the next open loads the page the bridge serves, not the saved one
- [ ] JSON examples exist for the state messages, and the page's tests read them
