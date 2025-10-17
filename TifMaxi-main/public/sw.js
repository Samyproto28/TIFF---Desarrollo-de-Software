// Service Worker for TifMaxi Electoral System

const CACHE_NAME = 'tifmaxi-v1.0.0';
const STATIC_CACHE_NAME = 'tifmaxi-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'tifmaxi-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/assets/css/app.css',
  '/assets/js/app.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
];

// API routes to cache
const API_ROUTES = [
  '/api/v1/provincias',
  '/api/v1/candidatos',
  '/api/v1/telegramas/stats/general',
  '/api/v1/candidatos/ranking',
];

// Install event - cache static files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static files', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete old caches
            if (cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME && 
                cacheName !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Old caches deleted');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    // Try network first, then cache for API routes
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache successful API responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Serve from cache when network fails
          return caches.match(request);
        })
    );
    return;
  }
  
  // Handle static files
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(request);
      })
      .catch(() => {
        // Serve offline page for navigation requests
        if (request.destination === 'document') {
          return caches.match('/offline');
        }
        
        // Return a generic offline response for other requests
        return new Response(
          JSON.stringify({ error: 'You are offline' }), 
          { 
            status: 503, 
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver detalles',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/images/xmark.png'
      },
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    // Open the app to relevant page
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Open the app to the home page
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync function
function doBackgroundSync() {
  // Get all stored actions from IndexedDB
  return getStoredActions()
    .then(actions => {
      // Process each action
      return Promise.all(
        actions.map(action => {
          return fetch(action.url, {
            method: action.method,
            headers: action.headers,
            body: action.body
          })
          .then(response => {
            if (response.ok) {
              // Remove successful action from IndexedDB
              return removeStoredAction(action.id);
            } else {
              throw new Error(`Failed to sync action: ${action.id}`);
            }
          })
          .catch(error => {
            console.error('Error syncing action:', error);
            // Keep failed action for next sync attempt
            return Promise.reject(error);
          });
        })
      );
    })
    .then(() => {
      console.log('Background sync completed successfully');
    })
    .catch(error => {
      console.error('Background sync failed:', error);
    });
}

// IndexedDB functions for offline storage
function openDB() {
  return indexedDB.open('tifmaxi-offline-db', 1);
}

function getStoredActions() {
  return new Promise((resolve, reject) => {
    const request = openDB();
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['actions'], 'readonly');
      const store = transaction.objectStore('actions');
      const getRequest = store.getAll();
      
      getRequest.onsuccess = () => {
        resolve(getRequest.result);
      };
      
      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

function removeStoredAction(id) {
  return new Promise((resolve, reject) => {
    const request = openDB();
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['actions'], 'readwrite');
      const store = transaction.objectStore('actions');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => {
        resolve();
      };
      
      deleteRequest.onerror = () => {
        reject(deleteRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

// Message handling for communication with the main app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_UPDATED') {
    // Handle cache updates
    console.log('Service Worker: Cache update requested', event.data.payload);
    
    // Update specific cache
    caches.open(DYNAMIC_CACHE_NAME)
      .then(cache => {
        return cache.add(event.data.payload.url);
      })
      .then(() => {
        console.log('Service Worker: Cache updated successfully');
        // Notify all clients about the update
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'CACHE_UPDATED',
              payload: event.data.payload
            });
          });
        });
      })
      .catch(error => {
        console.error('Service Worker: Failed to update cache', error);
      });
  }
});