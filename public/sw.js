const CACHE_NAME = 'fluxo-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  // Basic pass-through for now, as data is handled by Firestore and offline persistence.
  // PWA mostly relies on this file existing to pass the PWA install criteria.
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
