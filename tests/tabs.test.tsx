import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/preact";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../src/app";
import { connectBridge, REQUEST_TIMEOUT_MS, RequestFailed } from "../src/bridge";
import { CredentialContext, forgetPictures, Picture } from "../src/pictures";
import { BRIDGE_URL, examples, FakeBridge } from "./fake-bridge";

let bridge: FakeBridge;

beforeEach(() => {
  bridge = new FakeBridge();
  vi.stubGlobal("fetch", bridge.fetch);
  vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: (blob: Blob) => `blob:test/${blob.size}` }));
  localStorage.setItem("fmtv-controller.credential", examples.hello.credential);
});

afterEach(() => {
  cleanup();
  bridge.stop();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
  forgetPictures();
});

const tab = (name: string) => screen.getByRole("tab", { name });

describe("the tabs", () => {
  it("opens on the Controls tab, with Apps and Assistir beside it", async () => {
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["Controle", "Apps", "Assistir"]);
    expect(tab("Controle").getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("application")).toBeTruthy();
  });

  it("moves between tabs, and back to the Touchpad", async () => {
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    fireEvent.click(tab("Apps"));
    expect(screen.getByRole("heading", { name: "Apps" })).toBeTruthy();
    expect(tab("Apps").getAttribute("aria-selected")).toBe("true");
    fireEvent.click(tab("Assistir"));
    expect(screen.getByRole("heading", { name: "Assistir" })).toBeTruthy();
    fireEvent.click(tab("Controle"));
    expect(screen.getByRole("application")).toBeTruthy();
  });

  it("says why Apps and Assistir are empty while the TV is out of reach", async () => {
    bridge.goDown();
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("Sem conexão com a TV");
    fireEvent.click(tab("Apps"));
    expect(screen.getByRole("status").textContent).toMatch(/Sem conexão com a TV/);
    fireEvent.click(tab("Assistir"));
    expect(screen.getByRole("status").textContent).toMatch(/Sem conexão com a TV/);
  });

  it("shows no notice on Apps once the TV is ready", async () => {
    render(<App bridgeUrl={BRIDGE_URL} />);
    await screen.findByText("TV da sala");
    fireEvent.click(tab("Apps"));
    expect(screen.queryByRole("status")).toBeNull();
  });
});

describe("requests and answers", () => {
  async function ready(onList?: (of: string, items: unknown[]) => void) {
    let isReady!: () => void;
    const readyNow = new Promise<void>((resolve) => (isReady = resolve));
    const connection = connectBridge(BRIDGE_URL, examples.hello.credential, {
      onState: (state) => state === "ready" && isReady(),
      onReload: () => {},
      onClosed: () => {},
      onList,
    });
    await readyNow;
    return connection;
  }

  it("asks for a list as the protocol's example, and gets the Home's answer", async () => {
    bridge.lists.apps = [{ package: "com.netflix.ninja" }];
    const connection = await ready();

    const answer = await connection.request({ type: "list", of: "apps" });

    const sent = bridge.received.find((m) => m.type === "list");
    expect(Object.keys(sent).sort()).toEqual(Object.keys(examples["list-request"]).sort());
    expect(answer).toMatchObject({ type: "list", of: "apps", id: sent.id, items: [{ package: "com.netflix.ninja" }] });
    connection.close();
  });

  it("hands every list on, answered or pushed", async () => {
    const lists: [string, unknown[]][] = [];
    const connection = await ready((of, items) => lists.push([of, items]));

    await connection.request({ type: "list", of: "apps" });
    bridge.push("apps", [{ package: "com.google.android.youtube.tv" }]);

    await waitFor(() => expect(lists).toEqual([["apps", []], ["apps", [{ package: "com.google.android.youtube.tv" }]]]));
    connection.close();
  });

  it("turns a failed answer into a failure with its reason", async () => {
    bridge.failing.open = "not-installed";
    const connection = await ready();

    await expect(connection.request({ type: "open", package: "com.netflix.ninja" })).rejects.toMatchObject({ reason: "not-installed" });
    connection.close();
  });

  it("gives up on an unanswered request after the timeout", async () => {
    bridge.silentOn.add("list");
    const connection = await ready();
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const asked = connection.request({ type: "list", of: "apps" });
    const outcome = expect(asked).rejects.toMatchObject({ reason: "timeout" });
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS + 10);
    await outcome;
    connection.close();
  });

  it("refuses to ask before the bridge is ready, and fails what's pending when the connection is lost", async () => {
    bridge.answer = "nothing";
    const early = connectBridge(BRIDGE_URL, examples.hello.credential, { onState: () => {}, onReload: () => {}, onClosed: () => {} });
    await expect(early.request({ type: "list", of: "apps" })).rejects.toBeInstanceOf(RequestFailed);
    early.close();

    bridge.answer = "ready";
    bridge.silentOn.add("list");
    const connection = await ready();
    const asked = connection.request({ type: "list", of: "apps" });
    bridge.goDown();
    await expect(asked).rejects.toMatchObject({ reason: "closed" });
  });
});

describe("pictures", () => {
  function pictures(...ids: string[]) {
    return render(
      <CredentialContext.Provider value={examples.hello.credential}>
        {ids.map((id, i) => (
          <Picture key={i} id={id} alt={id} />
        ))}
      </CredentialContext.Provider>,
    );
  }

  it("shows a plain tile, then the picture fetched with the credential in a header", async () => {
    bridge.pictures["app:com.netflix.ninja"] = "png";
    const { container } = pictures("app:com.netflix.ninja");
    expect(container.querySelector(".placeholder")).toBeTruthy();

    const img = (await screen.findByAltText("app:com.netflix.ninja")) as HTMLImageElement;
    expect(img.getAttribute("src")).toMatch(/^blob:/);
    expect(bridge.pictureFetches).toEqual(["/pictures/app%3Acom.netflix.ninja"]);
    expect(bridge.pictureFetches.join()).not.toContain(examples.hello.credential);
  });

  it("fetches each picture once, however many times it's shown", async () => {
    bridge.pictures["app:a"] = "png";
    pictures("app:a", "app:a", "app:a");
    await waitFor(() => expect(screen.getAllByRole("img")).toHaveLength(3));
    expect(bridge.pictureFetches).toHaveLength(1);
  });

  it("keeps the plain tile when the Home refuses the picture", async () => {
    const { container } = pictures("app:missing");
    await waitFor(() => expect(bridge.pictureFetches).toHaveLength(1));
    expect(container.querySelector("img")).toBeNull();
  });
});
