import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app";
import { page, RECONNECT_DELAYS_MS, RESUME_TIMEOUT_MS, TURN_ON_TIMEOUT_MS } from "../src/connection";
import { BRIDGE_URL, examples, FakeBridge } from "./fake-bridge";

let bridge: FakeBridge;

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  localStorage.setItem("fmtv-controller.credential", examples.hello.credential);
  sessionStorage.clear();
});

afterEach(() => {
  cleanup();
  bridge.stop();
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
});

const button = (name: string) => screen.getByRole("button", { name }) as HTMLButtonElement;
const outOfReach = () => screen.queryByText("Sem conexão com a TV");

async function press(name: string) {
  fireEvent.pointerDown(button(name));
  fireEvent.pointerUp(button(name));
  await vi.advanceTimersByTimeAsync(20);
}

async function waitAll(ms: number) {
  await vi.advanceTimersByTimeAsync(ms);
}

function visibility(state: "visible" | "hidden") {
  vi.spyOn(document, "visibilityState", "get").mockReturnValue(state);
  vi.spyOn(document, "hidden", "get").mockReturnValue(state === "hidden");
  fireEvent(document, new Event("visibilitychange"));
}

describe("returning from the phone's lock screen", () => {
  it("opens a fresh connection on return even if the old socket has not reported closing", async () => {
    bridge = new FakeBridge();
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    visibility("hidden");
    visibility("visible");
    expect(button("Voltar").matches(":disabled")).toBe(true);
    await press("Home");
    await waitAll(100);
    expect(bridge.received.filter((message) => message.type === "hello")).toHaveLength(2);
    expect(button("Voltar").matches(":disabled")).toBe(false);
    expect(bridge.keys()).toEqual([]);
  });

  it("keeps the controls visible while reconnecting after a background disconnection", async () => {
    bridge = new FakeBridge();
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    visibility("hidden");
    bridge.goDown();
    await waitAll(20);
    bridge.comeBack();
    visibility("visible");
    expect(outOfReach()).toBeNull();
    expect(button("Voltar").matches(":disabled")).toBe(true);
    await waitAll(100);
    expect(outOfReach()).toBeNull();
    expect(button("Voltar").matches(":disabled")).toBe(false);
  });

  it("shows a real outage after the resume window even if reconnect attempts keep failing", async () => {
    bridge = new FakeBridge();
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    visibility("hidden");
    bridge.goDown();
    await waitAll(20);
    visibility("visible");
    await waitAll(RESUME_TIMEOUT_MS / 2);
    expect(outOfReach()).toBeNull();
    await waitAll(RESUME_TIMEOUT_MS / 2 + 100);
    expect(outOfReach()).toBeTruthy();
    expect(button("Voltar").matches(":disabled")).toBe(true);
    bridge.comeBack();
    await waitAll(RECONNECT_DELAYS_MS.at(-1)! + 100);
    expect(outOfReach()).toBeNull();
    expect(button("Voltar").matches(":disabled")).toBe(false);
  });

  it("bounds the resume window even if the socket opens without an answer", async () => {
    bridge = new FakeBridge();
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    bridge.answer = "nothing";
    visibility("hidden");
    visibility("visible");
    await waitAll(RESUME_TIMEOUT_MS + 100);
    expect(outOfReach()).toBeTruthy();
    expect(button("Voltar").matches(":disabled")).toBe(true);
  });

  it("starts a new resume window if the phone is locked again during reconnection", async () => {
    bridge = new FakeBridge();
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    visibility("hidden");
    bridge.goDown();
    await waitAll(20);
    visibility("visible");
    await waitAll(RESUME_TIMEOUT_MS / 2);
    visibility("hidden");
    await waitAll(RESUME_TIMEOUT_MS * 2);
    bridge.comeBack();
    visibility("visible");
    expect(outOfReach()).toBeNull();
    await waitAll(100);
    expect(outOfReach()).toBeNull();
    expect(button("Voltar").matches(":disabled")).toBe(false);
  });

  it("shows revocation immediately on return instead of hiding it behind reconnection", async () => {
    bridge = new FakeBridge();
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    visibility("hidden");
    bridge.answer = "revoked";
    visibility("visible");
    await screen.findByText("Este aparelho não está mais pareado");
    await waitAll(RESUME_TIMEOUT_MS + 100);
    expect(screen.getByText("Este aparelho não está mais pareado")).toBeTruthy();
    expect(outOfReach()).toBeNull();
  });
});

describe("Sem conexão", () => {
  it("shows when the bridge can't be reached, with the controls disabled", async () => {
    bridge = new FakeBridge({ up: false });
    render(<App bridgeUrl={BRIDGE_URL} />);
    expect(await screen.findByText("Sem conexão com a TV")).toBeTruthy();
    for (const name of ["Voltar", "Home", "Mudo", "Aumentar volume", "Desligar", "Cima", "Baixo", "Esquerda", "Direita", "OK"]) {
      expect(button(name).matches(":disabled")).toBe(true);
    }
  });

  it("returns to the controls by itself when the bridge answers again, without a reload", async () => {
    bridge = new FakeBridge({ up: false });
    const reload = vi.spyOn(page, "reload").mockImplementation(() => {});
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("Sem conexão com a TV");
    bridge.comeBack();
    await waitAll(RECONNECT_DELAYS_MS.at(-1)! + 100);
    expect(await screen.findByText("TV da sala")).toBeTruthy();
    expect(outOfReach()).toBeNull();
    expect(button("Voltar").matches(":disabled")).toBe(false);
    expect(reload).not.toHaveBeenCalled();
  });

  it("shows when a working connection is lost, and comes back", async () => {
    bridge = new FakeBridge();
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    bridge.goDown();
    expect(await screen.findByText("Sem conexão com a TV")).toBeTruthy();
    bridge.comeBack();
    await waitAll(RECONNECT_DELAYS_MS[0] + 100);
    await waitFor(() => expect(outOfReach()).toBeNull());
  });

  it("never sends keys pressed while out of reach, even after reconnecting", async () => {
    bridge = new FakeBridge();
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    bridge.goDown();
    await screen.findByText("Sem conexão com a TV");
    await press("Voltar");
    await press("Home");
    bridge.comeBack();
    await waitAll(RECONNECT_DELAYS_MS[0] + 100);
    await waitFor(() => expect(outOfReach()).toBeNull());
    await waitAll(100);
    expect(bridge.keys()).toEqual([]);
  });

  it("keeps showing the last TV's name while it is out of reach", async () => {
    bridge = new FakeBridge();
    const first = render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    first.unmount();
    bridge.goDown();
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("Sem conexão com a TV");
    expect(screen.getByText("TV da sala")).toBeTruthy();
  });

  it("stops a held D-pad direction on disconnection without resuming after reconnecting", async () => {
    bridge = new FakeBridge();
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    fireEvent.pointerDown(button("Cima"));
    await waitAll(20);
    expect(bridge.keys()).toEqual([["up", "press"]]);
    bridge.goDown();
    await screen.findByText("Sem conexão com a TV");
    await press("Direita");
    bridge.comeBack();
    await waitAll(RECONNECT_DELAYS_MS[0] + 1500);
    expect(outOfReach()).toBeNull();
    expect(bridge.keys()).toEqual([["up", "press"]]);
  });
});

describe("turning the TV on", () => {
  it("says so when nothing answers", async () => {
    bridge = new FakeBridge({ up: false });
    render(<App bridgeUrl={BRIDGE_URL} />);
    fireEvent.click(await screen.findByRole("button", { name: "Tentar ligar a TV" }));
    expect(screen.getByRole("button", { name: "Tentando ligar…" })).toBeTruthy();
    await waitAll(TURN_ON_TIMEOUT_MS + 100);
    expect(await screen.findByText(/A TV não respondeu/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tentar de novo" })).toBeTruthy();
  });

  it("wakes the TV, never toggling its power, when the bridge answers in time", async () => {
    bridge = new FakeBridge({ up: false });
    render(<App bridgeUrl={BRIDGE_URL} />);
    fireEvent.click(await screen.findByRole("button", { name: "Tentar ligar a TV" }));
    bridge.comeBack();
    await waitAll(RECONNECT_DELAYS_MS[0] + 100);
    await screen.findByText("TV da sala");
    await waitFor(() => expect(bridge.keys()).toEqual([["wake", "press"]]));
    expect(bridge.received.find((m) => m.type === "key")).toEqual(examples["key-wake"]);
    expect(outOfReach()).toBeNull();
  });
});

describe("the bridge's states", () => {
  it("explains a Home that isn't linked, and goes back to the controls once it is", async () => {
    bridge = new FakeBridge();
    bridge.answer = "not-linked";
    render(<App bridgeUrl={BRIDGE_URL} />);
    expect(await screen.findByText("O Home ainda não está vinculado à TV")).toBeTruthy();
    bridge.sendState("ready");
    expect(await screen.findByRole("application")).toBeTruthy();
  });

  it("explains a revoked iPhone and offers to pair again, forgetting the credential", async () => {
    bridge = new FakeBridge();
    bridge.answer = "revoked";
    render(<App bridgeUrl={BRIDGE_URL} />);
    expect(await screen.findByText("Este aparelho não está mais pareado")).toBeTruthy();
    await waitAll(RECONNECT_DELAYS_MS.at(-1)! * 2);
    expect(bridge.received.filter((m) => m.type === "hello")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Parear de novo" }));
    expect(screen.getByText("Parear este aparelho")).toBeTruthy();
    expect(localStorage.getItem("fmtv-controller.credential")).toBeNull();
  });

  it("revokes an iPhone in the middle of using it", async () => {
    bridge = new FakeBridge();
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    bridge.sendState("revoked");
    expect(await screen.findByText("Este aparelho não está mais pareado")).toBeTruthy();
  });

  it("reloads once when the bridge asks for a newer page, and never loops", async () => {
    bridge = new FakeBridge();
    bridge.answer = "reload";
    const reload = vi.spyOn(page, "reload").mockImplementation(() => {});
    const first = render(<App bridgeUrl={BRIDGE_URL} />);
    await waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
    first.unmount();
    render(<App bridgeUrl={BRIDGE_URL} />);
    expect(await screen.findByText("Sem conexão com a TV")).toBeTruthy();
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
