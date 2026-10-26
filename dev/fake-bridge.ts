import type { Server } from "node:http";
import type { Plugin } from "vite";
import { WebSocketServer } from "ws";

/**
 * A stand-in for the Home's bridge while developing: it answers the protocol
 * on `/remote` of the dev server and prints every key, so the page can be
 * tried in a browser without a TV.
 */
export function fakeBridge(tvName = "TV de teste"): Plugin {
  return {
    name: "fmtv-fake-bridge",
    configureServer(server) {
      attach(server.httpServer as Server | null, tvName);
    },
    configurePreviewServer(server) {
      attach(server.httpServer as Server | null, tvName);
    },
  };
}

function attach(http: Server | null, tvName: string) {
  if (!http) return;
  const wss = new WebSocketServer({ noServer: true });
  http.on("upgrade", (request, socket, head) => {
    if (request.url !== "/remote") return;
    wss.handleUpgrade(request, socket, head, (ws) => {
      ws.on("message", (data) => {
        const message = JSON.parse(String(data));
        if (message.type === "hello") ws.send(JSON.stringify({ type: "state", state: "ready", tvName }));
        if (message.type === "key") {
          console.log(`[ponte de teste] ${message.key} ${message.action}`);
          ws.send(JSON.stringify({ type: "ack", id: message.id }));
        }
      });
    });
  });
}
