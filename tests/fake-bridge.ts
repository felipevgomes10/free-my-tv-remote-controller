import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Server, WebSocket as MockWebSocket } from "mock-socket";

export const BRIDGE_URL = "ws://tv.test:8766/remote";

// The page always gets mock-socket's WebSocket, so a bridge that is down fails
// like a real unreachable address instead of reaching for the network.
globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;

/** Every JSON example of the protocol, by file name without `.json`. */
export const examples: Record<string, any> = Object.fromEntries(
  readdirSync(join(__dirname, "../protocol/examples"))
    .filter((file) => file.endsWith(".json"))
    .map((file) => [file.replace(/\.json$/, ""), JSON.parse(readFileSync(join(__dirname, "../protocol/examples", file), "utf8"))]),
);

type HelloAnswer = "ready" | "not-linked" | "revoked" | "reload" | "nothing";

/** A bridge that speaks the protocol from the examples and records what the page sends. */
export class FakeBridge {
  private server: Server | undefined;
  private readonly sockets = new Set<any>();
  readonly received: any[] = [];
  tvName = "TV da sala";
  /** What the bridge answers to a `hello`. */
  answer: HelloAnswer = "ready";
  /** Whether Parear aparelho is open on the TV, and whether the code just changed after too many tries. */
  pairing: "open" | "closed" | "too-many-tries" = "open";
  readonly pairingCode = examples["pair-request"].code;
  readonly pairRequests: any[] = [];

  constructor({ up = true } = {}) {
    if (up) this.comeBack();
  }

  /** The TV is off, or the Home restarting: nothing answers at the bridge's address. */
  goDown() {
    for (const socket of this.sockets) socket.close();
    this.sockets.clear();
    this.server?.stop();
    this.server = undefined;
  }

  comeBack() {
    if (this.server) return;
    this.server = new Server(BRIDGE_URL, { mock: false });
    this.server.on("connection", (socket) => {
      this.sockets.add(socket);
      socket.on("close", () => this.sockets.delete(socket));
      socket.on("message", (data) => {
        const message = JSON.parse(String(data));
        this.received.push(message);
        if (message.type === "hello") this.answerHello(socket);
        if (message.type === "key") socket.send(JSON.stringify({ ...examples.ack, id: message.id }));
      });
    });
  }

  /** Sends a state to every open connection, as the bridge does when Linking or the Paired Phones change. */
  sendState(state: "ready" | "not-linked" | "revoked") {
    for (const socket of this.sockets) socket.send(JSON.stringify({ ...examples[`state-${state}`], tvName: this.tvName }));
  }

  private answerHello(socket: any) {
    if (this.answer === "nothing") return;
    if (this.answer === "reload") return socket.send(JSON.stringify(examples.reload));
    socket.send(JSON.stringify({ ...examples[`state-${this.answer}`], tvName: this.tvName }));
    if (this.answer === "revoked") socket.close();
  }

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

  /** The keys received, without ids, in order. */
  keys(): [string, string][] {
    return this.received.filter((m) => m.type === "key").map((m) => [m.key, m.action]);
  }

  stop() {
    this.goDown();
  }
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}
