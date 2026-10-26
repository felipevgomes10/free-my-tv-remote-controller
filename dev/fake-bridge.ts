import type { IncomingMessage, Server, ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";
import { WebSocketServer } from "ws";

/**
 * A stand-in for the Home's bridge while developing: it answers the protocol
 * on `/remote` of the dev server and prints every key, so the page can be
 * tried in a browser without a TV. Pairing takes the code PAIRING_CODE.
 */
export const PAIRING_CODE = "4827";

export function fakeBridge(tvName = "TV de teste"): Plugin {
  return {
    name: "fmtv-fake-bridge",
    configureServer(server) {
      server.middlewares.use("/pair", pair);
      attach(server.httpServer as Server | null, tvName);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/pair", pair);
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
        } else if (message.type === "list") {
          ws.send(JSON.stringify({ type: "list", id: message.id, of: message.of, items: [] }));
        } else if (message.type !== "hello") {
          console.log(`[ponte de teste] ${message.type} ${JSON.stringify(message)}`);
          ws.send(JSON.stringify({ type: "done", id: message.id }));
        }
      });
    });
  });
}

const pair: Connect.NextHandleFunction = (request: IncomingMessage, response: ServerResponse) => {
  let body = "";
  request.on("data", (chunk) => (body += chunk));
  request.on("end", () => {
    const { code, name } = JSON.parse(body || "{}");
    const ok = code === PAIRING_CODE;
    console.log(`[ponte de teste] pareamento de "${name}" com ${code}: ${ok ? "aceito" : "código errado"}`);
    response.statusCode = ok ? 200 : 401;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(ok ? { credential: `teste-${Date.now()}` } : { error: "wrong-code" }));
  });
};
