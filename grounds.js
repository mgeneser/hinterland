// Food, drink and Basecamp, from hinterlandiowa.com/food-drink and
// /info/basecamp-2 (captured July 25, 2026).
//
// Vendor line-ups and bar hours change. Descriptions here are condensed to what
// you'd actually want to know while hungry and standing in a field; they are not
// the festival's marketing copy.
//
// Diet tags use the festival's own claims. They are a starting point for finding
// a stall, NOT an allergen guarantee — always ask at the window.

const AREAS = [
  { id: 'east', name: 'East Concourse' },
  { id: 'west', name: 'West Concourse' },
  { id: 'south', name: 'South Concourse' },
  { id: 'basecamp', name: 'Basecamp / Campground' },
  { id: 'roaming', name: 'Roaming carts' },
  { id: 'gaplus', name: 'GA+' },
  { id: 'vip', name: 'VIP' },
];

// diet: v = vegan, veg = vegetarian, gf = gluten-free, df = dairy-free, nf = nut-free
// Some are "option" rather than fully — noted in `caveat` where it matters.
const VENDORS = [
  // ── East Concourse ──────────────────────────────────────────────
  { name: "Bussin' Burgers", area: 'east', from: 'Tyrone, GA',
    what: 'Smash burger combos, doubles, and a vegan burger.',
    diet: ['veg', 'v', 'df', 'nf'] },
  { name: 'Chaotic Coffee', area: 'east', from: 'Tyrone, GA',
    what: 'Specialty coffee — Vanilla Ice, Mocha Magic, Cara Mellow — plus churros.',
    diet: [], tag: 'Coffee' },
  { name: 'Coast 2 Coast Events', area: 'east', from: 'Glendale, AZ',
    what: 'Mac & cheese every way: lobster, pork, buffalo chicken. Corn dogs too.',
    diet: ['veg'] },
  { name: 'Fistful of Tacos', area: 'east', from: 'New Albany, IN',
    what: 'Tacos, taco flights, loaded nachos, chips and queso.',
    diet: ['gf', 'df', 'v', 'veg', 'nf'] },
  { name: 'Flaming Wok', area: 'east', from: 'Tucker, GA',
    what: 'Asian rice bowls, bulgogi, dumplings, spring rolls, drunken noodles.',
    diet: ['veg'] },
  { name: 'Get BAKED Stuffed Pretzel Rolls', area: 'east', from: 'Ocean Pines, MD',
    what: 'Pretzel rolls stuffed with crab, cheesesteak, mac, spinach dip or Nutella.',
    diet: ['v', 'veg', 'nf'] },
  { name: 'Hebros Gyros and More', area: 'east', from: 'Wilmington, DE',
    what: 'Gyros, falafel pitas, loaded fries, fried Oreos.',
    diet: ['v', 'veg'] },
  { name: 'Melona Ice Cream', area: 'east', from: 'Redwood City, CA',
    what: 'Fruit ice cream bars — melon, mango, strawberry, coconut, ube.',
    diet: ['gf', 'veg'], tag: 'Sweet' },
  { name: 'Prince St. Pizza', area: 'east', from: 'West Hollywood, CA',
    what: 'Square pizzas with pepperoni, cheese, vegan cheese and specialty drizzles.',
    diet: ['v', 'veg'] },
  { name: 'The Empanadas Boys', area: 'east', from: 'North Miami, FL',
    what: 'Empanadas, arepas, hot dogs, fresh juices and iced coffee.',
    diet: ['gf', 'v', 'veg'] },

  // ── West Concourse ──────────────────────────────────────────────
  { name: "C'est la Crepe", area: 'west', from: 'Treynor, IA',
    what: 'Sweet and savoury crepes — Nutella, s’mores, ham & cheese, chicken pesto.',
    diet: ['veg', 'gf'], caveat: 'Gluten-free is an option, not the default.' },
  { name: "Hopper's Mini Donuts", area: 'west', from: 'White Bear Lake, MN',
    what: 'Mini donuts and fresh lemonade.', diet: ['nf'], tag: 'Sweet' },
  { name: 'Main Street Cafe & Bakery', area: 'west', from: 'Ankeny, IA',
    what: 'Wraps, melts, acai bowls, lemonades, cookies and cinnamon rolls.',
    diet: ['gf', 'veg'], caveat: 'Gluten-free is an option, not the default.' },
  { name: "Mo' Goodness Foods", area: 'west', from: 'Des Moines, IA',
    what: 'Sweet corn, street corn, fresh lemonade, mojitos and lemon water.',
    diet: ['gf', 'veg'] },
  { name: 'Off the Griddle', area: 'west', from: 'Saint Charles, IA',
    what: 'Burgers, melts, loaded fries and harvest bowls. The most local vendor here.',
    diet: ['gf', 'df', 'v', 'veg'], caveat: 'GF and DF are options, not the default.' },
  { name: 'Smokin Rs BBQ', area: 'west', from: 'Guthrie Center, IA',
    what: 'BBQ sandwiches, dinner plates, ribs, nachos and mac.', diet: [] },
  { name: 'Super Heady Grilled Cheese', area: 'west', from: 'Des Moines, IA',
    what: 'Gourmet grilled cheese with tomato soup and specialty toppings.', diet: [] },
  { name: 'The Outside Scoop', area: 'west', from: 'Ankeny, IA',
    what: 'Scoops and homemade ice cream sandwiches.', diet: [], tag: 'Sweet' },
  { name: "Winn & Sara's Kitchen", area: 'west', from: 'Indianola, IA',
    what: 'Bacon chicken ranch eggrolls, chicken tenders, crab rangoons.', diet: [] },

  // ── South Concourse ─────────────────────────────────────────────
  { name: 'Big Acai Bowl', area: 'south', from: 'Pella, IA',
    what: 'Acai bowls and chia pudding parfaits with fruit and granola.',
    diet: ['veg', 'gf'], caveat: 'Gluten-free is an option, not the default.' },
  { name: 'Corndog Inc', area: 'south', from: 'Chattanooga, TN',
    what: 'Corndogs, tots, chicken baskets, funnel cakes and limeade.',
    diet: ['v', 'veg'] },
  { name: "Mac n' Me", area: 'south', from: 'Exeter, NH',
    what: 'Gourmet mac & cheese bowls, loaded fries, chicken and limeade.',
    diet: ['gf', 'v', 'veg'], caveat: 'GF and vegan are options, not the default.' },
  { name: 'Pizza Nova', area: 'south', from: 'Smyrna, GA',
    what: 'Giant slices, gluten-free personal pizzas, lemonade and iced tea.',
    diet: ['gf', 'v', 'veg'] },

  // ── Basecamp / campground ───────────────────────────────────────
  { name: 'Iowah Noodz', area: 'basecamp', from: 'Saint Charles, IA',
    what: 'Noodle bowls, fried rice, pot stickers, egg rolls, smoothies.',
    diet: ['v', 'veg'], tag: '24/7' },
  { name: 'Pizza Nova', area: 'basecamp', from: 'Smyrna, GA',
    what: 'Giant slices and gluten-free personal pizzas.',
    diet: ['gf', 'v', 'veg'], tag: '24/7' },
  { name: 'Space Fruit', area: 'basecamp', from: 'Anderson, IN',
    what: 'Smoothies and quesadillas — veggie, mushroom, chicken or bacon.',
    diet: ['v', 'gf', 'veg'], tag: '24/7' },

  // ── Roaming carts ───────────────────────────────────────────────
  { name: 'Cookie Cruiser', area: 'roaming', from: 'Lakeville, MN',
    what: 'Ice cream sandwiches, cookies and fruit popsicles.',
    diet: ['v', 'veg', 'gf', 'nf'], tag: 'Sweet' },
  { name: 'Lost Pelican Lemonade', area: 'roaming', from: 'Lake Odessa, MI',
    what: 'Specialty lemonades — mango, strawberry, lavender, watermelon.',
    diet: ['v', 'gf'], tag: 'Drink' },
  { name: "Pete's Pops", area: 'roaming', from: 'Milwaukee, WI',
    what: 'Fruit and dairy ice pops in seasonal flavours.',
    diet: ['v', 'gf'], tag: 'Sweet' },

  // ── GA+ / VIP ───────────────────────────────────────────────────
  { name: 'Bulldog Burgery', area: 'gaplus', from: 'Woodside, NY',
    what: 'Smash burgers, chicken finger baskets, fries and cheese fries.',
    diet: ['veg', 'gf'] },
  { name: 'Muddy Puddles Ice Cream', area: 'gaplus', from: 'Indianola, IA',
    what: 'Homemade ice cream, sorbet and dairy-free scoops.',
    diet: ['gf', 'df', 'v', 'veg'], tag: 'Sweet' },
  { name: 'Get BAKED Stuffed Pretzel Rolls', area: 'vip', from: 'Ocean Pines, MD',
    what: 'Same stuffed pretzel rolls as the East Concourse stall.',
    diet: ['v', 'veg', 'nf'] },
];

const DIET_LABELS = {
  v: 'Vegan', veg: 'Vegetarian', gf: 'Gluten-free', df: 'Dairy-free', nf: 'Nut-free',
};

// Basecamp — the campground hub, west of the Dollar General.
const BASECAMP = {
  blurb: 'The central hub in the campgrounds, just west of Dollar General. Three food vendors run around the clock, so this is where you go at 3 AM.',
  hours: [
    { what: 'Full-service bar', when: 'Wed 4 PM – midnight · Thu–Sat 9 AM–1 PM and 9 PM–1 AM · Sun 9 AM–1 PM and 9 PM–midnight' },
    { what: 'Food vendors', when: '24 hours — Space Fruit, Pizza Nova, Iowah Noodz' },
    { what: 'SolFarm organic farm stand', when: 'Thu–Sun 10 AM – 2 PM' },
    { what: 'Vinyl Cup Record Store & throwback merch', when: 'Hours vary' },
  ],
  amenities: [
    { name: 'Water & ice stations', note: 'Refill and keep the cooler alive. Free refreshment stations are dotted around too.' },
    { name: 'Mini disc golf', note: 'Free to play.' },
    { name: 'Vinyl DJ sets', note: 'Curated playlists between the live sets.' },
    { name: 'Subaru Outpost', note: 'Camping bits you forgot, plus giveaways.' },
    { name: 'Market vendors', note: 'Wander & Co., Then Now Always, Sunny Life Hats.' },
    { name: 'B.WELL Foundation', note: 'On site through the weekend.' },
  ],
};
