// Starter lists for the quote builder, so links from the home page land on a filled-in quote.
// /quote?look=<id> loads a "Shop the look" tablescape; /quote?event=<id> loads a typical list for that occasion.
// Each line is a catalog id with either `ratio` (quantity per guest) or a fixed `qty`.
// Visitors can change or remove anything; the server prices whatever they send.

export type PresetLine = { id: string; ratio?: number; qty?: number };
export type QuotePreset = { id: string; name: string; label: string; icon?: string; eventType?: string; lines: PresetLine[] };

const place = (extra: PresetLine[] = []): PresetLine[] => [
  { id: "cloth-napkins", ratio: 1 },
  { id: "charger-plate", ratio: 1 },
  { id: "dinner-plate", ratio: 1 },
  { id: "water-goblet", ratio: 1 },
  ...extra,
];

export const looks: QuotePreset[] = [
  {
    id: "blush-garden",
    name: "Blush Garden",
    label: "the Blush Garden look",
    lines: [
      { id: "gold-chiavari", ratio: 1 },
      { id: "banquet-8ft", ratio: 0.1 },
      { id: "banquet-floor-length", ratio: 0.1 },
      ...place([
        { id: "gold-flatware", ratio: 3 },
        { id: "wine-glass", ratio: 1 },
        { id: "candle-holder", ratio: 0.4 },
        { id: "string-lights", qty: 2 },
      ]),
    ],
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    label: "the Midnight Gold look",
    lines: [
      { id: "gold-chiavari", ratio: 1 },
      { id: "banquet-8ft", ratio: 0.1 },
      { id: "banquet-floor-length", ratio: 0.1 },
      ...place([
        { id: "gold-flatware", ratio: 3 },
        { id: "champagne-flute", ratio: 1 },
        { id: "string-lights", qty: 3 },
        { id: "uplight", qty: 8 },
      ]),
    ],
  },
  {
    id: "gilded-ivory",
    name: "Gilded Ivory",
    label: "the Gilded Ivory look",
    lines: [
      { id: "gold-chiavari", ratio: 1 },
      { id: "round-60", ratio: 0.125 },
      { id: "round-floor-length", ratio: 0.125 },
      ...place([
        { id: "salad-plate", ratio: 1 },
        { id: "gold-flatware", ratio: 3 },
        { id: "wine-glass", ratio: 1 },
        { id: "candle-holder", ratio: 0.4 },
      ]),
    ],
  },
];

const rounds: PresetLine[] = [
  { id: "round-60", ratio: 0.125 },
  { id: "round-floor-length", ratio: 0.125 },
];
const cutlery: PresetLine[] = [
  { id: "dinner-fork", ratio: 1 },
  { id: "dinner-knife", ratio: 1 },
];

export const events: QuotePreset[] = [
  {
    id: "wedding",
    name: "Wedding",
    icon: "heart",
    label: "a typical wedding reception",
    eventType: "Wedding (ceremony + reception)",
    lines: [{ id: "gold-chiavari", ratio: 1 }, ...rounds, ...place(cutlery), { id: "wine-glass", ratio: 1 }, { id: "dance-floor", qty: 25 }],
  },
  {
    id: "corporate",
    name: "Corporate",
    icon: "users",
    label: "a typical corporate event",
    eventType: "Corporate event or gala",
    lines: [
      { id: "black-padded-folding", ratio: 1 },
      ...rounds,
      { id: "cocktail-highboy", ratio: 0.1 },
      { id: "spandex-highboy", ratio: 0.1 },
      { id: "dinner-plate", ratio: 1 },
      ...cutlery,
      { id: "water-goblet", ratio: 1 },
    ],
  },
  {
    id: "birthday",
    name: "Birthday",
    icon: "spark",
    label: "a typical birthday or milestone party",
    eventType: "Birthday or anniversary party",
    lines: [{ id: "white-folding", ratio: 1 }, ...rounds, { id: "cocktail-highboy", ratio: 0.1 }, { id: "cloth-napkins", ratio: 1 }],
  },
  {
    id: "quinceanera",
    name: "Quinceañera",
    icon: "star",
    label: "a typical quinceañera",
    eventType: "Quinceañera",
    lines: [{ id: "gold-chiavari", ratio: 1 }, ...rounds, ...place(cutlery), { id: "throne-chair", qty: 1 }, { id: "dance-floor", qty: 25 }],
  },
  {
    id: "indian-wedding",
    name: "Indian wedding",
    icon: "light",
    label: "a typical Indian wedding or sangeet",
    eventType: "Indian wedding or sangeet",
    lines: [
      { id: "gold-chiavari", ratio: 1 },
      ...rounds,
      ...place(),
      { id: "chafing-dish", ratio: 0.05 },
      { id: "lounge-sofa", qty: 2 },
      { id: "uplight", qty: 12 },
      { id: "dance-floor", qty: 36 },
    ],
  },
  {
    id: "shower",
    name: "Shower & brunch",
    icon: "glass",
    label: "a typical shower or brunch",
    eventType: "Bridal or baby shower",
    lines: [
      { id: "white-resin-folding", ratio: 1 },
      ...rounds,
      { id: "cloth-napkins", ratio: 1 },
      { id: "dinner-plate", ratio: 1 },
      { id: "salad-plate", ratio: 1 },
      { id: "champagne-flute", ratio: 1 },
      { id: "beverage-dispenser", qty: 2 },
    ],
  },
  {
    id: "graduation",
    name: "Graduation",
    icon: "calendar",
    label: "a typical graduation party",
    eventType: "Graduation party",
    lines: [
      { id: "white-folding", ratio: 1 },
      { id: "banquet-8ft", ratio: 0.1 },
      { id: "cocktail-highboy", ratio: 0.1 },
      { id: "canopy-10x10", qty: 1 },
      { id: "chafing-dish", ratio: 0.05 },
    ],
  },
  {
    id: "gala",
    name: "Gala",
    icon: "candle",
    label: "a typical gala or fundraiser",
    eventType: "Fundraiser or community event",
    lines: [
      { id: "gold-chiavari", ratio: 1 },
      ...rounds,
      ...place([{ id: "salad-plate", ratio: 1 }, { id: "gold-flatware", ratio: 3 }, { id: "wine-glass", ratio: 1 }, { id: "champagne-flute", ratio: 1 }]),
      { id: "uplight", qty: 10 },
    ],
  },
];

export const getLook = (id?: string) => looks.find((l) => l.id === id);
export const getEventPreset = (id?: string) => events.find((e) => e.id === id);
