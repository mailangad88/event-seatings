import type { Lead } from "./store";

// Small date and money helpers shared by the /admin pages. All days are Chicago days (YYYY-MM-DD).

export const TZ = "America/Chicago";
export const chicagoDay = (d: Date | string = new Date()) => new Date(d).toLocaleDateString("en-CA", { timeZone: TZ });
export const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T12:00:00Z`) + n * 864e5).toISOString().slice(0, 10);

export const prettyDay = (d?: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) =>
  d ? new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", opts) : "";

export const ago = (iso?: string) => {
  if (!iso) return "";
  const h = (Date.now() - new Date(iso).getTime()) / 36e5;
  return h < 1 ? `${Math.max(1, Math.round(h * 60))} min ago` : h < 48 ? `${Math.round(h)} h ago` : `${Math.round(h / 24)} days ago`;
};

export const money0 = (n = 0) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const money2 = (n = 0) => n.toLocaleString("en-US", { style: "currency", currency: "USD" });

// Stages that mean the event is happening (a rental partner has it, or it already took place).
export const confirmedStatuses = ["vendor_confirmed", "booked", "completed"] as const;
export const isConfirmed = (l: Lead) => (confirmedStatuses as readonly string[]).includes(l.status ?? "new");
export const isClosed = (l: Lead) => ["completed", "lost"].includes(l.status ?? "new");
export const stage = (l: Lead) => l.status ?? "new";

// One line about the event, for lists: "Wedding · 120 guests · Naperville".
export const eventLine = (l: Lead) =>
  [l.event_type, l.guest_count && `${l.guest_count} guests`, l.city].filter(Boolean).join(" · ");

// ISO timestamp n days ago (kept out of components so render code stays pure).
export const isoDaysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString();
