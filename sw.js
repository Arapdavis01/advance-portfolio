// ============================================================
// SERVICE WORKER — Offline Ready (Feature 20)
// Caches core assets, images, and external resources for offline viewing
// ============================================================

// ⚠️ BUMPED VERSION TO v3 TO FORCE CACHE REFRESH
const CACHE_NAME = 'digital-cartographer-v3';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    // Google Fonts (CSS)
    'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,600;14..32,700;14..32,800&family=Orbitron:wght@400;600;700;800;900&display=swap',
    // Font Awesome
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
    // External libraries
    'https://cdn.jsdelivr.net/npm/tsparticles@2.12.0/tsparticles.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js'
];

// ============================================================
// INSTALL EVENT — Cache core assets
// ============================================================
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('[Service Worker] Caching core assets for v3...');
                return cache.addAll(urlsToCache);
            })
            .catch(function(err) {
                console.log('[Service Worker] Cache addAll failed:', err);
            })
    );
    // ✅ Force the new service worker to activate immediately
    self.skipWaiting();
});

// ============================================================
// ACTIVATE EVENT — Clean up old caches and take control
// ============================================================
self.addEventListener('activate', function(event) {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(function() {
            // ✅ Take control of all clients immediately
            return self.clients.claim();
        })
    );
});

// ============================================================
// FETCH EVENT — Serve from cache, fallback to network
// ============================================================
self.addEventListener('fetch', function(event) {
    const request = event.request;
    const url = new URL(request.url);

    // ============================================================
    // STRATEGY 1: Images (cache-first with network fallback)
    // ============================================================
    if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/)) {
        event.respondWith(
            caches.match(request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }
                    // If not in cache, fetch from network and cache it
                    return fetch(request).then(function(networkResponse) {
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(request, responseToCache);
                            });
                        return networkResponse;
                    }).catch(function() {
                        // Fallback: return a placeholder image if offline and not cached
                        return caches.match('/images/offline-placeholder.png');
                    });
                })
        );
        return;
    }

    // ============================================================
    // STRATEGY 2: HTML, CSS, JS (cache-first with network fallback)
    // ============================================================
    if (request.destination === 'document' || 
        request.destination === 'style' || 
        request.destination === 'script' ||
        url.pathname === '/' ||
        url.pathname === '/index.html') {
        event.respondWith(
            caches.match(request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }
                    return fetch(request).then(function(networkResponse) {
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(request, responseToCache);
                            });
                        return networkResponse;
                    }).catch(function() {
                        // Fallback: return a simple offline page
                        return new Response(
                            '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
                            { headers: { 'Content-Type': 'text/html' } }
                        );
                    });
                })
        );
        return;
    }

    // ============================================================
    // STRATEGY 3: External CDN assets (cache-first with network fallback)
    // ============================================================
    if (url.hostname === 'fonts.googleapis.com' || 
        url.hostname === 'cdnjs.cloudflare.com' || 
        url.hostname === 'cdn.jsdelivr.net') {
        event.respondWith(
            caches.match(request)
                .then(function(response) {
                    if (response) {
                        return response;
                    }
                    return fetch(request).then(function(networkResponse) {
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(request, responseToCache);
                            });
                        return networkResponse;
                    });
                })
        );
        return;
    }

    // ============================================================
    // STRATEGY 4: Everything else (network-first with cache fallback)
    // ============================================================
    event.respondWith(
        fetch(request)
            .then(function(networkResponse) {
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME)
                        .then(function(cache) {
                            cache.put(request, responseToCache);
                        });
                }
                return networkResponse;
            })
            .catch(function() {
                return caches.match(request)
                    .then(function(cachedResponse) {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        if (request.headers.get('accept').includes('text/html')) {
                            return new Response(
                                '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
                                { headers: { 'Content-Type': 'text/html' } }
                            );
                        }
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});
