// What a visitor does on the site after they've sent us a form (so we know who they are): pages, clicks,
// their quote list and planner progress. Sent by lib/activity-client.ts only if they haven't said no to
// tracking, stored per visitor id (store.ts appendVisitorActivity), shown on the lead in /admin and used by
// the reminder emails (lib/reminders.ts).

export type ActivityEvent =
  | { t: "page"; at: string; path: string; title?: string }
  | { t: "click"; at: string; path: string; label: string; href?: string }
  // The quote builder list as it stands (item ids). An empty list means they cleared it.
  | { t: "quote_list"; at: string; path: string; items: string[] }
  // The step-by-step planner: which step they reached and the occasion they picked.
  | { t: "planner"; at: string; path: string; step: number; occasion?: string };

export const activityMaxEvents = 200;
export const activityMaxBatch = 40;

const iso = (v: unknown) => (typeof v === "string" && !Number.isNaN(Date.parse(v)) ? new Date(v).toISOString() : undefined);
const text = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : undefined);
const sitePath = (v: unknown) => {
  const p = text(v, 200);
  return p && /^\/[\w\-./%]*$/.test(p) && !p.startsWith("/admin") ? p : undefined;
};

// Cleans one batch from the browser. Anything malformed, from the future or older than a day is dropped.
export function parseActivity(raw: unknown, now = Date.now()): ActivityEvent[] {
  if (!Array.isArray(raw)) return [];
  const out: ActivityEvent[] = [];
  for (const r of raw.slice(0, activityMaxBatch)) {
    if (!r || typeof r !== "object") continue;
    const e = r as Record<string, unknown>;
    const at = iso(e.at);
    const path = sitePath(e.path);
    if (!at || !path) continue;
    const t = Date.parse(at);
    if (t > now + 5 * 60_000 || t < now - 864e5) continue;
    if (e.t === "page") out.push({ t: "page", at, path, title: text(e.title, 140) });
    else if (e.t === "click") {
      const label = text(e.label, 80);
      if (label) out.push({ t: "click", at, path, label, href: text(e.href, 200) });
    } else if (e.t === "quote_list" && Array.isArray(e.items)) {
      const items = e.items.filter((i): i is string => typeof i === "string" && /^[a-z0-9-]{1,80}$/.test(i)).slice(0, 100);
      out.push({ t: "quote_list", at, path, items });
    } else if (e.t === "planner") {
      const step = Number(e.step);
      if (Number.isInteger(step) && step >= 0 && step <= 20) out.push({ t: "planner", at, path, step, occasion: text(e.occasion, 60) });
    }
  }
  return out;
}

// Adds new events to what we have, oldest first, keeping the newest `activityMaxEvents`.
export function mergeActivity(existing: ActivityEvent[], incoming: ActivityEvent[]): ActivityEvent[] {
  const seen = new Set(existing.map((e) => `${e.t}|${e.at}|${e.path}`));
  const fresh = incoming.filter((e) => !seen.has(`${e.t}|${e.at}|${e.path}`));
  return [...existing, ...fresh].sort((a, b) => a.at.localeCompare(b.at)).slice(-activityMaxEvents);
}

export type VisitorActivity = { visitor_id: string; events: ActivityEvent[]; updated_at: string };

export const isVisitorId = (v: unknown): v is string => typeof v === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(v);
