import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app";
import { forgetPictures } from "../src/pictures";
import { SHORTCUT_HOLD_MS } from "../src/components/ShortcutTargetButton";
import { BRIDGE_URL, examples, FakeBridge } from "./fake-bridge";

const STORAGE_KEY = "fmtv-controller.shortcuts.v1";
const netflix = { kind: "app", target: "com.netflix.ninja", label: "Netflix" };
const playstation = { kind: "input", target: examples["list-inputs"].items[0].input, label: "PlayStation" };
let bridge: FakeBridge;

beforeEach(() => {
  bridge = new FakeBridge();
  bridge.lists.apps = examples["list-apps"].items;
  bridge.lists.inputs = examples["list-inputs"].items;
  bridge.lists["open-apps"] = examples["list-open-apps"].items;
  bridge.lists.shortcuts = examples["list-shortcuts"].items;
  vi.stubGlobal("fetch", bridge.fetch);
  localStorage.setItem("fmtv-controller.credential", examples.hello.credential);
});

afterEach(() => {
  cleanup();
  bridge.stop();
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
  forgetPictures();
});

async function open() {
  render(<App bridgeUrl={BRIDGE_URL} />);
  await screen.findByText("TV da sala");
}
async function apps() {
  await open();
  fireEvent.click(screen.getByRole("tab", { name: "Apps" }));
  await screen.findByRole("button", { name: "Abrir Netflix" });
}
function pointer(button: HTMLElement, type: string, x = 0, y = 0) {
  const event = new MouseEvent(type, { bubbles: true, button: 0, clientX: x, clientY: y });
  Object.defineProperties(event, { pointerId: { value: 1 }, isPrimary: { value: true } });
  fireEvent(button, event);
}
async function hold(button: HTMLElement) {
  vi.useFakeTimers();
  pointer(button, "pointerdown");
  await act(async () => { await vi.advanceTimersByTimeAsync(SHORTCUT_HOLD_MS); });
  pointer(button, "pointerup");
  fireEvent.click(button, { detail: 1 });
  vi.useRealTimers();
}
function addSelected() {
  fireEvent.click(screen.getByRole("button", { name: "Adicionar aos atalhos" }));
}
function controls() { fireEvent.click(screen.getByRole("tab", { name: "Controle" })); }
const saved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
const rowLabels = () => within(screen.getByRole("group", { name: "Atalhos de apps e entradas" })).getAllByRole("button").map((item) => item.textContent);

describe("this phone's configurable shortcuts", () => {
  it("starts with guidance and links to Apps instead of copying physical buttons", async () => {
    await open();
    expect(screen.getByText("Segure um app ou entrada na aba Apps para adicionar aqui.")).toBeTruthy();
    expect(screen.queryByRole("group", { name: "Botões de atalho" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    await screen.findByRole("button", { name: "Abrir Netflix" });
    expect(bridge.received.some((m) => m.type === "list" && m.of === "shortcuts")).toBe(false);
  });

  it("holds an app to add it without opening it, then opens its exact package from Controls", async () => {
    await apps();
    await hold(screen.getByRole("button", { name: "Abrir Netflix" }));
    expect(screen.getByRole("dialog", { name: "Netflix" })).toBeTruthy();
    expect(bridge.received.filter((m) => m.type === "open")).toHaveLength(0);
    addSelected();
    expect(saved()).toEqual([netflix]);
    controls();
    expect(rowLabels()).toEqual(["Netflix"]);
    fireEvent.click(screen.getByRole("button", { name: "Abrir Netflix" }));
    await waitFor(() => expect(bridge.received.find((m) => m.type === "open")).toMatchObject({ package: netflix.target }));
    expect(bridge.received.find((m) => m.type === "open")).not.toHaveProperty("shortcut");
  });

  it("adds an Input and opens the same Input from Controls", async () => {
    await apps();
    await hold(screen.getByRole("button", { name: "Mudar para PlayStation" }));
    addSelected();
    controls();
    fireEvent.click(screen.getByRole("button", { name: "Abrir PlayStation" }));
    await waitFor(() => expect(bridge.received.find((m) => m.type === "open")).toMatchObject({ input: playstation.target }));
    expect(saved()).toEqual([playstation]);
  });

  it("keeps the sheet open on the holding finger's release; only a new backdrop tap dismisses it", async () => {
    await apps();
    await hold(screen.getByRole("button", { name: "Abrir Netflix" }));
    const dialog = screen.getByRole("dialog", { name: "Netflix" });
    fireEvent.click(dialog, { clientX: -10, clientY: -10 });
    expect(screen.getByRole("dialog", { name: "Netflix" })).toBeTruthy();
    pointer(dialog, "pointerdown", -10, -10);
    fireEvent.click(dialog, { clientX: -10, clientY: -10 });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(saved()).toEqual([]);
  });

  it("does not duplicate an app added from Abertos and Todos os apps", async () => {
    await apps();
    await hold(screen.getByRole("button", { name: "Voltar para Netflix" }));
    addSelected();
    fireEvent.contextMenu(screen.getByRole("button", { name: "Abrir Netflix" }));
    expect((screen.getByRole("button", { name: "Já está nos atalhos" }) as HTMLButtonElement).disabled).toBe(true);
    expect(saved()).toEqual([netflix]);
  });

  it("supports the keyboard context menu without launching on the TV", async () => {
    await apps();
    fireEvent.keyDown(screen.getByRole("button", { name: "Abrir Plex" }), { key: "F10", shiftKey: true });
    expect(screen.getByRole("dialog", { name: "Plex" })).toBeTruthy();
    expect(bridge.received.filter((m) => m.type === "open")).toHaveLength(0);
    addSelected();
    controls();
    expect(rowLabels()).toEqual(["Plex"]);
  });

  it("reorders mixed apps and Inputs, removes items and keeps the result after reopening", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([netflix, playstation]));
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    const dialog = screen.getByRole("dialog", { name: "Editar atalhos" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Mover PlayStation para antes" }));
    expect(saved()).toEqual([playstation, netflix]);
    expect(within(dialog).getAllByRole("listitem").map((item) => item.querySelector("span")!.textContent)).toEqual(["PlayStationEntrada", "NetflixApp"]);
    expect((screen.getByRole("button", { name: "Mover PlayStation para antes" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Mover PlayStation para depois" }));
    expect(saved()).toEqual([netflix, playstation]);
    fireEvent.click(screen.getByRole("button", { name: "Remover Netflix dos atalhos" }));
    fireEvent.click(screen.getByRole("button", { name: "Concluir" }));
    expect(rowLabels()).toEqual(["PlayStation"]);
    cleanup();
    await open();
    expect(rowLabels()).toEqual(["PlayStation"]);
  });

  it("keeps an explicitly empty list after removing the final shortcut and reopening", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([netflix]));
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    fireEvent.click(screen.getByRole("button", { name: "Remover Netflix dos atalhos" }));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar atalhos" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await screen.findByRole("button", { name: "Abrir Netflix" });
    cleanup();
    await open();
    expect(saved()).toEqual([]);
    expect(screen.queryByRole("group", { name: "Atalhos de apps e entradas" })).toBeNull();
  });

  it.each(["pointermove", "pointercancel", "pointerleave", "lostpointercapture"])("cancels a pending hold on %s", async (event) => {
    await apps();
    vi.useFakeTimers();
    const button = screen.getByRole("button", { name: "Abrir Netflix" });
    pointer(button, "pointerdown");
    pointer(button, event, 20, 0);
    await act(async () => { await vi.advanceTimersByTimeAsync(SHORTCUT_HOLD_MS + 100); });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(saved()).toEqual([]);
  });

  it("cancels the hold when leaving Apps", async () => {
    await apps();
    vi.useFakeTimers();
    pointer(screen.getByRole("button", { name: "Abrir Netflix" }), "pointerdown");
    controls();
    await act(async () => { await vi.advanceTimersByTimeAsync(SHORTCUT_HOLD_MS + 100); });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(saved()).toEqual([]);
  });

  it("marks failed shortcuts and prevents duplicate opens while waiting", async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([netflix]));
    bridge.silentOn.add("open");
    await open();
    const button = screen.getByRole("button", { name: "Abrir Netflix" });
    fireEvent.click(button);
    fireEvent.click(button);
    await waitFor(() => expect(bridge.received.filter((m) => m.type === "open")).toHaveLength(1));
    const request = bridge.received.find((m) => m.type === "open");
    bridge.sendReply({ type: "failed", id: request.id, reason: "not-installed" });
    await waitFor(() => expect(button.className).toContain("failed"));
  });

  it("ignores malformed storage and filters invalid or duplicate entries", async () => {
    localStorage.setItem(STORAGE_KEY, "invalid JSON");
    await open();
    expect(screen.getByRole("button", { name: "Adicionar" })).toBeTruthy();
    cleanup();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([null, netflix, netflix, { kind: "app", target: 42 }, playstation]));
    await open();
    expect(rowLabels()).toEqual(["Netflix", "PlayStation"]);
  });

  it("keeps the list usable and explains when the browser refuses persistence", async () => {
    await apps();
    fireEvent.contextMenu(screen.getByRole("button", { name: "Abrir Netflix" }));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Storage unavailable"); });
    addSelected();
    expect(screen.getByText(/Não deu para salvar os atalhos neste aparelho/)).toBeTruthy();
    controls();
    expect(rowLabels()).toEqual(["Netflix"]);
  });
});
