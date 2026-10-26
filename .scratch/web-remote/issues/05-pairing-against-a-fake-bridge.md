# 05: Pairing on the page, against a fake bridge

**What to build:** Pairing from the Household Member's side, working against a fake bridge.
- **First open:** when opened in a Safari tab, the Web Remote suggests "Adicionar à Tela de Início" before pairing, so that the credential lands in the app that will be used.
- **The form:** the Pairing Code shown on the TV and a name for the phone ("iPhone da Ana").
- **The answers:** success leads to the controls and keeps the credential. Wrong code, Parear aparelho closed on the TV, and too many tries each get their own message.
- **After pairing:** the Web Remote opens straight to the controls every time.
- **The protocol:** the Pairing request and its answers are defined with JSON examples beside the key messages.

Design the Pairing screens in this repository's `design.pen` first.

The spec is `.scratch/web-remote/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 06, 07 and 09 live in free-my-tv; 03, 04, 05 and 08 in free-my-tv-remote-controller.

**Blocked by:** 03 (The Web Remote's controls, against a fake bridge)

**Status:** ready-for-agent

- [ ] The Pairing screens match their design
- [ ] A Safari tab suggests adding to the Home Screen; the Home Screen app goes straight to the form
- [ ] A successful Pairing keeps the credential and opens the controls, then and on every later open
- [ ] Wrong code, Pairing closed and too many tries each show their own message
- [ ] JSON examples exist for the Pairing request and every answer, and the page's tests read them
