// Chicago Event Rental Price Index: what the same item costs at different Chicago-area rental companies.
//
// Built only from PUBLISHED vendor prices in `offers` (src/data/catalog.ts). Only items where every listing
// describes the same thing are included (checked by hand against each vendor's item name on 2026-11-03),
// so the spread is a real price difference and not a size or style difference.
//
// Vendor names are never exported from this file: the page shows ranges, not who charges what.
// Prices are the companies' own rates, before our flat booking fee, delivery, setup, damage waiver and tax.

import "server-only";
import { canonicalItem, getCatalogItem, offers, PRICES_CHECKED_AT } from "./catalog";

export const PRICE_INDEX_SLUG = "/data/chicago-rental-prices";
export const PRICE_INDEX_CSV = "/data/chicago-rental-prices.csv";
export const PRICE_INDEX_CHECKED = PRICES_CHECKED_AT;

type Group = "Chairs" | "Tables" | "Linens" | "Dinnerware" | "Tents" | "Party machines" | "Event extras";

const items: { id: string; label: string; unit: string; group: Group }[] = [
  { id: "gold-chiavari", label: "Gold Chiavari chair", unit: "each", group: "Chairs" },
  { id: "silver-chiavari", label: "Silver Chiavari chair", unit: "each", group: "Chairs" },
  { id: "white-chiavari", label: "White Chiavari chair", unit: "each", group: "Chairs" },
  { id: "clear-chiavari", label: "Clear Chiavari chair", unit: "each", group: "Chairs" },
  { id: "white-folding", label: "White plastic folding chair", unit: "each", group: "Chairs" },
  { id: "white-resin-folding", label: "White resin garden chair", unit: "each", group: "Chairs" },
  { id: "round-72", label: "72\" round table", unit: "each", group: "Tables" },
  { id: "banquet-6ft", label: "6 ft banquet table", unit: "each", group: "Tables" },
  { id: "banquet-8ft", label: "8 ft banquet table", unit: "each", group: "Tables" },
  { id: "round-lap-length", label: "90\" round tablecloth", unit: "each", group: "Linens" },
  { id: "banquet-lap-length", label: "90x132\" banquet tablecloth", unit: "each", group: "Linens" },
  { id: "banquet-floor-length", label: "90x156\" banquet tablecloth", unit: "each", group: "Linens" },
  { id: "cloth-napkins", label: "Cloth napkin", unit: "each", group: "Linens" },
  { id: "chair-sash", label: "Chair sash", unit: "each", group: "Linens" },
  { id: "dinner-plate", label: "China dinner plate", unit: "each", group: "Dinnerware" },
  { id: "salad-plate", label: "China salad plate", unit: "each", group: "Dinnerware" },
  { id: "bread-plate", label: "China bread plate", unit: "each", group: "Dinnerware" },
  { id: "frame-tent-20x20", label: "20x20 frame tent", unit: "per event", group: "Tents" },
  { id: "popcorn-machine", label: "Popcorn machine", unit: "per event", group: "Party machines" },
  { id: "cotton-candy-machine", label: "Cotton candy machine", unit: "per event", group: "Party machines" },
  { id: "snow-cone-machine", label: "Snow cone machine", unit: "per event", group: "Party machines" },
  { id: "hot-dog-roller", label: "Hot dog steamer", unit: "per event", group: "Party machines" },
  { id: "nacho-cheese-warmer", label: "Nacho cheese warmer", unit: "per event", group: "Party machines" },
  { id: "podium", label: "Speaker's podium", unit: "per event", group: "Event extras" },
  { id: "projection-screen", label: "8 ft projection screen", unit: "per event", group: "Event extras" },
  { id: "stanchion", label: "Chrome stanchion with belt", unit: "each", group: "Event extras" },
];

export type PriceIndexRow = {
  id: string;
  label: string;
  unit: string;
  group: Group;
  companies: number;
  low: number;
  median: number;
  high: number;
  /** How much more the highest listed price is than the lowest, in percent. */
  gapPct: number;
  /** The item's page in /rentals, when it has one. */
  href?: string;
};

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round(((s[m - 1] + s[m]) / 2) * 100) / 100;
};

export const priceIndex: PriceIndexRow[] = items.flatMap((it) => {
  // One price per company: if a company lists the item twice, keep its lower price.
  const byVendor = new Map<string, number>();
  for (const o of offers[it.id] ?? []) byVendor.set(o.vendorId, Math.min(byVendor.get(o.vendorId) ?? Infinity, o.vendorPrice));
  const prices = [...byVendor.values()];
  if (prices.length < 2) return [];
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const item = getCatalogItem(it.id);
  const c = item && canonicalItem(item);
  const href = c ? `/rentals/${c.categoryId}/${c.id}` : undefined;
  return [{ ...it, href, companies: prices.length, low, median: median(prices), high, gapPct: Math.round(((high - low) / low) * 100) }];
});

/** Distinct companies whose published prices feed the index. */
export const priceIndexCompanies = new Set(items.flatMap((it) => (offers[it.id] ?? []).map((o) => o.vendorId))).size;

export const priceIndexGroups = [...new Set(priceIndex.map((r) => r.group))];

/** A 100-guest basic setup priced at the lowest and highest listed rate for each line. */
export function sampleOrder() {
  const lines = [
    { id: "white-folding", qty: 100 },
    { id: "banquet-8ft", qty: 13 },
    { id: "banquet-lap-length", qty: 13 },
    { id: "cloth-napkins", qty: 100 },
  ];
  let low = 0;
  let high = 0;
  for (const l of lines) {
    const r = priceIndex.find((p) => p.id === l.id);
    if (!r) continue;
    low += r.low * l.qty;
    high += r.high * l.qty;
  }
  return { lines: lines.map((l) => ({ ...l, label: priceIndex.find((p) => p.id === l.id)?.label ?? l.id })), low, high };
}

export function priceIndexCsv() {
  const head = ["item", "group", "unit", "companies_listing", "lowest_usd", "median_usd", "highest_usd", "gap_percent", "prices_checked"];
  const rows = priceIndex.map((r) => [r.label, r.group, r.unit, r.companies, r.low, r.median, r.high, r.gapPct, PRICE_INDEX_CHECKED]);
  const esc = (v: string | number) => (typeof v === "string" && /[",]/.test(v) ? `"${v.replace(/"/g, '""')}"` : String(v));
  return [head, ...rows].map((r) => r.map(esc).join(",")).join("\n") + "\n";
}
