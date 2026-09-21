/* Minimal SW: installability without breaking Next.js navigations. */
const CACHE = "cofit-static-v2";
const PRECACHE = [
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

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
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  // HTML / navigaties: altijd netwerk. Geen cache — voorkomt blanke Android-launch.
  if (request.mode === "navigate" || request.destination === "document") {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Alleen eigen static assets cachen (icons/manifest).
  if (!url.pathname.startsWith("/icons/") && url.pathname !== "/manifest.webmanifest") {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    }),
  );
});
