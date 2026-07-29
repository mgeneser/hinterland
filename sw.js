/* Hinterland 2026 service worker.
 *
 * Cell service at the amphitheater is bad enough that offline isn't a nicety —
 * it's the normal case. So the shell and all 48 artist photos are precached on
 * install (~1.5 MB), and song previews are cached as they're played.
 *
 * Bump CACHE when you change any precached file, or phones will keep the old one.
 */

var CACHE = 'hinterland-v18';
var AUDIO_CACHE = 'hinterland-audio';

var SHELL = [
  './',
  'index.html',
  'styles.css',
  'data.js',
  'artists.js',
  'previews.js',
  'grounds.js',
  'map.js',
  'app.js',
  'manifest.json',
  'icons/icon-180.png?v=2',
  'icons/icon-192.png?v=2',
  'icons/icon-512.png?v=2',
  'icons/icon-maskable-512.png?v=2',
  'img/ill-food.png',
  'img/ill-basecamp.webp',
  'img/ill-map.png',
  'img/grounds-map.jpg',
  'img/concourse-map.jpg',
    'img/amble.jpg',
    'img/ashnikko.jpg',
    'img/audrey-hobert.jpg',
    'img/audrey-nuna.jpg',
    'img/beabadoobee.jpg',
    'img/between-friends.jpg',
    'img/buffalo-traffic-jam.jpg',
    'img/cmat.jpg',
    'img/crooked-torus.jpg',
    'img/derry-the-dirty-dishes.jpg',
    'img/die-spitz.jpg',
    'img/duo-beats.jpg',
    'img/frost-children.jpg',
    'img/geese.jpg',
    'img/gouge-away.jpg',
    'img/haute-freddy.jpg',
    'img/jane-remover.jpg',
    'img/jeffery-lewis.jpg',
    'img/jessie-murph.jpg',
    'img/julia-wolf.jpg',
    'img/kali-uchis.jpg',
    'img/katseye.jpg',
    'img/koo-koo.jpg',
    'img/leslie-the-lys.jpg',
    'img/lipstick-homicide.jpg',
    'img/lorde.jpg',
    'img/mumford-sons.jpg',
    'img/muna.jpg',
    'img/ninajirachi.jpg',
    'img/nourished-by-time.jpg',
    'img/oklou.jpg',
    'img/paris-paloma.jpg',
    'img/pixel-grip.jpg',
    'img/porch-light.jpg',
    'img/quintron-and-miss-pussycat.jpg',
    'img/saint-avangeline.jpg',
    'img/samia.jpg',
    'img/santigold.jpg',
    'img/sarah-tonin.jpg',
    'img/snow-strippers.jpg',
    'img/sofia-isella.jpg',
    'img/suki-waterhouse.jpg',
    'img/the-brook-the-bluff.jpg',
    'img/the-format.jpg',
    'img/waylonwyatt2.jpg',
    'img/wet-leg.jpg',
    'img/wisp.jpg',
    'img/young-miko.jpg',
];

self.addEventListener('install', function (ev) {
  ev.waitUntil(
    caches.open(CACHE)
      // addAll is all-or-nothing; add individually so one bad file can't stop
      // the whole install and leave someone with no offline app at all.
      .then(function (c) {
        return Promise.all(SHELL.map(function (url) {
          return c.add(url).catch(function () {});
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (ev) {
  ev.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE && k !== AUDIO_CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (ev) {
  var req = ev.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);

  // Song previews: cache-first and keep them, so "save for offline" sticks.
  if (url.hostname.indexOf('audio-ssl.itunes.apple.com') !== -1) {
    ev.respondWith(
      caches.open(AUDIO_CACHE).then(function (c) {
        return c.match(req).then(function (hit) {
          if (hit) return hit;
          return fetch(req).then(function (res) {
            c.put(req, res.clone()).catch(function () {});
            return res;
          });
        });
      })
    );
    return;
  }

  // Preview lookups: network only. The resolved URLs live in localStorage,
  // so a failed lookup offline is harmless.
  if (url.hostname.indexOf('itunes.apple.com') !== -1) return;

  // Everything of ours: cache-first. The schedule doesn't change hour to hour,
  // and a guaranteed instant load matters more in a field than freshness.
  ev.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok && url.origin === location.origin) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy).catch(function () {}); });
        }
        return res;
      }).catch(function () {
        // A navigation that missed the cache still gets the app shell.
        if (req.mode === 'navigate') return caches.match('index.html');
      });
    })
  );
});
