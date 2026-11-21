const CACHE_NAME = 'presensi-mengaji-v2';
const ASET_INTI = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASET_INTI)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Jaringan dulu (supaya pembaruan aplikasi langsung terpakai), cadangan dari cache saat offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;
  if (url.includes('firestore.googleapis.com') || url.includes('googleapis.com') || url.includes('gstatic.com')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const salinan = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, salinan));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
