// Reminder emails built from what a known visitor did after sending us a form (lib/activity.ts).
// The daily job (/api/cron/reminders) sends them; /admin/reminders shows what would go out today and holds the
// settings, including an optional offer. Pure functions here, so the rules are easy to test.
//
// Three reminders, each at most once per person:
// - unfinished_quote: they built a list in the quote builder and didn't send it (20 hours to 7 days ago).
// - viewed_item: they keep coming back to the same rental item (2+ views, or 3+ items) without asking about it.
// - event_soon: they asked for a quote or a call, their date is 10 to 45 days away and nothing is booked yet.
//
// Never sent to: anyone who unsubscribed; for the first two, anyone who didn't tick the email tips box; anyone who
// got a reminder in the last 3 days or a follow-up in the last 2; leads that are booked, done or lost.

import type { ActivityEvent } from "./activity";
import type { Lead } from "./store";

export const reminderKinds = ["unfinished_quote", "viewed_item", "event_soon"] as const;
export type ReminderKind = (typeof reminderKinds)[number];

export const reminderLabels: Record<ReminderKind, string> = {
  unfinished_quote: "Unfinished quote list",
  viewed_item: "Kept looking at an item",
  event_soon: "Event date coming up, nothing booked",
};

export type ReminderSettings = {
  enabled: Record<ReminderKind, boolean>;
  // Optional offer: a share off the rentals subtotal, good for `days` days.
  offer: { enabled: boolean; percent: number; days: number; kinds: ReminderKind[] };
};

export const defaultReminderSettings: ReminderSettings = {
  enabled: { unfinished_quote: true, viewed_item: true, event_soon: true },
  offer: { enabled: false, percent: 5, days: 7, kinds: ["unfinished_quote"] },
};

export const REMINDER_SETTINGS_KEY = "reminders";

// Fills gaps from the defaults and keeps numbers in range, whatever was stored.
export function cleanReminderSettings(raw: unknown): ReminderSettings {
  const r = (raw ?? {}) as Partial<ReminderSettings>;
  const enabled = { ...defaultReminderSettings.enabled };
  for (const k of reminderKinds) if (typeof r.enabled?.[k] === "boolean") enabled[k] = r.enabled[k];
  const o: Partial<ReminderSettings["offer"]> = r.offer ?? {};
  const num = (v: unknown, min: number, max: number, d: number) => (Number.isFinite(Number(v)) ? Math.min(max, Math.max(min, Math.round(Number(v)))) : d);
  return {
    enabled,
    offer: {
      enabled: o.enabled === true,
      percent: num(o.percent, 1, 10, defaultReminderSettings.offer.percent), // capped: our margin is MARKUP (15%)
      days: num(o.days, 1, 30, defaultReminderSettings.offer.days),
      kinds: Array.isArray(o.kinds) ? reminderKinds.filter((k) => o.kinds!.includes(k)) : defaultReminderSettings.offer.kinds,
    },
  };
}

export type ReminderContext = {
  now: Date;
  siteUrl: string;
  settings: ReminderSettings;
  // Catalog item name for an id, for the email text.
  itemName: (id: string) => string | undefined;
};

export type PlannedReminder = {
  lead: Lead; // the person's newest lead; the reminder is logged on it
  kind: ReminderKind;
  subject: string;
  body: string[];
  offer?: string; // e.g. "5% off your rentals until Nov 20", logged on the lead so it's honoured
};

export type ReminderPlan = { send: PlannedReminder[]; skipped: Record<string, number> };

const DAY = 864e5;
const HOUR = 36e5;
const closed = new Set(["booked", "vendor_confirmed", "completed", "lost", "future_season"]);
const asked = (l: Lead) => l.kind === "quote" || l.kind === "call";
const sentPrefix = "Reminder sent: ";

const prettyDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/Chicago" });
const eventDate = (d: string) =>
  new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
const itemPath = /^\/rentals\/([a-z0-9-]+)\/([a-z0-9-]+)$/;
const cleanTitle = (t?: string) => t?.split(/ [|·–-] /)[0]?.trim();

function offerFor(kind: ReminderKind, ctx: ReminderContext) {
  const o = ctx.settings.offer;
  if (!o.enabled || !o.kinds.includes(kind)) return undefined;
  const until = prettyDate(new Date(ctx.now.getTime() + o.days * DAY));
  return {
    label: `${o.percent}% off your rentals until ${until}`,
    line: `Book by ${until} and we'll take ${o.percent}% off your rentals.`,
  };
}

/** Works out which reminder (if any) each person gets today. `activity` maps visitor id to their events. */
export function planReminders(leads: Lead[], activity: Map<string, ActivityEvent[]>, ctx: ReminderContext): ReminderPlan {
  const plan: ReminderPlan = { send: [], skipped: {} };
  const skip = (why: string) => (plan.skipped[why] = (plan.skipped[why] ?? 0) + 1);
  const now = ctx.now.getTime();

  const byEmail = new Map<string, Lead[]>();
  for (const l of leads) {
    if (l.kind === "partner" || !l.email) continue;
    const k = l.email.trim().toLowerCase();
    byEmail.set(k, [...(byEmail.get(k) ?? []), l]);
  }

  for (const group of byEmail.values()) {
    group.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const latest = group[0];
    if (group.some((l) => l.opted_out_at)) {
      skip("unsubscribed");
      continue;
    }
    if (group.every((l) => (l.lost_reason ?? "").startsWith("Spam check"))) {
      skip("spam");
      continue;
    }
    const log = group.flatMap((l) => l.activity ?? []).filter((a) => a.type === "email" && a.text.startsWith(sentPrefix));
    const sentKinds = new Set(log.map((a) => a.text.slice(sentPrefix.length).split(" ")[0]));
    if (log.some((a) => now - Date.parse(a.at) < 3 * DAY)) {
      skip("reminder in the last 3 days");
      continue;
    }
    if (group.some((l) => l.followup_last_at && now - Date.parse(l.followup_last_at) < 2 * DAY)) {
      skip("follow-up in the last 2 days");
      continue;
    }
    if (closed.has(latest.status ?? "new")) {
      skip("booked, done or lost");
      continue;
    }
    const lastAsk = group.find(asked);
    const lastAskAt = lastAsk ? Date.parse(lastAsk.created_at) : 0;
    const consent = group.some((l) => l.email_consent);
    const events = group
      .flatMap((l) => (l.visitor_id ? (activity.get(l.visitor_id) ?? []) : []))
      .filter((e) => Date.parse(e.at) > lastAskAt)
      .sort((a, b) => a.at.localeCompare(b.at));

    const pick = (): Omit<PlannedReminder, "lead" | "offer"> | undefined => {
      const allow = (k: ReminderKind) => ctx.settings.enabled[k] && !sentKinds.has(k);

      // 1. An unfinished quote list.
      if (allow("unfinished_quote") && consent) {
        const lists = events.filter((e): e is Extract<ActivityEvent, { t: "quote_list" }> => e.t === "quote_list");
        const last = lists.at(-1);
        const age = last ? now - Date.parse(last.at) : 0;
        if (last?.items.length && age >= 20 * HOUR && age <= 7 * DAY) {
          const names = last.items.map(ctx.itemName).filter(Boolean).slice(0, 5) as string[];
          const link = `${ctx.siteUrl}/quote?items=${last.items.join(",")}&from=reminder`;
          return {
            kind: "unfinished_quote",
            subject: "Your rental list is saved",
            body: [
              "Hi,",
              "",
              `You started a rental list on our site${names.length ? `: ${names.join(", ")}${last.items.length > names.length ? " and more" : ""}` : ""}. It's saved here, ready to finish:`,
              link,
              "",
              "Add your date and guest count and send it. We'll check your date and send one itemized quote, usually within one business day. Nothing is charged until you approve it.",
            ],
          };
        }
      }

      // 2. Kept looking at the same item.
      if (allow("viewed_item") && consent) {
        const views = events.filter((e): e is Extract<ActivityEvent, { t: "page" }> => e.t === "page" && itemPath.test(e.path) && now - Date.parse(e.at) <= 7 * DAY);
        const counts = new Map<string, { n: number; last: number; title?: string }>();
        for (const v of views) {
          const c = counts.get(v.path) ?? { n: 0, last: 0 };
          counts.set(v.path, { n: c.n + 1, last: Math.max(c.last, Date.parse(v.at)), title: cleanTitle(v.title) ?? c.title });
        }
        const top = [...counts.entries()].sort((a, b) => b[1].n - a[1].n || b[1].last - a[1].last)[0];
        const lastView = Math.max(0, ...[...counts.values()].map((c) => c.last));
        if (top && (top[1].n >= 2 || counts.size >= 3) && now - lastView >= 20 * HOUR) {
          const id = top[0].match(itemPath)![2];
          const name = ctx.itemName(id) ?? top[1].title ?? "that rental";
          return {
            kind: "viewed_item",
            subject: `Still thinking about the ${name.toLowerCase()}?`,
            body: [
              "Hi,",
              "",
              `You looked at the ${name.toLowerCase()} a few times this week, so here it is again with prices: ${ctx.siteUrl}${top[0]}`,
              "",
              `Want a price for your date? This puts it on a quote list for you: ${ctx.siteUrl}/quote?items=${id}&from=reminder`,
              "",
              "Or just reply with your date, guest count and venue, and we'll check it for you.",
            ],
          };
        }
      }

      // 3. Their event is close and nothing is booked.
      if (allow("event_soon") && lastAsk?.event_date && ["new", "contacted", "consult_booked", "quote_sent"].includes(lastAsk.status ?? "new")) {
        const days = Math.round((Date.parse(`${lastAsk.event_date}T12:00:00Z`) - now) / DAY);
        if (days >= 10 && days <= 45) {
          const weeks = Math.round(days / 7);
          return {
            kind: "event_soon",
            subject: `Your event is ${weeks >= 2 ? `${weeks} weeks` : `${days} days`} away`,
            body: [
              "Hi,",
              "",
              `Your event on ${eventDate(lastAsk.event_date)} is ${days} days away, and your rentals aren't booked yet.`,
              "",
              "Popular dates fill up, so it's worth booking soon. If you still need chairs, tables, linens or a tent, reply to this email or check your list here:",
              `${ctx.siteUrl}/quote`,
              "",
              "If you've already sorted it, no need to reply. We won't send this again.",
            ],
          };
        }
      }
      return undefined;
    };

    const chosen = pick();
    if (!chosen) {
      skip("nothing due");
      continue;
    }
    const offer = offerFor(chosen.kind, ctx);
    plan.send.push({
      ...chosen,
      lead: latest,
      body: offer ? [...chosen.body, "", offer.line] : chosen.body,
      offer: offer?.label,
    });
  }
  return plan;
}

export const reminderLogText = (r: PlannedReminder) => `${sentPrefix}${r.kind} ("${r.subject}")${r.offer ? ` · Offer: ${r.offer}` : ""}`;
