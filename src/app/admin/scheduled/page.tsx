import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, Empty, Panel, Tile } from "@/components/admin/AdminUi";
import { Icon } from "@/components/ui/Icon";
import { addDays, chicagoDay, prettyDay } from "@/lib/admin-view";
import { emailSwitches, scheduledEmails, type ScheduledEmail } from "@/lib/email-schedule";
import { mailto } from "@/lib/event-tasks";
import { listLeads, listPartners } from "@/lib/store";
import { skipEmail } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Scheduled emails", robots: { index: false } };

const DAYS = 14;

// Every automated email for the next two weeks, by day: event emails to customers and rental partners, and
// follow-ups after a form. Shows whether each one goes out by itself or waits as a draft.
export default async function ScheduledPage() {
  const today = chicagoDay();
  const [leads, partners] = await Promise.all([listLeads(), listPartners()]);
  const sw = emailSwitches();
  const list = scheduledEmails(leads, partners, today, DAYS, sw);
  const byDay = new Map<string, ScheduledEmail[]>();
  for (const e of list) byDay.set(e.day, [...(byDay.get(e.day) ?? []), e]);
  const todays = byDay.get(today) ?? [];

  const missing = [!sw.resend && "RESEND_API_KEY", !sw.from && "NOTIFY_FROM"].filter(Boolean).join(" and ");
  const line = (on: boolean, flag: boolean, flagName: string) =>
    on ? "On: goes out by itself each morning." : !flag ? `Off: set ${flagName}=true${missing ? ` and add ${missing}` : ""}.` : `Off: add ${missing}.`;

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Grow"
        title="Scheduled emails"
        intro="Every email set to go out in the next two weeks. Event emails go to booked customers and their rental partners; follow-ups go to people who sent a form and haven't heard back."
        actions={<Link href="/admin/followups" className="btn-ghost btn-sm">Follow-up details</Link>}
      />

      <section className={`card mt-8 p-5 ${sw.event && sw.followups ? "" : "border-amber"}`} aria-label="What is switched on">
        <div className="flex flex-wrap items-start gap-3">
          <Icon name={sw.event && sw.followups ? "check" : "info"} size={20} />
          <div className="min-w-0 flex-1 space-y-1 text-sm">
            <p><span className={sw.event ? "badge-green" : "badge-amber"}>{sw.event ? "On" : "Off"}</span> <strong className="ml-1">Event emails</strong> <span className="text-muted">{line(sw.event, sw.eventFlag, "EVENT_EMAILS_ENABLED")}</span></p>
            <p><span className={sw.followups ? "badge-green" : "badge-amber"}>{sw.followups ? "On" : "Off"}</span> <strong className="ml-1">Follow-ups</strong> <span className="text-muted">{line(sw.followups, sw.followupFlag, "FOLLOWUPS_ENABLED")}</span></p>
            {!(sw.event && sw.followups) && <p className="text-muted">While a kind is off, its emails wait here as drafts. Open the draft, send it from your own mail, then tap Skip so it leaves the list.</p>}
          </div>
          <Link href="/admin/settings" className="btn-ghost btn-sm">Site settings</Link>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="green" label="Going out today" value={todays.filter((e) => e.auto).length} note="Sent by the morning run" />
        <Tile tone="amber" label="Drafts for today" value={todays.filter((e) => !e.auto).length} note="You send these yourself" alert={todays.some((e) => !e.auto)} />
        <Tile tone="blue" label="Next 14 days" value={list.length} note={`${list.filter((e) => e.auto).length} by themselves`} />
        <Tile tone="gold" label="To rental partners" value={list.filter((e) => e.audience === "vendor").length} note="Order and final details" />
      </div>

      {list.length === 0 ? (
        <Panel title="Next two weeks" className="mt-8">
          <Empty>No emails are set to go out in the next two weeks.</Empty>
        </Panel>
      ) : (
        Array.from({ length: DAYS }, (_, i) => addDays(today, i))
          .filter((d) => byDay.has(d))
          .map((d) => (
            <Panel key={d} title={d === today ? `Today, ${prettyDay(d)}` : d === addDays(today, 1) ? `Tomorrow, ${prettyDay(d)}` : prettyDay(d, { weekday: "long", month: "short", day: "numeric" })} className="mt-6">
              <ul className="divide-y divide-line">
                {byDay.get(d)!.map((e) => <EmailRow key={e.id} e={e} />)}
              </ul>
            </Panel>
          ))
      )}
    </div>
  );
}

function EmailRow({ e }: { e: ScheduledEmail }) {
  const who = e.lead.name || e.lead.email;
  return (
    <li className="py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={e.audience === "vendor" ? "badge-blue" : "badge-wine"}>{e.audience === "vendor" ? "Rental partner" : "Customer"}</span>
            <span className="font-medium">{e.subject}</span>
          </div>
          <p className="mt-1 text-sm">
            <span className="text-muted">To </span>{e.to || <span className="text-rose">no email address</span>}
            <span className="text-muted"> · for </span>
            <Link href={`/admin/leads/${e.lead.id}`} className="text-accent">{who}</Link>
            <span className="text-muted"> · {e.source === "event" ? "Event email" : `Follow-up #${e.step}`}</span>
          </p>
          <p className="mt-1">
            {e.auto ? <span className="badge-green">Sends by itself</span> : <span className="badge-amber">Draft only: {e.why}</span>}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <a href={mailto({ to: e.to, subject: e.subject, body: e.body })} className="btn-ghost btn-sm">Open draft</a>
          {e.task ? (
            <form action={skipEmail}>
              <input type="hidden" name="id" value={e.lead.id} />
              <input type="hidden" name="key" value={e.task.key} />
              <input type="hidden" name="subject" value={e.subject} />
              <button type="submit" className="btn-ghost btn-sm">Skip</button>
            </form>
          ) : (
            <span className="text-xs text-muted">{e.lead.kind === "quote" || e.lead.kind === "call" ? "Stops when you move them out of New lead" : "Stops if they unsubscribe"}</span>
          )}
        </div>
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-muted">Preview</summary>
        <pre className="well mt-2 whitespace-pre-wrap p-4 font-sans text-sm">{e.body}</pre>
      </details>
    </li>
  );
}
