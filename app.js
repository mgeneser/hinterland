/* Hinterland 2026 — schedule, stars, and camper-run planning. */

(function () {
  'use strict';

  var STORE_STARS = 'hinterland26.stars';
  var STORE_THEME = 'hinterland26.theme';
  var STORE_DAY = 'hinterland26.day';

  var stageById = {};
  STAGES.forEach(function (s) { stageById[s.id] = s; });

  // ── Time helpers ────────────────────────────────────────────────
  // Naive local time throughout. The phone will be in Central at the
  // festival, so device-local and festival-local are the same thing.

  function toDate(dateStr, timeStr) {
    var d = dateStr.split('-').map(Number);
    var t = timeStr.split(':').map(Number);
    return new Date(d[0], d[1] - 1, d[2], t[0], t[1], 0, 0);
  }

  function fmtTime(date) {
    var h = date.getHours();
    var m = date.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return h + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + ampm;
  }

  function fmtDuration(mins) {
    var h = Math.floor(mins / 60);
    var m = mins % 60;
    if (h && m) return h + 'h ' + m + 'm';
    if (h) return h + (h === 1 ? ' hour' : ' hours');
    return m + ' min';
  }

  // ── Build the set list ──────────────────────────────────────────

  var sets = SETS.map(function (row, i) {
    return {
      id: 's' + i,
      dayId: row[0],
      stageId: row[1],
      start: toDate(row[2], row[3]),
      name: row[4],
    };
  });

  // End times are NOT published. Estimate from the next set on the same
  // stage, leaving 15 minutes for changeover. Everything that consumes
  // `end` must present it as approximate.
  (function estimateEnds() {
    var byStage = {};
    sets.forEach(function (s) {
      var key = s.dayId + '|' + s.stageId;
      (byStage[key] = byStage[key] || []).push(s);
    });
    Object.keys(byStage).forEach(function (key) {
      var list = byStage[key].sort(function (a, b) { return a.start - b.start; });
      list.forEach(function (s, i) {
        var next = list[i + 1];
        var mins;
        if (next) {
          mins = Math.round((next.start - s.start) / 60000) - 15;
          mins = Math.max(30, Math.min(90, mins));
        } else {
          // Last set on this stage for the day — headliners run longer.
          mins = s.stageId === 'main' ? 90 : 60;
        }
        s.durationMins = mins;
        s.end = new Date(s.start.getTime() + mins * 60000);
      });
    });
  })();

  sets.sort(function (a, b) { return a.start - b.start; });

  var setsByName = {};
  sets.forEach(function (s) {
    (setsByName[s.name] = setsByName[s.name] || []).push(s);
  });

  // ── Stars ───────────────────────────────────────────────────────

  var stars = load(STORE_STARS, {});

  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
  }

  function photoFor(name) {
    var slug = SLUGS[name];
    return slug ? 'img/' + slug + '.jpg' : '';
  }

  // Starred by artist name, so an artist playing twice is starred once.
  function isStarred(name) { return !!stars[name]; }

  function toggleStar(name) {
    if (stars[name]) delete stars[name];
    else stars[name] = 1;
    save(STORE_STARS, stars);
    render();
  }

  // ── State ───────────────────────────────────────────────────────

  // Which festival day is it right now, or null if the festival isn't on.
  //
  // The day rolls over at 4 AM, not midnight. Campfire sets run to roughly
  // 1:30 AM and belong to the night before — at 12:30 AM watching Ninajirachi
  // you are still having Friday, and the app should agree with you.
  //
  // Pure function of `now` so it can be tested against real timestamps.
  function festivalDayFor(now) {
    var shifted = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    for (var i = 0; i < DAYS.length; i++) {
      var d = toDate(DAYS[i].date, '00:00');
      if (d.getFullYear() === shifted.getFullYear() &&
          d.getMonth() === shifted.getMonth() &&
          d.getDate() === shifted.getDate()) return DAYS[i].id;
    }
    return null;
  }

  // During the festival, today wins over whatever was last tapped — otherwise a
  // stray tap on Sunday in July would still be showing Sunday on the Friday.
  // Outside the festival, the remembered day is the useful default.
  var state = {
    view: 'schedule',
    day: festivalDayFor(new Date()) || load(STORE_DAY, null) || DAYS[0].id,
    starredOnly: false,
    search: '',
  };

  function isToday(day) {
    return festivalDayFor(new Date()) === day.id;
  }

  // ── Element helper ──────────────────────────────────────────────

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k === 'style') node.setAttribute('style', attrs[k]);
      else if (k.slice(0, 2) === 'on') node.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== false) node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c) node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  // ── Schedule rendering ──────────────────────────────────────────

  function renderDayBar() {
    var bar = document.getElementById('dayBar');
    bar.textContent = '';
    DAYS.forEach(function (d) {
      var starred = sets.filter(function (s) {
        return s.dayId === d.id && isStarred(s.name);
      }).length;
      var cls = 'day' + (d.id === state.day ? ' is-active' : '') + (isToday(d) ? ' is-today' : '');
      bar.appendChild(el('button', {
        class: cls,
        'aria-pressed': d.id === state.day,
        'aria-label': d.label + ', ' + starred + ' starred',
        onclick: function () {
          state.day = d.id;
          save(STORE_DAY, d.id);
          render();
        },
      }, [
        el('b', { text: d.label.slice(0, 3) }),
        el('small', { text: starred ? starred + ' starred' : d.short.split(' ')[1] }),
      ]));
    });
  }

  function renderSchedule() {
    var list = document.getElementById('scheduleList');
    list.textContent = '';

    var now = new Date();
    var day = DAYS.filter(function (d) { return d.id === state.day; })[0];
    var all = sets.filter(function (s) { return s.dayId === state.day; });
    var shown = state.starredOnly ? all.filter(function (s) { return isStarred(s.name); }) : all;

    var q = state.search.trim().toLowerCase();
    if (q) {
      shown = shown.filter(function (s) {
        var a = ARTISTS[s.name];
        var hay = s.name + ' ' + (a ? a.genre + ' ' + (a.soundsLike || []).join(' ') : '');
        return hay.toLowerCase().indexOf(q) !== -1;
      });
    }

    // Star count for this day
    var starredToday = all.filter(function (s) { return isStarred(s.name); }).length;
    document.getElementById('starCount').textContent =
      starredToday + ' of ' + all.length + ' starred';

    var status = document.getElementById('scheduleStatus');
    if (status) {
      status.textContent = day.label + ': showing ' + shown.length +
        (state.starredOnly ? ' starred sets' : ' sets') + '.';
    }

    if (!shown.length) {
      list.appendChild(el('div', { class: 'empty' }, [
        el('b', { text: q ? 'No matches' : (state.starredOnly ? 'Nothing starred yet' : 'No sets') }),
        q ? 'Try a genre like \u201cfolk\u201d, or an artist you already like.'
          : (state.starredOnly
              ? 'Turn the filter off and tap a star next to any act you want to catch.'
              : 'Check another day.'),
      ]));
      return;
    }

    // Conflicts are only interesting among things you actually care about.
    var starredSets = all.filter(function (s) { return isStarred(s.name); });
    var conflicting = {};
    starredSets.forEach(function (a) {
      starredSets.forEach(function (b) {
        if (a === b) return;
        if (a.start < b.end && b.start < a.end) conflicting[a.id] = true;
      });
    });

    var cur = currentSet();
    nextUpId = (cur && now < cur.start) ? cur.id : null;

    sheetOrder = shown.map(function (x) { return x.name; });

    var prev = null;
    shown.forEach(function (s) {
      // In "my schedule" mode, show the free time between your sets —
      // that's the camper-run window.
      if (state.starredOnly && !q && prev) {
        var gapMins = Math.round((s.start - prev.end) / 60000);
        if (gapMins >= 25) {
          list.appendChild(el('div', { class: 'gap' }, [
            el('span', { text: '~' + fmtDuration(gapMins) + ' free' }),
          ]));
        }
      }
      list.appendChild(renderSlot(s, now, conflicting[s.id]));
      prev = s;
    });

    if (!state.starredOnly && starredToday) {
      list.appendChild(el('p', { class: 'note', text:
        'Flip on “My schedule only” to see the gaps between your sets.' }));
    }
    void day;
  }

  // Which set is "now", or the next one starting if nothing is on. Null outside
  // the festival. Returns the set object so callers can use its id and day.
  function currentSet() {
    var today = festivalDayFor(new Date());
    if (!today) return null;
    var now = new Date();
    var todays = sets.filter(function (x) { return x.dayId === today; });
    var live = todays.filter(function (x) { return now >= x.start && now < x.end; })[0];
    if (live) return live;
    var next = todays.filter(function (x) { return x.start > now; })[0];
    return next || todays[todays.length - 1] || null;
  }

  var nextUpId = null;

  function renderSlot(s, now, hasConflict) {
    var stage = stageById[s.stageId];
    var artist = ARTISTS[s.name];
    var starred = isStarred(s.name);
    var live = now >= s.start && now < s.end;
    var past = now >= s.end;

    var cls = 'slot' + (starred ? ' is-starred' : '') + (live ? ' is-now' : '') + (past ? ' is-past' : '');

    var meta = [el('span', { class: 'slot-stage', text: stage.name })];
    if (live) meta.push(el('span', { class: 'badge-now', text: 'On now' }));
    else if (nextUpId === s.id) meta.push(el('span', { class: 'badge-next', text: 'Next up' }));
    if (hasConflict) meta.push(el('span', { class: 'conflict', text: 'Overlap' }));
    if (artist && artist.genre) meta.push(el('span', { class: 'slot-genre', text: artist.genre }));

    var star = el('button', {
      class: 'slot-star',
      'aria-pressed': starred,
      'aria-label': (starred ? 'Unstar ' : 'Star ') + s.name,
      onclick: function (ev) { ev.stopPropagation(); toggleStar(s.name); },
    }, [starred ? '★' : '☆']);

    return el('div', {
      class: cls,
      'data-set-id': s.id,
      style: '--slot-color:' + stage.color,
      role: 'button',
      tabindex: '0',
      onclick: function () { openSheet(s.name); },
      onkeydown: function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openSheet(s.name); }
      },
    }, [
      playablePhoto(s.name, 'photo--row'),
      el('div', { class: 'slot-body' }, [
        el('div', { class: 'slot-time' }, [
          el('span', { class: 'slot-start', text: fmtTime(s.start) }),
          el('span', { class: 'slot-end', text: '– ~' + fmtTime(s.end) }),
        ]),
        el('div', { class: 'slot-name', text: s.name }),
        el('div', { class: 'slot-meta' }, meta),
      ]),
      star,
    ]);
  }

  // ── Artist sheet ────────────────────────────────────────────────

  var sheet = document.getElementById('sheet');
  var sheetBody = document.getElementById('sheetBody');
  var lastFocus = null;
  // Names in the order the schedule is currently showing them, so swiping in the
  // sheet moves through the same sequence you were just scrolling.
  var sheetOrder = [];
  var sheetName = null;

  function openSheet(name) {
    var a = ARTISTS[name] || {};
    var mySets = setsByName[name] || [];
    var starred = isStarred(name);
    sheetName = name;
    if (sheetOrder.indexOf(name) === -1) {
      // Opened from somewhere the schedule isn't driving; fall back to the day.
      sheetOrder = sets.filter(function (x) { return x.dayId === state.day; })
                       .map(function (x) { return x.name; });
    }
    if (sheet.hidden) lastFocus = document.activeElement;

    sheetBody.textContent = '';

    sheetBody.appendChild(playablePhoto(name, 'photo--sheet'));

    sheetBody.appendChild(el('h2', { id: 'sheetName', text: name }));

    var sub = [];
    if (a.genre) sub.push(el('span', { class: 'sheet-genre', text: a.genre }));
    if (a.genre && a.origin) sub.push(el('span', { class: 'sheet-origin', text: ' · ' }));
    if (a.origin) sub.push(el('span', { class: 'sheet-origin', text: a.origin }));
    if (sub.length) sheetBody.appendChild(el('div', {}, sub));

    if (a.blurb) sheetBody.appendChild(el('p', { class: 'sheet-blurb', text: a.blurb }));

    // When they play is the thing you actually want while flicking through
    // artists, so it gets the largest type in the sheet.
    sheetBody.appendChild(el('div', { class: 'sheet-sets' }, mySets.map(function (s) {
      var d = DAYS.filter(function (x) { return x.id === s.dayId; })[0];
      var stage = stageById[s.stageId];
      return el('div', { class: 'when', style: '--slot-color:' + stage.color }, [
        el('div', { class: 'when-day', text: d.label }),
        el('div', { class: 'when-time' }, [
          el('b', { text: fmtTime(s.start) }),
          el('span', { text: ' – ~' + fmtTime(s.end) }),
        ]),
        el('div', { class: 'when-stage', text: stage.name }),
      ]);
    })));

    var rows = [];
    if (a.soundsLike && a.soundsLike.length) {
      rows.push(el('div', { class: 'sheet-row' }, [
        el('dt', { text: 'Sounds like' }),
        el('dd', {}, [el('div', { class: 'chips' }, a.soundsLike.map(function (x) {
          return el('span', { class: 'chip', text: x });
        }))]),
      ]));
    }
    if (a.keyTracks && a.keyTracks.length) {
      rows.push(el('div', { class: 'sheet-row' }, [
        el('dt', { text: 'Start here' }),
        el('dd', {}, [el('div', { class: 'chips' }, a.keyTracks.map(function (x) {
          return el('span', { class: 'chip', text: x });
        }))]),
      ]));
    }
    if (rows.length) sheetBody.appendChild(el('dl', { class: 'sheet-rows' }, rows));

    var btn = el('button', {
      class: 'sheet-star',
      'aria-pressed': starred,
      onclick: function () { toggleStar(name); openSheet(name); },
      text: starred ? '★  In my schedule' : '☆  Add to my schedule',
    });
    sheetBody.appendChild(btn);

    var links = [
      el('a', {
        href: 'https://open.spotify.com/search/' + encodeURIComponent(name),
        rel: 'noopener', target: '_blank', text: 'Spotify',
      }),
      el('a', {
        href: 'https://www.youtube.com/results?search_query=' + encodeURIComponent(name),
        rel: 'noopener', target: '_blank', text: 'YouTube',
      }),
    ];
    if (SLUGS[name]) {
      links.push(el('a', {
        href: 'https://www.hinterlandiowa.com/artist/' + SLUGS[name],
        rel: 'noopener', target: '_blank', text: 'Official',
      }));
    }
    sheetBody.appendChild(el('div', { class: 'sheet-links' }, links));

    if (a.uncertain) {
      sheetBody.appendChild(el('p', { class: 'note', text:
        'Details for this act were hard to pin down — treat them as rough.' }));
    }

    // Pager. Swiping does the same thing; these exist because a swipe is
    // invisible and unusable with a keyboard or switch control.
    var i = sheetOrder.indexOf(name);
    sheetBody.appendChild(el('div', { class: 'pager' }, [
      el('button', {
        class: 'pager-btn', 'aria-label': 'Previous artist',
        disabled: i <= 0 ? 'disabled' : null,
        onclick: function () { sheetGo(-1); },
      }, ['\u2039']),
      el('span', { class: 'pager-count',
        text: i >= 0 ? (i + 1) + ' of ' + sheetOrder.length : '' }),
      el('button', {
        class: 'pager-btn', 'aria-label': 'Next artist',
        disabled: (i < 0 || i >= sheetOrder.length - 1) ? 'disabled' : null,
        onclick: function () { sheetGo(1); },
      }, ['\u203a']),
    ]));

    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
    btn.focus();
  }

  function sheetGo(delta) {
    var i = sheetOrder.indexOf(sheetName);
    var next = i + delta;
    if (i < 0 || next < 0 || next >= sheetOrder.length) return;
    stopAudio();                       // don't carry one artist's song onto the next
    var panel = sheet.querySelector('.sheet-panel');
    panel.classList.remove('slide-l', 'slide-r');
    // Force a reflow so the animation restarts on consecutive swipes.
    void panel.offsetWidth;
    panel.classList.add(delta > 0 ? 'slide-l' : 'slide-r');
    openSheet(sheetOrder[next]);
    panel.scrollTop = 0;
  }

  (function sheetSwipe() {
    var x0 = null, y0 = null;
    var panel = sheet.querySelector('.sheet-panel');
    panel.addEventListener('touchstart', function (ev) {
      x0 = ev.touches[0].clientX; y0 = ev.touches[0].clientY;
    }, { passive: true });
    panel.addEventListener('touchend', function (ev) {
      if (x0 === null) return;
      var dx = ev.changedTouches[0].clientX - x0;
      var dy = ev.changedTouches[0].clientY - y0;
      x0 = null;
      // Horizontal intent only — otherwise scrolling the sheet would page it.
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.6) sheetGo(dx < 0 ? 1 : -1);
    }, { passive: true });
  })();

  document.addEventListener('keydown', function (ev) {
    if (sheet.hidden) return;
    if (ev.key === 'ArrowRight') sheetGo(1);
    if (ev.key === 'ArrowLeft') sheetGo(-1);
  });

  function closeSheet() {
    sheet.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  sheet.addEventListener('click', function (ev) {
    if (ev.target.hasAttribute('data-close')) closeSheet();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && !sheet.hidden) closeSheet();
  });

  // ── Info ────────────────────────────────────────────────────────

  function renderInfo() {
    document.getElementById('basecampBlurb').textContent = BASECAMP.blurb;

    // Which build is actually running. Without this, "it still doesn't work" is
    // impossible to tell apart from "you're on a stale cached copy".
    var build = document.getElementById('buildInfo');
    if (build && window.caches) {
      caches.keys().then(function (names) {
        var app = names.filter(function (n) { return n.indexOf('hinterland-v') === 0; })[0];
        build.textContent = 'Build ' + (app || 'not cached yet') +
          (audioUnlocked ? ' · audio ready' : ' · audio not yet unlocked');
      }).catch(function () {});
    }

    renderHours();

    var am = document.getElementById('basecampAmenities');
    am.textContent = '';
    BASECAMP.amenities.forEach(function (a) {
      am.appendChild(el('li', {}, [
        el('b', { text: a.name }),
        el('span', { text: a.note }),
      ]));
    });

    var total = sets.length;
    var starred = Object.keys(stars).filter(function (n) { return setsByName[n]; }).length;
    var mins = sets.filter(function (s) { return isStarred(s.name); })
      .reduce(function (sum, s) { return sum + s.durationMins; }, 0);

    var stats = document.getElementById('statBlock');
    stats.textContent = '';
    [[total, 'sets'], [starred, 'starred'], [Math.round(mins / 60) + 'h', 'of music']]
      .forEach(function (pair) {
        stats.appendChild(el('div', { class: 'stat' }, [
          el('b', { text: String(pair[0]) }),
          el('span', { text: pair[1] }),
        ]));
      });

    var key = document.getElementById('stageKey');
    key.textContent = '';
    STAGES.forEach(function (s) {
      var count = sets.filter(function (x) { return x.stageId === s.id; }).length;
      key.appendChild(el('li', {}, [
        el('i', { style: 'background:' + s.color }),
        el('span', { text: s.name + ' — ' + count + ' sets' }),
      ]));
    });
  }

  // ── Song previews ───────────────────────────────────────────────
  // Apple's iTunes Search API is public, needs no key, and returns a 30-second
  // preview per track. We resolve each artist once and remember the result, so
  // the lookup only costs a request the first time.

  var STORE_PREVIEWS = 'hinterland26.previews';

  // Start from the build-time table so the common path costs zero API calls.
  // Anything learned at runtime is layered on top and remembered.
  var previews = {};
  if (typeof PREVIEWS === 'object' && PREVIEWS) {
    Object.keys(PREVIEWS).forEach(function (k) { previews[k] = PREVIEWS[k]; });
  }
  (function () {
    var stored = load(STORE_PREVIEWS, {});
    Object.keys(stored).forEach(function (k) { previews[k] = stored[k]; });
  })();

  function lookupPreview(name) {
    if (previews[name]) return Promise.resolve(previews[name]);

    var a = ARTISTS[name] || {};
    // Searching "<artist> <known song>" beats searching the artist alone —
    // it avoids soundalike acts and picks a song worth hearing.
    var terms = [];
    if (a.keyTracks && a.keyTracks[0]) terms.push(name + ' ' + a.keyTracks[0]);
    terms.push(name);

    // Apple throttles bursts by returning an empty body rather than a 429, so
    // an empty response means "slow down", not "no such artist". Without the
    // retry, saving a big starred list silently loses the last few artists.
    function attempt(i, retries) {
      if (i >= terms.length) return Promise.resolve(null);
      var url = 'https://itunes.apple.com/search?media=music&entity=musicTrack&limit=8&term='
        + encodeURIComponent(terms[i]);
      return fetch(url)
        .then(function (r) { return r.ok ? r.text() : ''; })
        .then(function (txt) {
          if (!txt || !txt.trim()) {
            if (retries > 0) return wait(2500).then(function () { return attempt(i, retries - 1); });
            return attempt(i + 1, 2);
          }
          var data;
          try { data = JSON.parse(txt); } catch (e) { return attempt(i + 1, 2); }
          if (!data.results || !data.results.length) return attempt(i + 1, 2);
          var hit = pickResult(data.results, name);
          if (!hit) return attempt(i + 1, 2);
          var rec = {
            track: hit.trackName,
            url: hit.previewUrl,
            art: (hit.artworkUrl100 || '').replace('100x100', '400x400'),
          };
          previews[name] = rec;
          var learned = load(STORE_PREVIEWS, {});
          learned[name] = rec;
          save(STORE_PREVIEWS, learned);
          return rec;
        })
        .catch(function () { return attempt(i + 1, 2); });
    }
    return attempt(0, 2);
  }

  function wait(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  // Loose match — iTunes spells names differently than festival posters do.
  function norm(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]/g, ''); }

  function pickResult(results, name) {
    var want = norm(name);
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      if (!r.previewUrl) continue;
      var got = norm(r.artistName);
      if (got === want || got.indexOf(want) !== -1 || want.indexOf(got) !== -1) return r;
    }
    return null;
  }

  // ── Inline player ───────────────────────────────────────────────
  //
  // There's no separate listening screen. Every artist photo — in the schedule
  // list and in the detail sheet — doubles as a play button, so hearing an act
  // never means leaving the place where you're deciding about them.

  var audio = new Audio();
  audio.preload = 'none';
  audio.setAttribute('playsinline', '');   // iOS otherwise wants fullscreen for media
  var nowPlaying = null;   // artist name, or null

  // iOS keeps an Audio element locked until it has played once inside a real
  // user gesture. Until that happens every play() is refused, no matter how
  // synchronous the call is — which is why previews needed a second tap.
  // Priming it with a fraction of a second of silence on the very first touch
  // unlocks it for the rest of the session.
  var SILENCE = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  var audioUnlocked = false;

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    try {
      audio.src = SILENCE;
      var p = audio.play();
      if (p && p.then) {
        p.then(function () {
          // Only stop the silence — by now a real preview may already be running.
          if (audio.src === SILENCE) { audio.pause(); audio.currentTime = 0; }
        }).catch(function () { /* still locked; the real tap will try again */ });
      }
    } catch (e) { /* nothing to do */ }
  }

  // touchstart fires before click, so the element is unlocked by the time a tap
  // on a play button reaches togglePlay.
  document.addEventListener('touchstart', unlockAudio, { passive: true });
  document.addEventListener('mousedown', unlockAudio);

  function isPlaying(name) {
    return nowPlaying === name && !audio.paused;
  }

  function stopAudio() {
    audio.pause();
    nowPlaying = null;
    refreshPlayButtons();
  }

  // Buttons live in two different views, so update by data attribute rather
  // than holding references that go stale on every re-render.
  function refreshPlayButtons() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-play]'), function (btn) {
      var name = btn.getAttribute('data-play');
      var on = isPlaying(name);
      var loading = btn.getAttribute('data-loading') === '1';
      btn.setAttribute('aria-pressed', on);
      btn.setAttribute('aria-label', (on ? 'Stop preview of ' : 'Play a preview of ') + name);
      btn.classList.toggle('is-playing', on);
      var icon = btn.querySelector('.play-icon');
      if (icon) icon.textContent = loading ? '\u22ef' : (on ? '\u275a\u275a' : '\u25b6');
    });
  }

  function togglePlay(name) {
    if (isPlaying(name)) { stopAudio(); return; }

    // iOS Safari only honours audio.play() while the user-gesture token is still
    // live, which means the SAME synchronous task as the tap. Awaiting anything
    // first — even an already-resolved promise — pushes play() into a microtask
    // and Safari blocks it. The blocked attempt still marks the element as
    // interacted-with, so a second tap works, which made this look like "previews
    // only start after you star an artist".
    //
    // Every preview is baked into previews.js and seeded at load, so the URL is
    // available synchronously. Play straight from it, no await.
    var rec = previews[name];
    if (rec && rec.url) {
      startPlayback(name, rec);
      return;
    }

    // Only reached if a baked entry is missing. This needs the network, so the
    // gesture is unavoidably lost and iOS may need a second tap.
    setLoading(name, true);
    lookupPreview(name).then(function (fresh) {
      setLoading(name, false);
      if (fresh && fresh.url) startPlayback(name, fresh);
      else {
        announce(navigator.onLine
          ? 'No preview found for ' + name
          : 'Previews need a connection.');
        refreshPlayButtons();
      }
    });
  }

  function startPlayback(name, rec) {
    if (audio.src !== rec.url) audio.src = rec.url;
    nowPlaying = name;
    refreshPlayButtons();               // paint the pause state immediately
    var attempt = audio.play();
    if (!attempt || !attempt.catch) return;
    attempt.then(function () {
      announce('Playing ' + rec.track + ' by ' + name);
    }).catch(function () {
      nowPlaying = null;
      refreshPlayButtons();
      announce('Could not play that preview — tap again.');
    });
  }

  function setLoading(name, on) {
    Array.prototype.forEach.call(document.querySelectorAll('[data-play]'), function (b) {
      if (b.getAttribute('data-play') !== name) return;
      if (on) b.setAttribute('data-loading', '1');
      else b.removeAttribute('data-loading');
    });
    refreshPlayButtons();
  }

  function announce(msg) {
    var live = document.getElementById('playStatus');
    if (live) live.textContent = msg;
  }

  // isPlaying() reads audio.paused, which is still true in the moment right after
  // play() is called — so painting the buttons at that point always shows the
  // idle glyph. These events are what make the pause state actually appear;
  // without a 'play' listener the audio ran with no visible feedback at all.
  ['play', 'playing', 'pause', 'ended', 'waiting', 'stalled'].forEach(function (ev) {
    audio.addEventListener(ev, function () {
      if (ev === 'ended') nowPlaying = null;
      refreshPlayButtons();
    });
  });

  // A photo with a play button on it, used by both the list and the sheet.
  function playablePhoto(name, cls) {
    var photo = photoFor(name);
    var track = previews[name] && previews[name].track;
    return el('div', { class: 'photo ' + cls }, [
      photo ? el('img', { src: photo, alt: '', loading: 'lazy' })
            : el('div', { class: 'photo-empty' }),
      el('button', {
        class: 'play',
        'data-play': name,
        'aria-pressed': 'false',
        'aria-label': 'Play a preview of ' + name,
        title: track ? 'Preview: ' + track : 'Play a preview',
        onclick: function (ev) { ev.stopPropagation(); togglePlay(name); },
      }, [el('span', { class: 'play-icon', 'aria-hidden': 'true', text: '\u25b6' })]),
    ]);
  }


  // ── Food & drink ────────────────────────────────────────────────

  var eatsState = { diet: '', search: '' };

  function renderEats() {
    // Derived, not hardcoded — the count drifts every time a vendor is edited.
    var uniq = {};
    VENDORS.forEach(function (v) { uniq[v.name] = 1; });
    document.getElementById('eatsCount').textContent =
      Object.keys(uniq).length + ' vendors across ' + AREAS.length + ' areas';

    var list = document.getElementById('eatsList');
    list.textContent = '';

    var q = eatsState.search.trim().toLowerCase();
    var matches = VENDORS.filter(function (v) {
      if (eatsState.diet && v.diet.indexOf(eatsState.diet) === -1) return false;
      if (!q) return true;
      return (v.name + ' ' + v.what + ' ' + (v.tag || '') + ' ' + v.from)
        .toLowerCase().indexOf(q) !== -1;
    });

    document.getElementById('eatsStatus').textContent =
      matches.length + ' of ' + VENDORS.length + ' vendors shown.';

    if (!matches.length) {
      list.appendChild(el('div', { class: 'empty' }, [
        el('b', { text: 'Nothing matches' }),
        'Try a different filter, or search for something like “pizza”.',
      ]));
      return;
    }

    AREAS.forEach(function (area) {
      var here = matches.filter(function (v) { return v.area === area.id; });
      if (!here.length) return;
      list.appendChild(el('div', { class: 'eats-area' }, [
        el('span', { text: area.name }),
        el('small', { text: here.length + (here.length === 1 ? ' vendor' : ' vendors') }),
      ]));
      here.forEach(function (v) { list.appendChild(vendorCard(v)); });
    });
  }

  function vendorCard(v) {
    var tags = v.diet.map(function (d) {
      return el('span', { class: 'diet diet--' + d, text: DIET_LABELS[d] || d });
    });
    if (v.tag) tags.unshift(el('span', { class: 'diet diet--tag', text: v.tag }));

    // Iowa vendors are a nice thing to notice at an Iowa festival.
    var local = /, IA$/.test(v.from);

    return el('div', { class: 'vendor' }, [
      el('div', { class: 'vendor-top' }, [
        el('h3', { class: 'vendor-name', text: v.name }),
        local ? el('span', { class: 'vendor-local', text: 'Iowa' }) : null,
      ]),
      el('p', { class: 'vendor-what', text: v.what }),
      tags.length ? el('div', { class: 'diet-row' }, tags) : null,
      v.caveat ? el('p', { class: 'vendor-caveat', text: v.caveat }) : null,
      el('p', { class: 'vendor-from', text: v.from }),
    ]);
  }

  document.getElementById('eatsSearch').addEventListener('input', function (ev) {
    eatsState.search = ev.target.value;
    renderEats();
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-diet]'), function (btn) {
    btn.addEventListener('click', function () {
      eatsState.diet = btn.dataset.diet;
      Array.prototype.forEach.call(document.querySelectorAll('[data-diet]'), function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on);
      });
      renderEats();
    });
  });


  // ── Jump to now ─────────────────────────────────────────────────
  //
  // Opening on the right day is only half of it; during the festival what you
  // want is the row for whatever is happening this minute. The button hides
  // itself when that row is already on screen, so it never sits over the list
  // for no reason.

  var nowBtn = document.getElementById('nowBtn');
  var nowBtnLabel = document.getElementById('nowBtnLabel');

  function jumpToNow() {
    var cur = currentSet();
    if (!cur) return;

    if (state.day !== cur.dayId) {
      state.day = cur.dayId;
      save(STORE_DAY, cur.dayId);
      render();
    }

    var row = document.querySelector('[data-set-id="' + cur.id + '"]');

    // The exact set can be filtered out by "my schedule only" or a search. Rather
    // than clearing someone's filter under them, land on the nearest row that IS
    // showing, by time.
    if (!row) {
      var rows = [].slice.call(document.querySelectorAll('#scheduleList [data-set-id]'));
      for (var i = 0; i < rows.length; i++) {
        var s = sets.filter(function (x) { return x.id === rows[i].getAttribute('data-set-id'); })[0];
        if (s && s.start >= cur.start) { row = rows[i]; break; }
      }
      if (!row) row = rows[rows.length - 1];
    }
    if (!row) return;

    row.scrollIntoView({ block: 'center', behavior: 'smooth' });
    row.classList.add('flash');
    setTimeout(function () { row.classList.remove('flash'); }, 1400);

    var status = document.getElementById('scheduleStatus');
    if (status) {
      var nm = row.querySelector('.slot-name');
      status.textContent = 'Jumped to ' + (nm ? nm.textContent : 'now') + '.';
    }
  }

  function updateNowBtn() {
    var cur = currentSet();
    if (!cur || state.view !== 'schedule') { nowBtn.hidden = true; return; }

    nowBtnLabel.textContent = (new Date() < cur.start) ? 'Jump to next' : 'Jump to now';

    // Hide it when the target row is already comfortably in view.
    var row = document.querySelector('[data-set-id="' + cur.id + '"]');
    if (row) {
      var r = row.getBoundingClientRect();
      var visible = r.top > 60 && r.bottom < window.innerHeight - 60;
      nowBtn.hidden = visible;
      return;
    }
    // Filtered out but the festival is on — still offer the jump.
    nowBtn.hidden = state.day !== cur.dayId ? false : false;
  }

  nowBtn.addEventListener('click', function () {
    jumpToNow();
    setTimeout(updateNowBtn, 700);
  });

  var nowBtnTick = null;
  window.addEventListener('scroll', function () {
    if (nowBtnTick) return;
    nowBtnTick = setTimeout(function () { nowBtnTick = null; updateNowBtn(); }, 150);
  }, { passive: true });

  // ── Map ─────────────────────────────────────────────────────────

  var mapState = { which: 'grounds', fix: null, heading: null, watchId: null, calibrating: false };

  function renderMap() {
    renderSpots();
    renderCampBtn();
    renderGlance();
    var img = document.getElementById('mapImg');
    var want = mapState.which === 'concourse' ? MAP.concourse : MAP.image;
    if (img.getAttribute('src') !== want) img.setAttribute('src', want);
    positionMe();
    renderDistances();
  }

  // Place the dot in the map image's own coordinate space, as a percentage, so
  // it stays correct while the image is zoomed or the layout changes.
  function positionMe() {
    var pin = document.getElementById('mePin');
    // The concourse map is a schematic with no road references — there is no
    // honest way to place a GPS dot on it, so we don't pretend.
    if (!mapState.fix || mapState.which !== 'grounds') { pin.hidden = true; return; }

    var fix = HLGeo.correct(mapState.fix);
    var px = HLGeo.lonLatToPx(fix.lat, fix.lon);
    var xPct = px.x / MAP.refWidth * 100;
    var yPct = px.y / MAP.refHeight * 100;

    if (xPct < -8 || xPct > 108 || yPct < -8 || yPct > 108) {
      pin.hidden = true;
      setStatus('You look like you’re off the map — that usually means you’re not at the festival yet.');
      return;
    }

    pin.hidden = false;
    pin.style.left = xPct + '%';
    pin.style.top = yPct + '%';

    // Accuracy ring: the GPS fix's own error plus the map's ~180 m distortion.
    var metres = (fix.accuracy || 20) + MAP.accuracyNoteMetres;
    var mapWidthM = MAP.refWidth * MAP.mPerPxX;
    var ringPct = metres / mapWidthM * 100 * 2;
    var ring = document.getElementById('meRing');
    ring.style.width = ringPct + '%';
    ring.style.paddingBottom = ringPct + '%';

    drawSpotPins();

    var cone = document.getElementById('meCone');
    if (mapState.heading === null) {
      cone.hidden = true;
    } else {
      cone.hidden = false;
      cone.style.transform = 'translate(-50%, -100%) rotate(' + mapState.heading + 'deg)';
    }
  }

  // Pins for shared spots. Same projection as your own dot, so they inherit the
  // illustration's distortion — which is why the distance readout, computed from
  // raw lat/lon, is the number to trust.
  function drawSpotPins() {
    var stage = document.getElementById('mapStage');
    Array.prototype.forEach.call(stage.querySelectorAll('.spot-pin'), function (n) { n.remove(); });
    if (mapState.which !== 'grounds') return;

    if (camp) {
      var cpx = HLGeo.lonLatToPx(camp.lat, camp.lon);
      var cx = cpx.x / MAP.refWidth * 100, cy = cpx.y / MAP.refHeight * 100;
      if (cx > -8 && cx < 108 && cy > -8 && cy < 108) {
        stage.appendChild(el('div', {
          class: 'spot-pin spot-pin--camp',
          style: 'left:' + cx + '%;top:' + cy + '%',
          title: 'Your camp',
        }, [el('span', { class: 'spot-label', text: 'Camp' })]));
      }
    }

    spots.forEach(function (spot) {
      var px = HLGeo.lonLatToPx(spot.lat, spot.lon);
      var xPct = px.x / MAP.refWidth * 100, yPct = px.y / MAP.refHeight * 100;
      if (xPct < -8 || xPct > 108 || yPct < -8 || yPct > 108) return;
      var pin = el('div', { class: 'spot-pin' + (spotAge(spot).stale ? ' is-stale' : ''),
                            style: 'left:' + xPct + '%;top:' + yPct + '%',
                            title: spot.label + ' — sent ' + spotAge(spot).text }, [
        el('span', { class: 'spot-label', text: spot.label }),
      ]);
      stage.appendChild(pin);
    });
  }


  // The two facts worth reading at a glance: how to get back to the tent, and
  // where the next act you starred is playing. Everything else lives behind a
  // disclosure — the map tab had become 2.6 screens of scrolling, which is a
  // reference document, not something you use in the dark.
  function renderGlance() {
    var wrap = document.getElementById('glance');
    wrap.textContent = '';
    var fix = mapState.fix ? HLGeo.correct(mapState.fix) : null;
    if (!fix) return;

    function card(kind, tag, title, target) {
      var m = HLGeo.distanceM(fix, target);
      var bearing = HLGeo.bearingDeg(fix, target);
      var dir;
      if (mapState.heading !== null) {
        var d = ((bearing - mapState.heading + 540) % 360) - 180;
        if (Math.abs(d) < 25) dir = '\u2191  straight ahead';
        else if (Math.abs(d) > 155) dir = '\u2193  behind you';
        else dir = d > 0 ? '\u2192  to your right' : '\u2190  to your left';
      } else {
        dir = HLGeo.compass(bearing) + '  \u00b7  turn on compass for left/right';
      }
      return el('div', { class: 'glance-card glance-card--' + kind }, [
        el('div', { class: 'glance-tag', text: tag }),
        el('div', { class: 'glance-title', text: title }),
        el('div', { class: 'glance-dist' }, [
          el('b', { text: HLGeo.fmtDistance(m) }),
          el('span', { text: ' \u00b7 ' + HLGeo.walkMinutes(m) + ' min' }),
        ]),
        el('div', { class: 'glance-dir', text: dir }),
      ]);
    }

    if (camp) wrap.appendChild(card('camp', 'Your camp', 'Back to the tent', camp));

    var now = new Date();
    var next = sets.filter(function (s) {
      return isStarred(s.name) && s.end > now;
    })[0];
    if (next) {
      var placeId = STAGE_PLACE[next.stageId];
      var place = PLACES.filter(function (p) { return p.id === placeId; })[0];
      if (place) {
        wrap.appendChild(card('next', next.name + ' \u00b7 ' + fmtTime(next.start),
                              stageById[next.stageId].name, place));
      }
    }

    if (!wrap.children.length) {
      wrap.appendChild(el('p', { class: 'glance-empty', text:
        camp ? 'Star an act and the walk to its stage shows here.'
             : 'Save where you\u2019re camped and the way back shows here.' }));
    }
  }

  function renderDistances() {
    var ul = document.getElementById('distList');
    if (!ul) return;
    ul.textContent = '';
    if (!mapState.fix) {
      ul.appendChild(el('li', { class: 'dist-row' }, [
        el('span', { class: 'dist-meta', text: 'Turn on your location to see distances.' }),
      ]));
      return;
    }

    var fix = HLGeo.correct(mapState.fix);

    // Whatever you starred next is the thing you actually want to walk to.
    var now = new Date();
    var nextStarred = sets.filter(function (s) {
      return isStarred(s.name) && s.start > now;
    })[0];

    var list = PLACES.map(function (p) {
      return {
        place: p,
        m: HLGeo.distanceM(fix, p),
        bearing: HLGeo.bearingDeg(fix, p),
      };
    }).sort(function (a, b) { return a.m - b.m; });

    var campEl = campRow(fix);
    if (campEl) ul.appendChild(campEl);

    if (nextStarred) {
      var pid = STAGE_PLACE[nextStarred.stageId];
      var hit = list.filter(function (x) { return x.place.id === pid; })[0];
      if (hit) {
        ul.appendChild(distRow(hit, 'Next up: ' + nextStarred.name + ' at ' +
          fmtTime(nextStarred.start)));
      }
    }

    list.slice(0, 8).forEach(function (x) { ul.appendChild(distRow(x, null)); });
  }

  function distRow(x, tag) {
    var heading = mapState.heading;
    // If we know which way you're facing, say left/right instead of compass
    // points — nobody reads a compass while carrying a chair.
    var rel = '';
    if (heading !== null) {
      var d = ((x.bearing - heading + 540) % 360) - 180;
      if (Math.abs(d) < 25) rel = 'straight ahead';
      else if (Math.abs(d) > 155) rel = 'behind you';
      else rel = (d > 0 ? 'to your right' : 'to your left');
    }

    return el('li', { class: 'dist-row' + (tag ? ' dist-row--flag' : '') }, [
      tag ? el('span', { class: 'dist-tag', text: tag }) : null,
      el('span', { class: 'dist-name', text: x.place.name }),
      el('span', { class: 'dist-meta', text:
        HLGeo.fmtDistance(x.m) + ' · ' + HLGeo.walkMinutes(x.m) + ' min walk · ' +
        (rel || HLGeo.compass(x.bearing)) }),
    ]);
  }

  function setStatus(msg) {
    document.getElementById('locStatus').textContent = msg;
  }

  function startLocating() {
    if (!navigator.geolocation) {
      setStatus('This phone won’t share location with the browser.');
      return;
    }
    setStatus('Getting a fix…');

    mapState.watchId = navigator.geolocation.watchPosition(function (pos) {
      mapState.fix = {
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
      };
      var cal = HLGeo.loadCal();
      setStatus('Located to about ' + Math.round(pos.coords.accuracy) + ' m' +
        (cal ? ', corrected at ' + cal.at + '.' : '.'));
      positionMe();
      renderDistances();
      renderSpots();
      renderGlance();   // shared spots need the new fix to show distance too
      document.getElementById('locBtn').textContent = 'Stop using my location';
    }, function (err) {
      setStatus(err.code === 1
        ? 'Location permission was declined. You can re-enable it in Settings → Safari.'
        : 'Couldn’t get a location fix out here.');
    }, { enableHighAccuracy: true, maximumAge: 5000, timeout: 20000 });

    requestHeading();
  }

  function stopLocating() {
    if (mapState.watchId !== null) navigator.geolocation.clearWatch(mapState.watchId);
    mapState.watchId = null;
    mapState.fix = null;
    mapState.heading = null;
    document.getElementById('locBtn').textContent = 'Show where I am';
    setStatus('Nothing is sent anywhere — location stays on your phone.');
    positionMe();
    renderDistances();
    renderSpots();
    renderGlance();
  }

  // iOS requires an explicit, gesture-triggered grant for the compass.
  function requestHeading() {
    function attach() {
      window.addEventListener('deviceorientation', function (ev) {
        var h = null;
        if (typeof ev.webkitCompassHeading === 'number') h = ev.webkitCompassHeading;
        else if (ev.absolute && typeof ev.alpha === 'number') h = 360 - ev.alpha;
        if (h === null || isNaN(h)) return;
        mapState.heading = h;
        positionMe();
      }, true);
    }
    var DOE = window.DeviceOrientationEvent;
    if (DOE && typeof DOE.requestPermission === 'function') {
      DOE.requestPermission().then(function (r) {
        if (r === 'granted') attach();
      }).catch(function () {});
    } else if (DOE) {
      attach();
    }
  }

  document.getElementById('locBtn').addEventListener('click', function () {
    if (mapState.watchId === null) startLocating();
    else stopLocating();
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-map]'), function (btn) {
    btn.addEventListener('click', function () {
      mapState.which = btn.dataset.map;
      Array.prototype.forEach.call(document.querySelectorAll('[data-map]'), function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on);
      });
      renderMap();
    });
  });

  // Standing at a known landmark is the cheapest possible survey correction.
  document.getElementById('calBtn').addEventListener('click', function () {
    if (!mapState.fix) {
      document.getElementById('calNote').textContent =
        'Turn location on first, then tap this while you’re standing at a gate or stage.';
      return;
    }
    var names = PLACES.map(function (p, i) { return (i + 1) + '. ' + p.name; }).join('\n');
    var pick = prompt('Which landmark are you standing at right now?\n\n' + names +
                      '\n\nEnter a number, or 0 to clear a previous correction.');
    if (pick === null) return;
    var n = parseInt(pick, 10);
    if (n === 0) {
      HLGeo.saveCal(null);
      document.getElementById('calNote').textContent = 'Correction cleared.';
      renderDistances(); positionMe();
      return;
    }
    var place = PLACES[n - 1];
    if (!place) { document.getElementById('calNote').textContent = 'That wasn’t one of the numbers.'; return; }
    HLGeo.saveCal({
      dLat: place.lat - mapState.fix.lat,
      dLon: place.lon - mapState.fix.lon,
      at: place.name,
    });
    document.getElementById('calNote').textContent =
      'Corrected against ' + place.name + '. Everything else should line up better now.';
    renderDistances(); positionMe();
  });



  // ── Where I'm camped ────────────────────────────────────────────
  //
  // Same machinery as a shared spot, with one difference that changes the whole
  // design: a camp doesn't move. So it never goes stale, it never needs a
  // timestamp caveat, and it sits pinned at the top of the walking list — because
  // the moment you need it is 1 AM, in the dark, at your least capable.

  var STORE_CAMP = 'hinterland26.camp';
  var camp = load(STORE_CAMP, null);

  function renderCampBtn() {
    var btn = document.getElementById('campBtn');
    btn.textContent = camp ? 'Move my camp pin' : 'Save where I\u2019m camped';
  }

  document.getElementById('campBtn').addEventListener('click', function () {
    if (!mapState.fix) {
      setStatus('Turn on your location first, then save your camp.');
      return;
    }
    if (camp && !confirm('Move your camp pin to where you are standing now?')) return;
    var fix = HLGeo.correct(mapState.fix);
    camp = { lat: fix.lat, lon: fix.lon, at: Date.now() };
    save(STORE_CAMP, camp);
    renderCampBtn();
    renderDistances();
    renderGlance();
    positionMe();
    announce('Camp pin saved.');
    setStatus('Camp saved. It will show at the top of the walking list from now on.');
  });

  function campRow(fix) {
    if (!camp) return null;
    var meta;
    if (fix) {
      var m = HLGeo.distanceM(fix, camp);
      var bearing = HLGeo.bearingDeg(fix, camp);
      var rel = '';
      if (mapState.heading !== null) {
        var d = ((bearing - mapState.heading + 540) % 360) - 180;
        if (Math.abs(d) < 25) rel = 'straight ahead';
        else if (Math.abs(d) > 155) rel = 'behind you';
        else rel = (d > 0 ? 'to your right' : 'to your left');
      }
      meta = HLGeo.fmtDistance(m) + ' \u00b7 ' + HLGeo.walkMinutes(m) + ' min walk \u00b7 ' +
             (rel || HLGeo.compass(bearing));
    } else {
      meta = 'Turn on your location for distance and direction';
    }
    return el('li', { class: 'dist-row dist-row--camp' }, [
      el('span', { class: 'dist-tag', text: 'Your camp' }),
      el('span', { class: 'dist-name', text: 'Back to the tent' }),
      el('span', { class: 'dist-meta', text: meta }),
      el('button', {
        class: 'spot-forget', 'aria-label': 'Forget my camp pin',
        onclick: function () {
          if (!confirm('Forget where you camped?')) return;
          camp = null;
          save(STORE_CAMP, null);
          renderCampBtn();
          renderDistances();
          renderGlance();
          positionMe();
        },
      }, ['Forget']),
    ]);
  }

  // ── Send my spot ────────────────────────────────────────────────
  //
  // The honest alternative to live friend-tracking. Live location needs a server
  // AND a working connection on both phones, and the venue's network is the
  // exact thing this app is built around not having — it would fail precisely
  // when you're separated. A spot instead needs one text to get through once.
  //
  // The trade is that a spot is a snapshot, so everything here is built around
  // saying how old it is rather than pretending it's live.

  var STORE_SPOTS = 'hinterland26.spots';
  var spots = load(STORE_SPOTS, []);

  // Five decimal places is about a metre — far finer than the GPS fix itself,
  // and keeps the link short enough to survive any messaging app.
  function encodeSpot(fix, label) {
    var mins = Math.round(Date.now() / 60000);
    var parts = [fix.lat.toFixed(5), fix.lon.toFixed(5), mins];
    if (label) parts.push(encodeURIComponent(label));
    return location.origin + location.pathname + '#spot=' + parts.join(',');
  }

  function readIncomingSpot() {
    var m = /[#&]spot=([^&]+)/.exec(location.hash);
    if (!m) return null;
    var p = decodeURIComponent(m[1]).split(',');
    var lat = parseFloat(p[0]), lon = parseFloat(p[1]), mins = parseInt(p[2], 10);
    if (isNaN(lat) || isNaN(lon)) return null;
    return {
      lat: lat, lon: lon,
      at: isNaN(mins) ? Date.now() : mins * 60000,
      label: p[3] ? decodeURIComponent(p[3]) : 'A friend',
    };
  }

  function absorbSpot() {
    var spot = readIncomingSpot();
    history.replaceState(null, '', location.pathname);
    if (!spot) return;

    // Replace an earlier spot from the same person rather than stacking them up.
    spots = spots.filter(function (s) { return s.label !== spot.label; });
    spots.unshift(spot);
    spots = spots.slice(0, 6);
    save(STORE_SPOTS, spots);

    state.view = 'map';
    setTimeout(function () {
      var t = document.getElementById('tab-map');
      if (t) t.click();
      announce(spot.label + ' shared a spot with you.');
    }, 300);
  }

  function spotAge(spot) {
    var mins = Math.max(0, Math.round((Date.now() - spot.at) / 60000));
    if (mins < 1) return { text: 'just now', stale: false };
    if (mins < 60) return { text: mins + ' min ago', stale: mins > 20 };
    var h = Math.floor(mins / 60);
    return { text: h + 'h ' + (mins % 60) + 'm ago', stale: true };
  }

  function renderSpots() {
    var wrap = document.getElementById('spotsWrap');
    var ul = document.getElementById('spotsList');
    if (!wrap || !ul) return;
    if (!spots.length) { wrap.hidden = true; return; }
    wrap.hidden = false;
    ul.textContent = '';

    var fix = mapState.fix ? HLGeo.correct(mapState.fix) : null;

    spots.forEach(function (spot, i) {
      var age = spotAge(spot);
      var meta;
      if (fix) {
        var m = HLGeo.distanceM(fix, spot);
        var bearing = HLGeo.bearingDeg(fix, spot);
        var rel = '';
        if (mapState.heading !== null) {
          var d = ((bearing - mapState.heading + 540) % 360) - 180;
          if (Math.abs(d) < 25) rel = 'straight ahead';
          else if (Math.abs(d) > 155) rel = 'behind you';
          else rel = (d > 0 ? 'to your right' : 'to your left');
        }
        meta = HLGeo.fmtDistance(m) + ' · ' + HLGeo.walkMinutes(m) + ' min walk · ' +
               (rel || HLGeo.compass(bearing));
      } else {
        meta = 'Turn on your location to get distance and direction';
      }

      ul.appendChild(el('li', { class: 'dist-row' + (age.stale ? ' dist-row--stale' : '') }, [
        el('span', { class: 'dist-tag', text: 'Sent ' + age.text }),
        el('span', { class: 'dist-name', text: spot.label }),
        el('span', { class: 'dist-meta', text: meta }),
        age.stale ? el('span', { class: 'stale-note',
          text: 'Old enough that they have probably moved.' }) : null,
        el('button', {
          class: 'spot-forget', 'aria-label': 'Forget the spot from ' + spot.label,
          onclick: function () {
            spots.splice(i, 1);
            save(STORE_SPOTS, spots);
            renderSpots();
            positionMe();
          },
        }, ['Forget']),
      ]));
    });
  }

  document.getElementById('spotBtn').addEventListener('click', function () {
    if (!mapState.fix) {
      setStatus('Turn on your location first, then send your spot.');
      return;
    }
    var label = prompt('Who is this from? (shown to whoever you send it to)', 'Me');
    if (label === null) return;
    var url = encodeSpot(HLGeo.correct(mapState.fix), label.trim() || 'A friend');
    var text = (label.trim() || 'I') + ' — here is where I am at Hinterland';

    if (navigator.share) {
      navigator.share({ title: 'My spot', text: text, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        setStatus('Link copied. Paste it to whoever you are meeting.');
      });
    } else {
      prompt('Send this link:', url);
    }
  });

  // ── Offline previews ────────────────────────────────────────────

  function starredNames() {
    return Object.keys(stars).filter(function (n) { return setsByName[n]; }).sort();
  }

  document.getElementById('cachePreviewsBtn').addEventListener('click', function () {
    var btn = this;
    var status = document.getElementById('cacheStatus');
    var names = starredNames();
    if (!names.length) { status.textContent = 'Star some artists first.'; return; }
    if (!navigator.onLine) { status.textContent = 'You’re offline — try again on wifi.'; return; }

    btn.disabled = true;
    var done = 0, saved = 0;

    function step(i) {
      if (i >= names.length) {
        btn.disabled = false;
        status.textContent = saved + ' of ' + names.length + ' previews saved for offline.';
        return;
      }
      lookupPreview(names[i]).then(function (rec) {
        done++;
        status.textContent = 'Saving… ' + done + ' of ' + names.length;
        if (!rec || !rec.url) return wait(350).then(function () { step(i + 1); });
        // Pull the audio through the cache the service worker reads from.
        return caches.open('hinterland-audio').then(function (c) {
          return c.add(rec.url).then(function () { saved++; }).catch(function () {});
        }).then(function () {
          // Pace the loop so Apple doesn't start returning empty bodies.
          return wait(350);
        }).then(function () { step(i + 1); });
      }).catch(function () { wait(350).then(function () { step(i + 1); }); });
    }
    step(0);
  });

  document.getElementById('shareAppBtn').addEventListener('click', function () {
    var url = location.origin + location.pathname;
    var data = { title: 'Hinterland \u201926', text: 'Set times, previews and a map for Hinterland', url: url };
    if (navigator.share) {
      navigator.share(data).catch(function () { /* dismissed */ });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        document.getElementById('shareAppBtn').textContent = 'Link copied';
        setTimeout(function () {
          document.getElementById('shareAppBtn').textContent = 'Send the link instead';
        }, 2000);
      });
    } else {
      prompt('Copy this link:', url);
    }
  });

  document.getElementById('clearBtn').addEventListener('click', function () {
    if (!confirm('Clear every star? This can’t be undone.')) return;
    stars = {};
    save(STORE_STARS, stars);
    render();
  });


  // ── Basecamp hours ──────────────────────────────────────────────
  //
  // Scanning a sentence like "Thu–Sat 9 AM–1 PM and 9 PM–1 AM" to work out
  // whether the bar is open right now is exactly the work a phone should be
  // doing. Windows are hours from midnight of the festival day, so 25 = 1 AM,
  // which keeps the after-midnight stretch attached to the night it belongs to.

  var DAY_LABEL = { wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };

  function fmtHour(h) {
    var hh = ((h % 24) + 24) % 24;
    var mins = Math.round((hh % 1) * 60);
    var whole = Math.floor(hh);
    if (whole === 0 && mins === 0) return 'midnight';
    if (whole === 12 && mins === 0) return 'noon';
    var ampm = whole >= 12 ? 'PM' : 'AM';
    var disp = whole % 12; if (disp === 0) disp = 12;
    return disp + (mins ? ':' + String(mins).padStart(2, '0') : '') + ' ' + ampm;
  }

  function fmtWindows(wins) {
    return wins.map(function (w) { return fmtHour(w[0]) + '–' + fmtHour(w[1]); }).join(', ');
  }

  // Hours elapsed since midnight of the *festival* day currently in effect.
  function hoursIntoFestivalDay(now, dayId) {
    var day = DAYS.filter(function (d) { return d.id === dayId; })[0];
    if (!day) return null;
    var midnight = toDate(day.date, '00:00');
    return (now - midnight) / 3600000;
  }

  function openState(item, dayId, hrs) {
    if (item.allDay) return { open: true, detail: 'Open 24 hours' };
    if (item.varies) return { open: null, detail: 'Hours vary' };
    var wins = (item.windows || {})[dayId];
    if (!wins || !wins.length) return { open: false, detail: 'Closed today' };
    for (var i = 0; i < wins.length; i++) {
      if (hrs >= wins[i][0] && hrs < wins[i][1]) {
        return { open: true, detail: 'Open until ' + fmtHour(wins[i][1]) };
      }
    }
    var next = wins.filter(function (w) { return w[0] > hrs; })[0];
    return { open: false, detail: next ? 'Opens ' + fmtHour(next[0]) : 'Closed for the night' };
  }

  function renderHours() {
    var now = new Date();
    var dayId = festivalDayFor(now);
    var openList = document.getElementById('openNow');
    var todayList = document.getElementById('basecampHours');
    var allList = document.getElementById('allHours');
    var heading = document.getElementById('hoursHeading');
    openList.textContent = ''; todayList.textContent = ''; allList.textContent = '';

    // Full weekend, always available for planning.
    BASECAMP.hours.forEach(function (item) {
      var rows = [];
      if (item.allDay) rows.push('Every day, 24 hours');
      else if (item.varies) rows.push('Hours vary');
      else {
        ['wed', 'thu', 'fri', 'sat', 'sun'].forEach(function (d) {
          if (item.windows[d]) rows.push(DAY_LABEL[d] + ' ' + fmtWindows(item.windows[d]));
        });
      }
      allList.appendChild(el('li', {}, [
        el('b', { text: item.what }),
        el('span', { text: rows.join(' · ') }),
        item.note ? el('span', { class: 'hours-note', text: item.note }) : null,
      ]));
    });

    if (!dayId) {
      // Outside the festival there is no "now" to report.
      heading.textContent = 'Hours';
      todayList.appendChild(el('li', {}, [
        el('span', { class: 'hours-note',
          text: 'The festival hasn\u2019t started. Open the weekend view below to plan.' }),
      ]));
      return;
    }

    var hrs = hoursIntoFestivalDay(now, dayId);
    heading.textContent = 'Right now · ' + DAY_LABEL[dayId];

    BASECAMP.hours.forEach(function (item) {
      var st = openState(item, dayId, hrs);
      openList.appendChild(el('li', {
        class: 'open-row' + (st.open === true ? ' is-open' : st.open === false ? ' is-shut' : ''),
      }, [
        el('span', { class: 'open-dot', 'aria-hidden': 'true' }),
        el('span', { class: 'open-what', text: item.what }),
        el('span', { class: 'open-detail', text: st.detail }),
      ]));
    });

    // Today's full windows, underneath the at-a-glance state.
    BASECAMP.hours.forEach(function (item) {
      var text;
      if (item.allDay) text = '24 hours';
      else if (item.varies) text = 'Hours vary';
      else text = item.windows[dayId] ? fmtWindows(item.windows[dayId]) : 'Closed today';
      todayList.appendChild(el('li', {}, [
        el('b', { text: item.what }),
        el('span', { text: text }),
        item.note ? el('span', { class: 'hours-note', text: item.note }) : null,
      ]));
    });
  }

  // ── Render ──────────────────────────────────────────────────────

  function render() {
    renderDayBar();
    if (state.view === 'schedule') renderSchedule();
    if (state.view === 'eats') renderEats();
    if (state.view === 'map') renderMap();
    if (state.view === 'info') renderInfo();
    refreshPlayButtons();
    updateNowBtn();
  }

  // ── Wiring ──────────────────────────────────────────────────────

  Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (tab) {
    tab.addEventListener('click', function () {
      state.view = tab.dataset.view;
      Array.prototype.forEach.call(document.querySelectorAll('.tab'), function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on);
      });
      Array.prototype.forEach.call(document.querySelectorAll('.view'), function (v) {
        v.classList.toggle('is-active', v.id === 'view-' + state.view);
      });
      // Nobody wants a preview still playing after they've walked away.
      // Leaving a view shouldn't leave audio running in your pocket.
      stopAudio();
      window.scrollTo(0, 0);
      render();
    });
  });

  document.getElementById('starredOnly').addEventListener('change', function (ev) {
    state.starredOnly = ev.target.checked;
    render();
  });

  document.getElementById('lineupSearch').addEventListener('input', function (ev) {
    state.search = ev.target.value;
    renderSchedule();
  });

  // Theme
  var themeIcon = document.getElementById('themeIcon');
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.textContent = theme === 'light' ? '☾' : '☀';
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#faf6f1' : '#14110f');
    save(STORE_THEME, theme);
  }
  var savedTheme = load(STORE_THEME, null);
  applyTheme(savedTheme || (window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));

  document.getElementById('themeToggle').addEventListener('click', function () {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
  });

  absorbSpot();   // a link may be carrying someone's location

  // Tapping a spot link while the app is already open only changes the hash —
  // no reload, so init never runs again. At a festival that is the LIKELY case:
  // you're in the app, a text arrives, you tap it.
  window.addEventListener('hashchange', absorbSpot);
  render();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) return;
    var today = festivalDayFor(new Date());
    if (today && today !== state.day) {
      state.day = today;
      save(STORE_DAY, today);
      render();
    }
  });

  // Keep "on now" honest without burning battery.
  setInterval(function () {
    if (state.view === 'schedule') { renderSchedule(); updateNowBtn(); }
    if (state.view === 'map') renderSpots();     // "sent 12 min ago" must keep counting
    if (state.view === 'info') renderHours();   // open/closed changes on its own
  }, 60000);

  // Service worker — offline is the whole point at this venue.
  //
  // Cache-first means a launch shows whatever was cached last time, and the new
  // worker only installs in the background. Without the reload below you have to
  // quit and reopen TWICE to actually see an update, which made every fix look
  // like it hadn't worked.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').then(function (reg) {
        // Ask immediately rather than waiting for the browser's own schedule,
        // and again whenever the app is brought back to the foreground.
        reg.update().catch(function () {});
        document.addEventListener('visibilitychange', function () {
          if (!document.hidden) reg.update().catch(function () {});
        });
      }).catch(function () { /* fine — the app still works */ });

      // sw.js calls skipWaiting(), so a new worker takes over as soon as it
      // installs. That fires controllerchange, and the page is still running the
      // old JS at that point — so reload once to pick up the new build.
      var reloading = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (reloading) return;
        reloading = true;
        // Guard against a reload loop if anything ever goes wrong here.
        if (sessionStorage.getItem('hl.reloaded') === '1') return;
        try { sessionStorage.setItem('hl.reloaded', '1'); } catch (e) {}
        location.reload();
      });
    });

    // Clear the guard once the page has settled, so the next genuine update can
    // still reload.
    window.addEventListener('load', function () {
      setTimeout(function () {
        try { sessionStorage.removeItem('hl.reloaded'); } catch (e) {}
      }, 5000);
    });
  }
})();
