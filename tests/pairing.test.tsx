import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app";
import { BRIDGE_URL, examples, FakeBridge } from "./fake-bridge";

let bridge: FakeBridge;

beforeEach(() => {
  bridge = new FakeBridge();
  vi.stubGlobal("fetch", bridge.fetch);
});

afterEach(() => {
  cleanup();
  bridge.stop();
  vi.unstubAllGlobals();
  localStorage.clear();
  delete (navigator as any).standalone;
});

function asIos(standalone: boolean) {
  Object.defineProperty(navigator, "standalone", { value: standalone, configurable: true });
}

const codeField = () => screen.getByLabelText("Código da TV");
const nameField = () => screen.getByLabelText("Nome deste iPhone");
const pairButton = () => screen.getByRole("button", { name: "Parear" }) as HTMLButtonElement;

function fill(code: string, name: string) {
  fireEvent.input(codeField(), { target: { value: code } });
  fireEvent.input(nameField(), { target: { value: name } });
}

describe("the first open", () => {
  it("suggests adding to the Home Screen in a Safari tab on iOS", () => {
    asIos(false);
    render(<App bridgeUrl={BRIDGE_URL} />);
    expect(screen.getByText("Primeiro, adicione o FMTV Controller à Tela de Início")).toBeTruthy();
    expect(screen.queryByLabelText("Código da TV")).toBeNull();
  });

  it("goes straight to the form in the app opened from the Home Screen", () => {
    asIos(true);
    render(<App bridgeUrl={BRIDGE_URL} />);
    expect(screen.getByText("Parear este iPhone")).toBeTruthy();
  });

  it("still lets a Safari tab pair, when asked to", () => {
    asIos(false);
    render(<App bridgeUrl={BRIDGE_URL} />);
    fireEvent.click(screen.getByRole("button", { name: "Parear no Safari mesmo assim" }));
    expect(screen.getByText("Parear este iPhone")).toBeTruthy();
  });
});

describe("Pairing", () => {
  it("waits for the whole code and a name before it can pair", () => {
    render(<App bridgeUrl={BRIDGE_URL} />);
    fill("482", "iPhone da Ana");
    expect(pairButton().disabled).toBe(true);
    fill("4827", "  ");
    expect(pairButton().disabled).toBe(true);
    fill("4827", "iPhone da Ana");
    expect(pairButton().disabled).toBe(false);
  });

  it("keeps only digits in the code", () => {
    render(<App bridgeUrl={BRIDGE_URL} />);
    fireEvent.input(codeField(), { target: { value: "4a8-27x9" } });
    expect((codeField() as HTMLInputElement).value).toBe("4827");
  });

  it("sends the protocol's request, keeps the credential and opens the controls, then and on every later open", async () => {
    const { unmount } = render(<App bridgeUrl={BRIDGE_URL} />);
    fill(examples["pair-request"].code, examples["pair-request"].name);
    fireEvent.click(pairButton());
    expect(await screen.findByText("TV da sala")).toBeTruthy();
    expect(bridge.pairRequests).toEqual([examples["pair-request"]]);
    expect(bridge.received[0]).toEqual({ ...examples.hello, credential: examples["pair-success"].credential });

    unmount();
    render(<App bridgeUrl={BRIDGE_URL} />);
    expect(await screen.findByRole("application")).toBeTruthy();
    expect(screen.queryByText("Parear este iPhone")).toBeNull();
  });

  it.each([
    ["a wrong code", "open", "0000", "Código errado. Confira o código na TV e tente de novo."],
    ["Pairing closed on the TV", "closed", "4827", "A tela de pareamento foi fechada na TV. Abra Parear aparelho de novo e use o código novo."],
    ["too many tries", "too-many-tries", "4827", "Tentativas demais. A TV mostrou um código novo: digite esse."],
  ] as const)("tells %s apart, and stays on the form", async (_, pairing, code, message) => {
    bridge.pairing = pairing;
    render(<App bridgeUrl={BRIDGE_URL} />);
    fill(code, "iPhone da Ana");
    fireEvent.click(pairButton());
    expect((await screen.findByRole("alert")).textContent).toBe(message);
    expect(localStorage.getItem("fmtv-controller.credential")).toBeNull();
  });

  it("clears the refusal as soon as the code changes", async () => {
    render(<App bridgeUrl={BRIDGE_URL} />);
    fill("0000", "iPhone da Ana");
    fireEvent.click(pairButton());
    await screen.findByRole("alert");
    fireEvent.input(codeField(), { target: { value: "482" } });
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  it("says when the TV can't be reached", async () => {
    vi.stubGlobal("fetch", () => Promise.reject(new TypeError("Load failed")));
    render(<App bridgeUrl={BRIDGE_URL} />);
    fill("4827", "iPhone da Ana");
    fireEvent.click(pairButton());
    expect((await screen.findByRole("alert")).textContent).toBe(
      "Sem conexão com a TV. Confira se o iPhone está no mesmo Wi-Fi da TV.",
    );
  });
});
