// The step-by-step event planner on /quote: turns a few answers (occasion, guests, style, setting, extras, date)
// into a recommended rental list and a personalised plan (checklist, timeline, layout, budget notes).
// Pure functions with no server or vendor data, so they run in the browser as the visitor answers.

export type StyleId = "simple" | "classic" | "lavish";
export type SettingId = "venue" | "backyard" | "tent" | "park";
export type ExtraId = "ceremony" | "dancing" | "bar" | "buffet" | "speeches" | "photos" | "kids" | "lounge";
export type BudgetId = "under-1500" | "1500-4000" | "4000-8000" | "8000-15000" | "15000-plus" | "unsure";

export type PlannerEvent = {
  id: string;
  name: string;
  eventType: string; // matches the quote form's occasion list
  image: string;
  alt: string;
  meal: boolean; // a served meal, so place settings are suggested
  formal: boolean; // round tables and full linens rather than banquet tables
  defaultGuests: number;
  extras: ExtraId[]; // pre-ticked extras
  leadMonths: number; // how far ahead most hosts book rentals for this occasion
};

const scene = (n: string) => `/rentals/scenes/${n}.webp`;

export const plannerEvents: PlannerEvent[] = [
  { id: "wedding", name: "Wedding", eventType: "Wedding (ceremony + reception)", image: scene("wedding-reception"), alt: "Wedding reception with round tables, gold Chiavari chairs and candlelight", meal: true, formal: true, defaultGuests: 150, extras: ["ceremony", "dancing", "bar"], leadMonths: 9 },
  { id: "indian-wedding", name: "Indian wedding or sangeet", eventType: "Indian wedding or sangeet", image: scene("sweetheart-stage"), alt: "Decorated stage with a sweetheart sofa for a sangeet or reception", meal: true, formal: true, defaultGuests: 250, extras: ["dancing", "buffet", "lounge"], leadMonths: 9 },
  { id: "corporate", name: "Corporate event or gala", eventType: "Corporate event or gala", image: scene("corporate-gala"), alt: "Corporate gala room with rounds, uplighting and a stage", meal: true, formal: true, defaultGuests: 120, extras: ["speeches", "bar"], leadMonths: 4 },
  { id: "birthday", name: "Birthday or anniversary", eventType: "Birthday or anniversary party", image: scene("backyard-birthday"), alt: "Backyard birthday party with long tables and string lights", meal: false, formal: false, defaultGuests: 50, extras: ["bar"], leadMonths: 2 },
  { id: "quinceanera", name: "Quinceañera", eventType: "Quinceañera", image: scene("dance-party"), alt: "Quinceañera dance floor with uplighting", meal: true, formal: true, defaultGuests: 150, extras: ["dancing", "photos"], leadMonths: 6 },
  { id: "shower", name: "Bridal or baby shower", eventType: "Bridal or baby shower", image: scene("baby-shower"), alt: "Baby shower brunch table with florals and pastel linens", meal: true, formal: false, defaultGuests: 40, extras: ["buffet"], leadMonths: 2 },
  { id: "graduation", name: "Graduation party", eventType: "Graduation party", image: scene("graduation-party"), alt: "Graduation party in a backyard with canopy, tables and food stations", meal: false, formal: false, defaultGuests: 80, extras: ["buffet"], leadMonths: 2 },
  { id: "kids", name: "Kids' party", eventType: "Birthday or anniversary party", image: scene("kids-party"), alt: "Kids' party with a bounce house, small tables and games", meal: false, formal: false, defaultGuests: 30, extras: ["kids"], leadMonths: 1 },
];

export const getPlannerEvent = (id?: string) => plannerEvents.find((e) => e.id === id);

export const styles: { id: StyleId; name: string; blurb: string; chair: string }[] = [
  { id: "simple", name: "Simple & practical", blurb: "Clean folding chairs, sturdy tables, the essentials done well.", chair: "white-folding" },
  { id: "classic", name: "Classic & elegant", blurb: "Garden chairs, floor-length linens, cloth napkins and candlelight.", chair: "white-resin-folding" },
  { id: "lavish", name: "Lavish & unforgettable", blurb: "Gold Chiavari chairs, chargers, gold flatware, uplighting and a lounge.", chair: "gold-chiavari" },
];

export const settings: { id: SettingId; name: string; blurb: string; image: string; alt: string }[] = [
  { id: "venue", name: "Indoor venue", blurb: "Banquet hall, restaurant, church hall, office or loft.", image: scene("cocktail-hour"), alt: "Indoor cocktail hour with highboy tables" },
  { id: "backyard", name: "Backyard or home", blurb: "Your own lawn or patio, with a house nearby.", image: scene("backyard-birthday"), alt: "Backyard party with string lights" },
  { id: "tent", name: "Tent on open ground", blurb: "A lawn, farm or field with no building to lean on.", image: scene("tent-reception-dusk"), alt: "Frame tent reception lit at dusk" },
  { id: "park", name: "Park or public space", blurb: "Chicago Park District or forest preserve shelters and lawns.", image: scene("graduation-party"), alt: "Outdoor party under canopies" },
];

export const extras: { id: ExtraId; name: string; icon: string }[] = [
  { id: "ceremony", name: "Ceremony on site", icon: "heart" },
  { id: "dancing", name: "Dancing", icon: "spark" },
  { id: "bar", name: "Bar or cocktail hour", icon: "glass" },
  { id: "buffet", name: "Buffet or food stations", icon: "chafer" },
  { id: "speeches", name: "Speeches or presentations", icon: "chat" },
  { id: "photos", name: "Photo booth", icon: "star" },
  { id: "kids", name: "Kids' area and games", icon: "users" },
  { id: "lounge", name: "Lounge seating", icon: "sofa" },
];

export const budgets: { id: BudgetId; name: string; max?: number }[] = [
  { id: "under-1500", name: "Under $1,500", max: 1500 },
  { id: "1500-4000", name: "$1,500 – $4,000", max: 4000 },
  { id: "4000-8000", name: "$4,000 – $8,000", max: 8000 },
  { id: "8000-15000", name: "$8,000 – $15,000", max: 15000 },
  { id: "15000-plus", name: "$15,000+" },
  { id: "unsure", name: "Not sure yet" },
];

export type PlanInput = {
  event: string;
  guests: number;
  style: StyleId;
  setting: SettingId;
  extras: ExtraId[];
  date?: string; // YYYY-MM-DD (or the 15th when only the month is known)
};

export type RecLine = { id: string; qty: number; group: string; why: string };

const up = (n: number) => Math.max(0, Math.ceil(n - 1e-9));
const month = (date?: string) => (date ? Number(date.slice(5, 7)) : undefined);
// Chicago evenings drop below about 60°F from October through April, so outdoor guests need heat.
export const isColdMonth = (date?: string) => {
  const m = month(date);
  return m !== undefined && (m >= 10 || m <= 4);
};

// Square feet for a seated, dining layout (~12 sq ft per guest at rounds, ~10 at banquet tables) plus extras.
export function spaceNeeded(input: PlanInput) {
  const ev = getPlannerEvent(input.event);
  const g = input.guests;
  const seating = g * (ev?.formal ? 12 : 10);
  const dance = input.extras.includes("dancing") ? danceSections(g) * 9 : 0;
  const bar = input.extras.includes("bar") ? 100 + g * 1 : 0;
  const buffet = input.extras.includes("buffet") ? 120 + g * 0.5 : 0;
  const lounge = input.extras.includes("lounge") || input.style === "lavish" ? 150 : 0;
  const stage = input.extras.includes("speeches") || input.event === "indian-wedding" ? 150 : 0;
  const total = Math.round(seating + dance + bar + buffet + lounge + stage);
  return { seating, dance, bar, buffet, lounge, stage, total };
}

// About a quarter of guests dance at once and each needs ~9 sq ft: one 3'x3' section per four guests, at least 4x4 sections.
export const danceSections = (guests: number) => Math.max(16, Math.min(400, up(guests / 4)));

const tentOptions = [
  { id: "frame-tent-20x20", area: 400, label: "20' x 20'" },
  { id: "frame-tent-20x40", area: 800, label: "20' x 40'" },
  { id: "frame-tent-30x60", area: 1800, label: "30' x 60'" },
  { id: "pole-tent-40x60", area: 2400, label: "40' x 60'" },
];

export function tentFor(area: number) {
  const one = tentOptions.find((t) => t.area >= area);
  if (one) return { id: one.id, qty: 1, area: one.area, label: one.label, perimeter: 2 * (Math.sqrt(one.area / 2) * 3) };
  const big = tentOptions[tentOptions.length - 1];
  const qty = up(area / big.area);
  return { id: big.id, qty, area: big.area * qty, label: `${qty} × 40' x 60'`, perimeter: qty * 200 };
}

// The recommended rental list for these answers. Every line says why it's there.
export function recommend(input: PlanInput): RecLine[] {
  const ev = getPlannerEvent(input.event) ?? plannerEvents[0];
  const g = Math.max(1, Math.round(input.guests));
  const s = input.style;
  const x = new Set(input.extras);
  const outdoor = input.setting !== "venue";
  const out: RecLine[] = [];
  const add = (id: string, qty: number, group: string, why: string) => {
    if (qty > 0) out.push({ id, qty: up(qty), group, why });
  };

  // Seating
  const chair =
    s === "lavish" ? "gold-chiavari" : s === "classic" ? (ev.id === "corporate" ? "black-padded-folding" : "white-resin-folding") : ev.id === "corporate" ? "black-padded-folding" : "white-folding";
  add(chair, g, "Seating", "One chair per guest");
  if (ev.id === "kids" || x.has("kids")) {
    const kids = ev.id === "kids" ? g * 0.6 : g * 0.2;
    add("kids-chair", kids, "Seating", "Kid-height seats for the little ones");
    add("kids-table", kids / 6, "Tables", "One kids' table per six children");
  }
  if (ev.id === "quinceanera") add("throne-chair", 1, "Seating", "The quinceañera's seat of honour");

  // Tables
  if (ev.formal || s !== "simple") {
    add("round-60", g / 8, "Tables", "60\" rounds seat eight comfortably");
  } else {
    add("banquet-8ft", g / 8, "Tables", "8' banquet tables seat eight, easy to line up");
  }
  if (x.has("bar") || ev.id === "corporate") add("cocktail-highboy", Math.max(4, g / 15), "Tables", "Standing tables for mingling, one per ~15 guests");
  if (x.has("buffet")) add("banquet-8ft", Math.max(2, g / 50), "Tables", "Buffet and dessert tables");
  if (ev.id === "wedding" && s !== "simple") add("sweetheart-table", 1, "Tables", "A table for the couple");

  // Linens
  const rounds = out.find((l) => l.id === "round-60")?.qty ?? 0;
  const banquets = out.filter((l) => l.id === "banquet-8ft").reduce((a, l) => a + l.qty, 0);
  if (s === "simple") {
    if (rounds) add("round-lap-length", rounds, "Linens", "Lap-length cloths for every round");
    if (banquets && ev.meal) add("banquet-lap-length", banquets, "Linens", "Lap-length cloths for the long tables");
  } else {
    if (rounds) add("round-floor-length", rounds, "Linens", "Floor-length cloths hide table legs for a finished look");
    if (banquets) add("banquet-floor-length", banquets, "Linens", "Floor-length cloths for the long tables");
    add("cloth-napkins", g, "Linens", "A cloth napkin at every seat");
    const highboys = out.find((l) => l.id === "cocktail-highboy")?.qty ?? 0;
    if (highboys) add("spandex-highboy", highboys, "Linens", "Fitted covers for the standing tables");
  }
  if (s === "lavish") {
    if (rounds) add("sequin-overlay", rounds, "Linens", "Sequin overlays catch the light on every table");
    else add("table-runner", banquets, "Linens", "Runners down the long tables");
  }

  // Place settings, only for a served meal
  if (ev.meal) {
    add("dinner-plate", g, "Tableware", "Dinner plate per guest");
    if (s !== "simple") add("salad-plate", g, "Tableware", "Salad or dessert plate per guest");
    if (s === "lavish") add("charger-plate", g, "Tableware", "Chargers frame each place setting");
    if (s === "lavish") {
      add("gold-flatware", g * 3, "Tableware", "Gold fork, knife and spoon for each guest");
    } else {
      add("dinner-fork", g, "Tableware", "Fork per guest");
      add("dinner-knife", g, "Tableware", "Knife per guest");
      if (s === "classic") add("salad-fork", g, "Tableware", "Salad fork per guest");
    }
    add("water-goblet", g, "Glassware", "Water glass at every seat");
    if (s !== "simple" || x.has("bar")) add("wine-glass", g, "Glassware", "Wine glass at every seat");
    if (ev.id === "wedding" || ev.id === "quinceanera" || (s === "lavish" && ev.formal)) add("champagne-flute", g, "Glassware", "For the toast");
    if (ev.id === "corporate" || ev.id === "shower") add("coffee-cup-saucer", g * 0.6, "Tableware", "Coffee service for about 60% of guests");
  }
  if (x.has("bar")) {
    add("portable-bar", Math.max(1, g / 100), "Bar", "One bar per ~100 guests keeps lines short");
    add("rocks-glass", g * 0.75, "Glassware", "Cocktails and spirits");
    add("highball-glass", g * 0.75, "Glassware", "Mixed drinks and soda");
  }
  if (x.has("buffet")) {
    add("chafing-dish", Math.max(4, g / 20), "Catering", "One chafer per hot dish, about one per 20 guests");
    add("serving-tray", Math.max(4, g / 25), "Catering", "Platters for cold dishes and desserts");
    add("beverage-dispenser", Math.max(2, g / 50), "Catering", "Water, lemonade or iced tea");
    add("cake-stand", 1, "Catering", "For the cake or dessert centrepiece");
  }
  if ((ev.id === "corporate" || ev.id === "shower") && x.has("buffet")) add("coffee-urn", Math.max(1, g / 75), "Catering", "Hot coffee, one urn per ~75 guests");

  // Ceremony, dance, stage, AV
  if (x.has("ceremony")) add("ceremony-arch", 1, "Decor & lighting", "Frames the ceremony and photos");
  if (x.has("dancing")) add(s === "lavish" && g <= 200 ? "led-dance-floor" : "dance-floor", s === "lavish" && g <= 200 ? danceSections(g) * 9 : danceSections(g), "Dance & stage", `Room for about ${up(g / 4)} guests dancing at once`);
  if (ev.id === "indian-wedding") add("stage-deck", 8, "Dance & stage", "A raised stage for the couple and performances");
  if (x.has("speeches") || ev.id === "corporate") {
    add("pa-system", 1, "Sound & AV", "So every guest hears the speeches");
    add("wireless-microphone", 2, "Sound & AV", "Two mics: one for the host, one to pass around");
    if (ev.id === "corporate") {
      add("podium", 1, "Sound & AV", "For presenters");
      add("projector", 1, "Sound & AV", "For slides or a video");
      add("projection-screen", 1, "Sound & AV", "Pairs with the projector");
    }
  }
  if (x.has("photos")) add(s === "lavish" ? "mirror-photo-booth" : "photo-booth-360", 1, "Fun", "Guests love it, and you get the photos");
  if (ev.id === "kids" || x.has("kids")) {
    add("bounce-house", 1, "Fun", "The main attraction for kids");
    add("yard-games", 3, "Fun", "Cornhole, giant Jenga and more");
    add(ev.id === "kids" ? "cotton-candy-machine" : "popcorn-machine", 1, "Fun", "An easy treat station");
  }
  if (ev.id === "graduation") add("popcorn-machine", 1, "Fun", "An easy snack station guests can help themselves to");

  // Decor and lighting by style
  if (s !== "simple") add("candle-holder", g * 0.4, "Decor & lighting", "Three candles per table for a warm glow");
  if (s === "lavish") {
    add("uplight", Math.max(8, g / 12), "Decor & lighting", "Wash the walls or tent in colour");
    if (["wedding", "quinceanera", "shower", "birthday"].includes(ev.id)) add("flower-wall", 1, "Decor & lighting", "A photo backdrop guests line up for");
    if (["birthday", "quinceanera"].includes(ev.id)) add("marquee-letters", 4, "Decor & lighting", "Light-up initials or age");
  }
  if (x.has("lounge") || (s === "lavish" && g >= 80)) {
    add("lounge-sofa", Math.max(1, g / 100), "Lounge", "A comfortable spot away from the tables");
    add("lounge-armchair", Math.max(2, g / 50), "Lounge", "Pairs with the sofa");
    add("coffee-table", Math.max(1, g / 100), "Lounge", "For drinks in the lounge");
  }

  // Outdoor
  if (outdoor) {
    const area = spaceNeeded(input).total;
    if (input.setting === "park") {
      add("canopy-10x10", Math.max(2, g / 40), "Tent & weather", "Shade or rain cover over the food and some seating");
    } else {
      const t = tentFor(area);
      add(t.id, t.qty, "Tent & weather", `About ${area.toLocaleString()} sq ft of cover for seating${x.has("dancing") ? ", dancing" : ""} and service`);
      if (isColdMonth(input.date)) {
        add("tent-sidewall", t.perimeter / 20, "Tent & weather", "Sidewalls keep wind and cold out");
        add("tent-heater", Math.max(1, area / 1000), "Tent & weather", "Chicago nights are cold this time of year");
      }
      if (s !== "simple" && input.setting === "tent" && g <= 250) add("chandelier", Math.max(1, t.qty * 2), "Decor & lighting", "Hang inside the tent");
    }
    add("string-lights", Math.max(1, g / 50), "Decor & lighting", "Bistro lights so the party carries on after sunset");
    if (isColdMonth(input.date) && input.setting !== "tent") add("patio-heater", Math.max(2, g / 25), "Tent & weather", "Patio heaters for cool evenings");
    if (input.setting === "tent" || input.setting === "park" || (input.setting === "backyard" && g >= 100)) {
      const toilets = Math.max(2, g / 50);
      if (s === "lavish" && g >= 100) add("restroom-trailer", 1, "Restrooms & power", "A restroom trailer guests will thank you for");
      else {
        add("portable-restroom", toilets - 1, "Restrooms & power", "About one restroom per 50 guests for a 4-5 hour event");
        add("ada-restroom", 1, "Restrooms & power", "At least one accessible unit");
      }
      add("hand-wash-station", Math.max(1, g / 100), "Restrooms & power", "Hand washing next to the restrooms");
    }
    if (input.setting !== "backyard" && (x.has("dancing") || x.has("speeches") || x.has("buffet") || isColdMonth(input.date))) {
      add(g > 150 || x.has("dancing") ? "generator-20kw" : "generator-7kw", 1, "Restrooms & power", "Power for lights, music, heaters or catering");
      add("cable-ramp", 4, "Restrooms & power", "Covers cords so no one trips");
    }
  }

  // Merge duplicates (e.g. buffet tables + seating banquets)
  const merged = new Map<string, RecLine>();
  for (const l of out) {
    const m = merged.get(l.id);
    if (m) m.qty += l.qty;
    else merged.set(l.id, { ...l });
  }
  return [...merged.values()];
}

// Month-by-month to-dos counted back from the date.
export type PlanStep = { when: string; date?: string; tasks: string[] };

const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function timeline(input: PlanInput, today = new Date()): PlanStep[] {
  const ev = getPlannerEvent(input.event) ?? plannerEvents[0];
  const x = new Set(input.extras);
  const outdoor = input.setting !== "venue";
  const day = input.date ? new Date(`${input.date}T12:00:00`) : undefined;
  const steps: { offsetDays: number; when: string; tasks: string[] }[] = [
    {
      offsetDays: -30 * Math.max(ev.leadMonths, 3),
      when: `${Math.max(ev.leadMonths, 3)} months before`,
      tasks: [
        input.setting === "venue" ? "Confirm what your venue includes (many halls supply basic tables and chairs)" : "Walk the site: measure the flat area, find power and note where trucks can park",
        "Set your guest list and an overall budget",
        "Approve your rental proposal to reserve your items for the date",
        ...(input.setting === "park" ? ["Apply for the park permit (Chicago Park District special event permits can take 30+ days)"] : []),
        ...(input.setting === "tent" || (input.setting === "backyard" && input.guests >= 100) ? ["Call 811 before any tent stakes go in, and check if your town needs a tent permit"] : []),
      ],
    },
    {
      offsetDays: -60,
      when: "2 months before",
      tasks: [
        "Choose linen colours and table layout",
        ...(ev.meal ? ["Book your caterer and confirm what they bring (plates, chafers, staff)"] : []),
        ...(x.has("dancing") ? ["Book the DJ or band and share the dance floor size"] : []),
        ...(x.has("bar") ? ["Plan the bar: hired bartenders, licensed caterer or self-serve"] : []),
      ],
    },
    {
      offsetDays: -30,
      when: "1 month before",
      tasks: [
        "Send invitations or confirm RSVPs",
        "Finalise the floor plan and share it with your rental team and caterer",
        ...(outdoor ? ["Pick a rain plan: sidewalls, extra canopies or a backup room"] : []),
      ],
    },
    {
      offsetDays: -14,
      when: "2 weeks before",
      tasks: ["Send your final guest count (most rental companies need it about a week out)", "Confirm delivery window, access and who signs for the delivery"],
    },
    {
      offsetDays: -7,
      when: "1 week before",
      tasks: [
        "Check the 10-day forecast" + (outdoor ? " and decide on sidewalls or heaters" : ""),
        "Print a seating chart and table numbers",
        "Make a day-of contact sheet (caterer, rentals, DJ, venue)",
      ],
    },
    {
      offsetDays: -1,
      when: "Day before",
      tasks: [outdoor ? "Tent and large items go up (most installs happen the day before)" : "Confirm the venue's load-in time with us", "Set out place cards, signage and favours"],
    },
    {
      offsetDays: 0,
      when: "Event day",
      tasks: ["Count chairs and tables against the delivery sheet", "Ask about the pickup window and how dishes and linens should be packed for return"],
    },
  ];
  return steps
    .map((s) => {
      const d = day ? new Date(day.getTime() + s.offsetDays * 864e5) : undefined;
      const late = d && d < today && s.offsetDays < 0;
      return { when: late ? `${s.when} (do now)` : s.when, date: d ? fmtDate(d) : undefined, tasks: s.tasks };
    });
}

// Short, honest observations about this plan: what's working, what to watch.
export function assessment(input: PlanInput, total: number, budget?: BudgetId, today = new Date()) {
  const ev = getPlannerEvent(input.event) ?? plannerEvents[0];
  const notes: { tone: "good" | "watch"; text: string }[] = [];
  const space = spaceNeeded(input);
  const g = input.guests;
  const perGuest = g ? total / g : 0;
  notes.push({ tone: "good", text: `About ${perGuest.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })} per guest in rentals for a ${styles.find((s) => s.id === input.style)?.name.toLowerCase()} ${ev.name.toLowerCase()}.` });
  notes.push({ tone: "good", text: `Plan for roughly ${space.total.toLocaleString()} sq ft of usable floor (seating${space.dance ? ", dance floor" : ""}${space.bar ? ", bar" : ""}${space.buffet ? ", buffet" : ""}). Ask your venue for its seated capacity with round tables.` });
  if (input.date) {
    const d = new Date(`${input.date}T12:00:00`);
    const monthsOut = (d.getTime() - today.getTime()) / (30 * 864e5);
    const m = d.getMonth() + 1;
    const peak = m >= 5 && m <= 10;
    const sat = d.getDay() === 6;
    if (monthsOut < ev.leadMonths) {
      notes.push({ tone: "watch", text: `Your date is ${monthsOut < 1 ? "under a month" : `about ${Math.round(monthsOut)} months`} away; most hosts book ${ev.name.toLowerCase()} rentals ${ev.leadMonths}+ months ahead${peak ? ", and May–October is Chicago's busiest season" : ""}. Send your list soon so we can lock in stock.` });
    } else {
      notes.push({ tone: "good", text: `You're booking with plenty of lead time, which gives you first pick of styles and colours.` });
    }
    if (peak && sat) notes.push({ tone: "watch", text: "Peak-season Saturdays sell out first. A Friday or Sunday often has better availability and lower venue prices." });
    if (input.setting !== "venue" && isColdMonth(input.date)) notes.push({ tone: "watch", text: "Chicago evenings are cold this time of year. We've added heat and sidewalls; keep a rain and wind plan." });
    if (input.setting !== "venue" && !isColdMonth(input.date)) notes.push({ tone: "watch", text: "Summer storms roll in fast in Chicagoland. Keep sidewalls on standby and anchor anything tall." });
  } else {
    notes.push({ tone: "watch", text: "Add a date when you can: rental stock is first come, first served." });
  }
  if (input.setting === "park") notes.push({ tone: "watch", text: "Parks usually need a permit for tents, amplified sound and alcohol, and ban stakes in some areas. We can use weighted canopies." });
  if (input.setting === "backyard" && g > 120) notes.push({ tone: "watch", text: `${g} guests is a big backyard party: check parking, neighbours and restroom access, which is why restrooms are on your list.` });
  const cap = budgets.find((b) => b.id === budget)?.max;
  if (cap && total > cap) notes.push({ tone: "watch", text: `This list is over your ${budgets.find((b) => b.id === budget)?.name} budget. Try a simpler style or trim extras below, or ask us for the best value options.` });
  else if (cap) notes.push({ tone: "good", text: `This list fits your ${budgets.find((b) => b.id === budget)?.name} budget before delivery and tax.` });
  return notes;
}

// Table layout for the floor plan sketch: how many rounds/banquets and an approximate room shape.
export function layout(input: PlanInput, lines: { id: string; qty: number }[]) {
  const q = (id: string) => lines.find((l) => l.id === id)?.qty ?? 0;
  const rounds = q("round-60") + q("round-48") + q("round-72");
  const banquets = q("banquet-8ft") + q("banquet-6ft") + q("farm-table");
  const space = spaceNeeded(input);
  const width = Math.max(40, Math.round(Math.sqrt(space.total * 1.5)));
  const depth = Math.max(20, Math.round(space.total / width));
  return {
    rounds,
    banquets,
    highboys: q("cocktail-highboy"),
    dance: q("dance-floor") || (q("led-dance-floor") ? up(q("led-dance-floor") / 9) : 0),
    bar: q("portable-bar"),
    buffet: input.extras.includes("buffet"),
    lounge: q("lounge-sofa") > 0,
    stage: q("stage-deck") > 0 || input.extras.includes("speeches"),
    width,
    depth,
  };
}
