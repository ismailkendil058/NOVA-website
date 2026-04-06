// Service Worker for NOVA Admin PWA
// Only handles basic fetch to satisfy Chrome's PWA install criteria

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    // Pass through all requests
    event.respondWith(fetch(event.request));
});
