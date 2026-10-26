import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app";
import { forgetPictures } from "../src/pictures";
import { BRIDGE_URL, examples, FakeBridge } from "./fake-bridge";

let bridge: FakeBridge;

beforeEach(() => {
  bridge = new FakeBridge();
  bridge.lists.apps = examples["list-apps"].items;
  bridge.lists.inputs = examples["list-inputs"].items;
  for (const app of examples["list-apps"].items) bridge.pictures[app.picture] = "png";
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

async function openApps() {
  render(<App bridgeUrl={BRIDGE_URL} />);
  await screen.findByText("TV da sala");
  fireEvent.click(screen.getByRole("tab", { name: "Apps" }));
}

const sent = (type: string, field: string) => bridge.received.find((m) => m.type === type && field in m);

describe("Todos os apps", () => {
  it("shows every app, as the Home lists them, with its banner", async () => {
    await openApps();
    const section = (await screen.findByRole("heading", { name: "Todos os apps" })).closest("section")!;
    await waitFor(() => expect(within(section).getAllByRole("button")).toHaveLength(3));
    expect(within(section).getAllByRole("button").map((b) => b.getAttribute("aria-label"))).toEqual(["Abrir Netflix", "Abrir YouTube", "Abrir Plex"]);
    await waitFor(() => expect(section.querySelectorAll("img")).toHaveLength(3));
  });

  it("opens an app with the protocol's open", async () => {
    await openApps();
    fireEvent.click(await screen.findByRole("button", { name: "Abrir Netflix" }));
    await waitFor(() => expect(sent("open", "package")).toBeTruthy());
    expect({ ...sent("open", "package"), id: examples["open-app"].id }).toEqual(examples["open-app"]);
  });

  it("follows apps installed or removed on the TV", async () => {
    await openApps();
    await screen.findByRole("button", { name: "Abrir Plex" });
    bridge.push("apps", examples["list-apps"].items.slice(0, 1));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Abrir Plex" })).toBeNull());
  });
});

describe("Entradas", () => {
  it("shows the Inputs by the Owner's names, with their port", async () => {
    await openApps();
    const card = await screen.findByRole("button", { name: "Mudar para PlayStation" });
    expect(card.textContent).toBe("PlayStationHDMI 1");
    expect(screen.getByRole("button", { name: "Mudar para HDMI 2" }).textContent).toBe("HDMI 2");
  });

  it("switches the TV to an Input with the protocol's open", async () => {
    await openApps();
    fireEvent.click(await screen.findByRole("button", { name: "Mudar para PlayStation" }));
    await waitFor(() => expect(sent("open", "input")).toBeTruthy());
    expect({ ...sent("open", "input"), id: examples["open-input"].id }).toEqual(examples["open-input"]);
  });

  it("marks an Input the TV couldn't switch to", async () => {
    bridge.failing.open = "error";
    await openApps();
    const card = await screen.findByRole("button", { name: "Mudar para Antena" });
    fireEvent.click(card);
    await waitFor(() => expect(card.className).toContain("failed"));
  });

  it("is left out when the TV has no Inputs to show", async () => {
    bridge.lists.inputs = [];
    await openApps();
    await screen.findByRole("button", { name: "Abrir Netflix" });
    expect(screen.queryByRole("heading", { name: "Entradas" })).toBeNull();
  });
});
