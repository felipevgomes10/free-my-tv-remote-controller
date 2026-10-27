# 17: The Teclado

**What to build:** The Teclado sheet from `design.pen`, opened by the keyboard button on Controle: the field's name when the TV tells it, the text mirrored on the TV as it's typed, clear, the keyboard's return submitting, Concluído and swiping down closing; "Nenhum campo de texto aberto na TV" when the TV says none is open. What it sends follows ADR 0007, from ticket 02.

The spec is `.scratch/companion/spec.md` in free-my-tv-remote-controller. Tickets are numbered across both repositories: 01, 02, 04, 06, 08, 10, 12, 14, 16, 18 and 19 live in free-my-tv; 03, 05, 07, 09, 11, 13, 15 and 17 in free-my-tv-remote-controller.

**Blocked by:** 02 (Prototype: typing on the TV), 03 (The tabs and protocol version 2)

**Status:** wontfix

- [ ] The sheet matches `design.pen`, with and without a text field open
- [ ] Typing, clearing and submitting send what ADR 0007 decides, with its examples
- [ ] The page's tests read the examples

## Comments

**2026-10-26.** The Owner explicitly chose to run prototype 02 on the TV first, rather than implement an untested accessibility contract. The Home field passed Unicode replacement, clearing and IME submit. YouTube accepted ASCII through ADB but exposed no editable field, and its grid handled Enter as the selected letter instead of submission; generic clear also failed. Netflix's search still needs the Owner to open it with the Remote because it supplied no usable ADB screenshot or accessible labels. See proposed ADR 0007 and ticket 02's results in free-my-tv. The TV was restored to its original Home 0.6.4. No production `text` / `text-field` contract or sheet has been implemented; this ticket remains gated on completing that experiment and settling the supported behaviour.

**2026-10-26, prototype 02 completed.** The Owner opened Netflix's search for the test. Accessibility returned no editable field and refused all replacements, clear and IME submit. Raw ADB Unicode failed; ASCII `acao` returned exit 0 but the Owner confirmed no text appeared. Ticket 02 is resolved with a negative compatibility result; accepted ADR 0007 records the stop condition. This ticket stays `needs-info` until the Owner chooses between investigating another integration for YouTube/Netflix or limiting the sheet to compatible standard fields. The original Home 0.6.4 was restored after testing; no production keyboard contract has been introduced.

**2026-10-26, UHID alternative tested.** The Owner selected the physical HID keyboard experiment. Android registered the external keyboard and kernel events were verified with Netflix focused, but the Owner confirmed no `acao` text appeared; Enter selected a grid letter. The positive control typed ASCII, erased and submitted in the Home. Current TCL IME accent/composition limitations were observed; no layout or IME change was attempted. The simulated device was removed and release 0.6.4 was retained. This experiment does not unblock the Netflix requirement; see ADR 0007 and `typing-alternatives.md` for the evidence.

**2026-10-26, Owner decision: “Melhor deixar sem”.** Close as `wontfix`: FMTV Controller ships without the Teclado button or sheet. Ticket 18's typing integration is also cancelled, and ticket 19 no longer waits for either or validates typing. The experimental probes and their hooks were removed from free-my-tv. ADR 0007 and the experiment's findings remain as the record of why this feature was left out. No production keyboard contract was implemented.
