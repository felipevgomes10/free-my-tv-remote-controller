// Keeps a copy of the page so FMTV Controller opens even when the Home doesn't answer (ADR 0004).
// Network first: when the Home answers, every open gets the page it serves now; only when it
// doesn't, within NAVIGATION_TIMEOUT_MS, does the saved copy open, on Sem conexão.
// The build fills in VERSION and PRECACHE (see plugins/service-worker.ts).

const VERSION = self.__VERSION__;
const PRECACHE = self.__PRECACHE__;
const CACHE = `fmtv-controller-${VERSION}`;
const NAVIGATION_TIMEOUT_MS = 3000;
/** The bridge's own paths: never cached, never answered from the cache. */
const BRIDGE_PATHS = ["/remote", "/pair"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || BRIDGE_PATHS.includes(url.pathname)) return;
  event.respondWith(networkFirst(event, request));
});

async function networkFirst(event, request) {
  const cache = await caches.open(CACHE);
  const network = fetch(request).then((response) => {
    if (response.ok) event.waitUntil(cache.put(request, response.clone()));
    return response;
  });
  const fallback = () =>
    cache
      .match(request, { ignoreSearch: true })
      .then((saved) => saved ?? (request.mode === "navigate" ? cache.match("/") : undefined));

  if (request.mode !== "navigate") return network.catch(() => fallback().then((saved) => saved ?? Response.error()));

  // An unreachable TV can leave a request hanging; past the timeout, the saved page opens
  // instead, while the network's answer, if it comes, still refreshes the copy.
  const timeout = new Promise((resolve) => setTimeout(resolve, NAVIGATION_TIMEOUT_MS));
  const first = await Promise.race([network.catch(() => undefined), timeout]);
  if (first) return first;
  return (await fallback()) ?? network;
}
