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
  bridge.lists["open-apps"] = examples["list-open-apps"].items;
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

describe("Loading the Apps tab", () => {
  it("keeps each list's skeleton until its own answer, including an empty answer", async () => {
    bridge.silentOn.add("list");
    await openApps();
    const pending = () => screen.queryAllByRole("status", { name: /^Carregando/ });
    expect(pending()).toHaveLength(3);
    expect(screen.getAllByRole("region").every((section) => section.getAttribute("aria-busy") === "true")).toBe(true);
    expect(screen.queryAllByRole("button")).toHaveLength(0);

    bridge.push("apps", examples["list-apps"].items);
    await screen.findByRole("button", { name: "Abrir Netflix" });
    expect(pending()).toHaveLength(2);
    bridge.push("open-apps", []);
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Abertos" })).toBeNull());
    expect(pending()).toHaveLength(1);
    bridge.push("inputs", []);
    await waitFor(() => expect(pending()).toHaveLength(0));
    expect(screen.queryByRole("heading", { name: "Entradas" })).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Controle" }));
    fireEvent.click(screen.getByRole("tab", { name: "Apps" }));
    expect(pending()).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Abrir Netflix" })).toBeTruthy();
  });

  it("replaces failed requests with a notice rather than leaving skeletons running", async () => {
    bridge.failing.list = "error";
    await openApps();
    await screen.findByText("Não deu para carregar os apps da TV. Tente abrir esta aba de novo.");
    expect(screen.getByText("Não deu para carregar os apps abertos. Tente abrir esta aba de novo.")).toBeTruthy();
    expect(screen.getByText("Não deu para carregar as entradas da TV. Tente abrir esta aba de novo.")).toBeTruthy();
    expect(screen.queryAllByRole("status", { name: /^Carregando/ })).toHaveLength(0);
    expect(screen.getAllByRole("region").every((section) => section.getAttribute("aria-busy") === "false")).toBe(true);
  });
});

describe("Abertos", () => {
  it("shows the Open Apps, most recent first; a playing app says Tocando and has no ✕", async () => {
    await openApps();
    const section = (await screen.findByRole("heading", { name: "Abertos" })).closest("section")!;
    await waitFor(() => expect(within(section).getAllByRole("listitem")).toHaveLength(3));
    expect(within(section).getAllByRole("button", { name: /^Voltar para/ }).map((b) => b.getAttribute("aria-label"))).toEqual([
      "Voltar para YouTube",
      "Voltar para Spotify",
      "Voltar para Netflix",
    ]);
    expect(screen.getByRole("button", { name: "Voltar para Spotify" }).textContent).toBe("SpotifyTocando");
    expect(within(section).getAllByRole("button", { name: /^Fechar/ }).map((b) => b.getAttribute("aria-label"))).toEqual(["Fechar YouTube", "Fechar Netflix"]);
  });

  it("switches the TV back to an Open App with the protocol's open", async () => {
    await openApps();
    fireEvent.click(await screen.findByRole("button", { name: "Voltar para Netflix" }));
    await waitFor(() => expect(sent("open", "package")).toBeTruthy());
    expect({ ...sent("open", "package"), id: examples["open-app"].id }).toEqual(examples["open-app"]);
  });

  it("closes an Open App with close-app, and the card goes once the TV confirms", async () => {
    bridge.silentOn.add("close-app");
    await openApps();
    fireEvent.click(await screen.findByRole("button", { name: "Fechar YouTube" }));
    await waitFor(() => expect(sent("close-app", "package")).toBeTruthy());
    expect({ ...sent("close-app", "package"), id: examples["close-app"].id }).toEqual(examples["close-app"]);
    expect(screen.getByRole("button", { name: "Voltar para YouTube" })).toBeTruthy();

    bridge.silentOn.delete("close-app");
    fireEvent.click(screen.getByRole("button", { name: "Fechar Netflix" }));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Voltar para Netflix" })).toBeNull());
  });

  it("keeps and marks an app the TV couldn't close", async () => {
    bridge.failing["close-app"] = "playing";
    await openApps();
    const close = await screen.findByRole("button", { name: "Fechar YouTube" });
    fireEvent.click(close);
    await waitFor(() => expect(close.className).toContain("failed"));
    expect(screen.getByRole("button", { name: "Voltar para YouTube" })).toBeTruthy();
  });

  it("follows apps opened and closed on the TV, and hides when none is open", async () => {
    await openApps();
    await screen.findByRole("button", { name: "Voltar para Netflix" });
    bridge.push("open-apps", examples["list-open-apps"].items.slice(0, 1));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Voltar para Netflix" })).toBeNull());
    bridge.push("open-apps", []);
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Abertos" })).toBeNull());
  });
});

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
