var cacheVersion = 2;
var cacheVersionKey = 'v' + parseInt(cacheVersion + 1);
var cacheUrls = {
  '/comment/index.html': 0,
  '/comment/index.css': 1,
  '/comment/index.js': 2,
  '/comment/index.json': 3,
  'https://static-sg.zacdn.com/fonts/apercu/apercu_regular-webfont.woff2': 4,
  '/comment/': 5,
  '/comment/?country=ph': 6,
  '/comment/?country=sg': 7,
  '/comment/?country=my': 8,
  '/comment/?country=hk': 9,
  '/comment/?country=tw': 10,
  '/comment/?country=id': 11
}

var makeRequest = function(event) {
  return fetch(event.request).then(function (response) {
    // response may be used only once
    // we need to save clone to put one copy in cache
    // and serve second one
    let responseClone = response.clone();

    if (response.status < 400) {
      caches.open(cacheVersionKey).then(function (cache) {
        cache.put(event.request, responseClone);
      });
    } else {
        console.log('Not caching the response to', event.request.url);
    }

    return response;
  }).catch(function (error) {
    console.error('Error in fetch handler:', error);
    throw error;
  });
}

self.addEventListener('install', function(event) {
  // Skip the 'waiting' lifecycle phase, to go directly from 'installed' to 'activated', even if
  // there are still previous incarnations of this service worker registration active.
  event.waitUntil(
    caches.open(cacheVersionKey).then(function(cache) {
      return cache.addAll([
        '/comment/index.html',
        '/comment/index.css',
        '/comment/index.js',
        '/comment/index.json',
        '/comment/',
        'https://static-sg.zacdn.com/fonts/apercu/apercu_regular-webfont.woff2',
      ]);
    })
  );
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    // caches.match() always resolves
    // but in case of success response will have value
    if (response !== undefined) {
      console.log('Found response in cache:', response);

      makeRequest(event);

      return response;
    } else {
      console.log(' No response for %s found in cache. About to fetch ' +
          'from network...', event.request.url);
      return fetch(event.request).then(function (response) {
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        let responseClone = response.clone();

        var host = self.location.origin;
        var path = event.request.url.replace(host, '');
        var needCache = typeof(cacheUrls[path]) !== 'undefined';

        if (needCache && response.status < 400) {
          caches.open(cacheVersionKey).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        } else {
            console.log('Not caching the response to', event.request.url);
        }

        return response;
      }).catch(function (error) {
        console.error('  Error in fetch handler:', error);
        throw error;
      });
    }
  }));
});

self.addEventListener('activate', function(event) {
  var cacheKeeplist = [cacheVersionKey];

  event.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (cacheKeeplist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});
