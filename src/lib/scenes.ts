import styled from "@/data/styled-images.json";
import { rentalImage, styledImage } from "@/data/rental-images";
import { site } from "./site";

// Styled 3D tablescape renders (Blender) used for heroes and editorial bands.
// Portrait 9:16 at 900x1600, plus one wide triptych. Alt text is written for
// search and AI: what is in the frame, the palette and the occasion.
export type Scene = { src: string; alt: string; caption: string; width: number; height: number; ai?: boolean };

// Gemini styled versions (scripts/styled-scenes.py) replace a tablescape when one exists, keyed by file stem.
const styledAll = styled as Record<string, Omit<Scene, "ai">>;
function withStyled<T extends Record<string, Scene>>(set: T): { [K in keyof T]: Scene } {
  return Object.fromEntries(
    Object.entries(set).map(([k, v]) => {
      const s = styledAll[v.src.split("/").pop()!.replace(/\.webp$/, "")];
      return [k, s ? { src: s.src, alt: s.alt, caption: s.caption, width: s.width, height: s.height, ai: true } : v];
    }),
  ) as { [K in keyof T]: Scene };
}

const baseScenes = {
  blushGarden: {
    src: "/images/scenes/blush-garden-tablescape.webp",
    alt: `Blush garden wedding tablescape rendered by ${site.name}: rose-gold bamboo chairs with ivory cushions, a blush linen banquet table, taper candles and a low white floral runner in front of a twinkle-light drape`,
    caption: "Blush Garden: rose-gold chairs, blush linen, taper candles and a low floral runner.",
    width: 900,
    height: 1600,
  },
  midnightGold: {
    src: "/images/scenes/midnight-gold-tablescape.webp",
    alt: `Midnight gold reception render by ${site.name}: gold bamboo chairs with grey cushions at a long charcoal table with coral florals and candles under a wall of warm string lights`,
    caption: "Midnight Gold: gold chairs, charcoal linen and a wall of warm light.",
    width: 900,
    height: 1600,
  },
  gildedIvory: {
    src: "/images/scenes/gilded-ivory-tablescape.webp",
    alt: `Gilded ivory banquet render by ${site.name}: gold chairs, ivory linen, gold chargers and white florals in a softly lit room`,
    caption: "Gilded Ivory: gold chairs, ivory linen and gold chargers.",
    width: 900,
    height: 1600,
  },
  chairDetail: {
    src: "/images/scenes/gilded-ivory-chair-detail.webp",
    alt: `Close-up render of a gold bamboo-style event chair with an ivory cushion, from ${site.name}`,
    caption: "Detail: gold bamboo-style chair with an ivory seat pad.",
    width: 900,
    height: 1600,
  },
  midnightLongTable: {
    src: "/images/scenes/midnight-gold-long-table.webp",
    alt: `Long reception table render by ${site.name} with rows of gold chairs, charcoal linen and candlelight`,
    caption: "A long Midnight Gold reception table.",
    width: 900,
    height: 1600,
  },
  blushLongTable: {
    src: "/images/scenes/blush-garden-long-table.webp",
    alt: `Long blush wedding table render by ${site.name} with rose-gold chairs, place settings and florals`,
    caption: "A long Blush Garden wedding table.",
    width: 900,
    height: 1600,
  },
  threeLooks: {
    src: "/images/scenes/three-looks-wide.webp",
    alt: `Three event looks rendered by ${site.name}: gilded ivory chair detail, a midnight gold reception and a blush garden wedding table`,
    caption: "Three looks, one quote: Gilded Ivory, Midnight Gold and Blush Garden.",
    width: 1800,
    height: 1067,
  },
} satisfies Record<string, Scene>;
export const scenes = withStyled(baseScenes);

// A 3D render from the rentals set (public/rentals/...), as a Scene.
export function render(slug: string): Scene {
  const r = rentalImage(slug);
  if (!r) throw new Error(`Missing render: ${slug}`);
  return { src: r.src, alt: r.alt, caption: r.caption, width: r.width, height: r.height, ai: r.ai };
}

// Event scenes (16:9) plus the styled tablescapes, so rotating bands don't repeat the same few images.
const eventScenes = [
  "wedding-reception",
  "garden-ceremony",
  "tent-reception-dusk",
  "corporate-gala",
  "farm-table-dinner",
  "cocktail-hour",
  "dance-party",
  "sweetheart-stage",
  "boho-lounge",
  "graduation-party",
  "baby-shower",
  "winter-tent",
  "buffet-setup",
  "bar-setup",
].filter((s) => rentalImage(s));
const pool: Scene[] = [
  ...eventScenes.map(render),
  scenes.blushGarden,
  scenes.midnightGold,
  scenes.gildedIvory,
  scenes.midnightLongTable,
  scenes.blushLongTable,
];

// Stable pick per page or section, so the same page always shows the same image.
export function sceneFor(slug: string): Scene {
  const n = [...slug].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return pool[n % pool.length];
}

// Header image for each rental category (nav ids): a category hero render, an event scene, or a product render.
const categoryRender: Record<string, string> = {
  chairs: "hero-chairs",
  tables: "hero-tables",
  linens: "hero-linens",
  dinnerware: "hero-dinnerware",
  flatware: "gold-flatware",
  glassware: "hero-glassware",
  "catering-equipment": "hero-catering",
  tents: "tent-reception-dusk",
  "dance-floors-staging": "hero-dance-decor",
  lighting: "string-lights",
  "heating-cooling": "winter-tent",
  lounge: "hero-lounge",
  decor: "flower-wall",
  "games-kids": "hero-parties",
  // New Gemini event scenes (scripts/styled-scenes.py --new-heroes); skipped until they exist.
  concessions: "hero-concessions",
  "photo-booths": "hero-photo-booths",
  "av-sound": "hero-av",
  "restrooms-power": "hero-restrooms-power",
  "fencing-crowd-control": "hero-fencing",
};

export function categoryScene(id: string): Scene | undefined {
  const slug = categoryRender[id];
  if (!slug) return undefined;
  // Heroes keep the styled event scene even when the slug is a product (e.g. gold-flatware), whose own image is the piece.
  const s = styledImage(slug);
  if (s) return { src: s.src, alt: s.alt, caption: s.caption, width: s.width, height: s.height, ai: true };
  return rentalImage(slug) ? render(slug) : undefined;
}

// Square tiles for the category grids (home page and /rentals): the rentals themselves, clear at a glance.
const categoryTiles: Record<string, string> = {
  chairs: "Row of gold Chiavari chairs with ivory cushions at a dressed table",
  tables: "Round, long banquet and tall cocktail tables side by side in an empty hall",
  linens: "Stack of folded tablecloths and napkins in many colours beside a table in a long ivory cloth",
  dinnerware: "Place setting from above: gold-rimmed charger, white plates and a folded napkin",
  flatware: "Gold forks, knives and spoons fanned out on an ivory napkin",
  glassware: "Wine glasses, a flute, a goblet and tumblers lined up on a white table",
  "catering-equipment": "Buffet line of stainless steel chafing dishes with food and serving tongs",
  tents: "White pole tent on a green lawn with tables and chairs set inside",
  "dance-floors-staging": "Black and white checkered dance floor in front of a low stage",
  lighting: "Bistro string lights over a patio at dusk with warm uplights on the wall",
  "heating-cooling": "Patio heater with a lit flame next to a large standing fan",
  lounge: "White leather sofa, armchairs and a glass coffee table on a rug",
  decor: "Pink flower wall with a round gold arch and two gold candle stands",
  "games-kids": "Giant stacking tower, cornhole boards and giant four in a row on a lawn",
  concessions: "Popcorn, cotton candy and snow cone machines side by side on a cart",
  "photo-booths": "Ring light photo booth on a stand in front of a white sequin backdrop",
  "av-sound": "Two PA speakers on stands, a microphone and a mixer on a table in a hall",
  "restrooms-power": "White restroom trailer on a lawn next to a portable generator",
  "fencing-crowd-control": "Chrome stanchions with red velvet ropes along a white picket fence",
};

export function categoryTile(id: string): Scene | undefined {
  const alt = categoryTiles[id];
  if (!alt) return categoryScene(id);
  return { src: `/rentals/styled/cat-${id}.webp`, alt, caption: alt, width: 1024, height: 1024 };
}
