// ============================================================
// sw.js — Service Worker untuk PWA PKBM Asesmen
// Menyimpan cache file utama agar aplikasi bisa offline
// ============================================================

const CACHE_NAME = 'pkbm-asesmen-v1';
const OFFLINE_URLS = [
  '/index.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;900&display=swap'
];

// Install: simpan file penting ke cache
self.addEventListener('install', (event) => {
  console.log('[SW] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: hapus cache lama
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Network-first, fallback ke cache
self.addEventListener('fetch', (event) => {
  // Jangan intercept request Firebase (butuh network)
  if (event.request.url.includes('firestore') ||
      event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis.com/auth')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Simpan response ke cache jika sukses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Jika offline, ambil dari cache
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/index.html');
        });
      })
  );
});
