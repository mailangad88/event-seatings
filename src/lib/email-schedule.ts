import "server-only";
import { addDays, chicagoDay } from "./admin-view";
import { allTasks, type EventTask } from "./event-tasks";
import { nextStep, sequenceFor } from "./followups";
import type { Lead, VendorPartner } from "./store";

// The automated email schedule behind /admin/scheduled and the "N emails go out today" line on Today:
// every event email (lib/event-tasks.ts, sent by /api/cron/event-emails) and every follow-up email
// (lib/followups.ts, sent by /api/cron/followups) due in the next few days, and whether it will go out by
// itself or is only a draft. The checks mirror the two cron routes.

export type ScheduledEmail = {
  id: string; // unique per row: lead id + task key or follow-up step
  source: "event" | "followup";
  lead: Lead;
  day: string; // YYYY-MM-DD the email goes out (or is due as a draft)
  to?: string;
  audience: "customer" | "vendor";
  subject: string;
  body: string;
  auto: boolean; // true = the daily run will send it
  why?: string; // why it won't send by itself
  task?: EventTask; // event emails only: tick task.key in tasks_done to skip it
  step?: number; // follow-ups only: 1-based step number
};

export type EmailSwitches = {
  event: boolean; // EVENT_EMAILS_ENABLED + RESEND_API_KEY + NOTIFY_FROM
  followups: boolean; // FOLLOWUPS_ENABLED + RESEND_API_KEY + NOTIFY_FROM
  resend: boolean;
  from: boolean;
  eventFlag: boolean;
  followupFlag: boolean;
};

export function emailSwitches(env: Record<string, string | undefined> = process.env): EmailSwitches {
  const resend = !!env.RESEND_API_KEY;
  const from = !!env.NOTIFY_FROM;
  const eventFlag = env.EVENT_EMAILS_ENABLED === "true";
  const followupFlag = env.FOLLOWUPS_ENABLED === "true";
  return { event: eventFlag && resend && from, followups: followupFlag && resend && from, resend, from, eventFlag, followupFlag };
}

// The follow-up cron runs at 15:00 UTC (vercel.json) and looks at leads from the last 16 days.
const FOLLOWUP_RUN = "T15:00:00Z";

// Every scheduled email from `today` through `today + days - 1`, sorted by day.
// Event emails due yesterday are listed on today: the event-email run still sends those.
export function scheduledEmails(leads: Lead[], partners: VendorPartner[], today: string, days = 14, switches: EmailSwitches = emailSwitches()): ScheduledEmail[] {
  const last = addDays(today, days - 1);
  const optedOut = new Set(leads.filter((l) => l.opted_out_at).map((l) => l.email.toLowerCase()));
  const out: ScheduledEmail[] = [];

  for (const t of allTasks(leads, partners, today)) {
    if (!t.email || t.due < addDays(today, -1) || t.due > last) continue;
    const to = t.email.to;
    const unsubscribed = t.who !== "vendor" && !!to && optedOut.has(to.toLowerCase());
    const why = !to ? (t.who === "vendor" ? "No email for this rental partner on Vendors" : "No email address") : unsubscribed ? "Unsubscribed" : !switches.event ? "Event emails are off" : undefined;
    out.push({
      id: `${t.lead.id}:${t.key}`,
      source: "event",
      lead: t.lead,
      day: t.due < today ? today : t.due,
      to,
      audience: t.who === "vendor" ? "vendor" : "customer",
      subject: t.email.subject,
      body: t.email.body,
      auto: !why,
      why,
      task: t,
    });
  }

  // Follow-ups: play the daily run forward day by day, using the same rules the cron uses (nextStep).
  const since = (d: string) => new Date(Date.parse(`${d}${FOLLOWUP_RUN}`) - 16 * 864e5).toISOString();
  for (const lead of leads) {
    const seq = sequenceFor(lead);
    if (!seq || lead.created_at < since(today)) continue;
    let step = lead.followup_step ?? 0;
    let lastAt = lead.followup_last_at;
    for (let d = today; d <= last && step < seq.steps.length; d = addDays(d, 1)) {
      if (lead.created_at < since(d)) break;
      const now = new Date(`${d}${FOLLOWUP_RUN}`);
      const next = nextStep({ ...lead, followup_step: step, followup_last_at: lastAt }, leads, now);
      if ("skip" in next) {
        if (next.skip === "not due" || next.skip === "sent recently") continue;
        break;
      }
      const subject = next.step.subject(lead);
      out.push({
        id: `${lead.id}:followup-${next.index + 1}`,
        source: "followup",
        lead,
        day: chicagoDay(now),
        to: lead.email,
        audience: "customer",
        subject,
        body: next.step.body(lead).join("\n"),
        auto: switches.followups,
        why: switches.followups ? undefined : "Follow-up emails are off",
        step: next.index + 1,
      });
      step = next.index + 1;
      lastAt = now.toISOString();
    }
  }

  return out.sort((a, b) => a.day.localeCompare(b.day) || a.source.localeCompare(b.source) || a.subject.localeCompare(b.subject));
}

// For the Today page: how many emails are set to go out by themselves today, and how many are drafts.
export function emailsToday(leads: Lead[], partners: VendorPartner[], today: string) {
  const list = scheduledEmails(leads, partners, today, 1);
  return { auto: list.filter((e) => e.auto).length, drafts: list.filter((e) => !e.auto).length, list };
}
