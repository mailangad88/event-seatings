import "server-only";
import { catalogItems } from "@/data/catalog";
import type { ActivityEvent } from "./activity";
import { cleanReminderSettings, planReminders, REMINDER_SETTINGS_KEY, type ReminderPlan, type ReminderSettings } from "./reminders";
import { site } from "./site";
import { getSetting, getVisitorActivity, listLeadsSince } from "./store";

// Loads what the reminder rules need (last 60 days of leads, their visitors' activity, the settings) and plans
// today's reminders. Used by the daily job and the /admin/reminders preview.

export const remindersSwitchedOn = () =>
  process.env.REMINDERS_ENABLED === "true" && !!process.env.RESEND_API_KEY && !!process.env.NOTIFY_FROM;

export async function reminderSettings(): Promise<ReminderSettings> {
  return cleanReminderSettings(await getSetting(REMINDER_SETTINGS_KEY).catch(() => undefined));
}

const names = new Map(catalogItems.map((i) => [i.id, i.name]));

export async function planTodaysReminders(now = new Date()): Promise<ReminderPlan & { settings: ReminderSettings }> {
  const [leads, settings] = await Promise.all([listLeadsSince(new Date(now.getTime() - 60 * 864e5).toISOString()), reminderSettings()]);
  const visitors = [...new Set(leads.map((l) => l.visitor_id).filter((v): v is string => !!v))];
  const activity = new Map<string, ActivityEvent[]>();
  for (let i = 0; i < visitors.length; i += 8) {
    const batch = visitors.slice(i, i + 8);
    const rows = await Promise.all(batch.map((v) => getVisitorActivity(v).catch(() => [] as ActivityEvent[])));
    batch.forEach((v, j) => activity.set(v, rows[j]));
  }
  const plan = planReminders(leads, activity, { now, siteUrl: site.url, settings, itemName: (id) => names.get(id) });
  return { ...plan, settings };
}
