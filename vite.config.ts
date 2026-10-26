import preact from "@preact/preset-vite";
import { defineConfig } from "vitest/config";
import { fakeBridge } from "./dev/fake-bridge.ts";

export default defineConfig({
  plugins: [preact(), fakeBridge()],
  server: { host: true },
  build: { target: "safari16", assetsInlineLimit: 0 },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
});
