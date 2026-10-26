import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { App } from "../src/app";
import { BRIDGE_URL, examples, FakeBridge } from "./fake-bridge";

let bridge: FakeBridge;

beforeEach(() => {
  bridge = new FakeBridge();
  bridge.lists.shortcuts = examples["list-shortcuts"].items;
  localStorage.setItem("fmtv-controller.credential", examples.hello.credential);
});

afterEach(() => {
  cleanup();
  bridge.stop();
  localStorage.clear();
});

async function open() {
  render(<App bridgeUrl={BRIDGE_URL} />);
  await screen.findByText("TV da sala");
}

describe("the Shortcut Buttons", () => {
  it("shows each button by what the Owner assigned to it", async () => {
    await open();
    const row = await screen.findByRole("group", { name: "Botões de atalho" });
    expect([...row.querySelectorAll("button")].map((b) => b.textContent)).toEqual([
      "Netflix",
      "Globoplay",
      "Prime Video",
      "Disney+",
      "YouTube",
      "PlayStation",
    ]);
    expect(bridge.received.find((m) => m.type === "list")).toMatchObject({ of: "shortcuts" });
  });

  it("opens a button's target with the protocol's open", async () => {
    await open();
    fireEvent.click(await screen.findByRole("button", { name: "Abrir Netflix" }));
    await waitFor(() => expect(bridge.received.find((m) => m.type === "open")).toBeTruthy());
    const sent = bridge.received.find((m) => m.type === "open");
    expect({ ...sent, id: examples["open-shortcut"].id }).toEqual(examples["open-shortcut"]);
  });

  it("marks a button whose target failed", async () => {
    bridge.failing.open = "not-installed";
    await open();
    const button = await screen.findByRole("button", { name: "Abrir Globoplay" });
    fireEvent.click(button);
    await waitFor(() => expect(button.className).toContain("failed"));
  });

  it("shows what the Owner reassigns, as the Home pushes it", async () => {
    await open();
    await screen.findByRole("button", { name: "Abrir Netflix" });
    bridge.push("shortcuts", [{ shortcut: "netflix", label: "Plex" }]);
    expect(await screen.findByRole("button", { name: "Abrir Plex" })).toBeTruthy();
  });

  it("is left out when the Home has none to list", async () => {
    bridge.lists.shortcuts = [];
    await open();
    await new Promise((r) => setTimeout(r, 30));
    expect(screen.queryByRole("group", { name: "Botões de atalho" })).toBeNull();
  });
});
