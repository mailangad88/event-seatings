import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, Empty, Panel, Table, Tile } from "@/components/admin/AdminUi";
import { planTodaysReminders, remindersSwitchedOn } from "@/lib/reminder-run";
import { reminderKinds, reminderLabels } from "@/lib/reminders";
import { saveReminderSettings } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reminder emails", robots: { index: false } };

const skipLabels: Record<string, string> = {
  unsubscribed: "Unsubscribed",
  spam: "Held as spam",
  "reminder in the last 3 days": "Got a reminder in the last 3 days",
  "follow-up in the last 2 days": "Got a follow-up in the last 2 days",
  "booked, done or lost": "Booked, done or lost",
  "nothing due": "Nothing to remind them about yet",
};

const what: Record<string, string> = {
  unfinished_quote: "They built a list in the quote builder 20 hours to 7 days ago and didn't send it. The email links back to the same list.",
  viewed_item: "They opened the same rental item 2 or more times (or 3 different items) this week without asking about it.",
  event_soon: "They asked for a quote or a call, their date is 10 to 45 days away, and the lead isn't booked.",
};

export default async function RemindersPage() {
  const plan = await planTodaysReminders();
  const { settings } = plan;
  const sending = remindersSwitchedOn();

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Grow"
        title="Reminder emails"
        intro="After someone sends a form, the site notes what they look at and click next (unless they said no in the cookie notice). Once a day it can send one short reminder, with an offer if you want one."
        actions={<Link href="/admin/followups" className="btn-ghost btn-sm">Follow-up emails</Link>}
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Tile tone="green" label="Automatic sending" value={sending ? "On" : "Off"} note={sending ? "Runs once a day" : "Needs REMINDERS_ENABLED=true and email set up"} href="/admin/settings" alert={!sending} />
        <Tile tone="blue" label="Due today" value={plan.send.length} note={sending ? "Goes out in the next daily run" : "Would go out if sending were on"} />
        <Tile tone="gold" label="Offer" value={settings.offer.enabled ? `${settings.offer.percent}% off fee` : "None"} note={settings.offer.enabled ? `Good for ${settings.offer.days} days` : "Add one below"} />
      </div>

      <Panel title="Due today" className="mt-8">
        {plan.send.length === 0 ? (
          <Empty>No reminders due right now.</Empty>
        ) : (
          <Table head={["Person", "Reminder", "Subject", "Offer"]} min={640}>
            {plan.send.map((r) => (
              <tr key={r.lead.id}>
                <td><Link href={`/admin/leads/${r.lead.id}`} className="text-accent">{r.lead.name || r.lead.email}</Link></td>
                <td className="whitespace-nowrap">{reminderLabels[r.kind]}</td>
                <td>
                  <details>
                    <summary className="cursor-pointer">{r.subject}</summary>
                    <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-muted">{r.body.join("\n")}</pre>
                  </details>
                </td>
                <td className="whitespace-nowrap">{r.offer ?? "None"}</td>
              </tr>
            ))}
          </Table>
        )}
        {Object.keys(plan.skipped).length > 0 && (
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-muted">Why others from the last 60 days get nothing today</summary>
            <ul className="mt-2 space-y-1">
              {Object.entries(plan.skipped).sort((a, b) => b[1] - a[1]).map(([k, n]) => (
                <li key={k} className="flex justify-between gap-4"><span>{skipLabels[k] ?? k}</span><span className="tabular-nums">{n}</span></li>
              ))}
            </ul>
          </details>
        )}
      </Panel>

      <Panel title="Settings" className="mt-6">
        <form action={saveReminderSettings} className="grid gap-5">
          <fieldset className="grid gap-3">
            <legend className="label">Which reminders to send</legend>
            {reminderKinds.map((k) => (
              <label key={k} className="flex items-start gap-3 text-sm">
                <input type="checkbox" name={`on_${k}`} defaultChecked={settings.enabled[k]} className="mt-1" />
                <span><span className="font-medium text-ink">{reminderLabels[k]}.</span> {what[k]}</span>
              </label>
            ))}
          </fieldset>

          <fieldset className="grid gap-3 rounded-xl border border-line p-4">
            <legend className="label px-1">Offer (optional)</legend>
            <p className="text-sm text-muted">
              Comes off our booking fee only, never the rental company&apos;s prices. It&apos;s written on the lead when it goes out, so you
              know to take it off their proposal.
            </p>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="offer_on" defaultChecked={settings.offer.enabled} /> Add an offer to reminders
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="offer_percent">Percent off our booking fee</label>
                <input id="offer_percent" name="offer_percent" type="number" min={5} max={100} step={5} defaultValue={settings.offer.percent} className="field" />
              </div>
              <div>
                <label className="label" htmlFor="offer_days">Good for (days)</label>
                <input id="offer_days" name="offer_days" type="number" min={1} max={30} defaultValue={settings.offer.days} className="field" />
              </div>
            </div>
            <div className="grid gap-2">
              <span className="label">Add it to</span>
              {reminderKinds.map((k) => (
                <label key={k} className="flex items-center gap-3 text-sm">
                  <input type="checkbox" name={`offer_${k}`} defaultChecked={settings.offer.kinds.includes(k)} /> {reminderLabels[k]}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <button type="submit" className="btn-primary">Save reminder settings</button>
          </div>
        </form>
      </Panel>

      <section className="mt-6 text-sm text-muted">
        <h2 className="display-3 text-ink">Rules that always apply</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Only people who sent us a form with their email, and only if they didn&apos;t say no to tracking in the cookie notice.</li>
          <li>The list and item reminders also need the &quot;email me planning tips&quot; box ticked.</li>
          <li>Each reminder goes to a person once. Nobody gets one within 3 days of another reminder or 2 days of a follow-up.</li>
          <li>Never sent to anyone who unsubscribed, or once a lead is booked, done or lost.</li>
          <li>Each one is written on the lead&apos;s timeline, with any offer.</li>
        </ul>
      </section>
    </div>
  );
}
