// The chair catalog. To add your own chair, copy one entry and change it.
// Photos: drop a file in /public/chairs/ and set `image: "/chairs/your-file.jpg"`.
// Without a photo, a line illustration of `silhouette` is shown instead.

export type Style =
  | "Rustic"
  | "Boho"
  | "Modern"
  | "Glam"
  | "Classic"
  | "Garden"
  | "Minimalist"
  | "Cultural";

export type EventUse =
  | "Ceremony"
  | "Reception"
  | "Head table"
  | "Cocktail & lounge"
  | "Corporate";

export type Silhouette =
  | "crossback"
  | "ghost"
  | "rattan"
  | "bentwood"
  | "wishbone"
  | "velvet"
  | "infinity"
  | "cane"
  | "windsor"
  | "louis"
  | "shell"
  | "folding"
  | "throne";

export type Finish = { name: string; hex: string };

export type Chair = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  silhouette: Silhouette;
  image?: string;
  styles: Style[];
  uses: EventUse[];
  finishes: Finish[];
  pairsWith: string;
  stackable: boolean;
  outdoorFriendly: boolean;
  cushion: "Included" | "Optional" | "None";
  // Estimated per-chair rental range. Shown as an estimate until pricing is final.
  estPrice: string;
};

export const chairs: Chair[] = [
  {
    slug: "cross-back",
    name: "Cross-Back Vineyard Chair",
    tagline: "Warm wood, X-back, made for barns and vineyards",
    description:
      "A solid-wood dining chair with a crossed back and woven or plank seat. It brings the warmth of a farm table to long reception rows and looks good from behind, which is the angle your guests see all night.",
    silhouette: "crossback",
    styles: ["Rustic", "Garden", "Classic"],
    uses: ["Reception", "Head table", "Ceremony"],
    finishes: [
      { name: "Walnut", hex: "#5b3a24" },
      { name: "Natural oak", hex: "#c69c6d" },
      { name: "Matte black", hex: "#222222" },
    ],
    pairsWith: "Farm tables, greenery runners, candlelight, linen napkins",
    stackable: true,
    outdoorFriendly: true,
    cushion: "Optional",
    estPrice: "$8–11",
  },
  {
    slug: "ghost",
    name: "Ghost Chair",
    tagline: "Clear acrylic that lets the florals do the talking",
    description:
      "A crystal-clear Louis-style chair that almost disappears in the room. Great for maximal florals, mirrored tables, or ceremonies where you don't want seating to block the view.",
    silhouette: "ghost",
    styles: ["Modern", "Glam", "Minimalist"],
    uses: ["Ceremony", "Reception", "Head table"],
    finishes: [
      { name: "Clear", hex: "#dfe9ee" },
      { name: "Smoke", hex: "#7a7f86" },
    ],
    pairsWith: "Mirror tables, white florals, pampas, gold flatware",
    stackable: true,
    outdoorFriendly: true,
    cushion: "None",
    estPrice: "$10–14",
  },
  {
    slug: "rattan-garden",
    name: "Rattan Garden Chair",
    tagline: "Hand-woven texture for boho and garden parties",
    description:
      "Natural woven rattan on a sturdy frame. Light, textured and relaxed, it suits tented garden receptions, desert-boho palettes and brunch-style receptions.",
    silhouette: "rattan",
    styles: ["Boho", "Garden"],
    uses: ["Reception", "Cocktail & lounge", "Ceremony"],
    finishes: [
      { name: "Honey", hex: "#c8a26b" },
      { name: "White wash", hex: "#e8e1d4" },
    ],
    pairsWith: "Pampas grass, terracotta, macramé, mismatched glassware",
    stackable: false,
    outdoorFriendly: true,
    cushion: "Optional",
    estPrice: "$12–16",
  },
  {
    slug: "bentwood",
    name: "Bentwood Bistro Chair",
    tagline: "The Parisian café classic",
    description:
      "Curved steam-bent wood with a round seat and looped back. Timeless, light and a little romantic, it works for vintage, European-inspired, and intimate dinner-party weddings.",
    silhouette: "bentwood",
    styles: ["Classic", "Garden"],
    uses: ["Reception", "Head table", "Cocktail & lounge"],
    finishes: [
      { name: "Espresso", hex: "#3b2a20" },
      { name: "Natural", hex: "#b88a5a" },
      { name: "Black", hex: "#1d1d1d" },
    ],
    pairsWith: "Bistro lights, taper candles, checkered linens, string quartets",
    stackable: false,
    outdoorFriendly: false,
    cushion: "Optional",
    estPrice: "$9–12",
  },
  {
    slug: "wishbone",
    name: "Wishbone Chair",
    tagline: "Scandinavian lines with a woven cord seat",
    description:
      "A Y-shaped back and hand-woven cord seat inspired by mid-century Danish design. Clean and natural, it suits modern lofts, minimalist palettes and design-forward couples.",
    silhouette: "wishbone",
    styles: ["Minimalist", "Modern", "Boho"],
    uses: ["Reception", "Head table"],
    finishes: [
      { name: "Natural oak", hex: "#c9a578" },
      { name: "Black", hex: "#222222" },
    ],
    pairsWith: "Loft venues, white linen, bud vases, neutral palettes",
    stackable: false,
    outdoorFriendly: false,
    cushion: "None",
    estPrice: "$14–18",
  },
  {
    slug: "velvet-dining",
    name: "Velvet Dining Chair",
    tagline: "Jewel-toned luxury for evening receptions",
    description:
      "An upholstered velvet chair with a channel-tufted back and slim gold or black legs. Richly colored and comfortable for long dinners, it's ideal for winter weddings and black-tie events.",
    silhouette: "velvet",
    styles: ["Glam", "Modern"],
    uses: ["Head table", "Reception", "Cocktail & lounge"],
    finishes: [
      { name: "Emerald", hex: "#1f5e4a" },
      { name: "Blush", hex: "#e3b5b0" },
      { name: "Navy", hex: "#22304f" },
      { name: "Champagne", hex: "#d8c3a0" },
    ],
    pairsWith: "Moody florals, brass candlesticks, dark linens, ballroom venues",
    stackable: false,
    outdoorFriendly: false,
    cushion: "Included",
    estPrice: "$18–25",
  },
  {
    slug: "infinity",
    name: "Gold Infinity Chair",
    tagline: "Sleek metal curves with a modern edge",
    description:
      "A slim metal frame with a looping back. It has the polish of a ballroom chair without the expected Chiavari look. Available with clear or white seat pads.",
    silhouette: "infinity",
    styles: ["Glam", "Modern"],
    uses: ["Reception", "Ceremony", "Corporate"],
    finishes: [
      { name: "Gold", hex: "#c9a646" },
      { name: "Silver", hex: "#b8bcc2" },
      { name: "Black", hex: "#1f1f1f" },
    ],
    pairsWith: "Ballrooms, sequin linens, tall centerpieces, galas",
    stackable: true,
    outdoorFriendly: true,
    cushion: "Included",
    estPrice: "$9–13",
  },
  {
    slug: "cane-back",
    name: "Cane-Back Chair",
    tagline: "Woven cane panel, soft vintage charm",
    description:
      "A wooden frame with a hand-woven cane back panel. It feels collected and heirloom, like it came from a family estate, and suits garden parties, mansions and vintage-modern design.",
    silhouette: "cane",
    styles: ["Boho", "Classic", "Garden"],
    uses: ["Reception", "Head table"],
    finishes: [
      { name: "Natural", hex: "#b98e5d" },
      { name: "Black", hex: "#222222" },
    ],
    pairsWith: "Estate venues, wildflowers, vintage china, linen tablecloths",
    stackable: false,
    outdoorFriendly: false,
    cushion: "Optional",
    estPrice: "$12–16",
  },
  {
    slug: "windsor",
    name: "Windsor Spindle Chair",
    tagline: "Farmhouse spindles, heritage feel",
    description:
      "A classic spindle-back chair with a sculpted seat. It's at home in barns, orchards and countryside venues, and less expected than the usual cross-back.",
    silhouette: "windsor",
    styles: ["Rustic", "Classic"],
    uses: ["Reception", "Ceremony"],
    finishes: [
      { name: "Antique white", hex: "#ece6da" },
      { name: "Walnut", hex: "#5b3a24" },
      { name: "Sage", hex: "#9aab8f" },
    ],
    pairsWith: "Barn venues, orchard settings, quilts, mason-jar florals",
    stackable: false,
    outdoorFriendly: true,
    cushion: "Optional",
    estPrice: "$9–12",
  },
  {
    slug: "louis-medallion",
    name: "Louis Medallion Chair",
    tagline: "French upholstered elegance for the head table",
    description:
      "An upholstered oval-back chair with carved trim, in the French Louis XVI tradition. It works for sweetheart tables, family seating at the ceremony and formal ballroom dinners.",
    silhouette: "louis",
    styles: ["Classic", "Glam"],
    uses: ["Head table", "Ceremony", "Cocktail & lounge"],
    finishes: [
      { name: "White & gold", hex: "#f2ede3" },
      { name: "Grey & silver", hex: "#a9acb0" },
    ],
    pairsWith: "Ballrooms, candelabras, roses, gilded details",
    stackable: false,
    outdoorFriendly: false,
    cushion: "Included",
    estPrice: "$20–30",
  },
  {
    slug: "shell",
    name: "Mid-Century Shell Chair",
    tagline: "Molded shell, wood legs, modern and comfortable",
    description:
      "A molded shell seat on wood or metal legs. It's comfortable, colorful and very photogenic, a good fit for modern weddings, rehearsal dinners and corporate events.",
    silhouette: "shell",
    styles: ["Modern", "Minimalist"],
    uses: ["Reception", "Corporate", "Cocktail & lounge"],
    finishes: [
      { name: "White", hex: "#f1f1ef" },
      { name: "Terracotta", hex: "#c0674a" },
      { name: "Sage", hex: "#9aab8f" },
      { name: "Black", hex: "#222222" },
    ],
    pairsWith: "Lofts, galleries, colorful florals, corporate dinners",
    stackable: true,
    outdoorFriendly: true,
    cushion: "None",
    estPrice: "$9–12",
  },
  {
    slug: "garden-folding",
    name: "Teak Garden Folding Chair",
    tagline: "A ceremony chair that's better than a white folding chair",
    description:
      "A slatted teak-look folding chair. It sets up quickly for ceremonies, looks warm in photos, and holds up on lawns, beaches and orchards. It's a step up from the plastic white folding chair.",
    silhouette: "folding",
    styles: ["Garden", "Rustic", "Minimalist"],
    uses: ["Ceremony", "Corporate"],
    finishes: [{ name: "Teak", hex: "#a9774a" }],
    pairsWith: "Outdoor ceremonies, aisle petals, arbors, lakeside venues",
    stackable: true,
    outdoorFriendly: true,
    cushion: "None",
    estPrice: "$5–7",
  },
  {
    slug: "royal-throne",
    name: "Royal Sweetheart Throne",
    tagline: "Statement seating for the couple",
    description:
      "An ornate carved high-back chair or loveseat for the couple. It's made for sweetheart stages, mandaps, receptions and milestone celebrations like quinceañeras and anniversaries.",
    silhouette: "throne",
    styles: ["Cultural", "Glam", "Classic"],
    uses: ["Head table", "Ceremony"],
    finishes: [
      { name: "Gold & ivory", hex: "#d4b25f" },
      { name: "Silver & white", hex: "#c4c7cc" },
      { name: "Maroon & gold", hex: "#7a1f2b" },
    ],
    pairsWith: "Mandaps, sweetheart stages, drapery, floral backdrops",
    stackable: false,
    outdoorFriendly: false,
    cushion: "Included",
    estPrice: "$75–150 / pair",
  },
];

export const allStyles: Style[] = [
  "Rustic",
  "Boho",
  "Modern",
  "Glam",
  "Classic",
  "Garden",
  "Minimalist",
  "Cultural",
];

export const allUses: EventUse[] = [
  "Ceremony",
  "Reception",
  "Head table",
  "Cocktail & lounge",
  "Corporate",
];

export function getChair(slug: string) {
  return chairs.find((c) => c.slug === slug);
}
