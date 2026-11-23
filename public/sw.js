const CACHE_NAME = 'farmflow-app-shell-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept API calls (handled by IndexedDB + Outbox Queue)
  if (
    url.port === '3333' ||
    url.pathname.startsWith('/clients') ||
    url.pathname.startsWith('/farms') ||
    url.pathname.startsWith('/orders') ||
    url.pathname.startsWith('/cost-variables') ||
    url.pathname.startsWith('/services') ||
    url.pathname.startsWith('/service-groups') ||
    url.pathname.startsWith('/products') ||
    url.pathname.startsWith('/sessions') ||
    url.pathname.startsWith('/users') ||
    url.pathname.startsWith('/analyses') ||
    url.pathname.startsWith('/sample-label-batches') ||
    url.pathname.startsWith('/audit-logs') ||
    url.pathname.startsWith('/financial') ||
    url.pathname.startsWith('/dashboard') ||
    url.pathname.startsWith('/equipment') ||
    url.pathname.startsWith('/collaborators') ||
    url.pathname.startsWith('/budget')
  ) {
    return;
  }

  // SPA navigation requests: network first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static assets (JS, CSS, fonts, images): stale-while-revalidate / cache fallback
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200 && response.type === 'basic') {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});
