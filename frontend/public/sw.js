// Enhanced Service Worker for QR Upload Viewer
const CACHE_NAME = 'qr-viewer-v2';
const API_CACHE_NAME = 'qr-viewer-api-v1';

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/view.html'
];

// API URLs that should not be cached
const API_URLS = [
  'qr-upload-viewer-backend.onrender.com/api/',
  '/api/'
];

// Install event - cache static resources
self.addEventListener('install', function(event) {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Caching static resources');
        return cache.addAll(urlsToCache.filter(url => url !== '/'));
      })
      .catch(function(error) {
        console.error('[SW] Cache installation failed:', error);
      })
  );
  // Force activation
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all pages
  self.clients.claim();
});

// Fetch event - smart caching strategy
self.addEventListener('fetch', function(event) {
  const url = event.request.url;
  
  // Skip caching for API requests
  if (isApiRequest(url)) {
    event.respondWith(handleApiRequest(event.request));
    return;
  }

  // Cache-first strategy for static resources
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          console.log('[SW] Serving from cache:', url);
          return response;
        }
        
        console.log('[SW] Fetching from network:', url);
        return fetch(event.request)
          .then(function(response) {
            // Only cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then(function(cache) {
                  cache.put(event.request, responseClone);
                });
            }
            return response;
          });
      })
      .catch(function(error) {
        console.error('[SW] Fetch failed:', error);
        // Return offline page if available
        return caches.match('/');
      })
  );
});

// Handle API requests with network-first strategy
function handleApiRequest(request) {
  return fetch(request)
    .then(function(response) {
      // Don't cache error responses
      if (!response.ok) {
        console.warn('[SW] API error response:', response.status, request.url);
        return response;
      }

      // Cache successful API responses with short TTL
      const responseClone = response.clone();
      caches.open(API_CACHE_NAME)
        .then(function(cache) {
          // Add timestamp for TTL
          const requestWithTimestamp = new Request(request.url + '?cached=' + Date.now());
          cache.put(requestWithTimestamp, responseClone);
        });

      return response;
    })
    .catch(function(error) {
      console.error('[SW] API request failed:', error);
      
      // Try to serve from cache as fallback
      return caches.match(request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            console.log('[SW] Serving API from cache:', request.url);
            return cachedResponse;
          }
          throw error;
        });
    });
}

// Check if request is for API
function isApiRequest(url) {
  return API_URLS.some(apiUrl => url.includes(apiUrl));
}

// Message handler for cache management
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Clearing all caches...');
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.map(function(cacheName) {
            console.log('[SW] Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(function() {
        console.log('[SW] All caches cleared');
        event.ports[0].postMessage({ success: true });
      }).catch(function(error) {
        console.error('[SW] Cache clear failed:', error);
        event.ports[0].postMessage({ success: false, error: error.message });
      })
    );
  }
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded');