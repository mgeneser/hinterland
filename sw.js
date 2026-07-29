/* Hinterland 2026 service worker.
 *
 * Cell service at the amphitheater is bad enough that offline isn't a nicety —
 * it's the normal case. So the shell and all 48 artist photos are precached on
 * install (~1.5 MB), and song previews are cached as they're played.
 *
 * Bump CACHE when you change any precached file, or phones will keep the old one.
 */

var CACHE = 'hinterland-v19';
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

  // Song previews.
  //
  // Safari requests media in byte ranges and REJECTS a plain 200 answer to a
  // Range request — the audio then fails to load with no error anyone can see.
  // The old code cache-matched on the URL and handed back the stored full 200,
  // so as soon as a preview had been cached (playing one, or "save for
  // offline"), previews stopped working on iOS while still working in Chrome,
  // which happily accepts a 200. Ranges must be honoured properly.
  if (url.hostname.indexOf('audio-ssl.itunes.apple.com') !== -1) {
    ev.respondWith(audioResponse(ev, req));
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

// Serve a preview, honouring Range. Apple's CDN sends access-control-allow-origin: *,
// so the cached body is readable and can be sliced here.
function audioResponse(ev, req) {
  var range = req.headers.get('range');
  // Key on the bare URL so one stored copy answers every range for that track.
  var key = new Request(req.url);

  return caches.open(AUDIO_CACHE).then(function (c) {
    return c.match(key).then(function (hit) {
      if (hit) return sliceIfNeeded(hit, range);

      // Not cached yet: let the network answer this request untouched so Safari
      // can start streaming immediately, and warm the cache separately for
      // offline use rather than making playback wait on a full download.
      ev.waitUntil(
        fetch(key).then(function (full) {
          if (full && full.status === 200) return c.put(key, full);
        }).catch(function () {})
      );
      return fetch(req);
    });
  }).catch(function () { return fetch(req); });
}

function sliceIfNeeded(res, range) {
  if (!range) return res.clone();
  return res.clone().arrayBuffer().then(function (buf) {
    var total = buf.byteLength;
    var m = /bytes=(\d*)-(\d*)/.exec(range) || [];
    var start = m[1] ? parseInt(m[1], 10) : 0;
    var end = m[2] ? parseInt(m[2], 10) : total - 1;
    if (isNaN(start) || start < 0) start = 0;
    if (isNaN(end) || end >= total) end = total - 1;
    if (start > end) {
      return new Response('', { status: 416, statusText: 'Range Not Satisfiable' });
    }
    var part = buf.slice(start, end + 1);
    return new Response(part, {
      status: 206,
      statusText: 'Partial Content',
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'audio/mp4',
        'Content-Length': String(part.byteLength),
        'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
        'Accept-Ranges': 'bytes'
      }
    });
  });
}
