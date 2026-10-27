import { hasNativeSwitchHaptics } from "../haptics";

/**
 * Safari requires a trusted tap, so the label itself sits under the finger.
 * Keep the native switch off the touch surface to preserve scrolling. Its
 * forwarded click must not reach the action a second time.
 * https://github.com/WebKit/WebKit/commit/fc1ef83
 */
export function HapticFeedback({ disabled = false }: { disabled?: boolean }) {
  if (!hasNativeSwitchHaptics()) return null;

  return (
    <label class="haptic-trigger" aria-hidden="true">
      <input type="checkbox" {...{ switch: "" }} tabIndex={-1} disabled={disabled}
        onClick={(event) => event.stopPropagation()} />
    </label>
  );
}
