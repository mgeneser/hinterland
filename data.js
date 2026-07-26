// Hinterland Music Festival 2026 — St. Charles, Iowa — July 30 – Aug 2, 2026
// Set times from hinterlandiowa.com/set-times-2026
//
// Start times are as published. END times are NOT published by the festival —
// they are estimated in app.js from the next set on the same stage. The UI
// marks them with a "~" so nobody plans a camper run around a guessed number.

const FESTIVAL = {
  name: 'Hinterland',
  year: 2026,
  location: 'Avenue of the Saints Amphitheater · St. Charles, Iowa',
  siteUrl: 'https://www.hinterlandiowa.com/',
};

const DAYS = [
  { id: 'thu', label: 'Thursday', date: '2026-07-30', short: 'Thu 7/30' },
  { id: 'fri', label: 'Friday', date: '2026-07-31', short: 'Fri 7/31' },
  { id: 'sat', label: 'Saturday', date: '2026-08-01', short: 'Sat 8/1' },
  { id: 'sun', label: 'Sunday', date: '2026-08-02', short: 'Sun 8/2' },
];

const STAGES = [
  { id: 'main', name: 'Main Stage', color: '#e8734a' },
  { id: 'miniland', name: 'Miniland', color: '#6a9b7c' },
  { id: 'campfire', name: 'Campfire', color: '#8b6bb1' },
];

// [dayId, stageId, 'YYYY-MM-DD', 'HH:MM', 'Artist Name']
// Late-night Campfire sets after midnight carry the NEXT calendar date but stay
// grouped with the festival day they belong to.
const SETS = [
  // ── Thursday, July 30 ─────────────────────────────────────────────
  ['thu', 'main', '2026-07-30', '13:00', 'Porch Light'],
  ['thu', 'main', '2026-07-30', '14:00', 'Frost Children'],
  ['thu', 'main', '2026-07-30', '15:00', 'Jane Remover'],
  ['thu', 'main', '2026-07-30', '16:00', 'Oklou'],
  ['thu', 'main', '2026-07-30', '17:15', 'AUDREY NUNA'],
  ['thu', 'main', '2026-07-30', '18:30', 'ASHNIKKO'],
  ['thu', 'main', '2026-07-30', '20:00', 'beabadoobee'],
  ['thu', 'main', '2026-07-30', '22:00', 'KATSEYE'],
  ['thu', 'miniland', '2026-07-30', '16:45', 'Duo Beats'],
  ['thu', 'miniland', '2026-07-30', '18:00', 'Lipstick Homicide'],
  ['thu', 'campfire', '2026-07-30', '23:30', 'Nourished by Time'],
  ['thu', 'campfire', '2026-07-31', '00:30', 'Pixel Grip'],

  // ── Friday, July 31 ───────────────────────────────────────────────
  ['fri', 'main', '2026-07-31', '14:00', 'Saint Avangeline'],
  ['fri', 'main', '2026-07-31', '15:00', 'Wisp'],
  ['fri', 'main', '2026-07-31', '16:00', 'SOFIA ISELLA'],
  ['fri', 'main', '2026-07-31', '17:00', 'Paris Paloma'],
  ['fri', 'main', '2026-07-31', '18:15', 'Snow Strippers'],
  ['fri', 'main', '2026-07-31', '19:30', 'MUNA'],
  ['fri', 'main', '2026-07-31', '21:30', 'Lorde'],
  ['fri', 'miniland', '2026-07-31', '14:30', 'Crooked Torus'],
  ['fri', 'miniland', '2026-07-31', '16:30', 'Sarah Tonin'],
  ['fri', 'miniland', '2026-07-31', '17:45', "Leslie & The Ly's"],
  ['fri', 'campfire', '2026-07-31', '23:30', 'Between Friends'],
  ['fri', 'campfire', '2026-08-01', '00:30', 'Ninajirachi'],

  // ── Saturday, August 1 ────────────────────────────────────────────
  ['sat', 'main', '2026-08-01', '12:45', 'Amble'],
  ['sat', 'main', '2026-08-01', '13:45', 'Waylon Wyatt'],
  ['sat', 'main', '2026-08-01', '14:45', 'Julia Wolf'],
  ['sat', 'main', '2026-08-01', '15:45', 'CMAT'],
  ['sat', 'main', '2026-08-01', '17:00', 'Santigold'],
  ['sat', 'main', '2026-08-01', '18:30', 'The Format'],
  ['sat', 'main', '2026-08-01', '20:00', 'Jessie Murph'],
  ['sat', 'main', '2026-08-01', '21:45', 'Mumford & Sons'],
  ['sat', 'miniland', '2026-08-01', '14:15', 'Derry & the Dirty Dishes'],
  ['sat', 'miniland', '2026-08-01', '15:15', 'Quintron & Miss Pussycat'],
  ['sat', 'campfire', '2026-08-01', '23:30', 'The Brook & The Bluff'],
  ['sat', 'campfire', '2026-08-02', '00:30', 'Buffalo Traffic Jam'],

  // ── Sunday, August 2 ──────────────────────────────────────────────
  ['sun', 'main', '2026-08-02', '12:15', 'Haute & Freddy'],
  ['sun', 'main', '2026-08-02', '13:15', 'Samia'],
  ['sun', 'main', '2026-08-02', '14:15', 'Audrey Hobert'],
  ['sun', 'main', '2026-08-02', '15:30', 'Suki Waterhouse'],
  ['sun', 'main', '2026-08-02', '16:45', 'Wet Leg'],
  ['sun', 'main', '2026-08-02', '18:00', 'Geese'],
  ['sun', 'main', '2026-08-02', '19:30', 'Young Miko'],
  ['sun', 'main', '2026-08-02', '21:30', 'Kali Uchis'],
  ['sun', 'miniland', '2026-08-02', '15:00', 'Koo Koo'],
  ['sun', 'miniland', '2026-08-02', '16:15', 'Jeffery Lewis'],
  ['sun', 'campfire', '2026-08-02', '23:30', 'Die Spitz'],
  ['sun', 'campfire', '2026-08-03', '00:30', 'Gouge Away'],
];

// Artist name → the festival's own URL slug. Used for two things:
//   img/<slug>.jpg          bundled press photo (see tools/fetch-photos.sh)
//   hinterlandiowa.com/artist/<slug>   deep link to the official page
const SLUGS = {
  'Amble': 'amble',
  'ASHNIKKO': 'ashnikko',
  'Audrey Hobert': 'audrey-hobert',
  'AUDREY NUNA': 'audrey-nuna',
  'beabadoobee': 'beabadoobee',
  'Between Friends': 'between-friends',
  'Buffalo Traffic Jam': 'buffalo-traffic-jam',
  'CMAT': 'cmat',
  'Crooked Torus': 'crooked-torus',
  'Derry & the Dirty Dishes': 'derry-the-dirty-dishes',
  'Die Spitz': 'die-spitz',
  'Duo Beats': 'duo-beats',
  'Frost Children': 'frost-children',
  'Geese': 'geese',
  'Gouge Away': 'gouge-away',
  'Haute & Freddy': 'haute-freddy',
  'Jane Remover': 'jane-remover',
  'Jeffery Lewis': 'jeffery-lewis',
  'Jessie Murph': 'jessie-murph',
  'Julia Wolf': 'julia-wolf',
  'Kali Uchis': 'kali-uchis',
  'KATSEYE': 'katseye',
  'Koo Koo': 'koo-koo',
  "Leslie & The Ly's": 'leslie-the-lys',
  'Lipstick Homicide': 'lipstick-homicide',
  'Lorde': 'lorde',
  'Mumford & Sons': 'mumford-sons',
  'MUNA': 'muna',
  'Ninajirachi': 'ninajirachi',
  'Nourished by Time': 'nourished-by-time',
  'Oklou': 'oklou',
  'Paris Paloma': 'paris-paloma',
  'Pixel Grip': 'pixel-grip',
  'Porch Light': 'porch-light',
  'Quintron & Miss Pussycat': 'quintron-and-miss-pussycat',
  'Saint Avangeline': 'saint-avangeline',
  'Samia': 'samia',
  'Santigold': 'santigold',
  'Sarah Tonin': 'sarah-tonin',
  'Snow Strippers': 'snow-strippers',
  'SOFIA ISELLA': 'sofia-isella',
  'Suki Waterhouse': 'suki-waterhouse',
  'The Brook & The Bluff': 'the-brook-the-bluff',
  'The Format': 'the-format',
  'Waylon Wyatt': 'waylonwyatt2',
  'Wet Leg': 'wet-leg',
  'Wisp': 'wisp',
  'Young Miko': 'young-miko',
};

// ── Map ───────────────────────────────────────────────────────────
//
// IMPORTANT, read before trusting anything here.
//
// The festival publishes no coordinates for anything, and OpenStreetMap has
// essentially nothing for this venue. These positions were derived by
// georeferencing the official Grounds Map illustration against road geometry
// (the I-35/G50 interchange is the hard anchor). That means:
//
//   * The map is an ILLUSTRATION. It is drawn north-up but vertically stretched
//     ~1.65x, and it straightens G50, which really bends southwest. Error grows
//     toward the west end of the site.
//   * Typical error is ~180 m. That is roughly the width of the concourse.
//   * The Main Stage MOVED for 2026 — a new permanent stage was built about half
//     a mile east, from Madison County into Warren County. Its coordinate below
//     came from mid-construction aerial imagery (April 2025); no post-build
//     aerial exists anywhere. Confidence is +/-150 m and it is the single riskiest
//     number in this file.
//
// Because of all that, the app treats these as hints, shows an accuracy circle,
// and lets you tap "I'm standing here" at a known landmark to correct the offset
// for your device. Do not present any of this as survey data.

const MAP = {
  image: 'img/grounds-map.jpg',
  concourse: 'img/concourse-map.jpg',
  // Pixel space of the source illustration used for the transform below.
  refWidth: 2600,
  refHeight: 2167,
  // Anchor: I-35 / G50 interchange (Exit 52), OSM road geometry, very high confidence.
  anchor: { px: 2390, py: 1742, lat: 41.2934, lon: -93.7795 },
  // Anisotropic scale — metres per source pixel.
  mPerPxX: 0.969,
  mPerPxY: 0.586,
  accuracyNoteMetres: 180,
};

// Landmarks. `confidence` is honest, not decorative — the UI shows it.
const PLACES = [
  { id: 'main',      name: 'Main Stage',     kind: 'stage',   lat: 41.29740, lon: -93.78651, confidence: 'low' },
  { id: 'miniland',  name: 'Miniland Stage', kind: 'stage',   lat: 41.29770, lon: -93.78518, confidence: 'low' },
  { id: 'campfire',  name: 'Campfire Stage', kind: 'stage',   lat: 41.29666, lon: -93.79925, confidence: 'low' },
  { id: 'tent',      name: 'Tent Camping',   kind: 'camp',    lat: 41.29560, lon: -93.79734, confidence: 'low' },
  { id: 'car',       name: 'Car Camping',    kind: 'camp',    lat: 41.29786, lon: -93.80157, confidence: 'low' },
  { id: 'rv',        name: 'RV Camping',     kind: 'camp',    lat: 41.29197, lon: -93.80016, confidence: 'low' },
  { id: 'basecamp',  name: 'Basecamp',       kind: 'service', lat: 41.29473, lon: -93.79253, confidence: 'low' },
  { id: 'ada',       name: 'ADA Camping & Parking', kind: 'service', lat: 41.29495, lon: -93.78871, confidence: 'low' },
  { id: 'park4day',  name: '4-Day Parking',  kind: 'parking', lat: 41.29216, lon: -93.78219, confidence: 'low' },
  { id: 'park1day',  name: 'Single Day Parking', kind: 'parking', lat: 41.29955, lon: -93.80097, confidence: 'low' },
  { id: 'parkprem',  name: 'Premium Parking', kind: 'parking', lat: 41.29252, lon: -93.78792, confidence: 'low' },
  { id: 'gateC',     name: 'Gate C — Box Office', kind: 'gate', lat: 41.29340, lon: -93.78330, confidence: 'medium' },
  { id: 'gateF',     name: 'Gate F — ADA',   kind: 'gate',    lat: 41.29368, lon: -93.78654, confidence: 'low' },
  { id: 'gateH',     name: 'Gate H — Tent Camping', kind: 'gate', lat: 41.29320, lon: -93.79595, confidence: 'low' },
  { id: 'gateJ',     name: 'Gate J — RV',    kind: 'gate',    lat: 41.29304, lon: -93.79815, confidence: 'low' },
  { id: 'gateN',     name: 'Gate N — Car Camping', kind: 'gate', lat: 41.29763, lon: -93.80428, confidence: 'medium' },
];

// Which landmark each stage in the schedule corresponds to.
const STAGE_PLACE = { main: 'main', miniland: 'miniland', campfire: 'campfire' };

// Artist detail, keyed by exact name as it appears in SETS.
// Populated by artists.js.
const ARTISTS = {};
