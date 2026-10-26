import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { Plugin } from "vite";

/**
 * Emits `sw.js` from `src/service-worker.js` with every file of the build to
 * keep, and a version that changes whenever any of them does.
 */
export function serviceWorker(): Plugin {
  return {
    name: "fmtv-service-worker",
    apply: "build",
    generateBundle(_, bundle) {
      const files = Object.keys(bundle).filter((file) => !file.endsWith(".map"));
      const precache = ["/", ...files.filter((file) => file !== "index.html").map((file) => `/${file}`)];
      const extras = ["/manifest.webmanifest", "/icons/apple-touch-icon.png", "/icons/icon-192.png", "/icons/icon-512.png"];
      const all = [...precache, ...extras];
      const version = createHash("sha256").update(all.join("\n")).digest("hex").slice(0, 12);
      const source = readFileSync(new URL("../src/service-worker.js", import.meta.url), "utf8")
        .replace("self.__VERSION__", JSON.stringify(version))
        .replace("self.__PRECACHE__", JSON.stringify(all));
      this.emitFile({ type: "asset", fileName: "sw.js", source });
    },
  };
}
