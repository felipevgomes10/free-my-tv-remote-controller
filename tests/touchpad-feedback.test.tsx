import { act, cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Touchpad } from "../src/components/Touchpad";

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) =>
    setTimeout(() => callback(performance.now()), 16),
  );
  vi.stubGlobal("cancelAnimationFrame", clearTimeout);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
const frame = () => advance(16);
const pad = () => screen.getByRole("application");
const down = () => fireEvent.pointerDown(pad(), { pointerId: 1, clientX: 100, clientY: 100 });
const move = (x: number, y: number, pointerId = 1) =>
  fireEvent.pointerMove(pad(), { pointerId, clientX: x, clientY: y });
const trail = () => pad().querySelectorAll(".touchpad-trail path");

describe("the Touchpad's moving light", () => {
  it("traces short movements and curves before any direction is sent to the TV", () => {
    const send = vi.fn();
    render(<Touchpad send={send} />);
    down();
    move(120, 100);
    move(120, 120);
    frame();

    expect(send).not.toHaveBeenCalled();
    expect(trail()).toHaveLength(1);
    expect(trail()[0].getAttribute("d")).toBe("M 100 100 Q 120 100 120 110 L 120 120");
  });

  it("fades the trail while the finger stays still, keeping the light under the finger", () => {
    render(<Touchpad send={vi.fn()} />);
    down();
    move(140, 100);
    frame();
    const opacity = Number(trail()[0].getAttribute("opacity"));
    advance(80);
    expect(Number(trail()[0].getAttribute("opacity"))).toBeLessThan(opacity);
    advance(220);
    expect(trail()).toHaveLength(0);
    expect(pad().querySelector(".touchpad-light")).toBeTruthy();
  });

  it("draws one stroke with the same opacity for sparse and dense samples", () => {
    render(<Touchpad send={vi.fn()} />);
    down();
    move(140, 100);
    frame();
    const opacity = trail()[0].getAttribute("opacity");
    fireEvent.pointerCancel(pad(), { pointerId: 1 });
    down();
    for (let x = 102; x <= 140; x += 2) move(x, 100);
    frame();
    expect(trail()).toHaveLength(1);
    expect(trail()[0].getAttribute("opacity")).toBe(opacity);
  });

  it("lets the trail fade after release and starts the next touch without an old trail", () => {
    render(<Touchpad send={vi.fn()} />);
    down();
    move(140, 100);
    frame();
    fireEvent.pointerUp(pad(), { pointerId: 1 });
    expect(pad().querySelector(".touchpad-light")).toBeNull();
    expect(trail().length).toBeGreaterThan(0);
    advance(300);
    expect(trail()).toHaveLength(0);
    down();
    expect(trail()).toHaveLength(0);
  });

  it("keeps following the first finger when another finger touches or releases the pad", () => {
    render(<Touchpad send={vi.fn()} />);
    down();
    fireEvent.pointerDown(pad(), { pointerId: 2, clientX: 250, clientY: 250 });
    move(260, 250, 2);
    fireEvent.pointerUp(pad(), { pointerId: 2 });
    move(120, 100);
    frame();
    expect(trail()).toHaveLength(1);
    expect(trail()[0].getAttribute("d")).toBe("M 100 100 L 120 100");
  });

  it("clears the feedback and animation when the touch is cancelled", () => {
    render(<Touchpad send={vi.fn()} />);
    down();
    move(140, 100);
    frame();
    fireEvent.pointerCancel(pad(), { pointerId: 1 });
    expect(pad().querySelector(".touchpad-light")).toBeNull();
    expect(trail()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops the trail and pending gesture when leaving the Controls tab", () => {
    const send = vi.fn();
    const { unmount } = render(<Touchpad send={send} />);
    down();
    move(120, 100);
    frame();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    advance(500);
    expect(send).not.toHaveBeenCalled();
  });

  it("clears the feedback if the TV becomes unavailable during a drag", () => {
    const send = vi.fn();
    const { rerender } = render(<Touchpad send={send} />);
    down();
    move(120, 100);
    frame();
    rerender(<Touchpad send={send} enabled={false} />);
    expect(trail()).toHaveLength(0);
    expect(pad().querySelector(".touchpad-light")).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    down();
    advance(500);
    expect(send).not.toHaveBeenCalled();
  });
});
