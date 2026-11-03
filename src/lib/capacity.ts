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
export const LIMITED_AT = 0.6;

export type DayLoad = {
  confirmed: Lead[]; // events a rental partner has, or that are paid
  pending: Lead[]; // requests and quotes for that date that aren't booked yet
  guests: number; // guests on confirmed events
  share: number; // 0..1+, the larger of events and guests against the limits
  level: "open" | "limited" | "full";
};

export function dayLoad(leads: Lead[]): DayLoad {
  const live = leads.filter((l) => !["lost", "future_season"].includes(stage(l)));
  const confirmed = live.filter((l) => isConfirmed(l) || l.fee_status === "paid");
  const pending = live.filter((l) => !confirmed.includes(l));
  const guests = confirmed.reduce((s, l) => s + (l.guest_count ?? 0), 0);
  const share = Math.max(confirmed.length / eventsPerDay(), guests / guestsPerDay());
  return { confirmed, pending, guests, share, level: share >= 1 ? "full" : share >= LIMITED_AT ? "limited" : "open" };
}
