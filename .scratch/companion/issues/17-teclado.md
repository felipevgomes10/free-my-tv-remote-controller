# 17: The Teclado

**What to build:** The Teclado sheet from `design.pen`, opened by the keyboard button on Controle: the field's name when the TV tells it, the text mirrored on the TV as it's typed, clear, the keyboard's return submitting, Concluído and swiping down closing; "Nenhum campo de texto aberto na TV" when the TV says none is open. What it sends follows ADR 0007, from ticket 02.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** 02 (Prototype: typing on the TV), 03 (The tabs and protocol version 2)

**Status:** ready-for-agent

- [ ] The sheet matches `design.pen`, with and without a text field open
- [ ] Typing, clearing and submitting send what ADR 0007 decides, with its examples
- [ ] The page's tests read the examples
