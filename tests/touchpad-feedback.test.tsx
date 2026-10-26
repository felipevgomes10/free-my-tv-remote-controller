import { act, cleanup, fireEvent, render, screen } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Touchpad } from "../src/components/Touchpad";

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms); });
const pad = () => screen.getByRole("application");
const light = () => pad().querySelector<HTMLElement>(".touchpad-light");
const down = () => fireEvent.pointerDown(pad(), { pointerId: 1, clientX: 100, clientY: 100 });
const move = (x: number, y: number, pointerId = 1) =>
  fireEvent.pointerMove(pad(), { pointerId, clientX: x, clientY: y });

describe("the Touchpad's moving light", () => {
  it("follows short movements and curves immediately, leaving only one light and no trail", () => {
    const send = vi.fn();
    render(<Touchpad send={send} />);
    down();
    move(120, 100);
    expect(light()?.style.left).toBe("120px");
    expect(light()?.style.top).toBe("100px");
    move(120, 120);
    expect(light()?.style.left).toBe("120px");
    expect(light()?.style.top).toBe("120px");
    expect(pad().querySelectorAll(".touchpad-light")).toHaveLength(1);
    expect(pad().querySelector(".touchpad-trail")).toBeNull();
    expect(send).not.toHaveBeenCalled();
  });

  it("removes the light on release and shows it at the next touch", () => {
    render(<Touchpad send={vi.fn()} />);
    down();
    move(140, 100);
    fireEvent.pointerUp(pad(), { pointerId: 1 });
    expect(light()).toBeNull();
    down();
    expect(light()?.style.left).toBe("100px");
    expect(light()?.style.top).toBe("100px");
  });

  it("keeps following the first finger when another finger touches or releases the pad", () => {
    render(<Touchpad send={vi.fn()} />);
    down();
    fireEvent.pointerDown(pad(), { pointerId: 2, clientX: 250, clientY: 250 });
    move(260, 250, 2);
    fireEvent.pointerUp(pad(), { pointerId: 2 });
    expect(light()?.style.left).toBe("100px");
    move(120, 100);
    expect(light()?.style.left).toBe("120px");
    expect(light()?.style.top).toBe("100px");
  });

  it("clears the light and pending gesture when the touch is cancelled", () => {
    render(<Touchpad send={vi.fn()} />);
    down();
    move(140, 100);
    fireEvent.pointerCancel(pad(), { pointerId: 1 });
    expect(light()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cancels the pending gesture when leaving the Controls tab", () => {
    const send = vi.fn();
    const { unmount } = render(<Touchpad send={send} />);
    down();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
    advance(500);
    expect(send).not.toHaveBeenCalled();
  });

  it("clears the light if the TV becomes unavailable during a drag", () => {
    const send = vi.fn();
    const { rerender } = render(<Touchpad send={send} />);
    down();
    move(120, 100);
    rerender(<Touchpad send={send} enabled={false} />);
    expect(light()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    down();
    advance(500);
    expect(send).not.toHaveBeenCalled();
  });
});
