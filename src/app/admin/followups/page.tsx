import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, Empty, Panel, Table, Tile } from "@/components/admin/AdminUi";
import { TaskList } from "@/components/admin/TaskList";
import { addDays, chicagoDay, isoDaysAgo, prettyDay } from "@/lib/admin-view";
import { allTasks } from "@/lib/event-tasks";
import { nextStep, sequenceFor } from "@/lib/followups";
import { listLeads, listPartners } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Follow-up emails", robots: { index: false } };

const skipLabels: Record<string, string> = {
  "opted out": "Unsubscribed",
  handled: "You already replied (moved out of New lead)",
  "event passed": "Event date passed",
  "newer lead": "Sent a newer form (that one gets the emails)",
  converted: "Asked for a quote later",
  finished: "Got every email",
  "not due": "Next email not due yet",
  "sent recently": "Got one in the last day",
  "no sequence": "No emails for this form",
};

export default async function FollowupsPage() {
  const today = chicagoDay();
  const [leads, partners] = await Promise.all([listLeads(), listPartners()]);
  const recent = leads.filter((l) => l.created_at >= isoDaysAgo(16));
  const sending = process.env.FOLLOWUPS_ENABLED === "true" && !!process.env.RESEND_API_KEY && !!process.env.NOTIFY_FROM;

  const queue: { id: string; name: string; step: number; subject: string; seq: string }[] = [];
  const skipped: Record<string, number> = {};
  for (const l of recent) {
    const n = nextStep(l, recent);
    if ("skip" in n) skipped[n.skip] = (skipped[n.skip] ?? 0) + 1;
    else queue.push({ id: l.id, name: l.name || l.email, step: n.index + 1, subject: n.step.subject(l), seq: sequenceFor(l)?.name ?? "" });
  }
  const sent = leads.reduce((s, l) => s + (l.followup_step ?? 0), 0);
  const optedOut = new Set(leads.filter((l) => l.opted_out_at).map((l) => l.email.toLowerCase())).size;
  const eventSending = process.env.EVENT_EMAILS_ENABLED === "true" && !!process.env.RESEND_API_KEY && !!process.env.NOTIFY_FROM;
  const eventEmails = allTasks(leads, partners, today).filter((t) => t.kind === "email" && t.due <= addDays(today, 14));

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Grow"
        title="Follow-up emails"
        intro="Two kinds of email keep people informed: the automatic follow-ups after someone sends a form, and the event emails before and after a booked event."
        actions={<Link href="/admin/emails" className="btn-ghost btn-sm">See how emails look</Link>}
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="green" label="Automatic sending" value={sending ? "On" : "Off"} note={sending ? "Runs once a day" : "Turn on in Site settings"} href="/admin/settings" alert={!sending} />
        <Tile tone="blue" label="Ready to go out" value={queue.length} note={sending ? "Goes out in the next daily run" : "Would go out if sending were on"} />
        <Tile tone="green" label="Follow-ups sent" value={sent} note="All time" />
        <Tile tone="gold" label="Unsubscribed" value={optedOut} note="Never emailed again" />
      </div>

      <Panel title="Next follow-ups" className="mt-8">
        {queue.length === 0 ? (
          <Empty>No follow-ups due right now.</Empty>
        ) : (
          <Table head={["Person", "Email", "Subject"]} min={560}>
            {queue.map((q) => (
              <tr key={q.id}>
                <td><Link href={`/admin/leads/${q.id}`} className="text-accent">{q.name}</Link></td>
                <td className="whitespace-nowrap">{q.seq === "request" ? "Quote follow-up" : "Planning tips"} #{q.step}</td>
                <td>{q.subject}</td>
              </tr>
            ))}
          </Table>
        )}
        {Object.keys(skipped).length > 0 && (
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-muted">Why others in the last 16 days get nothing now</summary>
            <ul className="mt-2 space-y-1">
              {Object.entries(skipped).sort((a, b) => b[1] - a[1]).map(([k, n]) => (
                <li key={k} className="flex justify-between gap-4"><span>{skipLabels[k] ?? k}</span><span className="tabular-nums">{n}</span></li>
              ))}
            </ul>
          </details>
        )}
      </Panel>

      <Panel title="Event emails, next 2 weeks" className="mt-6">
        <p className="mb-3 text-sm text-muted">
          For booked events: two weeks out, the day before, and a thank-you after.{" "}
          {eventSending
            ? "Automatic sending is on: each one goes out on its day and is ticked off by itself."
            : "Automatic sending is off, so these are drafts. Tap Email draft to open it in your mail app, send it, then tap Done. Turn on automatic sending in Site settings."}{" "}
          Anything due {prettyDay(today)} or earlier also shows on Today.
        </p>
        {eventEmails.length === 0 ? <Empty>No event emails due in the next two weeks.</Empty> : <TaskList tasks={eventEmails} today={today} />}
      </Panel>

      <section className="mt-6 text-sm text-muted">
        <h2 className="display-3 text-ink">How the automatic follow-ups work</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Quote and call requests get up to 4 emails over 2 weeks, but only while the lead is still New. Move it on when you reply and they stop.</li>
          <li>Download and quiz sign-ups who said yes to tips get 3 planning emails.</li>
          <li>Nobody gets two emails in one day, and the unsubscribe link stops everything for that address.</li>
        </ul>
      </section>
    </div>
  );
}
