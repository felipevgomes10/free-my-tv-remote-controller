/**
 * Keeps a finger's moves and release on the element it touched, even past its edges. A pointer
 * the browser doesn't know (one some tool made up, say) can't be captured: the gesture goes on
 * without it rather than failing.
 */
export function capture(element: Element, pointerId: number) {
  try {
    element.setPointerCapture?.(pointerId);
  } catch {
    // Not a live pointer.
  }
}
