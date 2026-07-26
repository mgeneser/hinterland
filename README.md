# Hinterland '26

An offline-first PWA for Hinterland Music Festival 2026 — St. Charles, Iowa, July 30 – Aug 2.

The festival has no app. This one has the full lineup with set times, a short honest
write-up of every artist, 30-second song previews, and a personal schedule you build
by starring acts. Its main job is answering *"can we go back to the camper for a bit?"*

## What it does

- **Schedule** — every set for a day in one time-ordered list, colour-coded by stage,
  searchable by name, genre, or sounds-like ("folk", "punk", "Robyn").
  Flip on **My schedule only** and it collapses to just your starred acts with the
  free time between them spelled out (`~2h 15m free`). Overlapping picks get an
  **Overlap** badge so you know you have a decision to make.
- **Listen** — swipe through all 48 artists: press photo, blurb, and a 30-second
  preview. Star straight from the card. Filter to *Not starred* to work through
  the ones you haven't decided on.
- **Map** — the official grounds and concourse maps, plus where you are, which way
  you're facing, and how far it is to each stage, gate, and camping area. See
  **Map accuracy** below before trusting the dot.
- **Info** — save previews for offline, stage key, and the caveats.

Each phone keeps its own schedule. Stars live in `localStorage`; there are no
accounts, no server, and nothing is shared between devices.

Works with no signal. The app shell and all 48 photos are precached on first load,
so it opens instantly in a field. Song previews stream from Apple and need a
connection — hit **Save my previews for offline** on wifi to keep your starred ones.

## Running it

```
python3 -m http.server 4173      # then open http://localhost:4173
```

No build step, no dependencies. Plain HTML, CSS, and one file of vanilla JS.

## Deploying

It's a static site, so anything that serves files over HTTPS works. HTTPS is
required — service workers and home-screen install don't work over plain HTTP.

```
gh auth login
gh repo create hinterland --public --source=. --push
gh api -X POST repos/:owner/hinterland/pages -f build_type=legacy \
  -f 'source[branch]=main' -f 'source[path]=/'
```

Then open the Pages URL on your phone → Share → **Add to Home Screen**.

## Files

| File | What's in it |
| --- | --- |
| `data.js` | Set times, stages, days, artist→slug map, map transform, landmarks. |
| `artists.js` | Genre, origin, blurb, sounds-like, key tracks per artist. |
| `map.js` | Distance/bearing maths and the lat/lon → map-pixel projection. |
| `app.js` | All behaviour — schedule, deck, previews, stars, map. |
| `sw.js` | Service worker. **Bump `CACHE` after editing any precached file.** |
| `tools/fetch-photos.sh` | Re-downloads artist photos and shrinks them to 320px. |
| `tools/make-icons.py` | Regenerates the app icons. |

### If the schedule changes

Edit the `SETS` array in `data.js`, then bump `CACHE` in `sw.js` (e.g. `hinterland-v1`
→ `hinterland-v2`). Without the bump, phones that already installed the app keep
serving the old schedule from cache.

## Things worth knowing

- **End times are estimated.** The festival publishes start times only. Each set's
  end is inferred from when the next act starts on the same stage, minus 15 minutes
  for changeover; last-of-night sets assume 90 minutes on Main and 60 elsewhere.
  Everywhere an estimate is shown it's prefixed with `~`. Don't miss a headliner
  over a guessed number.
- **Times are your phone's local time**, which is Central at the festival.
- **Stars are per-device.** They live in `localStorage`, aren't synced, and clearing
  browser data clears them. *Share my lineup* encodes your picks in a URL — opening
  someone else's link merges their picks into yours rather than replacing them.
- **Artist blurbs are original**, written from research rather than copied from the
  festival site, and they say when to skip an act as well as when to go.
- **Photos** are the festival's own press images, downscaled to 320px thumbnails and
  bundled so the app works with no signal. Swap `tools/fetch-photos.sh` for your own
  images if you'd rather not host theirs.
### Map accuracy — read this before trusting the dot

The festival publishes no coordinates for anything, and OpenStreetMap has almost
nothing for this venue. Every position in `PLACES` was derived by georeferencing
the official Grounds Map illustration against real road geometry, anchored on the
I-35/G50 interchange.

That has consequences you should not gloss over:

- **The map is an illustration.** It's drawn north-up but stretched vertically
  ~1.65×, and it straightens G50, which really bends southwest. Error grows toward
  the west end of the site. Typical accuracy is **~180 m** — about the width of the
  concourse.
- **The Main Stage moved for 2026.** A new permanent stage was built roughly half a
  mile east, crossing from Madison County into Warren County. Its coordinate came
  from April 2025 aerial imagery taken *mid-construction* — the building did not
  exist yet, so the position is the bowl, not the stage. Confidence **±150 m**, and
  it is the riskiest number in the repo. Any coordinate you find on Wikipedia or
  OSM points at the **old** stage.
- **Distances and bearings are more trustworthy than the dot**, because they're
  computed from lat/lon directly and don't inherit the illustration's distortion —
  they're only as good as the landmark coordinate itself.
- **Calibration fixes most of this.** Tapping *I'm standing at a landmark* while
  physically at a gate or stage stores the offset between your GPS fix and that
  landmark, and applies it to everything afterwards. Doing this once on arrival is
  worth more than any amount of tuning in this file.
- The concourse map is a schematic with no external reference points, so the app
  deliberately **refuses to draw your position on it** rather than guessing.

Location is requested only when you tap the button, is never stored, and is never
sent anywhere.

- Set times were captured **July 25, 2026**. If the festival reshuffles after that,
  this app won't know — re-check the official set times page before you go.

Data from [hinterlandiowa.com](https://www.hinterlandiowa.com/). Previews via the
iTunes Search API. Not affiliated with the festival.
