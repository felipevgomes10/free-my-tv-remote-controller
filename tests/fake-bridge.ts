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
