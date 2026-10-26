import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Server } from "mock-socket";

export const BRIDGE_URL = "ws://tv.test:8766/remote";

/** Every JSON example of the protocol, by file name without `.json`. */
export const examples: Record<string, any> = Object.fromEntries(
  readdirSync(join(__dirname, "../protocol/examples"))
    .filter((file) => file.endsWith(".json"))
    .map((file) => [file.replace(/\.json$/, ""), JSON.parse(readFileSync(join(__dirname, "../protocol/examples", file), "utf8"))]),
);

/** A bridge that speaks the protocol from the examples and records what the page sends. */
export class FakeBridge {
  readonly server = new Server(BRIDGE_URL);
  readonly received: any[] = [];
  tvName = "TV da sala";
  answerHello = true;
  /** Whether Parear aparelho is open on the TV, and whether the code just changed after too many tries. */
  pairing: "open" | "closed" | "too-many-tries" = "open";
  readonly pairingCode = examples["pair-request"].code;
  readonly pairRequests: any[] = [];

  /** The bridge's HTTP side, for `vi.stubGlobal("fetch", bridge.fetch)`. */
  readonly fetch = async (url: string, init?: RequestInit): Promise<Response> => {
    if (url !== "/pair" || init?.method !== "POST") return json(404, {});
    const request = JSON.parse(String(init.body));
    this.pairRequests.push(request);
    if (this.pairing === "closed") return json(409, examples["pair-closed"]);
    if (this.pairing === "too-many-tries") return json(429, examples["pair-too-many-tries"]);
    if (request.code !== this.pairingCode) return json(401, examples["pair-wrong-code"]);
    return json(200, examples["pair-success"]);
  };

  constructor() {
    this.server.on("connection", (socket) => {
      socket.on("message", (data) => {
        const message = JSON.parse(String(data));
        this.received.push(message);
        if (message.type === "hello" && this.answerHello) {
          socket.send(JSON.stringify({ ...examples["state-ready"], tvName: this.tvName }));
        }
        if (message.type === "key") socket.send(JSON.stringify({ ...examples.ack, id: message.id }));
      });
    });
  }

  /** The keys received, without ids, in order. */
  keys(): [string, string][] {
    return this.received.filter((m) => m.type === "key").map((m) => [m.key, m.action]);
  }

  stop() {
    this.server.stop();
  }
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
