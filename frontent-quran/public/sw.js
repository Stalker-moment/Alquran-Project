const CACHE_NAME = "quran-cache-v1";
const OFFLINE_URL = "/";

const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icon.png",
];

// Install Event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching static assets");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[Service Worker] Clearing old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - cache strategy
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip Next.js hot-reloading/internal resources and Webpack updates
  if (url.pathname.startsWith("/_next/") || url.pathname.includes("webpack") || url.pathname.includes("hot-update")) {
    return;
  }

  // Check if it's an API request or audio stream (skip caching for large audio files or live APIs unless necessary)
  const isApi = url.hostname.includes("api") || url.pathname.includes("/api/");
  const isAudio = url.pathname.endsWith(".mp3") || url.pathname.includes("/audio/");

  if (isApi || isAudio) {
    // Network-first for APIs/Audio to prevent issues with stale data or massive storage consumption
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Only cache navigations or explicit static assets
  const isNavigation = event.request.mode === 'navigate';
  const isStatic = STATIC_ASSETS.includes(url.pathname);

  if (!isNavigation && !isStatic) {
    return;
  }

  // Stale-While-Revalidate strategy for static resources and page documents
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Cache successful requests of the same origin
        if (networkResponse && networkResponse.status === 200 && url.origin === self.location.origin) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((err) => {
        console.log("[Service Worker] Fetch failed, returning cached version if available:", err);
        // If fetch fails and nothing matches in cache, return the main index page as fallback
        if (!cachedResponse && event.request.mode === "navigate") {
          return caches.match(OFFLINE_URL);
        }
      });

      return cachedResponse || fetchPromise;
    })
  );
});
