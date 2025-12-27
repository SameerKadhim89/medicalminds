const CACHE_NAME = 'medicalminds-v1';
const urlsToCache = [
  '/medicalbook.html',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Cairo:wght@400;600;700;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})));
      })
      .catch(err => console.log('Cache failed:', err))
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // Return offline page or fallback
        return caches.match('/medicalbook.html');
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'إشعار جديد من MedicalMinds',
    icon: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 200\'%3E%3Cdefs%3E%3ClinearGradient id=\'grad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%230088cc;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%2300c2a8;stop-opacity:1\' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'200\' height=\'200\' rx=\'40\' fill=\'url(%23grad)\'/%3E%3Ctext x=\'100\' y=\'135\' font-family=\'Arial\' font-size=\'100\' fill=\'white\' text-anchor=\'middle\'%3E%E2%9D%A4%3C/text%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 200\'%3E%3Cdefs%3E%3ClinearGradient id=\'grad\' x1=\'0%25\' y1=\'0%25\' x2=\'100%25\' y2=\'100%25\'%3E%3Cstop offset=\'0%25\' style=\'stop-color:%230088cc;stop-opacity:1\' /%3E%3Cstop offset=\'100%25\' style=\'stop-color:%2300c2a8;stop-opacity:1\' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=\'200\' height=\'200\' rx=\'40\' fill=\'url(%23grad)\'/%3E%3Ctext x=\'100\' y=\'135\' font-family=\'Arial\' font-size=\'100\' fill=\'white\' text-anchor=\'middle\'%3E%E2%9D%A4%3C/text%3E%3C/svg%3E',
    vibrate: [200, 100, 200],
    tag: 'medicalbook-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('MedicalMinds', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/medicalbook.html')
  );
});

// Background sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
});

async function syncPosts() {
  // Sync logic here
  console.log('Syncing posts...');
}
