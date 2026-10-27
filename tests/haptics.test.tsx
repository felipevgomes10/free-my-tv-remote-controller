import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app";
import { BUTTON_HOLD_MS, REPEAT_DELAY_MS, REPEAT_EVERY_MS } from "../src/components/RemoteButton";
import { HOLD_MS } from "../src/gestures";
import { BRIDGE_URL, examples, FakeBridge } from "./fake-bridge";

let bridge: FakeBridge;

beforeEach(() => {
  // Model Safari's native switch support; desktop jsdom has no haptic hardware.
  Object.defineProperty(HTMLInputElement.prototype, "switch", { configurable: true, value: false });
  bridge = new FakeBridge();
  bridge.lists.shortcuts = examples["list-shortcuts"].items;
  localStorage.setItem("fmtv-controller.credential", examples.hello.credential);
});

afterEach(() => {
  cleanup();
  bridge.stop();
  localStorage.clear();
  vi.useRealTimers();
  Reflect.deleteProperty(HTMLInputElement.prototype, "switch");
  vi.restoreAllMocks();
});

async function open() {
  render(<App bridgeUrl={BRIDGE_URL} />);
  await screen.findByText("TV da sala");
}

function hapticTarget(host: Element) {
  const label = host.querySelector<HTMLLabelElement>("label");
  expect(label, "Safari needs a native label under the finger, not label.click() in tick()").not.toBeNull();
  const input = label!.querySelector<HTMLInputElement>("input[type=checkbox][switch]");
  expect(input).not.toBeNull();
  expect(input!.tabIndex).toBe(-1);
  expect(label!.getAttribute("aria-hidden")).toBe("true");
  return { label: label!, input: input! };
}

function nativePad() {
  const input = screen.getByRole("application").querySelector<HTMLInputElement>(":scope > input.touchpad-switch");
  expect(input, "Native dragging needs the actual switch under the finger").not.toBeNull();
  return input!;
}

const finger = (x = 100, y = 100, identifier = 1) => ({ identifier, clientX: x, clientY: y });
function startPad(input: HTMLInputElement, touch = finger()) {
  // Safari sends both pointer and touch events for one finger; never duplicate commands.
  fireEvent.pointerDown(input, { pointerType: "touch", pointerId: touch.identifier, clientX: touch.clientX, clientY: touch.clientY });
  fireEvent.touchStart(input, { touches: [touch], changedTouches: [touch] });
}
function movePad(input: HTMLInputElement, touch: ReturnType<typeof finger>) {
  fireEvent.pointerMove(input, { pointerType: "touch", pointerId: touch.identifier, clientX: touch.clientX, clientY: touch.clientY });
  fireEvent.touchMove(input, { touches: [touch], changedTouches: [touch] });
}
function releasePad(input: HTMLInputElement, touch = finger()) {
  fireEvent.pointerUp(input, { pointerType: "touch", pointerId: touch.identifier });
  fireEvent.touchEnd(input, { touches: [], changedTouches: [touch] });
  fireEvent.click(input);
}

describe("haptic activation from the actual control", () => {
  it("lets the button's original tap toggle a native switch and sends only one key", async () => {
    await open();
    const button = screen.getByRole("button", { name: "Voltar" });
    const { label, input } = hapticTarget(button);
    const capture = vi.fn();
    label.setPointerCapture = capture;
    fireEvent.pointerDown(label, { pointerId: 1 });
    fireEvent.pointerUp(label, { pointerId: 1 });
    fireEvent.click(label);
    expect(capture).toHaveBeenCalledWith(1);
    expect(input.checked).toBe(true);
    await waitFor(() => expect(bridge.keys()).toEqual([["back", "press"]]));
  });

  it("keeps the native Touchpad's tap and swipe working without duplicate pointer commands", async () => {
    await open();
    const input = nativePad();
    startPad(input);
    releasePad(input);
    startPad(input, finger(100, 100, 2));
    movePad(input, finger(200, 100, 2));
    releasePad(input, finger(200, 100, 2));
    await waitFor(() => expect(bridge.keys()).toEqual([["ok", "press"], ["right", "press"], ["right", "press"]]));
  });

  it("keeps all four directions and reversals in one native drag", async () => {
    await open();
    const input = nativePad();
    vi.useFakeTimers();
    startPad(input);
    await vi.advanceTimersByTimeAsync(250);
    for (const [x, y] of [[148, 100], [148, 148], [100, 148], [100, 100]]) movePad(input, finger(x, y));
    releasePad(input);
    await vi.advanceTimersByTimeAsync(20);
    expect(bridge.keys()).toEqual([["right", "press"], ["down", "press"], ["left", "press"], ["up", "press"]]);
  });

  it("preserves holding OK through the native switch", async () => {
    await open();
    const input = nativePad();
    vi.useFakeTimers();
    startPad(input);
    await vi.advanceTimersByTimeAsync(HOLD_MS + 10);
    releasePad(input);
    await vi.advanceTimersByTimeAsync(20);
    expect(bridge.keys()).toEqual([["ok", "hold-start"], ["ok", "hold-end"]]);
  });

  it("cancels a native drag without pressing OK and can start another", async () => {
    await open();
    const input = nativePad();
    startPad(input);
    fireEvent.pointerCancel(input, { pointerType: "touch", pointerId: 1 });
    // Native switch ownership may cancel pointer events while touch events continue.
    movePad(input, finger(148, 100));
    fireEvent.touchCancel(input, { touches: [], changedTouches: [finger(148, 100)] });
    startPad(input);
    releasePad(input);
    await waitFor(() => expect(bridge.keys()).toEqual([["right", "press"], ["ok", "press"]]));
  });

  it("ignores another finger while the native pad tracks the first", async () => {
    await open();
    const input = nativePad();
    startPad(input);
    fireEvent.touchStart(input, { touches: [finger(), finger(200, 200, 2)], changedTouches: [finger(200, 200, 2)] });
    fireEvent.touchEnd(input, { touches: [finger()], changedTouches: [finger(200, 200, 2)] });
    movePad(input, finger(148, 100));
    releasePad(input, finger(148, 100));
    await waitFor(() => expect(bridge.keys()).toEqual([["right", "press"]]));
  });

  it("releases a held OK when the page loses focus and allows a fresh gesture", async () => {
    await open();
    const input = nativePad();
    vi.useFakeTimers();
    startPad(input);
    await vi.advanceTimersByTimeAsync(HOLD_MS + 10);
    fireEvent.blur(window);
    await vi.advanceTimersByTimeAsync(20);
    expect(bridge.keys()).toEqual([["ok", "hold-start"], ["ok", "hold-end"]]);
    startPad(input);
    releasePad(input);
    await vi.advanceTimersByTimeAsync(20);
    expect(bridge.keys()).toEqual([["ok", "hold-start"], ["ok", "hold-end"], ["ok", "press"]]);
  });

  it("does not send a shortcut twice when the label forwards its click to the switch", async () => {
    await open();
    const { label, input } = hapticTarget(await screen.findByRole("button", { name: "Abrir Netflix" }));
    fireEvent.click(label);
    expect(input.checked).toBe(true);
    await waitFor(() => expect(bridge.received.filter((m) => m.type === "open")).toHaveLength(1));
  });

  it("preserves Home holds and volume repeats through the haptic surface", async () => {
    await open();
    const home = hapticTarget(screen.getByRole("button", { name: "Home" })).label;
    const volume = hapticTarget(screen.getByRole("button", { name: "Aumentar volume" })).label;
    vi.useFakeTimers();
    fireEvent.pointerDown(home, { pointerId: 1 });
    await vi.advanceTimersByTimeAsync(BUTTON_HOLD_MS + 10);
    fireEvent.pointerUp(home, { pointerId: 1 });
    fireEvent.click(home);
    fireEvent.pointerDown(volume, { pointerId: 2 });
    await vi.advanceTimersByTimeAsync(REPEAT_DELAY_MS + REPEAT_EVERY_MS * 2 + 10);
    fireEvent.pointerUp(volume, { pointerId: 2 });
    fireEvent.click(volume);
    await vi.advanceTimersByTimeAsync(REPEAT_EVERY_MS * 5);
    expect(bridge.keys()).toEqual([
      ["home", "hold-start"], ["home", "hold-end"],
      ["volume-up", "press"], ["volume-up", "press"], ["volume-up", "press"],
    ]);
  });

  it("keeps the native switch disabled until the TV is ready", async () => {
    bridge.answer = "nothing";
    render(<App bridgeUrl={BRIDGE_URL} />);
    await waitFor(() => expect(bridge.received).toHaveLength(1));
    const pad = screen.getByRole("application");
    const input = nativePad();
    expect(input.disabled).toBe(true);
    fireEvent.pointerDown(pad, { pointerId: 1 });
    fireEvent.pointerUp(pad, { pointerId: 1 });
    expect(bridge.keys()).toEqual([]);
    bridge.sendState("ready");
    await waitFor(() => expect(input.disabled).toBe(false));
  });

  it("uses the browser vibration API where available, without a switch overlay", async () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, "vibrate", { configurable: true, value: vibrate });
    try {
      await open();
      const button = screen.getByRole("button", { name: "Voltar" });
      expect(button.querySelector("label")).toBeNull();
      fireEvent.pointerDown(button, { pointerId: 1 });
      fireEvent.pointerUp(button, { pointerId: 1 });
      expect(vibrate).toHaveBeenCalledExactlyOnceWith(10);
      await waitFor(() => expect(bridge.keys()).toEqual([["back", "press"]]));
    } finally {
      Reflect.deleteProperty(navigator, "vibrate");
    }
  });
});
