// Service Worker for Wizard Breaker Game - Offline Support
//
// Pages are network-first so a new deploy shows up on the next load; the
// cached copy is only an offline fallback. Hashed JS/CSS bundles never change
// under the same URL, so those are cache-first. Paths are relative to the
// worker's scope, so it works at a domain root or under a subpath.
const CACHE_NAME = 'wizard-breaker-v2';
const SCOPE = new URL(self.registration.scope).pathname;
const INDEX = SCOPE + 'index.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([SCOPE, INDEX, SCOPE + 'manifest.json']))
  );
  self.skipWaiting();
});

// Drop caches from older versions (v1 served stale pages cache-first).
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
  );
  self.clients.claim();
});

function cachePut(request, response) {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;

  // Page loads: network first, fall back to the cached app shell when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => cachePut(INDEX, response))
        .catch(() => caches.match(INDEX))
    );
    return;
  }

  // Everything else: cache first, then network.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((response) => cachePut(request, response))
          .catch(() => new Response('Offline', { status: 503, statusText: 'Service Unavailable' }))
    )
  );
});
