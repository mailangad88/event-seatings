// Navigation for the rental marketplace. Category ids match the catalog
// (src/data/catalog-products.ts) so links resolve to /rentals/<id>.
export type NavCategory = { id: string; name: string; blurb: string; icon: IconName };

import type { IconName } from "@/components/ui/Icon";

export const rentalCategories: NavCategory[] = [
  { id: "chairs", name: "Chairs", blurb: "Chiavari, cross-back, ghost, folding", icon: "chair" },
  { id: "tables", name: "Tables", blurb: "Banquet, round, farm, cocktail", icon: "table" },
  { id: "linens", name: "Linens & napkins", blurb: "Tablecloths, runners, napkins", icon: "linen" },
  { id: "dinnerware", name: "Dinnerware", blurb: "Plates, chargers, bowls", icon: "plate" },
  { id: "glassware", name: "Glassware", blurb: "Wine, coupes, water goblets", icon: "glass" },
  { id: "flatware", name: "Flatware", blurb: "Gold, silver, matte black", icon: "flatware" },
  { id: "tents", name: "Tents", blurb: "Frame, pole, sailcloth", icon: "tent" },
  { id: "lighting", name: "Lighting", blurb: "Bistro, uplighting, chandeliers", icon: "light" },
  { id: "lounge", name: "Lounge furniture", blurb: "Sofas, armchairs, ottomans", icon: "sofa" },
  { id: "bars", name: "Bars & backdrops", blurb: "Bars, arches, walls", icon: "arch" },
  { id: "dance-floors", name: "Dance floors & stages", blurb: "Floors, risers, staging", icon: "floor" },
  { id: "decor", name: "Decor & centerpieces", blurb: "Candles, vases, stands", icon: "candle" },
  { id: "catering", name: "Catering equipment", blurb: "Chafers, warmers, beverage", icon: "chafer" },
  { id: "heaters", name: "Heaters & climate", blurb: "Patio heaters, fans", icon: "heat" },
];

export const primaryNav = [
  { href: "/rentals", label: "Rentals" },
  { href: "/blog", label: "Ideas & guides" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
];
