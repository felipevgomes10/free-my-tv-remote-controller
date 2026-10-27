# Teclado alternatives after prototype 02

Research date: 2026-10-26. No alternative below has passed the Home / YouTube / Netflix test matrix on the Owner's TV. The original research was read-only. The Owner subsequently authorized a UHID experiment; its measured results follow. The Home remains at its original 0.6.4 release.

**Final decision:** The Owner chose to leave out Teclado (“Melhor deixar sem”). Tickets 17/18 are `wontfix`, the probes were removed and the alternatives below are historical research rather than pending implementation work. See ADR 0007.

## UHID keyboard: tested, does not solve Netflix text entry

scrcpy implements `--keyboard=uhid`, which creates a simulated physical HID keyboard using the device's UHID kernel interface and works over TCP/IP. It requires configuring a keyboard layout. This is a different input path from `cmd input text`; its documentation describes support for characters and IMEs beyond the SDK keyboard mode. It does not establish Netflix compatibility. [scrcpy keyboard documentation](https://github.com/Genymobile/scrcpy/blob/master/doc/keyboard.md#uhid)

Read-only checks on the Owner's TCL returned:

```text
crw-rw---- 1 uhid uhid 10, 239 ... /dev/uhid
UHID_WRITABLE_BY_ADB_SHELL
```

The second line was the preliminary result of `test -w /dev/uhid`. The follow-up experiment then created a real UHID device through the TV's existing `/system/bin/hid -`, without installing an APK or changing permissions. Android classified `FMTV UHID typing prototype` as `KEYBOARD | ALPHAKEY | EXTERNAL`, using `Generic.kl` and `Generic.kcm`. `getevent` confirmed physical `KEY_A` and `KEY_ENTER` down/up events, and InputDispatcher's focused window was Netflix.

The Owner confirmed **no text appeared** after `acao` was sent to the open Netflix search. The Owner then confirmed **Enter selected a letter in the grid**, rather than submitting the query. Device registration and event delivery therefore work, but this tested HID path does not provide the specified Netflix text entry. The Netflix input method state still had `inputType=0x0` and no served connection.

As a positive control, the same simulated keyboard typed ASCII `Coracao` and `o ultimo trem` into the Home's Renomear entrada dialog. Repeated Backspace cleared the field and Enter submitted the empty name, restoring the original HDMI 1 label. Ctrl+A was not reliable while the TCL IME had composing text. The experimental `Generic.kcm` Alt/dead-key sequence for `ação` produced `aao`, so Unicode is **not** verified with the current `com.tcl.inputmethod.international/.T_IME`; no alternative physical keyboard layout or IME was selected. YouTube was not retested with UHID in this follow-up.

The temporary CLI accepted JSON lines, checked the foreground package before each action, and released/removed the keyboard when its stream closed. All test streams were closed, the simulated keyboard disappeared from `dumpsys input`, and the original release APK was never replaced during this experiment. The temporary UI dump on the TV was removed. The CLI source was subsequently removed with the cancelled feature.

A possible production design could drive a persistent shell helper through the Home's existing ADB connection, but these results do not justify implementing it as the ticket's universal keyboard. The Home's ordinary app UID must not be assumed to have the shell's access.

Test ASCII, `ação`, `Coração`, `o último trem`, Backspace, clear and Return on all three target fields. Also measure latency, helper lifecycle and the Home's memory budget. UHID alone does not expose a custom app's text field or current text, so successful typing would still leave field detection and synchronization to solve. Do not report an unknown field as closed.

## Other choices

| Approach | Benefit | Constraint for this project |
| --- | --- | --- |
| Custom Android input method (IME) | Use `InputConnection` to commit Unicode, edit text and invoke editor actions when the target supplies that connection. | The tested YouTube/Netflix searches exposed `TYPE_NULL` and no served input connection. Android documents raw-key-only behaviour for `TYPE_NULL`; a custom IME is not evidence that either search will support rich editing. It must be enabled/selected as a keyboard. |
| Automate each app's letter grid | Translate phone text into the same D-pad/OK operations already used by the Web Remote. | A proposal requiring its own prototype: known initial focus, a verified layout, accents/clear/search actions and recovery when the Owner moves focus. Slower and sensitive to app/layout changes. Netflix supplies no accessible labels or usable screenshot in the current experiment. |
| Android TV Remote v2 from another device | The maintained client and Home Assistant support sending text via IME messages. | A machine outside the TV would be required under the measured localhost restriction. Home Assistant explicitly documents Netflix command failures, also in Google's mobile apps. This cannot be presented as a Netflix fix. |
| Search in Assistir and open the result on the TV | Avoid typing in the app where a title/search link works. | Changes the interaction. Local ADR 0014 confirms YouTube search links, but the tested Netflix title links were ignored; this does not currently solve Netflix search. |
| Limit Teclado to compatible standard fields | Ship the demonstrated Unicode/clear/submit flow through accessibility. | Explicitly narrow the ticket/spec; do not claim support for the tested custom searches. |

Android's IME contract: text generation uses the current `InputConnection`; `TYPE_NULL` targets support only raw keys. `onStartInput` / `onFinishInput` provide target lifecycle where the IME contract is used. [InputMethodService documentation](https://developer.android.com/reference/android/inputmethodservice/InputMethodService#GeneratingText)

Remote v2 text support is described by [Home Assistant's sending-text documentation](https://www.home-assistant.io/integrations/androidtv_remote/#sending-text-input) and implemented by [androidtvremote2's `send_text`](https://github.com/tronikos/androidtvremote2/blob/main/src/androidtvremote2/remote.py). Its Netflix limitation is explicit in [Home Assistant's known issues](https://www.home-assistant.io/integrations/androidtv_remote/#limitations-and-known-issues). Availability of text messages does not prove target-app support.

## Local constraints checked in source

- [ADR 0005](../../docs/adr/0005-keys-through-the-tvs-own-adb.md) records that command connections originating on the TV were refused, although external connections worked. See free-my-tv's `.scratch/web-remote/issues/01-prototype-reach-the-tv-remote-service.md` for the measured details. Do not propose Remote v2 on localhost as an untested replacement for ADB.
- free-my-tv's `docs/adr/0014-titles-open-in-their-services-apps.md`, `ServiceLinks.kt` and `Explorar.watch` restrict deep links to behaviours verified on the Owner's TV. Netflix currently falls back to opening its app.
- The AOSP `cmd input text` implementation already selects `SOURCE_KEYBOARD` by default and turns characters into key events through `KeyCharacterMap`. Merely adding `keyboard` is not a new integration or a justified fix. The Owner's firmware's help text labels the default differently, so an explicit-source comparison could be a small diagnostic experiment, not a compatibility promise. [AOSP implementation](https://android.googlesource.com/platform/frameworks/base/+/8417c7bb1cbb/services/core/java/com/android/server/input/InputShellCommand.java)
- Avoid building the solution on `ACTION_MULTIPLE`: Android documents it as no longer used by the input system since API 29. [KeyEvent documentation](https://developer.android.com/reference/android/view/KeyEvent#ACTION_MULTIPLE)

After the UHID result, grid automation and compatible-field scope were considered as further options. The Owner instead chose to leave out the feature. An external Remote v2 bridge and a custom IME would add substantial integration work without current evidence that they solve this Netflix search. No further experiment is pending.
