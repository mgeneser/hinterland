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

// Artist detail, keyed by exact name as it appears in SETS.
// Populated by artists.js.
const ARTISTS = {};
