// Navigation for the rental marketplace. Categories come straight from the catalog
// (src/data/catalog-products.ts) so the menu always matches /rentals/<id>.
import type { IconName } from "@/components/ui/Icon";
import { categories, type CategoryId } from "@/data/catalog-products";

export type NavCategory = { id: string; name: string; blurb: string; icon: IconName };

const icons: Record<CategoryId, IconName> = {
  chairs: "chair",
  tables: "table",
  linens: "linen",
  dinnerware: "plate",
  flatware: "flatware",
  glassware: "glass",
  "catering-equipment": "chafer",
  tents: "tent",
  "dance-floors-staging": "floor",
  lighting: "light",
  "heating-cooling": "heat",
  lounge: "sofa",
  decor: "arch",
  "games-kids": "games",
  concessions: "spark",
  "photo-booths": "star",
  "av-sound": "chat",
  "restrooms-power": "truck",
  "fencing-crowd-control": "shield",
};

export const rentalCategories: NavCategory[] = categories.map((c) => ({
  id: c.id,
  name: c.name,
  blurb: c.blurb,
  icon: icons[c.id],
}));
export const primaryNav = [
  { href: "/rentals", label: "Rentals" },
  { href: "/blog", label: "Ideas & guides" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/faq", label: "FAQ" },
];
