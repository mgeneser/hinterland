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
  Every artist photo is also a play button — tap it for a 30-second preview
  without leaving the list.
- **Eats** — all 30 food and drink vendors grouped by area, searchable, with
  filters for vegan / vegetarian / gluten-free / dairy-free / nut-free. Iowa
  vendors are flagged.
- **Map** — the map, one button, and two answers in large type: how far back to
  your tent, and how far to the next act you starred. Everything else — the full
  list of gates and parking, saving your camp, sending your spot, calibration and
  the accuracy notes — sits behind two collapsed disclosures. See **Map accuracy**
  below before trusting the dot.
- **Info** — Basecamp, opening with **what's open right now** and today's hours,
  because that is what this tab actually gets asked; the whole weekend is one tap
  away for planning. Plus the QR to share the app. What else is at
  Basecamp, your picks and offline settings, and the stage key / set-time caveats /
  sourcing all sit behind collapsed disclosures.

Each phone keeps its own schedule. Stars live in `localStorage`; there are no
accounts, no server, and nothing is shared between devices.

Works with no signal. The app shell and all 48 photos are precached on first load,
so it opens instantly in a field. Song previews stream from Apple and need a
connection — hit **Save my previews for offline** on wifi to keep your starred ones.

Previews are meant for deciding, so nothing has to be starred first: tap any
artist photo and it plays. Two things make that reliable and both are easy to
reintroduce:

- **`play()` must be called in the same synchronous task as the tap.** iOS Safari
  revokes the user-gesture token at the end of that task, so awaiting anything
  first — even an already-resolved promise — gets the playback blocked. Every
  preview URL is baked into `previews.js` and seeded at load precisely so the
  common path needs no `await`.
- **The button state has to come from media events, not from the call site.**
  `audio.paused` is still `true` in the moment after `play()` is called, so
  painting the buttons there always shows the idle glyph. `play`, `playing`,
  `pause`, `ended`, `waiting` and `stalled` all refresh them.

## How many people can use it

There is no server, no database and no shared state, so nothing in the app itself
limits concurrency — every phone runs its own independent copy.

| | |
| --- | --- |
| First load | **2.93 MB** (app shell, 48 artist photos, both maps) |
| Every load after | **0 bytes** — the service worker serves everything |
| GitHub Pages soft bandwidth cap | 100 GB/month → roughly **35,000 first installs** |

The practical ceiling is the venue's cell network, not the hosting. 2.93 MB over
congested LTE in a field with 20,000 people is slow, which is the real reason to
open the app once on wifi before you go.

**The one thing that genuinely degraded with concurrency was song previews**, and
it's been fixed. The iTunes Search API rate-limits per IP, and at a festival every
phone shares a carrier NAT — so a group browsing the Listen tab together counted
as one caller and tripped the limit collectively. Preview URLs are now resolved at
build time into `previews.js`, so the app makes **zero** API calls; audio streams
from Apple's CDN, which is not rate-limited that way. Regenerate with
`node tools/fetch-previews.js` if a preview ever stops working.

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
| `grounds.js` | Food & drink vendors and Basecamp hours/amenities. |
| `map.js` | Distance/bearing maths and the lat/lon → map-pixel projection. |
| `app.js` | All behaviour — schedule, deck, previews, stars, map. |
| `sw.js` | Service worker. **Bump `CACHE` after editing any precached file.** |
| `previews.js` | Build-time table of 30-second preview URLs. Generated, don't hand-edit. |
| `tools/fetch-photos.sh` | Re-downloads artist photos and shrinks them to 320px. |
| `tools/fetch-previews.js` | Regenerates `previews.js` from the iTunes Search API. |
| `tools/make-icons.py` | Regenerates the app icons from a festival illustration. |
| `tools/make-qr.sh` | Regenerates `img/qr.png`, the share code. |

### If the schedule changes

Edit the `SETS` array in `data.js`, then **bump `CACHE` in `sw.js`**. Without the
bump, phones that already installed the app keep serving the old data from cache
forever. This is the single easiest thing to forget, and it has bitten this repo
more than once — a change shipped, the server served it, and phones carried on
running the previous build, which is indistinguishable from "the fix didn't work".

The app now updates itself: it calls `registration.update()` on load and whenever
it returns to the foreground, and reloads once when a new worker takes over
(`controllerchange`), guarded against reload loops. Before that, a cache-first
launch showed the old build while the new one installed silently in the
background, so you had to quit and reopen **twice** to see any change.

**Media in a service worker must honour Range.** Safari requests `<audio>` in byte
ranges and rejects a plain `200` answer to a `Range` request — playback then fails
with nothing visible in the console. The audio handler originally cache-matched on
the URL and returned the stored full response, so previews worked in Chrome (which
accepts a 200) and were silent on iOS as soon as anything had been cached. It now
slices a real `206` with `Content-Range` out of the cached body, which Apple's CDN
permits because it sends `access-control-allow-origin: *`. Uncached tracks are
passed straight through so Safari can stream immediately, with the cache warmed in
the background via `waitUntil`.

**`cache.add()` honours the browser HTTP cache.** A freshly installed service
worker could therefore precache *stale* files and then serve them forever — a new
build silently containing old assets, which is nearly impossible to diagnose from
outside. The install step now fetches each entry with `cache: 'reload'`.

**The audio cache is versioned too** (`hinterland-audio-v2`). The activate handler
only keeps caches it knows about, so bumping that name is what evicts preview
responses cached before ranges were handled properly. Without it, exactly the
artists someone had already played stayed broken while everyone else worked.

**Info → Data shows the running build** (`Build hinterland-vNN · audio ready`).
If someone reports a fix not working, get that line first — it separates "the fix
is wrong" from "you are on a stale cache".

## Things worth knowing

- **End times are estimated.** The festival publishes start times only. Each set's
  end is inferred from when the next act starts on the same stage, minus 15 minutes
  for changeover; last-of-night sets assume 90 minutes on Main and 60 elsewhere.
  Everywhere an estimate is shown it's prefixed with `~`. Don't miss a headliner
  over a guessed number.
- **Times are your phone's local time**, which is Central at the festival.
- **The share QR is a build-time asset**, not generated at runtime. The URL never
  changes, so encoding it live is pointless work — and a subtly wrong encoder
  produces a code that looks correct and refuses to scan, which is worse than
  none. `tools/make-qr.sh` fetches it; verify it decodes before shipping.
- **A "Jump to now" button** appears during the festival and scrolls to whatever
  is playing this minute. It reads "Jump to next" between sets, and hides itself
  when that row is already on screen so it never covers the list for no reason.
  If your filter or search has hidden the exact set, it lands on the nearest
  showing row by time rather than clearing your filter out from under you.
  The next set is badged **Next up** so a jump made between sets explains itself.
- **The Schedule opens on today** once the festival starts, and today overrides
  whatever day you last tapped — otherwise a stray tap on Sunday back in July
  would still be showing Sunday on the Friday. Outside the festival the
  remembered day is used instead. The day **rolls over at 4 AM, not midnight**:
  Campfire sets run to about 1:30 AM and belong to the night before, so at
  12:30 AM watching Ninajirachi the app still says Friday. It also re-checks when
  the app returns to the foreground, so opening it on Saturday morning doesn't
  still show Friday — but never on a timer, which would yank the view out from
  under you mid-scroll.
- **Stars are per-device.** They live in `localStorage`, aren't synced to anything,
  and clearing browser data clears them. Every person who installs the app keeps
  their own separate schedule.
- **Artist blurbs are original**, written from research rather than copied from the
  festival site, and they say when to skip an act as well as when to go.
- **Photos** are the festival's own press images, downscaled to 320px thumbnails and
  bundled so the app works with no signal. Swap `tools/fetch-photos.sh` for your own
  images if you'd rather not host theirs.
- Set times were captured **July 25, 2026**. If the festival reshuffles after that,
  this app won't know — re-check the official set times page before you go.

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

Location is requested only when you tap the button, and is never sent anywhere by
the app itself.

### Where I'm camped

Same machinery as a shared spot with one difference that changes the design: a
camp doesn't move. So it never goes stale, carries no timestamp caveat, and sits
pinned at the top of the walking list — because the moment you need it is 1 AM,
in the dark, at your least capable. Its pin is green rather than gold and is
never dimmed.

### Send my spot

The honest alternative to live friend-tracking. Live location needs a server *and*
a working connection on both phones, and the venue's network is the exact thing
this app is built around not having — it would fail precisely when you are
separated and need it. A spot needs one message to get through, once.

Tapping **Send my spot** builds a link with your coordinates and a timestamp in
the fragment and hands it to the share sheet. Opening someone's link stores it on
your device and shows distance, walking time and direction to it, plus a pin on
the map. Nothing goes to a server; the coordinates travel inside the link you
choose to send, to the person you choose to send it to.

Because a spot is a snapshot, everything about it is built to say so:

- The age is always shown, and it keeps counting while the app is open.
- After 20 minutes it is greyed, the pin dims, and it says outright that they
  have probably moved.
- The **distance and bearing** come from raw lat/lon, so they are as good as the
  two GPS fixes. The **pin on the map** additionally inherits the illustration's
  ~180 m distortion. Trust the number over the dot.
- Resending replaces that person's previous spot rather than stacking up a trail.

Data from [hinterlandiowa.com](https://www.hinterlandiowa.com/). Previews via the
iTunes Search API. Not affiliated with the festival.

## Artwork and the disclaimer

The section headers on Eats, Map and Info are the festival's own arch
illustrations (`hlandicon-02`, `-01`, `-13` from their CDN), used as-is with
their transparency intact so they sit on either theme's background. The title
word is drawn into each illustration, so the visible heading is the artwork and
the `<h2>` next to it is `sr-only` — the heading exists for screen readers and
document outline, it just isn't text on screen.

Basecamp uses their original WebP rather than a re-encode: at 601px it is both
higher resolution and smaller than anything `sips` can produce locally, since
`sips` on this machine cannot write WebP at all.

The masthead is type-set in their display stack, not their logo artwork — name,
hairline rule, then dates and place stacked beside it, on the powder-blue band.

The standalone disclaimer banner was removed at the owner's request. "A fan-made
guide, not affiliated with the festival" now sits in the Info tab's Data card
instead, next to where the sourcing is already explained. Worth keeping somewhere,
since this is a public link shared with other attendees at a festival that has no
app of its own — but the masthead is type-set rather than their logo, so nothing
is passing itself off as official.

## Design notes

Palette and type come from hinterlandiowa.com's own design tokens rather than
being eyeballed from screenshots: `--colors-all--dark-gray` (#27241b) and
`--colors-all--black` (#353329) are the two browns, `--colors-all--blue`
(#aacbd6) is the masthead band, `--off-white` (#fbf6ef) the cream. The softer
peach / sage / powder trio is sampled from their art-nouveau arch illustrations.

Type follows their stack exactly — `Migra, "Palatino Linotype", sans-serif` for
display, Helvetica-family for body. Migra is commercial and nothing is loaded
from the network (a webfont would break offline-first), so it resolves to the
Palatino fallback they specify themselves. Artist names in scannable lists use
the system sans, not a serif: they get read at a glance, in the sun, at arm's
length.

The arch section headers are hand-drawn SVG in the style of their illustrations,
not their artwork — so they recolour with the theme and add nothing to the
payload.

Every colour pair is checked against WCAG AA with a script rather than by eye,
including the awkward ones: filled chips whose ink has to flip between themes,
and borders that convey state (1.4.11 wants 3:1, which is why there are separate
`--line` and `--line-strong` tokens).

## The app icon

Set in three places, and all three matter for different clients:

| Where | Used by |
| --- | --- |
| `<link rel="apple-touch-icon" href="icons/icon-180.png">` | **iOS Add to Home Screen.** iOS ignores the manifest for this, so 180 is the file that decides what's on your phone. |
| `manifest.json` → `icons[]` | Android/Chrome install and the install prompt |
| `<link rel="icon">` | browser tab favicon |

All four files are precached, so the icon survives an offline install.

Regenerate with `python3 tools/make-icons.py map` (or `butterfly`). The script
exists because there's no PIL or ImageMagick here and `sips` cannot flatten
transparency onto a chosen colour — only pad. App icons must be fully opaque,
since iOS composites transparency to black, so the art genuinely has to be
blended onto a solid background. Hence the small PNG reader/writer. Output is
colourtype 2 (RGB, no alpha) on purpose.

Two notes if you revisit this:

- **`maskable` needs its own file.** `icon-512.png` used to be declared as both
  `purpose: any` and `purpose: maskable`, which is wrong — `any` wants edge-to-edge
  art, `maskable` needs padding so Android's circular crop can't clip it. There is
  now a separate `icon-maskable-512.png` with the art scaled to 68%.
- **The butterfly is two different drawings.** Their web-clip icon is a colourful
  butterfly but only 256px, so it can't make a crisp 512. `HLAND_GRAPHICS-09` is a
  butterfly at 1667×2084, but it's monochrome line art and goes wispy at 180px on
  a home screen. The map arch, cropped above its lettering, holds up far better at
  icon size — that's what ships.
