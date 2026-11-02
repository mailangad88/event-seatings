import type { CatalogItem, Vendor } from "@/lib/catalog-types";
import { chairs } from "./chairs";

// The rental catalog the quote builder prices from.
// PLACEHOLDER: until the researched vendor catalog lands, this holds only our chairs, priced so the
// customer price (vendor price + 10%) matches the low end of each chair's published estimate.
// Replace this whole file with real vendor data, keeping the two exports below.
// Rules: store the vendor's own price in `vendorPrice` (never the marked-up one); vendor names are back office only.

export const vendors: Vendor[] = [
  { id: "tbd", name: "Vendor to be assigned", notes: "Placeholder until vendor pricing is confirmed." },
];

const low = (est: string) => Number(est.replace(/[^0-9.–-]/g, "").split(/[–-]/)[0]);

export const catalogItems: CatalogItem[] = chairs.map((c) => ({
  id: `chair-${c.slug}`,
  name: c.name,
  category: "Chairs",
  unit: /pair/.test(c.estPrice) ? "pair" : "each",
  vendorPrice: Math.round((low(c.estPrice) / 1.1) * 100) / 100,
  vendorId: "tbd",
  description: c.tagline,
  perGuest: c.slug === "royal-throne" ? undefined : 1,
  priceSource: "estimated",
  chairSlug: c.slug,
}));
