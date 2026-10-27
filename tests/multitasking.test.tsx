import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app";
import { REQUEST_TIMEOUT_MS } from "../src/bridge";
import { RECONNECT_DELAYS_MS } from "../src/connection";
import { BRIDGE_URL, examples, FakeBridge } from "./fake-bridge";

let bridge: FakeBridge;
beforeEach(() => {
  bridge = new FakeBridge();
  localStorage.setItem("fmtv-controller.credential", examples.hello.credential);
});
afterEach(() => { cleanup(); bridge.stop(); vi.useRealTimers(); localStorage.clear(); });
const button = () => screen.getByRole("button", { name: "Multitarefas" }) as HTMLButtonElement;
const requests = () => bridge.received.filter((m) => m.type === "open-app-switcher");
async function open() {
  render(<App bridgeUrl={BRIDGE_URL} />);
  await screen.findByText("TV da sala");
  await waitFor(() => expect(button().disabled).toBe(false));
}

describe("Multitarefas", () => {
  it("exists without shortcuts or open apps and sends the shared example without Home keys", async () => {
    await open();
    fireEvent.click(button());
    await waitFor(() => expect(requests()).toHaveLength(1));
    expect({ ...requests()[0], id: 42 }).toEqual(examples["open-app-switcher"]);
    expect(bridge.keys()).toEqual([]);
    expect(screen.getByRole("application")).toBeTruthy();
    await waitFor(() => expect(button().disabled).toBe(false));
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("prevents duplicate actions while pending and accepts another show after success", async () => {
    bridge.silentOn.add("open-app-switcher");
    await open();
    fireEvent.click(button());
    fireEvent.click(button());
    await waitFor(() => expect(requests()).toHaveLength(1));
    expect(button().disabled).toBe(true);
    expect(button().getAttribute("aria-busy")).toBe("true");
    bridge.sendReply({ ...examples["app-switcher-shown"], id: requests()[0].id });
    await waitFor(() => expect(button().disabled).toBe(false));
    fireEvent.click(button());
    await waitFor(() => expect(requests()).toHaveLength(2));
  });

  it.each([
    ["overlay-unavailable", "Não foi possível abrir o multitarefas. Confira a preparação do Home na TV."],
    ["busy", "A TV está concluindo outra ação. Tente novamente."],
    ["unknown-request", "Atualize o Home para usar o botão Multitarefas."],
    ["error", "Não foi possível confirmar a abertura do multitarefas. Tente novamente."],
  ])("explains %s and allows a fresh tap", async (reason, message) => {
    bridge.failing["open-app-switcher"] = reason;
    await open();
    fireEvent.click(button());
    expect((await screen.findByRole("alert")).textContent).toBe(message);
    expect(button().disabled).toBe(false);
    delete bridge.failing["open-app-switcher"];
    fireEvent.click(button());
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  it("times out without automatic retry, then lets the owner try again", async () => {
    await open();
    vi.useFakeTimers();
    bridge.silentOn.add("open-app-switcher");
    fireEvent.click(button());
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 30);
    expect(screen.getByRole("alert").textContent).toContain("Não foi possível confirmar");
    expect(button().disabled).toBe(false);
    expect(requests()).toHaveLength(1);
    bridge.silentOn.clear();
    fireEvent.click(button());
    await vi.advanceTimersByTimeAsync(30);
    expect(requests()).toHaveLength(2);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("disables before ready and never queues a tap", async () => {
    bridge.answer = "nothing";
    render(<App bridgeUrl={BRIDGE_URL} />);
    expect(button().disabled).toBe(true);
    fireEvent.click(button());
    await waitFor(() => expect(bridge.received.some((m) => m.type === "hello")).toBe(true));
    bridge.sendState("ready");
    await screen.findByText("TV da sala");
    expect(requests()).toHaveLength(0);
  });

  it("clears pending on disconnect without replaying after reconnect", async () => {
    await open();
    vi.useFakeTimers();
    bridge.silentOn.add("open-app-switcher");
    fireEvent.click(button());
    await vi.advanceTimersByTimeAsync(30);
    bridge.goDown();
    await vi.advanceTimersByTimeAsync(30);
    expect(button().disabled).toBe(true);
    bridge.comeBack();
    await vi.advanceTimersByTimeAsync(RECONNECT_DELAYS_MS[0] + 100);
    expect(button().disabled).toBe(false);
    expect(requests()).toHaveLength(1);
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
