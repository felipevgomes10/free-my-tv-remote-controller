# Installed Chrome PWA controls the TV but produces no haptics

Status: resolved

## Reproduction reported by the owner

After updating to Home 0.6.6 / Controller 0.2.5, keys still reach the TV, but neither the Touchpad nor the buttons vibrate. The owner uses a PWA installed through Chrome on the same iPhone that passed the earlier tests (iOS 26.6.2). Force-closing the PWA through the app switcher and reopening did not restore feedback.

The prior physical integration check covered the real Touchpad component as an ordinary page, with `enabled=true` initially. It did not cover the complete App installed as a PWA, including the initial disabled-to-ready transition. Its positive result must not be treated as validation of this failing scenario.

## Verified delivery

On the real TV, ADB reports `versionName=0.6.6`, `versionCode=33`. All ten static files fetched from `http://192.168.100.18:8766/` match the published Controller 0.2.5 ZIP byte-for-byte. HTML is served with `Cache-Control: no-cache`. The asset paths include `index-Br2R9oog.js` and `index-sBs00B-n.css`.

## Ranked probes

1. **Runtime capability differs in the installed PWA.** Compare native switch support, the presence of `navigator.vibrate`, and actual rendered native inputs. A method existing is not proof of hardware feedback.
2. **Native switch initialization while disabled differs from the passing test.** The full App initially disables controls until the bridge answers. If a newly created reference switch vibrates while the pad does not, compare mounting enabled versus transitioning from disabled.
3. **Complete-page event handling or layout differs.** Capture the actual targets and trusted status of touch events without modifying them. The production bootstrap also installs gesture prevention listeners absent from the isolated harness.
4. **Installed-page lifecycle differs despite current server assets.** The delivered version is verified, but the loaded DOM/script of the owner's original installed app is not observable from the Mac. Avoid deleting its data or pairing to test this hypothesis.

## Full-page diagnostic

Prepare the exact published JavaScript/CSS with local instrumentation:

```sh
python3 .scratch/haptic-pad/prepare-pwa-check.py
npm run preview -- --host 0.0.0.0 --port 8767 --strictPort --outDir /tmp/fmtv-pwa-haptic-check
```

This preserves the published JS and CSS, adds a separate `Teste Tátil` PWA identity and a native reference switch, and uses the existing development fake bridge. Its synthetic credential exists only on the Mac's test origin. No real-TV pairing credential is read, and no keys reach the real TV.

The owner was asked to install this page through Chrome, then report native-reference, Touchpad and button feedback plus the generated capability/event report. Compare an ordinary tab and the installed icon only after observing the actual installed-mode report.

## Current status

The full installed-mode report identified the concrete rendering defect. Runtime capabilities were available (`standaloneNavigator=true`, `standaloneDisplay=true`, `nativeSwitchAPI=true`, `vibrationAPI="undefined"`), but the controls were ordinary checkboxes:

| Control | `hasAttribute("switch")` | DOM `switch` property | Disabled |
| --- | --- | --- | --- |
| Production Touchpad | false | false | false |
| Production button input | false | false | false |
| Independent native reference | true | true | false |

Preact assigns an existing DOM property directly (`node_modules/preact/src/diff/props.js`, `dom[name] = value`). JSX supplied `switch: ""`; WebKit coerces that assignment to boolean false and removes the reflected attribute. Both production inputs therefore lost native switch behavior.

The original jsdom stub was a read-only prototype value. Assigning it threw, so Preact fell back to `setAttribute`, hiding the real browser defect. The regression harness now models WebKit's writable boolean property with an attribute-reflecting getter/setter. This reproduced the failure: 10 tests failed and only the Vibration API case passed. Passing `switch: true` in both components restores all 110 tests and the production build.

The local PWA check now supports `python3 .scratch/haptic-pad/prepare-pwa-check.py --candidate` after `npm run build`. The panel explicitly labels the candidate `correção switch=true`.

## Physical validation of the fix

The owner closed and reopened the installed `Teste Tátil` PWA through the app switcher, verified the candidate panel and tested the complete page with the panel closed. To the question “o pad e os botões agora vibram?”, the owner answered **“Sim, pad e botões vibram”**. This directly covers the failing Chrome-installed PWA scenario, not just the isolated Touchpad.

All 110 tests and the TypeScript/Vite production build pass with the corrected reflection model. The fix changes only the two native switch props from an empty string to boolean true. It does not change gesture timing, the bridge protocol, pairing or layout.
