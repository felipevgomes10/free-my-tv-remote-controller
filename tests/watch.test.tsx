import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app";
import { forgetPictures } from "../src/pictures";
import { BRIDGE_URL, examples, FakeBridge } from "./fake-bridge";

let bridge: FakeBridge;

beforeEach(() => {
  bridge = new FakeBridge();
  bridge.lists["up-next"] = examples["list-up-next"].items;
  for (const entry of examples["list-up-next"].items) bridge.pictures[entry.picture] = "png";
  vi.stubGlobal("fetch", bridge.fetch);
  vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: (blob: Blob) => `blob:test/${blob.size}` }));
  localStorage.setItem("fmtv-controller.credential", examples.hello.credential);
});

afterEach(() => {
  cleanup();
  bridge.stop();
  vi.unstubAllGlobals();
  localStorage.clear();
  forgetPictures();
});

async function openWatch() {
  render(<App bridgeUrl={BRIDGE_URL} />);
  await screen.findByText("TV da sala");
  fireEvent.click(screen.getByRole("tab", { name: "Assistir" }));
}

describe("Continuar assistindo", () => {
  it("shows each entry with its picture, progress, episode, app and time left", async () => {
    await openWatch();
    const section = (await screen.findByRole("heading", { name: "Continuar assistindo" })).closest("section")!;
    await waitFor(() => expect(within(section).getAllByRole("button")).toHaveLength(3));
    expect(within(section).getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Sombras do NorteT2, E4: O farolNetflix, faltam 18 min",
      "Cidade de vidroT1, E7: ReflexosMax, faltam 1h12",
      "Continuar no GloboplayGloboplay",
    ]);
    await waitFor(() => expect(section.querySelectorAll("img")).toHaveLength(3));
    const bars = [...section.querySelectorAll<HTMLElement>(".up-next-progress > span")].map((bar) => bar.style.width);
    expect(bars).toEqual(["62%", "30%"]);
  });

  it("resumes an entry on the TV with the protocol's open", async () => {
    await openWatch();
    fireEvent.click(await screen.findByRole("button", { name: "Continuar Sombras do Norte" }));
    await waitFor(() => expect(bridge.received.find((m) => m.type === "open")).toBeTruthy());
    expect({ ...bridge.received.find((m) => m.type === "open"), id: examples["open-up-next"].id }).toEqual(examples["open-up-next"]);
  });

  it("marks an entry the TV couldn't resume", async () => {
    bridge.failing.open = "not-installed";
    await openWatch();
    const entry = await screen.findByRole("button", { name: "Continuar no Globoplay" });
    fireEvent.click(entry);
    await waitFor(() => expect(entry.className).toContain("failed"));
  });

  it("follows the TV's Up Next Tray, and hides when it's empty", async () => {
    await openWatch();
    await screen.findByRole("button", { name: "Continuar Cidade de vidro" });
    bridge.push("up-next", examples["list-up-next"].items.slice(0, 1));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Continuar Cidade de vidro" })).toBeNull());
    bridge.push("up-next", []);
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Continuar assistindo" })).toBeNull());
  });
});
