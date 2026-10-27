/** Android's optional vibration API. Safari uses real native switch interactions. */
export function tick() {
  try {
    navigator.vibrate?.(10);
  } catch {
    // Decoration only.
  }
}

export function hasNativeSwitchHaptics() {
  return "switch" in HTMLInputElement.prototype && typeof navigator.vibrate !== "function";
}
