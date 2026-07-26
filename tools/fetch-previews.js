/* Resolve every artist's 30-second preview ONCE, here, and bake the result into
 * previews.js so the app doesn't have to ask Apple at runtime.
 *
 * Why this matters: the iTunes Search API rate-limits per IP, and at a festival
 * every phone is behind the same carrier NAT. If the app resolved previews live,
 * a few dozen people opening the Listen tab together would share one egress IP,
 * trip the limit, and previews would fail for all of them at once. Baking the
 * URLs means the app makes zero API calls; audio still streams from Apple's CDN.
 *
 * Run from the repo root:  node tools/fetch-previews.js
 * Re-run if a preview 404s or you change keyTracks.
 */

const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// data.js and artists.js are browser scripts; evaluate them together the way the
// page does, then export what we need.
const shim = fs.readFileSync(path.join(root, 'data.js'), 'utf8') + '\n' +
             fs.readFileSync(path.join(root, 'artists.js'), 'utf8') + '\n' +
             ';module.exports = { SETS, ARTISTS };';
const tmp = path.join(require('os').tmpdir(), '_hl_bake_' + process.pid + '.js');
fs.writeFileSync(tmp, shim);
const { SETS, ARTISTS } = require(tmp);
fs.unlinkSync(tmp);

const names = [...new Set(SETS.map(r => r[4]))];
const norm = s => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const wait = ms => new Promise(r => setTimeout(r, ms));

function pick(results, name) {
  const want = norm(name);
  return results.find(r => {
    if (!r.previewUrl) return false;
    const got = norm(r.artistName);
    return got === want || got.includes(want) || want.includes(got);
  });
}

async function search(term, tries = 4) {
  const url = 'https://itunes.apple.com/search?media=music&entity=musicTrack&limit=8&term=' +
              encodeURIComponent(term);
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      const txt = await res.text();
      // An empty body is Apple's way of saying "slow down", not "no results".
      if (txt.trim()) return JSON.parse(txt);
      await wait(4000 * (i + 1));
    } catch (e) {
      await wait(2000 * (i + 1));
    }
  }
  return null;
}

(async () => {
  const out = {};
  const missing = [];

  for (const name of names) {
    const a = ARTISTS[name] || {};
    const terms = [];
    if (a.keyTracks && a.keyTracks[0]) terms.push(name + ' ' + a.keyTracks[0]);
    terms.push(name);

    let hit = null;
    for (const t of terms) {
      const data = await search(t);
      if (data && data.results) hit = pick(data.results, name);
      if (hit) break;
      await wait(900);
    }

    if (hit) {
      out[name] = {
        track: hit.trackName,
        url: hit.previewUrl,
        art: (hit.artworkUrl100 || '').replace('100x100', '400x400'),
      };
      process.stdout.write('.');
    } else {
      missing.push(name);
      process.stdout.write('X');
    }
    await wait(900); // stay well under Apple's per-IP ceiling
  }

  const header = `// Song previews, resolved at build time by tools/fetch-previews.js.
//
// Baked deliberately: the iTunes Search API rate-limits per IP, and at a festival
// every phone shares a carrier NAT. Resolving these live would mean a crowd all
// tripping one rate limit together. The app reads this file and only falls back
// to a live lookup if an entry is missing or its URL stops working.
//
// Regenerate with:  node tools/fetch-previews.js
// Last generated: ${new Date().toISOString().slice(0, 10)}

const PREVIEWS = `;

  fs.writeFileSync(path.join(root, 'previews.js'),
    header + JSON.stringify(out, null, 2) + ';\n');

  console.log(`\n\nresolved ${Object.keys(out).length}/${names.length}`);
  if (missing.length) console.log('no preview found: ' + missing.join(', '));
  console.log('wrote previews.js');
})();
