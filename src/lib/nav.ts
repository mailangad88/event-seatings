// Navigation for the rental marketplace. Categories come straight from the catalog
// (src/data/catalog-products.ts) so the menu always matches /rentals/<id>.
import type { IconName } from "@/components/ui/Icon";
import { categories, type CategoryId } from "@/data/catalog-products";

export type NavCategory = { id: string; name: string; blurb: string; icon: IconName };

// Menu icon and short blurb per category (the catalog blurbs are too long for the menu).
const menu: Record<CategoryId, [IconName, string]> = {
  chairs: ["chair", "Chiavari, cross-back, ghost, folding"],
  tables: ["table", "Round, banquet, farm, cocktail"],
  linens: ["linen", "Tablecloths, runners, napkins"],
  dinnerware: ["plate", "Chargers, plates, bowls"],
  flatware: ["flatware", "Silver and gold finishes"],
  glassware: ["glass", "Goblets, wine, flutes, bar"],
  "catering-equipment": ["chafer", "Chafers, urns, bars"],
  tents: ["tent", "Frame, pole, sailcloth, clear-top"],
  "dance-floors-staging": ["floor", "Wood, white, LED, stages"],
  lighting: ["light", "Bistro, uplights, chandeliers"],
  "heating-cooling": ["heat", "Patio and tent heaters"],
  lounge: ["sofa", "Sofas, armchairs, coffee tables"],
  decor: ["arch", "Arches, flower walls, candles"],
  "games-kids": ["games", "Bounce houses, yard games"],
  concessions: ["spark", "Popcorn, cotton candy, snow cones"],
  "photo-booths": ["star", "360, mirror and selfie booths"],
  "av-sound": ["chat", "PA, mics, projectors, screens"],
  "restrooms-power": ["truck", "Restrooms, generators, cords"],
  "fencing-crowd-control": ["shield", "Stanchions, barricades, carpets"],
};

export const rentalCategories: NavCategory[] = categories.map((c) => ({
  id: c.id,
  name: c.name,
  blurb: menu[c.id][1],
  icon: menu[c.id][0],
}));
export const primaryNav = [
  { href: "/rentals", label: "Rentals" },
  { href: "/packages", label: "Packages" },
  { href: "/ideas", label: "Ideas" },
  { href: "/blog", label: "Guides" },
  { href: "/tools", label: "Free tools" },
  { href: "/my-events", label: "My events" },
  { href: "/how-it-works", label: "How it works" },
];
