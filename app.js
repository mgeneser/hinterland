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

  var state = {
    view: 'schedule',
    day: load(STORE_DAY, null) || defaultDay(),
    starredOnly: false,
    search: '',
  };

  function defaultDay() {
    var today = new Date();
    var match = null;
    DAYS.forEach(function (d) {
      var dd = toDate(d.date, '06:00');
      if (dd.getFullYear() === today.getFullYear() &&
          dd.getMonth() === today.getMonth() &&
          dd.getDate() === today.getDate()) match = d.id;
    });
    return match || DAYS[0].id;
  }

  function isToday(day) {
    var now = new Date();
    var d = toDate(day.date, '00:00');
    return d.getFullYear() === now.getFullYear() &&
           d.getMonth() === now.getMonth() &&
           d.getDate() === now.getDate();
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
        role: 'tab',
        'aria-selected': d.id === state.day,
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

    // Star count for this day
    var starredToday = all.filter(function (s) { return isStarred(s.name); }).length;
    document.getElementById('starCount').textContent =
      starredToday + ' of ' + all.length + ' starred';

    if (!shown.length) {
      list.appendChild(el('div', { class: 'empty' }, [
        el('b', { text: state.starredOnly ? 'Nothing starred yet' : 'No sets' }),
        state.starredOnly
          ? 'Turn the filter off and tap a star next to any act you want to catch.'
          : 'Check another day.',
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

    var prev = null;
    shown.forEach(function (s) {
      // In "my schedule" mode, show the free time between your sets —
      // that's the camper-run window.
      if (state.starredOnly && prev) {
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

  function renderSlot(s, now, hasConflict) {
    var stage = stageById[s.stageId];
    var artist = ARTISTS[s.name];
    var starred = isStarred(s.name);
    var live = now >= s.start && now < s.end;
    var past = now >= s.end;

    var cls = 'slot' + (starred ? ' is-starred' : '') + (live ? ' is-now' : '') + (past ? ' is-past' : '');

    var meta = [el('span', { class: 'slot-stage', text: stage.name })];
    if (live) meta.push(el('span', { class: 'badge-now', text: 'On now' }));
    if (hasConflict) meta.push(el('span', { class: 'conflict', text: 'Overlap' }));
    if (artist && artist.genre) meta.push(el('span', { class: 'slot-genre', text: artist.genre }));

    var star = el('button', {
      class: 'slot-star',
      'aria-pressed': starred,
      'aria-label': (starred ? 'Unstar ' : 'Star ') + s.name,
      onclick: function (ev) { ev.stopPropagation(); toggleStar(s.name); },
    }, [starred ? '★' : '☆']);

    var photo = photoFor(s.name);

    return el('div', {
      class: cls,
      style: '--slot-color:' + stage.color,
      role: 'button',
      tabindex: '0',
      onclick: function () { openSheet(s.name); },
      onkeydown: function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openSheet(s.name); }
      },
    }, [
      el('div', { class: 'slot-time' }, [
        el('span', { class: 'slot-start', text: fmtTime(s.start) }),
        el('span', { class: 'slot-end', text: '~' + fmtTime(s.end) }),
      ]),
      photo ? el('img', {
        class: 'slot-thumb', src: photo, alt: '', loading: 'lazy',
        width: '46', height: '46',
      }) : null,
      el('div', { class: 'slot-body' }, [
        el('div', { class: 'slot-name', text: s.name }),
        el('div', { class: 'slot-meta' }, meta),
      ]),
      star,
    ]);
  }

  // ── Lineup ──────────────────────────────────────────────────────

  function renderLineup() {
    var list = document.getElementById('lineupList');
    list.textContent = '';
    var q = state.search.trim().toLowerCase();
    var now = new Date();
    var any = false;

    DAYS.forEach(function (d) {
      var daySets = sets.filter(function (s) {
        if (s.dayId !== d.id) return false;
        if (!q) return true;
        var a = ARTISTS[s.name];
        var hay = s.name + ' ' + (a ? a.genre + ' ' + (a.soundsLike || []).join(' ') : '');
        return hay.toLowerCase().indexOf(q) !== -1;
      });
      if (!daySets.length) return;
      any = true;
      list.appendChild(el('div', { class: 'lineup-day', text: d.label + ' · ' + d.short.split(' ')[1] }));
      daySets.forEach(function (s) {
        list.appendChild(renderSlot(s, now, false));
      });
    });

    if (!any) {
      list.appendChild(el('div', { class: 'empty' }, [
        el('b', { text: 'No matches' }),
        'Try a genre like “folk” or a name.',
      ]));
    }
  }

  // ── Artist sheet ────────────────────────────────────────────────

  var sheet = document.getElementById('sheet');
  var sheetBody = document.getElementById('sheetBody');
  var lastFocus = null;

  function openSheet(name) {
    var a = ARTISTS[name] || {};
    var mySets = setsByName[name] || [];
    var starred = isStarred(name);
    lastFocus = document.activeElement;

    sheetBody.textContent = '';

    var photo = photoFor(name);
    if (photo) {
      sheetBody.appendChild(el('img', { class: 'sheet-photo', src: photo, alt: '' }));
    }

    sheetBody.appendChild(el('h2', { id: 'sheetName', text: name }));

    var sub = [];
    if (a.genre) sub.push(el('span', { class: 'sheet-genre', text: a.genre }));
    if (a.genre && a.origin) sub.push(el('span', { class: 'sheet-origin', text: ' · ' }));
    if (a.origin) sub.push(el('span', { class: 'sheet-origin', text: a.origin }));
    if (sub.length) sheetBody.appendChild(el('div', {}, sub));

    if (a.blurb) sheetBody.appendChild(el('p', { class: 'sheet-blurb', text: a.blurb }));

    var setList = el('div', { class: 'sheet-sets' }, mySets.map(function (s) {
      var d = DAYS.filter(function (x) { return x.id === s.dayId; })[0];
      var stage = stageById[s.stageId];
      return el('div', { class: 'sheet-set', style: '--slot-color:' + stage.color }, [
        el('b', { text: d.label.slice(0, 3) + ' ' + fmtTime(s.start) }),
        el('span', { text: '– ~' + fmtTime(s.end) }),
        el('span', { text: '· ' + stage.name }),
      ]);
    }));
    sheetBody.appendChild(setList);

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

    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
    btn.focus();
  }

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
  var previews = load(STORE_PREVIEWS, {});

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
          save(STORE_PREVIEWS, previews);
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

  // ── Listen deck ─────────────────────────────────────────────────

  var audio = new Audio();
  audio.preload = 'none';
  var deckIdx = 0;
  var deckMode = 'all';
  var wantPlaying = false;

  // One entry per artist, ordered by their first set.
  var deckAll = [];
  (function () {
    var seen = {};
    sets.forEach(function (s) {
      if (seen[s.name]) return;
      seen[s.name] = true;
      deckAll.push(s);
    });
  })();

  function deckList() {
    if (deckMode === 'starred') return deckAll.filter(function (s) { return isStarred(s.name); });
    if (deckMode === 'undecided') return deckAll.filter(function (s) { return !isStarred(s.name); });
    return deckAll;
  }

  var dEl = {};
  ['deckImg', 'deckName', 'deckGenre', 'deckWhen', 'deckTrack', 'deckBlurb',
   'deckStar', 'deckPrev', 'deckNext', 'deckCount', 'deckPlay', 'deckPlayIcon',
   'deckProgress', 'deckCard'].forEach(function (id) {
    dEl[id] = document.getElementById(id);
  });

  function renderDeck() {
    var list = deckList();

    if (!list.length) {
      dEl.deckCard.style.display = 'none';
      if (!document.getElementById('deckEmpty')) {
        document.getElementById('deck').appendChild(el('div', { class: 'empty', id: 'deckEmpty' }, [
          el('b', { text: 'Nothing here' }),
          'Star some artists first, or switch back to All.',
        ]));
      }
      return;
    }
    dEl.deckCard.style.display = '';
    var empty = document.getElementById('deckEmpty');
    if (empty) empty.remove();

    if (deckIdx >= list.length) deckIdx = list.length - 1;
    if (deckIdx < 0) deckIdx = 0;

    var s = list[deckIdx];
    var a = ARTISTS[s.name] || {};
    var day = DAYS.filter(function (d) { return d.id === s.dayId; })[0];
    var stage = stageById[s.stageId];

    dEl.deckImg.src = photoFor(s.name) || '';
    dEl.deckImg.alt = s.name;
    dEl.deckName.textContent = s.name;
    dEl.deckGenre.textContent = a.genre || '';
    dEl.deckWhen.textContent = day.label.slice(0, 3) + ' ' + fmtTime(s.start) + ' · ' + stage.name;
    dEl.deckBlurb.textContent = a.blurb || '';
    dEl.deckCount.textContent = (deckIdx + 1) + ' of ' + list.length;

    var starred = isStarred(s.name);
    dEl.deckStar.setAttribute('aria-pressed', starred);
    dEl.deckStar.textContent = starred ? '★  Starred' : '☆  Star this';

    dEl.deckPrev.disabled = deckIdx === 0;
    dEl.deckNext.disabled = deckIdx === list.length - 1;

    dEl.deckProgress.style.width = '0';
    setTrackLabel(s.name);
    if (wantPlaying) playCurrent();
    else stopAudio();
  }

  function setTrackLabel(name) {
    var cached = previews[name];
    if (cached) {
      dEl.deckTrack.textContent = '';
      dEl.deckTrack.appendChild(el('b', { text: cached.track }));
      dEl.deckTrack.appendChild(document.createTextNode('  ·  30-second preview'));
    } else {
      dEl.deckTrack.textContent = 'Tap play to load a preview';
    }
  }

  function currentArtist() {
    var list = deckList();
    return list.length ? list[deckIdx].name : null;
  }

  function stopAudio() {
    audio.pause();
    dEl.deckPlayIcon.textContent = '▶';
    dEl.deckPlay.setAttribute('aria-label', 'Play preview');
  }

  function playCurrent() {
    var name = currentArtist();
    if (!name) return;

    dEl.deckPlay.classList.add('is-loading');
    dEl.deckPlayIcon.textContent = '⋯';

    lookupPreview(name).then(function (rec) {
      dEl.deckPlay.classList.remove('is-loading');
      if (currentArtist() !== name) return; // user moved on while we fetched

      if (!rec || !rec.url) {
        dEl.deckTrack.textContent = navigator.onLine
          ? 'No preview found for this artist'
          : 'No signal — previews need a connection';
        dEl.deckPlayIcon.textContent = '▶';
        wantPlaying = false;
        return;
      }

      setTrackLabel(name);
      if (audio.src !== rec.url) audio.src = rec.url;
      audio.play().then(function () {
        dEl.deckPlayIcon.textContent = '❚❚';
        dEl.deckPlay.setAttribute('aria-label', 'Pause preview');
      }).catch(function () {
        dEl.deckPlayIcon.textContent = '▶';
        wantPlaying = false;
        dEl.deckTrack.textContent = 'Could not play — tap again';
      });
    });
  }

  audio.addEventListener('timeupdate', function () {
    if (!audio.duration) return;
    dEl.deckProgress.style.width = (audio.currentTime / audio.duration * 100) + '%';
  });

  // Roll into the next artist when a preview finishes — that's the browse loop.
  audio.addEventListener('ended', function () {
    if (deckIdx < deckList().length - 1) { deckIdx++; renderDeck(); }
    else { wantPlaying = false; stopAudio(); }
  });

  dEl.deckPlay.addEventListener('click', function () {
    if (!audio.paused) { wantPlaying = false; stopAudio(); }
    else { wantPlaying = true; playCurrent(); }
  });

  function deckGo(delta) {
    var list = deckList();
    var next = deckIdx + delta;
    if (next < 0 || next >= list.length) return;
    deckIdx = next;
    renderDeck();
  }

  dEl.deckPrev.addEventListener('click', function () { deckGo(-1); });
  dEl.deckNext.addEventListener('click', function () { deckGo(1); });

  dEl.deckStar.addEventListener('click', function () {
    var name = currentArtist();
    if (!name) return;
    // In a filtered deck, starring removes the card — hold position so the
    // next one slides under your thumb instead of jumping.
    var filtered = deckMode !== 'all';
    toggleStar(name);
    if (filtered) {
      var list = deckList();
      if (deckIdx >= list.length) deckIdx = Math.max(0, list.length - 1);
    }
    renderDeck();
  });

  Array.prototype.forEach.call(document.querySelectorAll('[data-deck]'), function (btn) {
    btn.addEventListener('click', function () {
      deckMode = btn.dataset.deck;
      deckIdx = 0;
      Array.prototype.forEach.call(document.querySelectorAll('[data-deck]'), function (b) {
        b.classList.toggle('is-active', b === btn);
      });
      renderDeck();
    });
  });

  // Swipe between cards.
  (function () {
    var x0 = null, y0 = null;
    dEl.deckCard.addEventListener('touchstart', function (ev) {
      x0 = ev.touches[0].clientX; y0 = ev.touches[0].clientY;
    }, { passive: true });
    dEl.deckCard.addEventListener('touchend', function (ev) {
      if (x0 === null) return;
      var dx = ev.changedTouches[0].clientX - x0;
      var dy = ev.changedTouches[0].clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) deckGo(dx < 0 ? 1 : -1);
    }, { passive: true });
  })();

  // ── Sharing and offline previews ────────────────────────────────

  function starredNames() {
    return Object.keys(stars).filter(function (n) { return setsByName[n]; }).sort();
  }

  function shareUrl() {
    var slugs = starredNames().map(function (n) { return SLUGS[n] || n; });
    return location.origin + location.pathname + '#picks=' + encodeURIComponent(slugs.join(','));
  }

  // A shared link merges into whatever you already had — it never wipes your picks.
  function applySharedPicks() {
    var m = /[#&]picks=([^&]*)/.exec(location.hash);
    if (!m) return;
    var slugToName = {};
    Object.keys(SLUGS).forEach(function (n) { slugToName[SLUGS[n]] = n; });
    var added = 0;
    decodeURIComponent(m[1]).split(',').forEach(function (slug) {
      var name = slugToName[slug] || (setsByName[slug] ? slug : null);
      if (name && !stars[name]) { stars[name] = 1; added++; }
    });
    if (added) save(STORE_STARS, stars);
    history.replaceState(null, '', location.pathname);
    if (added) {
      setTimeout(function () {
        alert('Added ' + added + ' artist' + (added === 1 ? '' : 's') +
              ' from that link to your schedule.');
      }, 400);
    }
  }

  document.getElementById('shareBtn').addEventListener('click', function () {
    var names = starredNames();
    if (!names.length) { alert('Star a few artists first.'); return; }
    var url = shareUrl();
    var text = 'My Hinterland ’26 lineup (' + names.length + ' acts)';
    if (navigator.share) {
      navigator.share({ title: 'Hinterland ’26', text: text, url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        alert('Link copied — send it to whoever you\'re going with.');
      });
    } else {
      prompt('Copy this link:', url);
    }
  });

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

  document.getElementById('clearBtn').addEventListener('click', function () {
    if (!confirm('Clear every star? This can’t be undone.')) return;
    stars = {};
    save(STORE_STARS, stars);
    render();
  });

  // ── Render ──────────────────────────────────────────────────────

  function render() {
    renderDayBar();
    if (state.view === 'schedule') renderSchedule();
    if (state.view === 'discover') renderDeck();
    if (state.view === 'lineup') renderLineup();
    if (state.view === 'info') renderInfo();
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
      if (state.view !== 'discover') { wantPlaying = false; stopAudio(); }
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
    renderLineup();
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

  applySharedPicks();
  render();

  // Keep "on now" honest without burning battery.
  setInterval(function () {
    if (state.view === 'schedule') renderSchedule();
  }, 60000);

  // Service worker — offline is the whole point at this venue.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* fine */ });
    });
  }
})();
