// Shapes and pricing rules for the rental catalog that powers the quote builder.
// The data itself lives in src/data/catalog.ts. Store raw vendor prices there; the customer
// price is always computed here, so the markup is changed in exactly one place.

import { daysUntil } from "./my-events-key";

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

// Customer prices are our own prices: the supplier's rate plus MARKUP, set by Angad on Nov 4 2026
// (raised from 10% to 15%, then to 40% on Nov 9 2026). There is no separate booking or coordination
// fee. Customers see one price per item and never the supplier's name or rate. (Vendor-facing pages
// and admin still use vendorPrice.) Since Nov 9, this price only appears in a quote, labeled an
// estimate — see PublicItem/toPublicItem callers and the public /rentals and /chairs pages.
export const MARKUP = 0.4;

const cents = (n: number) => Math.round(n * 100) / 100;

// `eventDate` minus `n` days, as a YYYY-MM-DD string. UTC noon arithmetic sidesteps DST.
const addDaysIso = (day: string, n: number) => new Date(Date.parse(`${day}T12:00:00Z`) + n * 864e5).toISOString().slice(0, 10);

const shareOf = (subtotal: number, share: number) => cents(Math.min(subtotal, Math.max(0, subtotal * share)));

// What the customer pays us, in up to three stages, set by Angad on Nov 5 2026. More than
// secondDueDaysBefore days out when booked: firstShare now (at least $min), secondShare
// secondDueDaysBefore days before the event, the rest finalDueDaysBefore days before. Booked inside
// secondDueDaysBefore days: lateFirstShare now instead, then the rest finalDueDaysBefore days before.
// Booked inside finalDueDaysBefore days (or with no event date to go by): paid in full now.
export const PAYMENT_SCHEDULE = {
  firstShare: 0.2,
  secondShare: 0.3,
  lateFirstShare: 0.5,
  secondDueDaysBefore: 30,
  finalDueDaysBefore: 7,
  min: 100, // smallest first payment we take
  refundHours: 72, // full refund of the first payment within this window
} as const;

export type PaymentStage = { label: string; amount: number; dueDate?: string };

/** The payment plan for an order with this rental subtotal (our prices), first stage first. */
export function paymentPlanFor(subtotal: number, eventDate?: string, today: Date = new Date()): PaymentStage[] {
  const sub = cents(subtotal);
  if (sub <= 0) return [{ label: "Nothing due", amount: 0 }];
  const days = eventDate ? daysUntil(eventDate, today) : undefined;
  const full = (): PaymentStage[] => [{ label: "Full payment", amount: sub }];
  if (days !== undefined && days <= PAYMENT_SCHEDULE.finalDueDaysBefore) return full();

  const late = days !== undefined && days < PAYMENT_SCHEDULE.secondDueDaysBefore;
  const firstShare = late ? PAYMENT_SCHEDULE.lateFirstShare : PAYMENT_SCHEDULE.firstShare;
  const first = Math.min(sub, Math.max(PAYMENT_SCHEDULE.min, shareOf(sub, firstShare)));
  if (first >= sub) return full();
  const firstStage: PaymentStage = { label: `${Math.round(firstShare * 100)}% deposit`, amount: first };

  if (late) {
    return [
      firstStage,
      { label: "Balance", amount: cents(sub - first), dueDate: eventDate ? addDaysIso(eventDate, -PAYMENT_SCHEDULE.finalDueDaysBefore) : undefined },
    ];
  }
  const second = Math.min(cents(sub - first), shareOf(sub, PAYMENT_SCHEDULE.secondShare));
  const secondStage: PaymentStage = {
    label: `${Math.round(PAYMENT_SCHEDULE.secondShare * 100)}% installment`,
    amount: second,
    dueDate: eventDate ? addDaysIso(eventDate, -PAYMENT_SCHEDULE.secondDueDaysBefore) : undefined,
  };
  const final = cents(sub - first - second);
  if (final <= 0) return [firstStage, secondStage];
  return [
    firstStage,
    secondStage,
    { label: "Balance", amount: final, dueDate: eventDate ? addDaysIso(eventDate, -PAYMENT_SCHEDULE.finalDueDaysBefore) : undefined },
  ];
}

/** What's due right now to book an order with this rental subtotal. Never more than the subtotal. */
export function depositFor(subtotal: number, eventDate?: string, today?: Date): number {
  return paymentPlanFor(subtotal, eventDate, today)[0]?.amount ?? 0;
}

// Generic label for marketing copy that doesn't know a specific event's date: the normal (more than
// secondDueDaysBefore days out) first-stage share.
export const DEPOSIT_LABEL = `${Math.round(PAYMENT_SCHEDULE.firstShare * 100)}% deposit`;

// Our prices end on clean amounts, like a shop's own price list: the supplier's rate plus MARKUP,
// rounded UP (so the markup is never under MARKUP) to $0.25 under $10, $1 under $100, $5 from $100.
export function roundPrice(n: number) {
  if (n <= 0) return 0;
  const step = n < 10 ? 0.25 : n < 100 ? 1 : 5;
  return cents(Math.ceil(n / step - 1e-7) * step);
}

export function customerPrice(item: Pick<CatalogItem, "vendorPrice">) {
  return roundPrice(item.vendorPrice * (1 + MARKUP));
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
  unit_price: number; // what the customer pays per unit (vendor price; MARKUP is 0)
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
