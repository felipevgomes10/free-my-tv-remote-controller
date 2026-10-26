/**
 * A haptic tick. Safari has no vibration API; on iOS 18+ toggling a switch
 * control produces the system's tick, so the page keeps a hidden one and
 * clicks its label. Where that does nothing, the controls work the same.
 */
let label: HTMLLabelElement | undefined;

export function tick() {
  try {
    if (!label) {
      label = document.createElement("label");
      label.setAttribute("aria-hidden", "true");
      label.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.setAttribute("switch", "");
      input.tabIndex = -1;
      label.append(input);
      document.body.append(label);
    }
    label.click();
  } catch {
    // Decoration only.
  }
}
