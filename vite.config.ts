import preact from "@preact/preset-vite";
import { defineConfig } from "vitest/config";
import { fakeBridge } from "./dev/fake-bridge.ts";
import { serviceWorker } from "./plugins/service-worker.ts";

export default defineConfig({
  plugins: [preact(), fakeBridge(), serviceWorker()],
  server: { host: true },
  build: { target: "safari16", assetsInlineLimit: 0 },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
