---
status: accepted
---

# FMTV Controller ships without Teclado

On 2026-10-26, after the TV experiments, the Owner chose to leave FMTV Controller without Teclado: “Melhor deixar sem”. Tickets 17 and 18 are `wontfix`; the Controls tab has no keyboard button/sheet, and protocol 2 gains no `text` / `text-field` contract. The experimental source and CLI probes were removed. The results below preserve the reason for this decision.

The ticket 02 prototype was run on the Owner's TCL TV (Android 12 / API 31), before implementing the Teclado. Accessibility worked in the Home, ADB typed ASCII in YouTube with editing limitations, and neither typed into Netflix's search. A subsequent physical UHID keyboard experiment also failed to type into Netflix's search. These results did not meet the specified experience across the target apps.

## Observed on the TV

| Field | `cmd input text` through the Home's ADB key | Accessibility `ACTION_SET_TEXT` | Detection and submit |
| --- | --- | --- | --- |
| Home: Renomear entrada | `o ultimo trem` arrives intact. Raw `ação` and `Coração` fail with `InputShellCommand.sendText` / `NullPointerException`; they are not automatically transliterated. | `ação`, `Coração` and `o último trem` arrive intact. An empty string clears the field. | The Compose virtual `EditText` is focused and editable and offers `ACTION_SET_TEXT` and `ACTION_IME_ENTER`. Traversal is needed when `findFocus(FOCUS_INPUT)` returns the Compose host. `ACTION_IME_ENTER` closes the dialog and applies the value. Package is known; hint is absent. |
| YouTube 7.27.302: search with its own letter grid visible | `acao` and `Coracao` arrive as lowercase `acao` / `coracao`. Raw `ação` fails with the same exception. | No editable node is exposed; set, clear and IME submit return false. | Neither accessibility nor `dumpsys input_method` distinguishes this search from no text field: `inputType=0x0`, `mInputShown=false`, no served input connection and no hint. Enter activates the selected letter in the grid instead of submitting. Ctrl+A then Delete does not clear the query; `KEYCODE_CLEAR` and `KEYCODE_SEARCH` did not provide the missing clear/submit actions. |
| Netflix 13.2.1 build 27207: search opened by the Owner | `acao` returned exit 0 but the Owner confirmed that no text appeared. Raw `ação`, `Coração` and `o último trem` failed with `InputShellCommand.sendText` / `NullPointerException`. An exit 0 is not proof that Netflix accepted input. | No editable node is exposed. All three Unicode replacements, empty text and IME submit returned false. | With Netflix confirmed in front, accessibility returned `field:null` and `editable:[]`; `input_method` reported `inputType=0x0`, `mInputShown=false`, no served connection and no hint. Screenshots supplied no image, so the visible result was checked by the Owner. Clear/submit cannot be claimed supported. |

## Follow-up: physical HID keyboard simulation

The Owner authorized UHID on 2026-10-26. The TV's native `hid -` created an external physical keyboard, confirmed by `dumpsys input`; `getevent` recorded KEY_A and KEY_ENTER down/up with Netflix's window focused. The Owner confirmed that `acao` did not appear in Netflix's open search, while Enter selected a letter in its grid. This removes a basic device-registration/event-generation failure as the explanation, but does not establish the app's internal reason for ignoring typed letters. UHID does not unblock the specified Netflix keyboard.

The positive control typed ASCII into the Home's field, cleared it with repeated Backspace and submitted with Enter. With the existing TCL input method, Ctrl+A was unreliable during composition and an experimental Generic.kcm accent sequence turned `ação` into `aao`. Portuguese layout/IME alternatives were not configured or validated; YouTube was not retested with UHID. The experiment used a temporary CLI probe in free-my-tv. Closing its native HID stream removed the simulated keyboard. No APK was replaced, and the original Home 0.6.4 and HDMI 1 label were retained. The probe source was then removed when the Owner cancelled the feature.

## Consequences

- Teclado is out of scope, including its release acceptance checks. The existing Controls, Apps and Assistir features retain their current scope.
- The observed limitations below are findings for any future reconsideration; no further integration experiment is scheduled under this decision.

- ASCII injection alone cannot meet the sheet's replace, clear, submit and reliable no-field behaviour in YouTube. A successful ADB command exit code does not establish any of those behaviours.
- If a fallback is chosen, accents must be explicitly normalized before ADB input; arbitrary Unicode must never be passed to `cmd input text` and assumed to work.
- An unobservable custom keyboard must not be reported as a confirmed closed text field. Supporting it would need an explicit unknown state/manual mode or a different integration, with the spec revised before shipping.
- Netflix's result was confirmed by the Owner after the protected probe's `before.roots` and the resumed Activity both identified `com.netflix.ninja`. Installing the debug Home brings the Home forward; the first samples after that installation identified `com.freemytv.home` and were discarded as Netflix evidence. Focusing the existing Netflix task preserved the Owner's search for the actual experiment.
- The initial experiment used a debug-only broadcast protected by `android.permission.DUMP`. The broadcast, no-op counterpart, key-filter hooks and CLI scripts were all removed after the Owner's final decision. The TV retains its original Home 0.6.4 APK, without clearing app data.
