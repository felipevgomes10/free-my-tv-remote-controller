// Builds the actual production Touchpad into a local-only physical-device check.
import { fileURLToPath } from "node:url";
import { build } from "vite";
import preact from "@preact/preset-vite";

await build({
  configFile: false,
  root: fileURLToPath(new URL("./integration-check", import.meta.url)),
  base: "./",
  plugins: [preact()],
  build: { outDir: "/tmp/fmtv-touchpad-check", emptyOutDir: true, target: "safari16" },
});
