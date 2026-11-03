# 01: Add and edit this phone's shortcuts

Status: resolved

Implement the flow in [the spec](../spec.md). Preserve short taps and native button haptics, cancel pending holds during scrolling and teardown, and keep editing usable with touch and keyboard.

## Comments

2026-11-03: Implementation uses a shared provider across tabs, versioned browser storage, a native modal sheet, and pointer holds cancelled by movement, pointer cancellation, leave, lost capture, blur, visibility changes and unmount. The bridge protocol is unchanged. Validation complete: 147 tests and production build passed, with Chromium mouse/touch, modal focus and 320/390 px layout checks. See `../validation.md`.
