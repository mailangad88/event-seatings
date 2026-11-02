// Shapes and pricing rules for the rental catalog that powers the quote builder.
// The data itself lives in src/data/catalog.ts. Store raw vendor prices there; the customer
// price is always computed here, so the markup is changed in exactly one place.

export type Vendor = {
  id: string;
  name: string;
  website?: string;
  phone?: string;
  email?: string;
  city?: string;
  serviceArea?: string[];
  notes?: string;
};

export type CatalogItem = {
  id: string; // kebab-case, unique
  name: string;
  category: string; // e.g. "Chairs", "Tables", "Linens", "Dinnerware"…
  unit: string; // "each", "set of 10", "per event"…
  vendorPrice: number; // USD per unit, what the vendor charges us, before markup
  vendorId: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  minQty?: number;
  perGuest?: number; // suggested quantity per guest (1 for chairs, 0.125 for 8-seat rounds…)
  chairSlug?: string; // links to src/data/chairs.ts for chair pages and art
  sourceUrl?: string;
  priceCheckedAt?: string; // YYYY-MM-DD
  priceSource?: "published" | "estimated"; // estimated = no public vendor price, market estimate
  altOffers?: { vendorId: string; vendorPrice: number; sourceUrl?: string }[]; // other vendors with the same item
  specs?: string;
};

// What the browser is allowed to see: no vendor, cost or source fields.
export type PublicItem = Pick<
  CatalogItem,
  "id" | "name" | "category" | "unit" | "description" | "image" | "imageAlt" | "minQty" | "perGuest" | "chairSlug" | "specs"
> & { price: number; estimated: boolean };

export function toPublicItem(i: CatalogItem): PublicItem {
  return {
    id: i.id,
    name: i.name,
    category: i.category,
    unit: i.unit,
    description: i.description,
    image: i.image,
    imageAlt: i.imageAlt,
    minQty: i.minQty,
    perGuest: i.perGuest,
    chairSlug: i.chairSlug,
    specs: i.specs,
    price: customerPrice(i),
    estimated: i.priceSource !== "published",
  };
}

// Our margin on top of every vendor price (10%).
export const MARKUP = 0.1;
// How the fee is written in customer copy (booking promise, terms, how it works). Follows MARKUP.
export const BOOKING_FEE_LABEL = `${Math.round(MARKUP * 100)}%`;

const cents = (n: number) => Math.round(n * 100) / 100;

export function customerPrice(item: Pick<CatalogItem, "vendorPrice">) {
  return cents(item.vendorPrice * (1 + MARKUP));
}

export const usd = (n: number, digits: 0 | 2 = 2) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits });

// Order categories are shown in; anything not listed goes last, alphabetically.
export const categoryOrder = [
  "Chairs",
  "Tables",
  "Linens",
  "Dinnerware",
  "Flatware",
  "Glassware",
  "Lounge",
  "Tents",
  "Dance floors & staging",
  "Lighting",
  "Decor",
  "Heating & cooling",
  "Games & kids",
  "Catering equipment",
  "Concessions",
  "Photo booths",
  "AV & sound",
  "Restrooms & power",
  "Fencing & crowd control",
];

export function sortCategories(categories: string[]) {
  const rank = (c: string) => {
    const i = categoryOrder.indexOf(c);
    return i === -1 ? categoryOrder.length : i;
  };
  return [...new Set(categories)].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

export function suggestedQty(item: Pick<CatalogItem, "perGuest" | "minQty">, guests: number) {
  if (!item.perGuest || guests <= 0) return 0;
  return Math.max(item.minQty ?? 1, Math.ceil(guests * item.perGuest));
}

export type QuoteLine = {
  id: string;
  name: string;
  category: string;
  unit: string;
  qty: number;
  unit_price: number; // what the customer pays per unit (vendor + markup)
  line_total: number;
  vendor_id: string;
  vendor_price: number; // our cost per unit, back office only
  variant?: string; // colour or finish the customer picked, e.g. "navy"
};

export type PricedQuote = { lines: QuoteLine[]; subtotal: number; cost: number; margin: number };

// Prices a list of {id, qty} picks against the catalog. Unknown items and bad quantities are dropped,
// so the server never trusts prices or totals sent by the browser.
export function priceQuote(picks: { id: string; qty: number }[], items: CatalogItem[]): PricedQuote {
  const byId = new Map(items.map((i) => [i.id, i]));
  const merged = new Map<string, number>();
  for (const p of picks) {
    const qty = Math.floor(Number(p.qty));
    if (!byId.has(p.id) || !Number.isFinite(qty) || qty <= 0) continue;
    merged.set(p.id, Math.min(10_000, (merged.get(p.id) ?? 0) + qty));
  }
  const lines: QuoteLine[] = [...merged].map(([id, qty]) => {
    const item = byId.get(id)!;
    const unit_price = customerPrice(item);
    return {
      id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      qty,
      unit_price,
      line_total: cents(unit_price * qty),
      vendor_id: item.vendorId,
      vendor_price: item.vendorPrice,
    };
  });
  const subtotal = cents(lines.reduce((s, l) => s + l.line_total, 0));
  const cost = cents(lines.reduce((s, l) => s + l.vendor_price * l.qty, 0));
  return { lines, subtotal, cost, margin: cents(subtotal - cost) };
}
