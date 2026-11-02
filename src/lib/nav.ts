// Navigation for the rental marketplace. Ids, names and order mirror `categories` in
// src/data/catalog-products.ts (catalog PR) so links resolve to /rentals/<id>. Once that
// file is on main, import it here and keep only the icon map. Blurbs are shortened for the menu.
export type NavCategory = { id: string; name: string; blurb: string; icon: IconName };

import type { IconName } from "@/components/ui/Icon";

export const rentalCategories: NavCategory[] = [
  { id: "chairs", name: "Chairs", blurb: "Chiavari, cross-back, ghost, folding", icon: "chair" },
  { id: "tables", name: "Tables", blurb: "Round, banquet, farm, cocktail", icon: "table" },
  { id: "linens", name: "Linens", blurb: "Tablecloths, runners, napkins", icon: "linen" },
  { id: "dinnerware", name: "Dinnerware", blurb: "Chargers, plates, bowls", icon: "plate" },
  { id: "flatware", name: "Flatware", blurb: "Silver and gold finishes", icon: "flatware" },
  { id: "glassware", name: "Glassware", blurb: "Goblets, wine, flutes, bar", icon: "glass" },
  { id: "catering-equipment", name: "Catering equipment", blurb: "Chafers, urns, bars", icon: "chafer" },
  { id: "tents", name: "Tents", blurb: "Frame, pole, sailcloth, clear-top", icon: "tent" },
  { id: "dance-floors-staging", name: "Dance floors & staging", blurb: "Wood, white, LED, stages", icon: "floor" },
  { id: "lighting", name: "Lighting", blurb: "Bistro, uplights, chandeliers", icon: "light" },
  { id: "heating-cooling", name: "Heating & cooling", blurb: "Patio and tent heaters", icon: "heat" },
  { id: "lounge", name: "Lounge", blurb: "Sofas, armchairs, coffee tables", icon: "sofa" },
  { id: "decor", name: "Decor", blurb: "Arches, flower walls, candles", icon: "arch" },
  { id: "games-kids", name: "Games & kids", blurb: "Bounce houses, yard games", icon: "games" },
];

export const primaryNav = [
  { href: "/rentals", label: "Rentals" },
  { href: "/blog", label: "Ideas & guides" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
];
