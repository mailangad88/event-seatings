import type { Lead, LeadStatus } from "./store";
import { stage } from "./admin-view";

// The customer pipeline board behind /admin/pipeline: which stages get a column, how long a customer has sat in
// their stage, and when that is too long. Pure functions only, so the board and the Today page can share them.

// Stages that get a column on the board, in order.
export const boardStages = ["new", "contacted", "consult_booked", "quote_sent", "vendor_confirmed", "booked"] as const satisfies readonly LeadStatus[];
// Stages shown as small counts under the board.
export const closedStages = ["completed", "future_season", "lost"] as const satisfies readonly LeadStatus[];

// Move back / Move forward walk this order. Booked moves forward to Completed.
const moveOrder: readonly LeadStatus[] = [...boardStages, "completed"];

// Days a customer can sit in a stage before the card gets a warning. Stages not listed never warn.
export const stageLimits: Partial<Record<LeadStatus, number>> = {
  new: 1,
  contacted: 4,
  consult_booked: 7,
  quote_sent: 5,
  vendor_confirmed: 14,
};

// When the customer entered their current stage: the last stage change on the timeline, else when they wrote in.
export function stageSince(l: Lead): string {
  const last = [...(l.activity ?? [])].reverse().find((a) => a.type === "status");
  return last?.at ?? l.created_at;
}

export const daysInStage = (l: Lead, now = Date.now()) => Math.max(0, Math.floor((now - new Date(stageSince(l)).getTime()) / 864e5));

export function isStale(l: Lead, now = Date.now()) {
  const limit = stageLimits[stage(l)];
  return limit !== undefined && daysInStage(l, now) > limit;
}

export function nextStage(s: LeadStatus): LeadStatus | undefined {
  const i = moveOrder.indexOf(s);
  return i >= 0 && i < moveOrder.length - 1 ? moveOrder[i + 1] : undefined;
}

export function prevStage(s: LeadStatus): LeadStatus | undefined {
  const i = moveOrder.indexOf(s);
  return i > 0 ? moveOrder[i - 1] : undefined;
}

// YYYY-MM of the event, or "" when there is no date yet.
export const eventMonth = (l: Lead) => l.event_date?.slice(0, 7) ?? "";

export type BoardCard = { lead: Lead; days: number; stale: boolean };
export type BoardColumn = { id: LeadStatus; cards: BoardCard[]; count: number; value: number };
export type Board = {
  columns: BoardColumn[];
  closed: { id: LeadStatus; leads: Lead[] }[];
  months: string[]; // every event month on the board, for the filter
  staleCount: number;
};

// Builds the board. month = "YYYY-MM" or "none" (no event date yet); q matches name, email or phone.
export function buildBoard(leads: Lead[], { month = "", q = "", now = Date.now() }: { month?: string; q?: string; now?: number } = {}): Board {
  const customers = leads.filter((l) => l.kind !== "partner");
  const months = [...new Set(customers.map(eventMonth).filter(Boolean))].sort();
  const needle = q.trim().toLowerCase();
  const shown = customers.filter(
    (l) =>
      (!month || (month === "none" ? !l.event_date : eventMonth(l) === month)) &&
      (!needle || [l.name, l.email, l.phone].some((v) => v?.toLowerCase().includes(needle))),
  );

  const columns = boardStages.map((id) => {
    const cards = shown
      .filter((l) => stage(l) === id)
      .map((lead) => ({ lead, days: daysInStage(lead, now), stale: isStale(lead, now) }))
      // Longest wait first, so the cards that need a push sit at the top.
      .sort((a, b) => b.days - a.days);
    return { id, cards, count: cards.length, value: cards.reduce((s, c) => s + (c.lead.quote_subtotal ?? 0), 0) };
  });
  const closed = closedStages.map((id) => ({ id, leads: shown.filter((l) => stage(l) === id) }));
  return { columns, closed, months, staleCount: columns.reduce((s, c) => s + c.cards.filter((x) => x.stale).length, 0) };
}
