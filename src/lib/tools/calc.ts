// Pure maths behind the free /tools calculators. No React, no data fetching, so it is easy to test
// and reuse (the planner, countdown and calculators can all share it).
// Every rule of thumb used here is shown to the visitor on the tool page, and every one can be changed.

export const up = (n: number) => Math.ceil(Math.max(0, n) - 1e-9);
export const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : lo));

/* ---------------- Guest count ---------------- */

export type GuestGroup = { id: string; label: string; invited: number; rate: number };

export function guestEstimate(groups: GuestGroup[], extras: { vendors: number; bufferPct: number }) {
  const lines = groups.map((g) => ({ ...g, expected: (g.invited * clamp(g.rate, 0, 100)) / 100 }));
  const invited = lines.reduce((a, l) => a + l.invited, 0);
  const expected = Math.round(lines.reduce((a, l) => a + l.expected, 0));
  // Low/high: each group's rate moved 10 points either way.
  const low = Math.round(lines.reduce((a, l) => a + (l.invited * clamp(l.rate - 10, 0, 100)) / 100, 0));
  const high = Math.round(lines.reduce((a, l) => a + (l.invited * clamp(l.rate + 10, 0, 100)) / 100, 0));
  const chairs = up((high + extras.vendors) * (1 + extras.bufferPct / 100));
  return { lines, invited, expected, low, high, chairs, rate: invited ? Math.round((expected / invited) * 100) : 0 };
}

/* ---------------- Tables and chairs ---------------- */

export const tableTypes = {
  "round-60": { label: '60" round', seats: 8, max: 10, kind: "round" },
  "round-72": { label: '72" round', seats: 10, max: 12, kind: "round" },
  "banquet-6ft": { label: "6' banquet", seats: 6, max: 8, kind: "banquet" },
  "banquet-8ft": { label: "8' banquet", seats: 8, max: 10, kind: "banquet" },
} as const;
export type TableType = keyof typeof tableTypes;

export type ExtraTable = { id: string; label: string; table: TableType | "cocktail-highboy"; qty: (g: number) => number };

export const extraTables: ExtraTable[] = [
  { id: "head", label: "Head or sweetheart table", table: "banquet-8ft", qty: () => 1 },
  { id: "gifts", label: "Gift and card table", table: "banquet-6ft", qty: () => 1 },
  { id: "cake", label: "Cake or dessert table", table: "round-60", qty: () => 1 },
  { id: "guestbook", label: "Guest book and place cards", table: "banquet-6ft", qty: () => 1 },
  { id: "dj", label: "DJ or band table", table: "banquet-6ft", qty: () => 1 },
  { id: "buffet", label: "Buffet line (one per 75 guests)", table: "banquet-8ft", qty: (g) => 2 * Math.max(1, up(g / 75)) },
  { id: "bar", label: "Bar (one per 75 guests)", table: "banquet-6ft", qty: (g) => 2 * Math.max(1, up(g / 75)) },
];

export function tablesAndChairs(input: {
  guests: number;
  table: TableType;
  perTable: number;
  ceremony: boolean;
  cocktail: boolean;
  guestsPerHighboy: number;
  extras: string[];
  sparePct: number;
}) {
  const g = Math.max(0, Math.round(input.guests));
  const t = tableTypes[input.table];
  const perTable = clamp(Math.round(input.perTable), 2, t.max);
  const guestTables = up(g / perTable);
  const extras = extraTables
    .filter((e) => input.extras.includes(e.id))
    .map((e) => ({ ...e, count: e.qty(g) }));
  const tableCounts = new Map<string, number>();
  tableCounts.set(input.table, guestTables);
  for (const e of extras) tableCounts.set(e.table, (tableCounts.get(e.table) ?? 0) + e.count);
  const highboys = input.cocktail ? up(g / Math.max(4, input.guestsPerHighboy)) : 0;
  if (highboys) tableCounts.set("cocktail-highboy", (tableCounts.get("cocktail-highboy") ?? 0) + highboys);
  const spare = (n: number) => up(n * (1 + input.sparePct / 100));
  const receptionChairs = spare(g);
  // Chairs at the ceremony are separate unless the same chairs are flipped between rooms.
  const ceremonyChairs = input.ceremony ? spare(g) : 0;
  const emptySeats = guestTables * perTable - g;
  return { guestTables, perTable, emptySeats, extras, highboys, tableCounts, receptionChairs, ceremonyChairs };
}

/* ---------------- Space and tents ---------------- */

export const layouts = {
  rounds: { label: "Seated dinner at round tables", sqft: 12 },
  banquet: { label: "Seated dinner at long tables", sqft: 10 },
  ceremony: { label: "Ceremony or theater rows", sqft: 7 },
  cocktail: { label: "Cocktail party, mostly standing", sqft: 8 },
  classroom: { label: "Classroom or meeting tables", sqft: 18 },
} as const;
export type Layout = keyof typeof layouts;

export const spaceExtras = [
  { id: "dance", label: "Dance floor", sqft: (g: number, share: number) => danceFloor(g, share).sqft },
  { id: "bar", label: "Bar", sqft: (g: number) => 100 * Math.max(1, up(g / 75)) },
  { id: "buffet", label: "Buffet line", sqft: (g: number) => 120 * Math.max(1, up(g / 75)) },
  { id: "band", label: "DJ or band", sqft: () => 150 },
  { id: "head", label: "Head or sweetheart table", sqft: () => 80 },
  { id: "cake", label: "Cake, gift and guest book tables", sqft: () => 100 },
  { id: "lounge", label: "Lounge furniture", sqft: () => 150 },
] as const;

export function spaceFor(guests: number, layout: Layout, extras: string[], danceShare = 33) {
  const g = Math.max(0, Math.round(guests));
  const seating = g * layouts[layout].sqft;
  const parts = spaceExtras
    .filter((e) => extras.includes(e.id))
    .map((e) => ({ id: e.id, label: e.label, sqft: Math.round(e.sqft(g, danceShare)) }));
  const total = Math.round(seating + parts.reduce((a, p) => a + p.sqft, 0));
  return { seating, parts, total };
}

// Common frame and pole tent footprints. Rental houses vary; this is the usual size ladder.
export const tentSizes: [number, number][] = [
  [10, 10], [10, 20], [20, 20], [20, 30], [20, 40], [30, 30], [30, 45], [30, 60], [40, 40], [40, 60], [40, 80], [40, 100], [60, 60], [60, 90], [60, 120],
];

export function tentOptions(sqft: number) {
  const sorted = [...tentSizes].sort((a, b) => a[0] * a[1] - b[0] * b[1]);
  const fits = sorted.filter(([w, l]) => w * l >= sqft);
  const snug = fits[0];
  // "Comfortable" is the next size with at least 15% to spare, for walkways and service.
  const roomy = fits.find(([w, l]) => w * l >= sqft * 1.15) ?? fits[1];
  const tooBig = !snug;
  return { snug, roomy, tooBig, largest: sorted[sorted.length - 1] };
}

/* ---------------- Venue capacity ---------------- */

export function venueCapacity(input: { length: number; width: number; reserved: number; usablePct: number }) {
  const gross = Math.max(0, input.length) * Math.max(0, input.width);
  const usable = Math.max(0, gross * (clamp(input.usablePct, 30, 100) / 100) - Math.max(0, input.reserved));
  const rows = (Object.keys(layouts) as Layout[]).map((k) => ({ id: k, label: layouts[k].label, sqft: layouts[k].sqft, guests: Math.floor(usable / layouts[k].sqft) }));
  return { gross, usable: Math.round(usable), rows };
}

/* ---------------- Dance floor ---------------- */

// Each dancer needs about 9 sq ft (one 3' x 3' panel). `share` is the % of guests on the floor at once.
export function danceFloor(guests: number, share: number) {
  const dancers = up((Math.max(0, guests) * clamp(share, 5, 100)) / 100);
  const panels = Math.max(9, dancers);
  // Near-square floor in whole 3' panels.
  const w = Math.max(3, Math.floor(Math.sqrt(panels)));
  const l = Math.max(w, up(panels / w));
  return { dancers, panels: w * l, widthFt: w * 3, lengthFt: l * 3, sqft: w * l * 9 };
}

/* ---------------- Linens ---------------- */

export const linenTables = {
  "round-48": { label: '48" round', kind: "round", d: 48, height: 30 },
  "round-60": { label: '60" round', kind: "round", d: 60, height: 30 },
  "round-72": { label: '72" round', kind: "round", d: 72, height: 30 },
  "banquet-6ft": { label: "6' x 30\" banquet", kind: "rect", w: 30, l: 72, height: 30 },
  "banquet-8ft": { label: "8' x 30\" banquet", kind: "rect", w: 30, l: 96, height: 30 },
  "highboy-30": { label: '30" cocktail highboy', kind: "round", d: 30, height: 42 },
} as const;
export type LinenTable = keyof typeof linenTables;

export const drops = {
  lap: { label: "Lap length", inches: 12, note: "Hangs to about the chair seat. Table legs show." },
  half: { label: "Half drop", inches: 15, note: "Halfway to the floor. A common budget choice for rounds." },
  floor: { label: "Floor length", inches: 30, note: "Touches the floor and hides the legs. The formal look." },
} as const;
export type Drop = keyof typeof drops;

// Standard rental cloth sizes in inches (round diameters; rectangles as width x length).
const roundCloths = [70, 84, 90, 96, 108, 120, 132];
const rectCloths: [number, number][] = [[52, 52], [60, 102], [60, 120], [90, 132], [90, 156]];

export function clothFor(table: LinenTable, drop: Drop) {
  const t = linenTables[table];
  const dropIn = table === "highboy-30" && drop === "floor" ? 42 : drops[drop].inches;
  if (t.kind === "round") {
    const need = t.d + dropIn * 2;
    const size = roundCloths.find((s) => s >= need - 2) ?? roundCloths[roundCloths.length - 1];
    return { need: `${need}"`, size: `${size}" round`, actualDrop: Math.round((size - t.d) / 2), spandex: table === "highboy-30" };
  }
  const needW = t.w + dropIn * 2;
  const needL = t.l + dropIn * 2;
  const size = rectCloths.find(([w, l]) => w >= needW - 2 && l >= needL - 2) ?? rectCloths[rectCloths.length - 1];
  return { need: `${needW}" x ${needL}"`, size: `${size[0]}" x ${size[1]}"`, actualDrop: Math.round((size[0] - t.w) / 2), spandex: false };
}

/* ---------------- Lighting ---------------- */

export type LightPattern = "perimeter" | "zigzag" | "parallel" | "starburst";

export function stringLights(input: { length: number; width: number; pattern: LightPattern; spacing: number; bulbSpacingIn: number; slackPct: number; uplightSpacing: number }) {
  const L = Math.max(0, input.length);
  const W = Math.max(0, input.width);
  const s = Math.max(2, input.spacing);
  let runs = 0;
  let feet = 0;
  if (input.pattern === "perimeter") {
    feet = 2 * (L + W);
    runs = 1;
  } else if (input.pattern === "parallel") {
    runs = Math.max(1, Math.floor(L / s) + 1);
    feet = runs * W;
  } else if (input.pattern === "zigzag") {
    // Diagonal legs across the width, stepping `spacing` along the length.
    runs = Math.max(1, Math.ceil(L / s));
    feet = runs * Math.hypot(W, s);
  } else {
    // Starburst from the centre to every corner and wall midpoint (8 runs).
    runs = 8;
    feet = 4 * Math.hypot(L / 2, W / 2) + 2 * (L / 2) + 2 * (W / 2);
  }
  const total = up(feet * (1 + input.slackPct / 100));
  const bulbs = up((total * 12) / Math.max(6, input.bulbSpacingIn));
  const uplights = L && W ? up((2 * (L + W)) / Math.max(4, input.uplightSpacing)) : 0;
  return { runs, feet: Math.round(feet), total, bulbs, uplights, strands48: up(total / 48) };
}

/* ---------------- Budget ---------------- */

export type BudgetLine = { id: string; label: string; pct: number };

// Starting splits only. They are not survey data; the visitor moves the sliders to match their priorities.
export const budgetPresets: Record<string, { label: string; lines: BudgetLine[] }> = {
  wedding: {
    label: "Wedding",
    lines: [
      { id: "venue", label: "Venue", pct: 25 },
      { id: "catering", label: "Food and drink", pct: 30 },
      { id: "rentals", label: "Rentals (chairs, tables, linens, tent)", pct: 10 },
      { id: "photo", label: "Photo and video", pct: 10 },
      { id: "music", label: "Music and entertainment", pct: 7 },
      { id: "flowers", label: "Flowers and decor", pct: 8 },
      { id: "attire", label: "Attire and beauty", pct: 5 },
      { id: "other", label: "Invitations, favors and buffer", pct: 5 },
    ],
  },
  party: {
    label: "Party or celebration",
    lines: [
      { id: "venue", label: "Venue or space", pct: 15 },
      { id: "catering", label: "Food and drink", pct: 40 },
      { id: "rentals", label: "Rentals", pct: 20 },
      { id: "music", label: "Music and entertainment", pct: 10 },
      { id: "decor", label: "Decor and flowers", pct: 10 },
      { id: "other", label: "Buffer", pct: 5 },
    ],
  },
  corporate: {
    label: "Corporate event",
    lines: [
      { id: "venue", label: "Venue", pct: 30 },
      { id: "catering", label: "Food and drink", pct: 35 },
      { id: "av", label: "AV and staging", pct: 15 },
      { id: "rentals", label: "Rentals and furniture", pct: 10 },
      { id: "brand", label: "Signage and swag", pct: 5 },
      { id: "other", label: "Buffer", pct: 5 },
    ],
  },
  backyard: {
    label: "Backyard event",
    lines: [
      { id: "catering", label: "Food and drink", pct: 40 },
      { id: "rentals", label: "Rentals (tent, tables, chairs)", pct: 30 },
      { id: "decor", label: "Lighting and decor", pct: 10 },
      { id: "music", label: "Music", pct: 10 },
      { id: "other", label: "Restrooms, power and buffer", pct: 10 },
    ],
  },
};

/** Change one line's % and spread the difference across the unlocked others so the total stays 100. */
export function rebalance(lines: BudgetLine[], id: string, pct: number, locked: string[] = []): BudgetLine[] {
  const target = clamp(Math.round(pct), 0, 100);
  const others = lines.filter((l) => l.id !== id && !locked.includes(l.id));
  const fixed = lines.filter((l) => l.id !== id && locked.includes(l.id)).reduce((a, l) => a + l.pct, 0);
  const capped = Math.min(target, 100 - fixed);
  const remaining = 100 - fixed - capped;
  const otherSum = others.reduce((a, l) => a + l.pct, 0);
  let next = lines.map((l) => {
    if (l.id === id) return { ...l, pct: capped };
    if (locked.includes(l.id)) return l;
    const share = otherSum ? l.pct / otherSum : 1 / Math.max(1, others.length);
    return { ...l, pct: Math.round(remaining * share) };
  });
  // Fix rounding drift on the largest unlocked line.
  const drift = 100 - next.reduce((a, l) => a + l.pct, 0);
  if (drift && others.length) {
    const big = [...next].filter((l) => l.id !== id && !locked.includes(l.id)).sort((a, b) => b.pct - a.pct)[0];
    next = next.map((l) => (l.id === big.id ? { ...l, pct: Math.max(0, l.pct + drift) } : l));
  }
  return next;
}

/* ---------------- Bar and glassware ---------------- */

export type DrinkMix = { wine: number; beer: number; cocktails: number; soft: number };

// Bottle maths: a 750 ml bottle of wine pours five 5 oz glasses; a 750 ml bottle of spirits pours
// about sixteen 1.5 oz shots. Beer and soft drinks count one per serving.
export function barPlan(input: {
  guests: number;
  hours: number;
  firstHour: number;
  laterHours: number;
  mix: DrinkMix;
  glassesPerGuest: number;
  toast: boolean;
  water: boolean;
  icePerGuest: number;
  guestsPerBartender: number;
}) {
  const g = Math.max(0, Math.round(input.guests));
  const h = Math.max(0, input.hours);
  const perGuest = h <= 0 ? 0 : input.firstHour + Math.max(0, h - 1) * input.laterHours;
  const drinks = Math.round(g * perGuest);
  const total = input.mix.wine + input.mix.beer + input.mix.cocktails + input.mix.soft || 1;
  const share = (n: number) => Math.round((drinks * n) / total);
  const wineDrinks = share(input.mix.wine);
  const beerDrinks = share(input.mix.beer);
  const cocktailDrinks = share(input.mix.cocktails);
  const softDrinks = share(input.mix.soft);
  const glasses = (on: boolean) => (on ? up(g * input.glassesPerGuest) : 0);
  return {
    perGuest,
    drinks,
    wineDrinks,
    beerDrinks,
    cocktailDrinks,
    softDrinks,
    wineBottles: up(wineDrinks / 5),
    beer: beerDrinks,
    spiritBottles: up(cocktailDrinks / 16),
    softServings: softDrinks,
    glassware: {
      "wine-glass": glasses(input.mix.wine > 0),
      "pilsner-glass": glasses(input.mix.beer > 0),
      "rocks-glass": glasses(input.mix.cocktails > 0),
      "highball-glass": glasses(input.mix.soft > 0 || input.mix.cocktails > 0),
      "champagne-flute": input.toast ? g : 0,
      "water-goblet": input.water ? g : 0,
    } as Record<string, number>,
    iceLbs: up(g * input.icePerGuest),
    bartenders: g ? Math.max(1, up(g / Math.max(10, input.guestsPerBartender))) : 0,
  };
}

/* ---------------- Parking and shuttles ---------------- */

export function parkingPlan(input: {
  guests: number;
  perCar: number;
  rideSharePct: number;
  shuttlePct: number;
  onSite: number;
  sqftPerSpace: number;
  shuttleSeats: number;
  roundTripMin: number;
  windowMin: number;
}) {
  const g = Math.max(0, Math.round(input.guests));
  const shuttleRiders = Math.round((g * clamp(input.shuttlePct, 0, 100)) / 100);
  const rideShare = Math.round((g * clamp(input.rideSharePct, 0, 100 - clamp(input.shuttlePct, 0, 100))) / 100);
  const drivers = Math.max(0, g - shuttleRiders - rideShare);
  const cars = up(drivers / Math.max(1, input.perCar));
  const overflow = Math.max(0, cars - Math.max(0, input.onSite));
  const lotSqft = Math.round(overflow * Math.max(150, input.sqftPerSpace));
  const tripsPerVehicle = Math.max(1, Math.floor(Math.max(1, input.windowMin) / Math.max(5, input.roundTripMin)));
  const seatsPerVehicle = Math.max(1, input.shuttleSeats) * tripsPerVehicle;
  const shuttles = shuttleRiders ? up(shuttleRiders / seatsPerVehicle) : 0;
  return { shuttleRiders, rideShare, drivers, cars, overflow, lotSqft, tripsPerVehicle, shuttles };
}
