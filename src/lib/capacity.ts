import type { Lead } from "./store";
import { isConfirmed, stage } from "./admin-view";

// How much we can take on in one day. We don't own stock: the rental companies do. So the limit is how many
// events we can coordinate in a day, and roughly how many guests the partners we use can cover between them.
// Change with EVENTS_PER_DAY and GUESTS_PER_DAY in Vercel; the defaults are a cautious start.
const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};
export const eventsPerDay = () => num(process.env.EVENTS_PER_DAY, 4);
export const guestsPerDay = () => num(process.env.GUESTS_PER_DAY, 600);

// The calendar shades each day from quiet to full as its share of the day's capacity climbs.
// Change the breakpoints with these env vars in Vercel; defaults are a cautious start.
export const LIGHT_AT = () => num(process.env.CAL_LIGHT_AT, 0.2);
export const MODERATE_AT = () => num(process.env.CAL_MODERATE_AT, 0.4);
export const BUSY_AT = () => num(process.env.CAL_BUSY_AT, 0.6);
export const LIMITED_AT = () => num(process.env.CAL_LIMITED_AT, 0.8);
// "full" is always share >= 1 (at or past the day's capacity).

export type LoadLevel = "open" | "light" | "moderate" | "busy" | "limited" | "full";

export type DayLoad = {
  confirmed: Lead[]; // events a rental partner has, or that are paid
  pending: Lead[]; // requests and quotes for that date that aren't booked yet
  guests: number; // guests on confirmed events
  share: number; // 0..1+, the larger of events and guests against the limits
  level: LoadLevel;
};

function loadLevel(share: number): LoadLevel {
  if (share >= 1) return "full";
  if (share >= LIMITED_AT()) return "limited";
  if (share >= BUSY_AT()) return "busy";
  if (share >= MODERATE_AT()) return "moderate";
  if (share >= LIGHT_AT()) return "light";
  return "open";
}

export function dayLoad(leads: Lead[]): DayLoad {
  const live = leads.filter((l) => !["lost", "future_season"].includes(stage(l)));
  const confirmed = live.filter((l) => isConfirmed(l) || l.fee_status === "paid");
  const pending = live.filter((l) => !confirmed.includes(l));
  const guests = confirmed.reduce((s, l) => s + (l.guest_count ?? 0), 0);
  const share = Math.max(confirmed.length / eventsPerDay(), guests / guestsPerDay());
  return { confirmed, pending, guests, share, level: loadLevel(share) };
}
