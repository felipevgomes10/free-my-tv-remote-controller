# Can native switch dragging provide one haptic per Touchpad step?

Status: resolved
Type: prototype

## Question

Can the owner's iPhone generate a haptic for each 48px Touchpad step, in four directions, through real native switch dragging? The production Touchpad stays unchanged until physical feedback is validated.

## Prototype

The standalone prototype is archived on its dedicated branch, outside `main`: [view the captured HTML](https://github.com/felipevgomes10/free-my-tv-remote-controller/blob/codex/haptic-pad-prototype/.scratch/haptic-pad/prototype/index.html). To recover a self-contained local copy:

```sh
git show codex/haptic-pad-prototype:.scratch/haptic-pad/prototype/index.html > /tmp/fmtv-native-haptic-prototype.html
```

The page makes no requests, controls no TV, stores nothing, and has no external dependencies. Use the Mac's LAN address on the iPhone. The page includes a tap baseline, a native-drag baseline, and the experimental pad with explicit manual result recording.

## Hypotheses and limits

1. WebKit derives the native switch's visual state from a trusted touch's local coordinates. Repositioning the same rendered native input across that threshold during trusted movement may produce a tick per step without a synthetic click.
2. Native iOS touch tracking has a 200ms hold timer. Immediate swipes may miss the first steps, even if slow swipes after a pause work. The prototype marks its candidate phase after 240ms; this does not observe native tracking or haptic hardware.
3. Several 48px steps may arrive in one touchmove. A single native default action cannot guarantee a tick for each; the prototype records merged steps instead of manufacturing clicks.

The candidate uses a transparent native switch directly under the finger, with its native appearance intact. It alternates its coordinate mapping only on a step and preserves that mapping between steps. It tests horizontal, vertical, reversal, immediate and fast gestures. It does not attempt to replace native gesture events or call click(), dispatchEvent(), or navigator.vibrate().

Sources, inspected 2026-10-27:
- [WebKit native touch tracking and local-coordinate thresholds](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/html/CheckboxInputType.cpp)
- [iOS enables switch haptics for tracking as well as click](https://github.com/WebKit/WebKit/blob/main/Source/WebCore/rendering/ios/RenderThemeIOS.h)

## Acceptance on the physical iPhone

- Tap baseline produces a tick.
- Native drag produces ticks before releasing the finger.
- Experimental pad produces ticks aligned with steps for left, right, up and down, including reversals.
- Record immediate and fast movement separately. An extra tick on release, skipped steps, or a required initial pause is a limitation, not a pass.
- Paste the page's generated report into the chat. Never infer physical vibration from trusted events, checked state, or request counts.

## Answer

The owner confirmed physical haptics during native dragging on iOS 26.6.2, and reported one pulse per step in all four scenarios: waiting, immediate movement, reversing and fast movement. See [the original report](../iphone-26.6.2-report.md).

The counter recorded 54 steps, 41 candidate requests, 13 early steps and zero merged steps. This validates the mechanism's perceived feedback, not exact pulse counts. Early steps and multiple steps per touch event remain limits.

The throwaway prototype is captured on local branch `codex/haptic-pad-prototype` at `a90818da89a1`; no prototype code is part of the production entry point. Integration uses the same geometry and timing, with the real Touchpad's gesture logic and separate touch ownership so pointer events cannot duplicate commands.

## Local validation, 2026-10-27

- Standalone script passes `node --check`; no external script or stylesheet dependencies.
- Dedicated static server responds HTTP 200 at `http://192.168.100.227:8767/` in this local session. Only `prototype/` is served; no TV bridge, credentials or production assets are exposed.
- At a 390px phone viewport, four real mouse drags in the desktop browser produce 12 steps and 12 candidate requests: three right, three left, three up, three down; no merged or early steps. All events are trusted. Mouse tracking starts immediately in WebKit; the candidate's 240ms warm-up applies only to touch.
- Generated report leaves every physical haptic result as `Não avaliado`; the UI does not infer vibration from counters.
- The desktop browser has no native switch support. These checks validate the page's gesture instrumentation and phone layout, not native switch behavior or physical haptics.
- [Desktop instrumentation evidence](../evidence/desktop-gestures.jpg).

The production component is checked by the separate [integration harness](../integration-check/index.html). Build it with `node .scratch/haptic-pad/build-check.mjs`, then serve `/tmp/fmtv-touchpad-check` to repeat the physical check of tap, hold and swipe together. This check never connects to the TV.

## Integrated validation

The owner confirmed all three checks on the integrated component: vibration during swipes, one OK on tap, and hold-start/hold-end when holding and releasing. The desktop browser also recorded exactly one OK, a hold-start/hold-end pair, and four Right presses for a 200px drag. Automated page/bridge regression tests cover both touch and pointer event copies, four-direction reversals, immediate movement, holding OK, native cancellation, another finger, blur and unavailable state. The tests verify commands and cleanup, not physical pulse counts.

Final checks: 110 tests passed across 10 files; TypeScript and the production Vite build passed; `git diff --check` passed. [Integrated pad evidence](../evidence/integrated-pad.jpg). Physical validation preceded the production release; the local check did not update the TV.
