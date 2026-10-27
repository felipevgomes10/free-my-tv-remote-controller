// Local-only instrumentation for the published page. Never reads pairing credentials.
window.addEventListener("load", () => {
  const variant = window.__FMTV_TEST_VARIANT__ || "Published Controller 0.2.5, full App, simulated bridge";
  const events = [];
  const panel = document.createElement("details");
  panel.style.cssText = "position:fixed;z-index:99999;top:8px;right:8px;max-width:calc(100vw - 16px);max-height:70dvh;overflow:auto;padding:8px;background:#172b45;color:white;border:1px solid #93c5fd;border-radius:12px;font:13px system-ui;touch-action:pan-y";
  panel.innerHTML = '<summary style="min-height:32px;cursor:pointer">Teste PWA 0.2.5 · diagnóstico</summary><p>Esta cópia simula a TV. Não envia comandos para a TV real.</p><label style="display:flex;align-items:center;gap:12px;min-height:60px">Toque nativo de referência <input type="checkbox" switch id="diagnostic-switch" style="width:64px;height:32px;opacity:1;visibility:visible;pointer-events:auto"></label><p>Teste o interruptor acima, feche este painel e teste o pad e os botões. Depois, gere o relato.</p><button type="button" id="diagnostic-refresh">Gerar relato</button><textarea id="diagnostic-report" readonly aria-label="Diagnóstico do PWA" style="display:block;width:100%;min-height:260px;margin-top:10px;color:white;background:#101114;font:12px monospace;user-select:text"></textarea>';
  document.body.append(panel);
  if (window.__FMTV_TEST_VARIANT__) panel.querySelector("summary").textContent = "Teste PWA · correção switch=true";
  const report = panel.querySelector("textarea");
  function inputState(element) {
    if (!element) return null;
    const style = getComputedStyle(element);
    return {
      nativeSwitchAttribute: element.hasAttribute("switch"),
      nativeSwitchProperty: "switch" in element ? element.switch : "indisponível",
      disabled: element.matches(":disabled"),
      appearance: style.appearance,
      webkitAppearance: style.webkitAppearance,
      opacity: style.opacity,
      visibility: style.visibility,
      pointerEvents: style.pointerEvents,
      size: `${style.width} × ${style.height}`,
    };
  }
  function refresh() {
    report.value = JSON.stringify({
      test: variant,
      standaloneNavigator: navigator.standalone ?? "indisponível",
      standaloneDisplay: matchMedia("(display-mode: standalone)").matches,
      secureContext: window.isSecureContext,
      nativeSwitchAPI: "switch" in HTMLInputElement.prototype,
      vibrationAPI: typeof navigator.vibrate,
      pageScripts: Array.from(document.scripts).map((script) => new URL(script.src || location.href).pathname),
      pad: inputState(document.querySelector(".touchpad-switch")),
      button: inputState(document.querySelector(".haptic-trigger input")),
      reference: inputState(panel.querySelector("input")),
      events,
    }, null, 2);
  }
  panel.querySelector("button").addEventListener("click", () => { refresh(); report.focus(); report.select(); });
  report.addEventListener("focus", () => report.select());
  for (const type of ["touchstart", "touchmove", "touchend", "pointerdown", "click"]) {
    document.addEventListener(type, (event) => {
      const target = event.target;
      if (!(target instanceof Element) || panel.contains(target) && target.id !== "diagnostic-switch") return;
      if (events.length >= 24) events.shift();
      events.push({ type, trusted: event.isTrusted, pointerType: event.pointerType, target: target.getAttribute("class") || target.id || target.tagName });
    }, { capture: true, passive: true });
  }
  refresh();
});
