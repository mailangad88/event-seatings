// Decor "looks" for the /looks lead pages. Each look is built around one hero chair.
//
// Social media: Blender renders live in /public/social (see blender/README.md).
//   video  a vertical 9:16 MP4 that plays on the look's own page
//   poster the video's first frame, shown while it loads
//   still  a frame used on cards and as the share image
// Any file that isn't in /public at build time is skipped, and the page falls back to the
// studio render of the hero chair in the look's palette.

export type Swatch = { name: string; hex: string };

export type Look = {
  slug: string;
  name: string;
  kicker: string;
  story: string;
  heroChair: string;
  alsoChairs: string[];
  palette: Swatch[];
  /** Two colors for the scene's lighting: the glow and the shadow. */
  light: [string, string];
  details: { label: string; text: string }[];
  bestFor: string[];
  season: string;
  video?: string;
  poster?: string;
  still?: string;
};

export const looks: Look[] = [
  {
    slug: "gilded-ballroom",
    name: "The Gilded Ballroom",
    kicker: "Champagne, candlelight and carved gold",
    story:
      "A black-tie evening that feels like a grand hotel in its golden age. Carved Louis chairs at the head table, slim gold Infinity chairs down every long table, and so much candlelight the room glows.",
    heroChair: "louis-medallion",
    alsoChairs: ["infinity", "ghost"],
    palette: [
      { name: "Ivory", hex: "#f3ead8" },
      { name: "Champagne", hex: "#d8c3a0" },
      { name: "Antique gold", hex: "#b08d4a" },
      { name: "Blush", hex: "#e3b5b0" },
    ],
    light: ["#6b5530", "#1a140c"],
    details: [
      { label: "Florals", text: "Tall arrangements of white roses, garden roses and hanging amaranthus" },
      { label: "Linens", text: "Champagne sequin or satin, floor length" },
      { label: "Lighting", text: "Taper candles in brass, warm uplighting on the walls" },
      { label: "Table", text: "Gold-rim chargers, crystal stemware, ivory menus" },
    ],
    bestFor: ["Hotel ballrooms", "Country clubs", "Galas and black-tie weddings"],
    season: "Fall and winter evenings",
    video: "/social/clips/gilded-ivory-dolly.mp4",
    poster: "/social/stills/gilded-ivory-dolly-start.jpg",
    still: "/social/stills/gilded-ivory-reveal-end.jpg",
  },
  {
    slug: "midnight-gold-gala",
    name: "Midnight Gold Gala",
    kicker: "Black linen, gold chairs and deep red roses",
    story:
      "The most dramatic room of the night: black linen, gold chairs that catch every candle, and roses so deep they read almost black. It is made for evening galas, New Year's Eve weddings and anything with a dress code.",
    heroChair: "infinity",
    alsoChairs: ["velvet-dining", "louis-medallion"],
    palette: [
      { name: "Onyx", hex: "#141416" },
      { name: "Gold", hex: "#c9a646" },
      { name: "Oxblood", hex: "#5a0d16" },
      { name: "Ivory", hex: "#efe7da" },
    ],
    light: ["#4a3a1c", "#08080a"],
    details: [
      { label: "Florals", text: "Black Baccara and burgundy roses, low and dense, with a few ivory blooms" },
      { label: "Linens", text: "Black velvet or satin, floor length" },
      { label: "Lighting", text: "Gold candlesticks, fairy-light backdrop, the room kept dark" },
      { label: "Table", text: "Gold chargers and flatware, black napkins, crystal" },
    ],
    bestFor: ["Galas and fundraisers", "New Year's Eve weddings", "Hotel ballrooms", "Corporate award nights"],
    season: "Evenings, October to February",
    video: "/social/clips/midnight-gold-dolly.mp4",
    poster: "/social/stills/midnight-gold-dolly-start.jpg",
    still: "/social/stills/midnight-gold-reveal-end.jpg",
  },
  {
    slug: "blush-garden-party",
    name: "Blush Garden Party",
    kicker: "Rose gold, ivory linen and soft pink blooms",
    story:
      "Rose-gold chairs, crisp ivory linen and a cloud of blush flowers under string lights. Soft and romantic without being sweet, it suits spring weddings, bridal showers and garden receptions.",
    heroChair: "infinity",
    alsoChairs: ["ghost", "cane-back"],
    palette: [
      { name: "Blush", hex: "#e8c4c0" },
      { name: "Rose gold", hex: "#c9907e" },
      { name: "Ivory", hex: "#f4eee4" },
      { name: "Sage", hex: "#a7b59c" },
    ],
    light: ["#6e4d48", "#1a1210"],
    details: [
      { label: "Florals", text: "Garden roses, peonies and ranunculus in blush and cream" },
      { label: "Linens", text: "Ivory linen with a blush chiffon runner" },
      { label: "Lighting", text: "String lights and fairy lights, candles in pink glass" },
      { label: "Table", text: "Rose-gold chargers and flatware, clear stemware" },
    ],
    bestFor: ["Garden and tented weddings", "Bridal and baby showers", "Spring receptions", "Brunches"],
    season: "April to June",
    video: "/social/clips/blush-garden-dolly.mp4",
    poster: "/social/stills/blush-garden-dolly-start.jpg",
    still: "/social/stills/blush-garden-reveal-end.jpg",
  },
  {
    slug: "emerald-supper-club",
    name: "Emerald Supper Club",
    kicker: "Velvet, brass and a moody dinner party",
    story:
      "Deep emerald velvet chairs, dark linens and low candlelit florals. It feels like a members-only supper club, and guests will happily stay at the table for hours because these chairs are actually comfortable.",
    heroChair: "velvet-dining",
    alsoChairs: ["bentwood", "louis-medallion"],
    palette: [
      { name: "Emerald", hex: "#1f5e4a" },
      { name: "Burgundy", hex: "#6b2232" },
      { name: "Brass", hex: "#b8913f" },
      { name: "Smoke", hex: "#2a2622" },
    ],
    light: ["#244c3c", "#0c1410"],
    details: [
      { label: "Florals", text: "Low, lush garden roses in burgundy, plum and deep red" },
      { label: "Linens", text: "Charcoal or forest-green velvet runners on dark tables" },
      { label: "Lighting", text: "Dozens of votives and brass candlesticks, lights dimmed low" },
      { label: "Table", text: "Smoked glass, brass flatware, handwritten place cards" },
    ],
    bestFor: ["Restaurants and private dining rooms", "Lofts", "Rehearsal dinners", "Winter weddings"],
    season: "November to February",
  },
  {
    slug: "garden-estate",
    name: "The Garden Estate",
    kicker: "Woven cane, white florals and a summer lawn",
    story:
      "An heirloom garden party on the lawn of an old estate. Cane-back chairs look as if they came out of the family house, and white florals with trailing greenery keep it fresh in the afternoon light.",
    heroChair: "cane-back",
    alsoChairs: ["bentwood", "garden-folding"],
    palette: [
      { name: "White", hex: "#f6f3ec" },
      { name: "Sage", hex: "#94a98f" },
      { name: "Natural cane", hex: "#b98e5d" },
      { name: "Soft gold", hex: "#d6b97a" },
    ],
    light: ["#5f6b4c", "#161a10"],
    details: [
      { label: "Florals", text: "White hydrangea, garden roses, trailing jasmine and olive branches" },
      { label: "Linens", text: "White or sage linen, a little crumpled on purpose" },
      { label: "Lighting", text: "Daylight, then bistro string lights at dusk" },
      { label: "Table", text: "Vintage china, mismatched bud vases, rattan chargers" },
    ],
    bestFor: ["Estates and mansions", "Backyard and tented weddings", "Garden ceremonies", "Showers and brunches"],
    season: "May to September",
  },
  {
    slug: "crystal-modern",
    name: "Crystal Modern",
    kicker: "Clear acrylic that lets the flowers float",
    story:
      "Ghost chairs almost disappear, so a white flower installation and mirrored tables can take the whole room. It is clean, bright and photographs beautifully, especially in a gallery or a city loft.",
    heroChair: "ghost",
    alsoChairs: ["infinity", "shell"],
    palette: [
      { name: "Clear", hex: "#dfe9ee" },
      { name: "Pure white", hex: "#fbfbf9" },
      { name: "Silver", hex: "#b8bcc2" },
      { name: "Soft grey", hex: "#7a7f86" },
    ],
    light: ["#56606a", "#101317"],
    details: [
      { label: "Florals", text: "All-white installations: orchids, roses, delphinium and baby's breath" },
      { label: "Linens", text: "None at all on mirror or acrylic tables, or crisp white" },
      { label: "Lighting", text: "Cool pin-spots on florals, clear glass candle cylinders" },
      { label: "Table", text: "Clear chargers, silver flatware, acrylic menus" },
    ],
    bestFor: ["Art galleries", "City lofts and rooftops", "Modern ceremonies", "Brand launches"],
    season: "Any season",
  },
  {
    slug: "vineyard-candlelight",
    name: "Vineyard Candlelight",
    kicker: "Long farm tables and warm wood",
    story:
      "Rows of cross-back chairs down long wooden tables, greenery runners and candlelight as far as you can see. The back of a cross-back chair is the angle guests see all night, and it is the reason this look photographs so well.",
    heroChair: "cross-back",
    alsoChairs: ["windsor", "garden-folding"],
    palette: [
      { name: "Walnut", hex: "#5b3a24" },
      { name: "Olive", hex: "#6f7350" },
      { name: "Candle", hex: "#e7c98f" },
      { name: "Linen", hex: "#e8e1d4" },
    ],
    light: ["#6a4a2c", "#160e08"],
    details: [
      { label: "Florals", text: "Eucalyptus and olive runners with wildflowers in small jars" },
      { label: "Linens", text: "Bare wood tables with oatmeal linen napkins" },
      { label: "Lighting", text: "Pillar candles, lanterns and market lights overhead" },
      { label: "Table", text: "Wooden chargers, amber glass, sprigs of rosemary" },
    ],
    bestFor: ["Barns", "Vineyards and orchards", "Farm venues", "Fall weddings"],
    season: "September to November",
  },
  {
    slug: "golden-hour-boho",
    name: "Golden Hour Boho",
    kicker: "Rattan, pampas and a lakeside sunset",
    story:
      "Woven rattan chairs, dried pampas and terracotta tones in the warm light just before sunset. Relaxed and textured, it suits tented receptions, lakeside ceremonies and long brunch-style celebrations.",
    heroChair: "rattan-garden",
    alsoChairs: ["wishbone", "cane-back"],
    palette: [
      { name: "Honey", hex: "#c8a26b" },
      { name: "Terracotta", hex: "#b5643c" },
      { name: "Sand", hex: "#e6d3b3" },
      { name: "Pampas", hex: "#efe4cf" },
    ],
    light: ["#7a5130", "#1a0f08"],
    details: [
      { label: "Florals", text: "Pampas grass, bunny tails, dried palms and orange ranunculus" },
      { label: "Linens", text: "Rust, sand or gauze runners on natural wood" },
      { label: "Lighting", text: "Sunset first, then paper lanterns and candles in amber glass" },
      { label: "Table", text: "Terracotta, rattan chargers, mismatched vintage glassware" },
    ],
    bestFor: ["Lakeside venues", "Tented receptions", "Backyard weddings", "Bridal showers"],
    season: "June to September",
  },
  {
    slug: "quiet-luxury",
    name: "Quiet Luxury",
    kicker: "Clean lines, natural oak, nothing extra",
    story:
      "Wishbone chairs in natural oak, white linen and a few sculptural stems. Everything in the room is well made and nothing shouts. It is the look for couples and companies who would rather it felt considered than loud.",
    heroChair: "wishbone",
    alsoChairs: ["shell", "bentwood"],
    palette: [
      { name: "Oak", hex: "#c9a578" },
      { name: "Bone", hex: "#ece5d8" },
      { name: "Stone", hex: "#a39a8c" },
      { name: "Ink", hex: "#222222" },
    ],
    light: ["#5c4e3c", "#13100c"],
    details: [
      { label: "Florals", text: "Single branches, calla lilies and bud vases in a line" },
      { label: "Linens", text: "Heavy white linen, pressed sharp" },
      { label: "Lighting", text: "Soft daylight or dimmed warm white, low candles" },
      { label: "Table", text: "Stoneware, matte black flatware, linen napkins tied with nothing" },
    ],
    bestFor: ["Lofts and galleries", "Restaurants", "Corporate dinners", "Intimate weddings"],
    season: "Any season",
  },
  {
    slug: "royal-celebration",
    name: "The Royal Celebration",
    kicker: "Marigold, fuchsia and a throne for two",
    story:
      "A celebration with real presence, for sangeets, receptions, quinceañeras and milestone birthdays. Carved royal thrones on stage, jewel-toned velvet for family tables and gold for everyone else.",
    heroChair: "royal-throne",
    alsoChairs: ["velvet-dining", "infinity"],
    palette: [
      { name: "Marigold", hex: "#e39a2d" },
      { name: "Fuchsia", hex: "#b8336a" },
      { name: "Royal gold", hex: "#c9a646" },
      { name: "Deep red", hex: "#7a1e22" },
    ],
    light: ["#7a3a24", "#1a0808"],
    details: [
      { label: "Florals", text: "Marigold garlands, roses and orchid strands framing the stage" },
      { label: "Linens", text: "Gold or jewel-tone satin with embroidered runners" },
      { label: "Lighting", text: "Warm uplighting, chandeliers and a lit stage backdrop" },
      { label: "Table", text: "Gold chargers, colored glass, brass diyas or votives" },
    ],
    bestFor: ["Banquet halls", "South Asian weddings and sangeets", "Quinceañeras", "Milestone birthdays"],
    season: "Any season",
  },
];

export function getLook(slug: string) {
  return looks.find((l) => l.slug === slug);
}
