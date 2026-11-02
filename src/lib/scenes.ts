import { site } from "./site";

// Styled 3D tablescape renders (Blender) used for heroes and editorial bands.
// Portrait 9:16 at 900x1600, plus one wide triptych. Alt text is written for
// search and AI: what is in the frame, the palette and the occasion.
export type Scene = { src: string; alt: string; caption: string; width: number; height: number };

export const scenes = {
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

const tablescapes = [scenes.blushGarden, scenes.midnightGold, scenes.gildedIvory, scenes.midnightLongTable, scenes.blushLongTable];

/** A stable scene for any slug, so every page gets a visual even without its own image. */
export function sceneFor(slug: string): Scene {
  const n = [...slug].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  return tablescapes[n % tablescapes.length];
}
