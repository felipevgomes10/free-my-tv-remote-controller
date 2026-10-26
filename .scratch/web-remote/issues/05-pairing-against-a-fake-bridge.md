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

**Status:** resolved

- [x] The Pairing screens match their design
- [x] A Safari tab suggests adding to the Home Screen; the Home Screen app goes straight to the form
- [x] A successful Pairing keeps the credential and opens the controls, then and on every later open
- [x] Wrong code, Pairing closed and too many tries each show their own message
- [x] JSON examples exist for the Pairing request and every answer, and the page's tests read them

## Comments

**2026-10-26, done.** Pairing is `POST /pair` (protocol/README.md, with an example for the request and each answer and its HTTP status). A Safari tab on iOS (`navigator.standalone === false`) shows Adicionar à Tela de Início first, with a quiet "Parear no Safari mesmo assim" so it never dead-ends; the Home Screen app and any other browser go straight to the form. "Parear" waits for the 4 digits and a name; after a refusal it stays enabled, as in the design, and the refusal clears as soon as the code changes. A TV out of reach gets its own message too. 11 new tests, 28 in all; in the browser pane the dev bridge refused 4821 and accepted 4827, which opened the controls.
