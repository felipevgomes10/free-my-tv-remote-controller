import "@fontsource-variable/figtree";
import { render } from "preact";
import { App } from "./app";
import { bridgeUrl } from "./bridge";
import "./styles.css";

// Pinch and double-tap zoom only ever get in the way of the Touchpad.
for (const type of ["gesturestart", "gesturechange", "dblclick"]) {
  document.addEventListener(type, (event) => event.preventDefault(), { passive: false });
}

render(<App bridgeUrl={bridgeUrl(location)} />, document.getElementById("app")!);
