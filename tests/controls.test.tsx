import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app";
import { HOLD_MS, STEP_PX } from "../src/gestures";
import { BUTTON_HOLD_MS, REPEAT_DELAY_MS, REPEAT_EVERY_MS } from "../src/components/RemoteButton";
import { BRIDGE_URL, examples, FakeBridge } from "./fake-bridge";

let bridge: FakeBridge;

beforeEach(() => {
  bridge = new FakeBridge();
  localStorage.setItem("fmtv-controller.credential", examples.hello.credential);
});

afterEach(() => {
  cleanup();
  bridge.stop();
  vi.useRealTimers();
  localStorage.clear();
});

async function openControls() {
  render(<App bridgeUrl={BRIDGE_URL} />);
  await screen.findByText("TV da sala");
}

const touchpad = () => screen.getByRole("application");
const button = (name: string) => screen.getByRole("button", { name });

function touch(el: Element, path: [number, number][]) {
  const [first, ...rest] = path;
  fireEvent.pointerDown(el, { pointerId: 1, clientX: first[0], clientY: first[1] });
  for (const [x, y] of rest) fireEvent.pointerMove(el, { pointerId: 1, clientX: x, clientY: y });
}

function release(el: Element) {
  fireEvent.pointerUp(el, { pointerId: 1 });
}

async function sent(keys: [string, string][]) {
  await waitFor(() => expect(bridge.keys()).toEqual(keys));
}

describe("connecting", () => {
  it("says hello with the protocol version and the credential kept on the phone", async () => {
    await openControls();
    expect(bridge.received[0]).toEqual(examples.hello);
  });

  it("shows the TV's name the bridge sends", async () => {
    bridge.tvName = "TV do quarto";
    render(<App bridgeUrl={BRIDGE_URL} />);
    expect(await screen.findByText("TV do quarto")).toBeTruthy();
  });

  it("drops keys pressed before the bridge is ready, never sending them later", async () => {
    bridge.answer = "nothing";
    render(<App bridgeUrl={BRIDGE_URL} />);
    await waitFor(() => expect(bridge.received).toHaveLength(1));
    fireEvent.pointerDown(button("Voltar"));
    fireEvent.pointerUp(button("Voltar"));
    await new Promise((r) => setTimeout(r, 20));
    expect(bridge.keys()).toEqual([]);
  });
});

describe("the Touchpad", () => {
  it("sends a swipe as one move per step, in the protocol's key message", async () => {
    await openControls();
    touch(touchpad(), [[100, 100], [130, 102], [100 + STEP_PX * 2 + 5, 104]]);
    release(touchpad());
    await sent([["right", "press"], ["right", "press"]]);
    const first = bridge.received.find((m) => m.type === "key");
    // Ids share one counter with the companion's requests: compare the rest, and that ids grow.
    expect({ ...first, id: examples["key-press"].id }).toEqual(examples["key-press"]);
  });

  it("moves along the swipe's main axis", async () => {
    await openControls();
    touch(touchpad(), [[200, 300], [210, 300 - STEP_PX - 5]]);
    release(touchpad());
    touch(touchpad(), [[200, 100], [200 - STEP_PX - 5, 110]]);
    release(touchpad());
    touch(touchpad(), [[200, 100], [205, 100 + STEP_PX + 1]]);
    release(touchpad());
    await sent([["up", "press"], ["left", "press"], ["down", "press"]]);
  });

  it("presses OK on a tap, never a move, even when the finger drifts a little", async () => {
    await openControls();
    touch(touchpad(), [[100, 100], [105, 103]]);
    release(touchpad());
    await sent([["ok", "press"]]);
  });

  it("holds OK while the finger stays still, then releases it", async () => {
    await openControls();
    vi.useFakeTimers();
    touch(touchpad(), [[100, 100]]);
    await vi.advanceTimersByTimeAsync(HOLD_MS + 10);
    release(touchpad());
    await vi.advanceTimersByTimeAsync(20);
    expect(bridge.keys()).toEqual([["ok", "hold-start"], ["ok", "hold-end"]]);
    const [start, end] = bridge.received.filter((m) => m.type === "key");
    expect({ ...start, id: examples["key-hold-start"].id }).toEqual(examples["key-hold-start"]);
    expect({ ...end, id: examples["key-hold-end"].id }).toEqual(examples["key-hold-end"]);
    expect(end.id).toBeGreaterThan(start.id);
  });

  it("ends a hold when the touch is taken away", async () => {
    await openControls();
    vi.useFakeTimers();
    touch(touchpad(), [[100, 100]]);
    await vi.advanceTimersByTimeAsync(HOLD_MS + 10);
    fireEvent.pointerCancel(touchpad(), { pointerId: 1 });
    await vi.advanceTimersByTimeAsync(20);
    expect(bridge.keys()).toEqual([["ok", "hold-start"], ["ok", "hold-end"]]);
  });
});

describe("the buttons", () => {
  it.each([
    ["Voltar", "back"],
    ["Play ou pausa", "play-pause"],
    ["Mudo", "mute"],
    ["Desligar", "power"],
    ["Home", "home"],
  ])("%s presses %s", async (name, key) => {
    await openControls();
    fireEvent.pointerDown(button(name));
    fireEvent.pointerUp(button(name));
    await sent([[key, "press"]]);
  });

  it("sends Home pressed twice as two presses", async () => {
    await openControls();
    for (let i = 0; i < 2; i++) {
      fireEvent.pointerDown(button("Home"));
      fireEvent.pointerUp(button("Home"));
    }
    await sent([["home", "press"], ["home", "press"]]);
  });

  it("holds Home when held", async () => {
    await openControls();
    vi.useFakeTimers();
    fireEvent.pointerDown(button("Home"));
    await vi.advanceTimersByTimeAsync(BUTTON_HOLD_MS + 10);
    fireEvent.pointerUp(button("Home"));
    await vi.advanceTimersByTimeAsync(20);
    expect(bridge.keys()).toEqual([["home", "hold-start"], ["home", "hold-end"]]);
  });

  it.each([
    ["Aumentar volume", "volume-up"],
    ["Diminuir volume", "volume-down"],
  ])("%s repeats while held and stops on release", async (name, key) => {
    await openControls();
    vi.useFakeTimers();
    fireEvent.pointerDown(button(name));
    await vi.advanceTimersByTimeAsync(REPEAT_DELAY_MS + REPEAT_EVERY_MS * 3 + 10);
    fireEvent.pointerUp(button(name));
    await vi.advanceTimersByTimeAsync(REPEAT_EVERY_MS * 5);
    expect(bridge.keys()).toEqual(Array(4).fill([key, "press"]));
  });
});

describe("the D-pad alongside the Touchpad", () => {
  it.each([
    ["Cima", "up"], ["Baixo", "down"],
    ["Esquerda", "left"], ["Direita", "right"], ["OK", "ok"],
  ])("%s sends %s and keeps the Touchpad available", async (name, key) => {
    await openControls();
    expect(screen.getByRole("group", { name: "D-pad" })).toBeTruthy();
    fireEvent.pointerDown(button(name), { pointerId: 1 });
    release(button(name));
    fireEvent.click(button(name), { detail: 1 });
    touch(touchpad(), [[100, 100]]);
    release(touchpad());
    await sent([[key, "press"], ["ok", "press"]]);
  });

  it("repeats a direction while held and stops on release", async () => {
    await openControls();
    vi.useFakeTimers();
    fireEvent.pointerDown(button("Direita"), { pointerId: 1 });
    await vi.advanceTimersByTimeAsync(REPEAT_DELAY_MS + REPEAT_EVERY_MS * 3 + 10);
    release(button("Direita"));
    await vi.advanceTimersByTimeAsync(1000);
    expect(bridge.keys()).toEqual(Array(4).fill(["right", "press"]));
  });

  it.each(["pointerCancel", "lostPointerCapture", "blur", "hidden", "tab"])("stops repeating on %s", async (reason) => {
    await openControls();
    vi.useFakeTimers();
    fireEvent.pointerDown(button("Cima"));
    if (reason === "pointerCancel") fireEvent.pointerCancel(button("Cima"));
    if (reason === "lostPointerCapture") fireEvent.lostPointerCapture(button("Cima"));
    if (reason === "blur") fireEvent(window, new Event("blur"));
    if (reason === "hidden") {
      const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
      fireEvent(document, new Event("visibilitychange"));
      hidden.mockRestore();
    }
    if (reason === "tab") fireEvent.click(screen.getByRole("tab", { name: "Apps" }));
    await vi.advanceTimersByTimeAsync(1500);
    expect(bridge.keys()).toEqual([["up", "press"]]);
  });

  it("holds OK and ends the hold on cancellation", async () => {
    await openControls();
    vi.useFakeTimers();
    fireEvent.pointerDown(button("OK"));
    await vi.advanceTimersByTimeAsync(BUTTON_HOLD_MS + 10);
    fireEvent.pointerCancel(button("OK"));
    await vi.advanceTimersByTimeAsync(1000);
    expect(bridge.keys()).toEqual([["ok", "hold-start"], ["ok", "hold-end"]]);
  });

  it("accepts native keyboard and assistive clicks", async () => {
    await openControls();
    fireEvent.click(button("Esquerda"), { detail: 0 });
    fireEvent.click(button("OK"), { detail: 0 });
    await sent([["left", "press"], ["ok", "press"]]);
  });
});
