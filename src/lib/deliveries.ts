import { locations } from "@/data/geo";
import { vendors } from "@/data/vendors";
import { addDays } from "./admin-view";
import { isPartConfirmed, vendorParts, type PartState } from "./orders";
import type { Lead } from "./store";

// Deliveries and pickups worked out from booked orders. Each rental partner's part of an order is one
// delivery (on its delivery date, else the event day) and one pickup (its pickup date, else the day after).
// Powers /admin/deliveries: the day sheet, the two-week view and the map.

export type Stop = {
  id: string;
  kind: "delivery" | "pickup";
  day: string; // YYYY-MM-DD
  window?: string;
  lead: Lead;
  vendorId: string;
  vendorName: string;
  items: number; // pieces on this stop
  lines: number;
  state: PartState;
  confirmed: boolean;
  address: string;
  point?: { lat: number; lng: number }; // approximate, from the city
};

const cityPoint = new Map(locations.filter((l) => l.kind !== "county").map((l) => [l.name.toLowerCase(), { lat: l.lat, lng: l.lng }]));
export const pointFor = (city?: string) => (city ? cityPoint.get(city.trim().toLowerCase()) : undefined);
export const vendorPoint = (vendorId: string) => pointFor(vendors.find((v) => v.id === vendorId)?.city);

// Orders that are really happening: fee paid or a rental partner has it.
const isLive = (l: Lead) =>
  l.kind !== "partner" && !["lost", "future_season"].includes(l.status ?? "new") && (l.fee_status === "paid" || ["booked", "vendor_confirmed", "completed"].includes(l.status ?? ""));

export function buildStops(leads: Lead[]): Stop[] {
  const out: Stop[] = [];
  for (const l of leads) {
    if (!isLive(l) || !l.event_date) continue;
    const address = [l.venue, l.city].filter(Boolean).join(", ");
    for (const part of vendorParts(l)) {
      if (part.state === "cancelled") continue;
      const o = part.order;
      const base = {
        lead: l,
        vendorId: part.vendorId,
        vendorName: part.vendorName,
        items: part.lines.reduce((s, { line }) => s + line.qty, 0),
        lines: part.lines.length,
        state: part.state,
        confirmed: isPartConfirmed(part.state),
        address,
        point: pointFor(l.city),
      };
      out.push({ ...base, id: `${l.id}-${part.vendorId}-d`, kind: "delivery", day: o?.delivery_date || l.event_date, window: o?.delivery_window });
      out.push({ ...base, id: `${l.id}-${part.vendorId}-p`, kind: "pickup", day: o?.pickup_date || addDays(l.event_date, 1), window: o?.pickup_window });
    }
  }
  // Morning windows first; stops with no window go last.
  return out.sort((a, b) => a.day.localeCompare(b.day) || windowRank(a.window) - windowRank(b.window) || a.vendorName.localeCompare(b.vendorName));
}

// "8–10 AM" -> 8, "1–3 PM" -> 13, unknown -> 99. Good enough to put morning stops first.
export function windowRank(w?: string) {
  const m = w?.match(/\d{1,2}/);
  if (!m) return 99;
  const h = Number(m[0]) % 12;
  return /pm/i.test(w!) && !/am/i.test(w!) ? h + 12 : h;
}

export type DaySummary = { day: string; deliveries: number; pickups: number; vendors: number; unconfirmed: number; pieces: number };

export function summarizeDays(stops: Stop[], from: string, days: number): DaySummary[] {
  return Array.from({ length: days }, (_, i) => {
    const day = addDays(from, i);
    const s = stops.filter((x) => x.day === day);
    return {
      day,
      deliveries: s.filter((x) => x.kind === "delivery").length,
      pickups: s.filter((x) => x.kind === "pickup").length,
      vendors: new Set(s.map((x) => x.vendorId)).size,
      unconfirmed: s.filter((x) => !x.confirmed).length,
      pieces: s.reduce((t, x) => t + x.items, 0),
    };
  });
}

// One Google Maps route for a rental partner's day: from their yard through each stop, in window order.
export function routeUrl(vendorId: string, stops: Stop[]) {
  const v = vendors.find((x) => x.id === vendorId);
  const places = stops.map((s) => (s.address ? `${s.address}, IL` : "")).filter(Boolean);
  if (!places.length) return undefined;
  const origin = v?.address ?? (v?.city ? `${v.city}, IL` : places[0]);
  const destination = places[places.length - 1];
  const waypoints = places.slice(0, -1).join("|");
  const q = new URLSearchParams({ api: "1", origin, destination, travelmode: "driving" });
  if (waypoints) q.set("waypoints", waypoints);
  return `https://www.google.com/maps/dir/?${q.toString()}`;
}
