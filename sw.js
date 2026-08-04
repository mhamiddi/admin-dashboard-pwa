const CACHE = 'jomdigital-cc-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install — cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Fetch — network-first with cache fallback
self.addEventListener('fetch', e => {
  // Don't cache API calls
  if (e.request.url.includes('/api/')) return;
  
  e.respondWith(
    fetch(e.request).then(resp => {
      // Cache successful HTML/DOC responses
      if (resp.ok && (resp.headers.get('content-type') || '').includes('text/html')) {
        const clone = resp.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
      }
      return resp;
    }).catch(() => caches.match(e.request))
  );
});
