import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app";
import { forgetPictures } from "../src/pictures";
import { BRIDGE_URL, examples, FakeBridge } from "./fake-bridge";

let bridge: FakeBridge;

beforeEach(() => {
  bridge = new FakeBridge();
  bridge.lists["up-next"] = examples["list-up-next"].items;
  bridge.lists.trending = examples["list-trending"].items;
  bridge.replies.title = examples.title;
  bridge.pictures["app:com.netflix.ninja"] = "png";
  for (const entry of examples["list-up-next"].items) bridge.pictures[entry.picture] = "png";
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

async function openWatch() {
  render(<App bridgeUrl={BRIDGE_URL} />);
  await screen.findByText("TV da sala");
  fireEvent.click(screen.getByRole("tab", { name: "Assistir" }));
}

describe("Continuar assistindo", () => {
  it("shows each entry with its picture, progress, episode, app and time left", async () => {
    await openWatch();
    const section = (await screen.findByRole("heading", { name: "Continuar assistindo" })).closest("section")!;
    await waitFor(() => expect(within(section).getAllByRole("button")).toHaveLength(3));
    expect(within(section).getAllByRole("button").map((b) => b.textContent)).toEqual([
      "Sombras do NorteT2, E4: O farolNetflix, faltam 18 min",
      "Cidade de vidroT1, E7: ReflexosMax, faltam 1h12",
      "Continuar no GloboplayGloboplay",
    ]);
    await waitFor(() => expect(section.querySelectorAll("img")).toHaveLength(3));
    const bars = [...section.querySelectorAll<HTMLElement>(".up-next-progress > span")].map((bar) => bar.style.width);
    expect(bars).toEqual(["62%", "30%"]);
  });

  it("resumes an entry on the TV with the protocol's open", async () => {
    await openWatch();
    fireEvent.click(await screen.findByRole("button", { name: "Continuar Sombras do Norte" }));
    await waitFor(() => expect(bridge.received.find((m) => m.type === "open")).toBeTruthy());
    expect({ ...bridge.received.find((m) => m.type === "open"), id: examples["open-up-next"].id }).toEqual(examples["open-up-next"]);
  });

  it("marks an entry the TV couldn't resume", async () => {
    bridge.failing.open = "not-installed";
    await openWatch();
    const entry = await screen.findByRole("button", { name: "Continuar no Globoplay" });
    fireEvent.click(entry);
    await waitFor(() => expect(entry.className).toContain("failed"));
  });

  it("follows the TV's Up Next Tray, and hides when it's empty", async () => {
    await openWatch();
    await screen.findByRole("button", { name: "Continuar Cidade de vidro" });
    bridge.push("up-next", examples["list-up-next"].items.slice(0, 1));
    await waitFor(() => expect(screen.queryByRole("button", { name: "Continuar Cidade de vidro" })).toBeNull());
    bridge.push("up-next", []);
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Continuar assistindo" })).toBeNull());
  });
});

describe("Em alta hoje", () => {
  it("shows Explorar's trending Titles with their TMDB backdrop, name, kind and genre", async () => {
    await openWatch();
    const section = (await screen.findByRole("heading", { name: "Em alta hoje" })).closest("section")!;
    await waitFor(() => expect(within(section).getAllByRole("button")).toHaveLength(3));
    expect(within(section).getAllByRole("button").map((b) => b.textContent)).toEqual(["Último tremFilme, suspense", "Maré altaSérie, drama", "Sem título aindaFilme"]);
    expect([...section.querySelectorAll("img")].map((img) => img.getAttribute("src"))).toEqual(
      examples["list-trending"].items.filter((t: any) => t.backdrop).map((t: any) => t.backdrop),
    );
    expect(bridge.pictureFetches.filter((id) => id.includes("tmdb"))).toEqual([]);
  });

  it("says when the TV has no TMDB token", async () => {
    bridge.failing["list:trending"] = "missing-token";
    await openWatch();
    expect(await screen.findByText(/precisa da chave do TMDB/)).toBeTruthy();
  });

  it("says when the TV is offline", async () => {
    bridge.failing["list:trending"] = "offline";
    await openWatch();
    expect(await screen.findByText("A TV está sem internet: não deu para trazer os destaques de hoje.")).toBeTruthy();
  });
});

describe("The Title screen", () => {
  async function openTitle() {
    await openWatch();
    fireEvent.click(await screen.findByRole("button", { name: "Ver Último trem" }));
    await screen.findByRole("heading", { name: "Último trem", level: 1 });
  }

  it("asks the TV for the Title with the protocol's title request", async () => {
    await openTitle();
    await waitFor(() => expect(bridge.received.find((m) => m.type === "title")).toBeTruthy());
    const asked = bridge.received.find((m) => m.type === "title");
    expect({ ...asked, id: examples["title-request"].id }).toEqual(examples["title-request"]);
  });

  it("shows the Title's facts, synopsis and Onde assistir", async () => {
    await openTitle();
    expect(await screen.findByLabelText("Classificação 14")).toBeTruthy();
    expect(screen.getByText("Filme, 2025, Suspense")).toBeTruthy();
    expect(screen.getByText("2 h 08 min")).toBeTruthy();
    expect(screen.getByLabelText("Nota 7,8 de 10")).toBeTruthy();
    expect(screen.getByText(examples.title.overview)).toBeTruthy();
    const services = within(screen.getByRole("heading", { name: "Onde assistir" }).closest("section")!).getAllByRole("listitem");
    expect(services.map((s) => s.textContent)).toEqual([
      "NetflixIncluído na assinaturaAbrir na TV",
      "Prime VideoPrime VideoAlugar ou comprarAbrir na TV",
      "Apple TVApple TVAlugar ou comprar",
    ]);
  });

  it("opens the Title in a service on the TV, and plays its trailer there", async () => {
    await openTitle();
    fireEvent.click(await screen.findByRole("button", { name: "Abrir na TV em Netflix" }));
    await waitFor(() => expect(bridge.received.find((m) => m.type === "open" && "service" in m)).toBeTruthy());
    expect({ ...bridge.received.find((m) => m.type === "open" && "service" in m), id: 5 }).toEqual(examples["open-service"]);

    fireEvent.click(screen.getByRole("button", { name: "Ver trailer na TV" }));
    await waitFor(() => expect(bridge.received.find((m) => m.type === "open" && "trailer" in m)).toBeTruthy());
    expect({ ...bridge.received.find((m) => m.type === "open" && "trailer" in m), id: 5 }).toEqual(examples["open-trailer"]);
  });

  it("marks what the TV couldn't open", async () => {
    bridge.failing.open = "error";
    await openTitle();
    const trailer = await screen.findByRole("button", { name: "Ver trailer na TV" });
    fireEvent.click(trailer);
    await waitFor(() => expect(trailer.className).toContain("failed"));
  });

  it("says why the details didn't come, and goes back to Assistir", async () => {
    bridge.failing.title = "offline";
    await openTitle();
    expect(await screen.findByText("A TV está sem internet: não deu para trazer os detalhes desta obra.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(await screen.findByRole("heading", { name: "Em alta hoje" })).toBeTruthy();
  });
});
