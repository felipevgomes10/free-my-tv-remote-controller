import type { IncomingMessage, Server, ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";
import { WebSocketServer } from "ws";

/**
 * A stand-in for the Home's bridge while developing: it answers the protocol
 * on `/remote` of the dev server and prints every key, so the page can be
 * tried in a browser without a TV. Pairing takes the code PAIRING_CODE.
 */
export const PAIRING_CODE = "4827";

/** What the fake bridge's Home has, for the companion's tabs. */
const SAMPLE_LISTS: Record<string, unknown[]> = {
  shortcuts: [
    { shortcut: "netflix", label: "Netflix" },
    { shortcut: "globoplay", label: "Globoplay" },
    { shortcut: "prime-video", label: "Prime Video" },
    { shortcut: "disney-plus", label: "Disney+" },
    { shortcut: "youtube", label: "YouTube" },
    { shortcut: "input", label: "PlayStation" },
  ],
  inputs: [
    { input: "hdmi1", name: "PlayStation", port: "HDMI 1", kind: "hdmi" },
    { input: "hdmi2", name: "HDMI 2", port: "HDMI 2", kind: "hdmi" },
    { input: "tuner", name: "Antena", port: "TV aberta", kind: "antenna" },
  ],
  apps: [
    ["com.netflix.ninja", "Netflix", true],
    ["com.google.android.youtube.tv", "YouTube", true],
    ["com.amazon.amazonvideo.livingroom", "Prime Video", true],
    ["com.globo.globotv", "Globoplay", false],
    ["com.disney.disneyplus", "Disney+", false],
    ["tv.plex.labs", "Plex", false],
    ["com.spotify.tv.android", "Spotify", false],
  ].map(([pkg, label, inTray]) => ({ package: pkg, label, picture: `app:${pkg}`, inTray })),
  "open-apps": [
    ["com.google.android.youtube.tv", "YouTube", false],
    ["com.spotify.tv.android", "Spotify", true],
    ["com.netflix.ninja", "Netflix", false],
  ].map(([pkg, label, playing]) => ({ package: pkg, label, picture: `app:${pkg}`, playing })),
  "up-next": [
    ["com.netflix.ninja", "Netflix", "Sombras do Norte", "T2, E4: O farol", 18, 0.62],
    ["com.hbo.hbonow", "Max", "Cidade de vidro", "T1, E7: Reflexos", 72, 0.3],
    ["com.globo.globotv", "Globoplay", null, null, null, null],
  ].map(([pkg, app, title, episode, minutesLeft, progress]) => {
    const key = title ? `${pkg}|${title}` : pkg;
    return { upNext: key, title, episode, app, minutesLeft, progress, picture: title ? `upnext:${key}` : `app:${pkg}` };
  }),
  trending: [
    { kind: "movie", tmdbId: 1, name: "Último trem", genre: "Suspense", backdrop: "/images/ultimo-trem.png" },
    { kind: "series", tmdbId: 2, name: "Maré alta", genre: "Drama", backdrop: "/pictures/upnext:tmdb|Maré alta" },
    { kind: "movie", tmdbId: 3, name: "Cidade de vidro", genre: "Ficção científica", backdrop: "/pictures/upnext:tmdb|Cidade de vidro" },
  ],
};

/** A Title's screen for the dev bridge: the trending Title asked for, with made-up facts. */
function sampleTitle(kind: string, tmdbId: number) {
  const summary = (SAMPLE_LISTS.trending as { kind: string; tmdbId: number; name: string; genre: string; backdrop: string }[]).find(
    (t) => t.kind === kind && t.tmdbId === tmdbId,
  );
  return {
    type: "title",
    kind,
    tmdbId,
    name: summary?.name ?? "?",
    backdrop: summary?.backdrop ?? null,
    ageRating: "14",
    year: 2025,
    genres: [summary?.genre ?? "Drama"],
    runtimeMinutes: kind === "movie" ? 128 : null,
    seasons: kind === "series" ? 2 : null,
    rating: 7.8,
    overview: "Na última viagem da noite, uma maquinista percebe que um dos passageiros não aparece nas câmeras do trem.",
    trailer: true,
    services: [
      { service: "com.netflix.ninja", name: "Netflix", offer: "subscription", picture: "app:com.netflix.ninja" },
      { service: "com.amazon.amazonvideo.livingroom", name: "Prime Video", offer: "rent-or-buy", picture: "app:com.amazon.amazonvideo.livingroom" },
      { service: null, name: "Apple TV", offer: "rent-or-buy", picture: null },
    ],
  };
}

/** A banner for the dev bridge's pictures: the app's name on a colour of its own. */
const banner: Connect.NextHandleFunction = (request: IncomingMessage, response: ServerResponse) => {
  const id = decodeURIComponent(request.url ?? "").replace(/^\//, "");
  const pkg = id.replace(/^(app|upnext):/, "");
  const app = (SAMPLE_LISTS.apps as { package: string; label: string }[]).find((a) => a.package === pkg);
  const label = id.startsWith("upnext:") ? pkg.split("|")[1] : app?.label;
  const hue = [...pkg].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0);
  response.setHeader("Content-Type", "image/svg+xml");
  response.end(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="hsl(${hue} 60% 38%)"/>` +
      `<text x="160" y="100" font-family="sans-serif" font-size="34" font-weight="700" fill="#fff" text-anchor="middle">${label ?? "?"}</text></svg>`,
  );
};

export function fakeBridge(tvName = "TV de teste"): Plugin {
  return {
    name: "fmtv-fake-bridge",
    configureServer(server) {
      server.middlewares.use("/pair", pair);
      server.middlewares.use("/pictures", banner);
      attach(server.httpServer as Server | null, tvName);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/pair", pair);
      server.middlewares.use("/pictures", banner);
      attach(server.httpServer as Server | null, tvName);
    },
  };
}

function attach(http: Server | null, tvName: string) {
  if (!http) return;
  const wss = new WebSocketServer({ noServer: true });
  http.on("upgrade", (request, socket, head) => {
    if (request.url !== "/remote") return;
    wss.handleUpgrade(request, socket, head, (ws) => {
      ws.on("message", (data) => {
        const message = JSON.parse(String(data));
        if (message.type === "hello") ws.send(JSON.stringify({ type: "state", state: "ready", tvName }));
        if (message.type === "key") {
          console.log(`[ponte de teste] ${message.key} ${message.action}`);
          ws.send(JSON.stringify({ type: "ack", id: message.id }));
        } else if (message.type === "list") {
          ws.send(JSON.stringify({ type: "list", id: message.id, of: message.of, items: SAMPLE_LISTS[message.of] ?? [] }));
        } else if (message.type === "search") {
          const query = String(message.query).toLowerCase();
          const results = (SAMPLE_LISTS.trending as { kind: string; tmdbId: number; name: string; backdrop: string }[])
            .filter((title) => title.name.toLowerCase().includes(query))
            .map(({ kind, tmdbId, name, backdrop }) => ({ kind, tmdbId, name, year: 2025, backdrop, poster: null }));
          ws.send(JSON.stringify({ type: "search-results", id: message.id, query: message.query, results }));
        } else if (message.type === "title") {
          ws.send(JSON.stringify({ ...sampleTitle(message.kind, message.tmdbId), id: message.id }));
        } else if (message.type === "open-app-switcher") {
          // Show-only. A fake bridge confirms the contract, not live Android window visibility.
          ws.send(JSON.stringify({ type: "done", id: message.id }));
        } else if (message.type !== "hello") {
          console.log(`[ponte de teste] ${message.type} ${JSON.stringify(message)}`);
          ws.send(JSON.stringify({ type: "done", id: message.id }));
        }
      });
    });
  });
}

const pair: Connect.NextHandleFunction = (request: IncomingMessage, response: ServerResponse) => {
  let body = "";
  request.on("data", (chunk) => (body += chunk));
  request.on("end", () => {
    const { code, name } = JSON.parse(body || "{}");
    const ok = code === PAIRING_CODE;
    console.log(`[ponte de teste] pareamento de "${name}" com ${code}: ${ok ? "aceito" : "código errado"}`);
    response.statusCode = ok ? 200 : 401;
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify(ok ? { credential: `teste-${Date.now()}` } : { error: "wrong-code" }));
  });
};
