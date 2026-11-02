// Ready-made rental lists for common Chicago events. Used on /rentals and category pages as
// worked examples, and linked into the quote builder (/quote?items=...).

export type SampleBudget = {
  id: string;
  title: string;
  guests: number;
  summary: string;
  lines: [itemId: string, qty: number][];
};

export const sampleBudgets: SampleBudget[] = [
  {
    id: "wedding-100",
    title: "100-guest wedding reception",
    guests: 100,
    summary: "Gold Chiavari chairs at 60\" rounds, floor-length linens, full china, flatware and glassware, cocktail hour highboys, a 12x12 dance floor and uplighting.",
    lines: [
      ["gold-chiavari", 100],
      ["round-60", 13],
      ["round-floor-length", 13],
      ["cloth-napkins", 100],
      ["charger-plate", 100],
      ["dinner-plate", 100],
      ["salad-plate", 100],
      ["dinner-fork", 100],
      ["salad-fork", 100],
      ["dinner-knife", 100],
      ["teaspoon", 100],
      ["water-goblet", 100],
      ["wine-glass", 100],
      ["champagne-flute", 100],
      ["cocktail-highboy", 8],
      ["spandex-highboy", 8],
      ["banquet-8ft", 4],
      ["banquet-floor-length", 4],
      ["dance-floor", 16],
      ["uplight", 12],
    ],
  },
  {
    id: "graduation-60",
    title: "60-guest backyard graduation party",
    guests: 60,
    summary: "A 20x40 frame tent with white folding chairs, banquet tables, lap linens, bistro lights and lawn games.",
    lines: [
      ["frame-tent-20x40", 1],
      ["white-folding", 60],
      ["banquet-8ft", 8],
      ["banquet-lap-length", 8],
      ["string-lights", 2],
      ["beverage-dispenser", 2],
      ["yard-games", 2],
    ],
  },
  {
    id: "corporate-150",
    title: "150-guest corporate mixer",
    guests: 150,
    summary: "Highboys and lowboys with spandex covers, lounge seating, a bar, bar glassware and uplighting.",
    lines: [
      ["cocktail-highboy", 15],
      ["spandex-highboy", 15],
      ["cocktail-lowboy", 6],
      ["black-padded-folding", 24],
      ["lounge-sofa", 2],
      ["lounge-armchair", 4],
      ["portable-bar", 2],
      ["rocks-glass", 150],
      ["highball-glass", 150],
      ["wine-glass", 150],
      ["uplight", 16],
    ],
  },
];
