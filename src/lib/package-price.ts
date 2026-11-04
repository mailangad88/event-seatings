// Prices a ready-made package for any guest count. Has no server imports, so the package cards can
// reprice in the browser when a visitor changes the guest count. The server uses the same function
// (src/lib/packages.ts), so the card price always matches the planner.
import { allInEstimate } from "@/lib/fees";
import { recommend, type ExtraId, type SettingId, type StyleId } from "@/lib/event-plan";

/** The few facts a package needs about each catalog item it can use. */
export type PackageItemInfo = { name: string; price: number; cat: string };

export type PackageShape = { event: string; setting: SettingId; style: StyleId; extras: ExtraId[] };

export type PackageQuote = { guests: number; rentals: number; allIn: number; perGuest: number; itemCount: number; highlights: string[] };

export const MIN_GUESTS = 1;
export const MAX_GUESTS = 2000;
export const clampGuests = (n: number) => Math.max(MIN_GUESTS, Math.min(MAX_GUESTS, Math.round(Number(n)) || MIN_GUESTS));

export function priceLines(p: PackageShape, guests: number, items: Record<string, PackageItemInfo>) {
  return recommend({ event: p.event, guests, style: p.style, setting: p.setting, extras: p.extras }).filter((l) => items[l.id]);
}

export function quotePackage(p: PackageShape, guests: number, items: Record<string, PackageItemInfo>): PackageQuote {
  const g = clampGuests(guests);
  const lines = priceLines(p, g, items);
  const rentals = lines.reduce((s, l) => s + items[l.id].price * l.qty, 0);
  const allIn = allInEstimate(rentals, { categoryIds: lines.map((l) => items[l.id].cat) }).total;
  // The biggest lines first, so the card names what the money goes on.
  const highlights = [...lines]
    .sort((x, y) => items[y.id].price * y.qty - items[x.id].price * x.qty)
    .slice(0, 4)
    .map((l) => `${items[l.id].name} × ${l.qty.toLocaleString()}`);
  return { guests: g, rentals: Math.round(rentals), allIn: Math.round(allIn), perGuest: Math.round(allIn / g), itemCount: lines.length, highlights };
}

/** Planner link for a package at a guest count. */
export function packageHref(p: PackageShape & { id: string }, guests: number) {
  const params = new URLSearchParams({ event: p.event, guests: String(clampGuests(guests)), setting: p.setting, style: p.style, from: `package-${p.id}` });
  return `/quote?${params}`;
}
