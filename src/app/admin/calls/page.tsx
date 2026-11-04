import type { Metadata } from "next";
import Link from "@/components/Link";
import { AdminHeader, Empty, Panel, StagePill, Tile } from "@/components/admin/AdminUi";
import { Icon } from "@/components/ui/Icon";
import { chicagoDay, eventLine, prettyDay } from "@/lib/admin-view";
import { buildCallList, callOutcomes, type CallConsent, type CallRow } from "@/lib/call-list";
import { listLeads, listPartners } from "@/lib/store";
import { logCall } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Calls for today", robots: { index: false } };

const kindBadge: Record<CallRow["kind"], { label: string; cls: string }> = {
  new: { label: "New customer", cls: "badge-amber" },
  follow_up: { label: "Follow-up", cls: "badge-blue" },
  task: { label: "Event call", cls: "badge-wine" },
  vendor: { label: "Rental partner call", cls: "badge-green" },
};

function ConsentBadge({ consent }: { consent: CallConsent }) {
  if (consent === "yes") return <span className="badge-green">OK to call</span>;
  if (consent === "asked") return <span className="badge-amber" title="They didn't tick the box to be called, but they asked for a call or a quote.">Didn&apos;t tick OK to call</span>;
  if (consent === "no") return <span className="badge-rose" title="They didn't agree to calls. Email them instead.">Did not agree to calls</span>;
  return null;
}

function CallItem({ row, today }: { row: CallRow; today: string }) {
  const l = row.lead;
  const badge = kindBadge[row.kind];
  // People who neither ticked "OK to call" nor asked for a call or quote get an email instead.
  const canCall = row.consent !== "no" && !!row.phone;
  return (
    <li className="py-5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={badge.cls}>{badge.label}</span>
            <span className="font-semibold">{row.who}</span>
            <ConsentBadge consent={row.consent} />
            {row.overdueSince && row.overdueSince < today && <span className="text-xs text-rose">waiting since {prettyDay(row.overdueSince)}</span>}
          </div>
          <p className="mt-1 text-sm">{row.reason}</p>
          <p className="mt-1 text-xs text-muted">
            <Link href={`/admin/leads/${l.id}`} className="text-accent">{l.name || l.email}</Link>
            {[eventLine(l), l.event_date && `event ${prettyDay(l.event_date)}`].filter(Boolean).map((s) => ` · ${s}`)}
            {row.kind !== "vendor" && <> · <StagePill status={l.status} /></>}
          </p>
          <div className="well mt-3 p-4 text-sm">
            <p className="eyebrow">What to say</p>
            <ul className="mt-2 space-y-1">
              {row.script.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {canCall ? (
            <a href={`tel:${row.phone}`} className="btn-primary btn-sm">
              <Icon name="phone" size={16} /> {row.phone}
            </a>
          ) : (
            <a href={`mailto:${l.email}`} className="btn-ghost btn-sm">
              <Icon name="mail" size={16} /> Email instead
            </a>
          )}
        </div>
      </div>
      <form action={logCall} className="mt-3 flex flex-wrap items-center gap-2">
        <input type="hidden" name="id" value={l.id} />
        <input type="hidden" name="kind" value={row.kind} />
        {row.taskKey && <input type="hidden" name="task_key" value={row.taskKey} />}
        {row.taskTitle && <input type="hidden" name="task_title" value={row.taskTitle} />}
        <span className="text-xs text-muted">How did it go?</span>
        {callOutcomes.map((o) => (
          <button key={o.id} type="submit" name="outcome" value={o.id} className={o.id === "reached" ? "btn-primary btn-sm" : "btn-ghost btn-sm"}>
            {o.label}
          </button>
        ))}
      </form>
    </li>
  );
}

export default async function CallsPage() {
  const today = chicagoDay();
  const [leads, partners] = await Promise.all([listLeads(), listPartners()]);
  const rows = buildCallList(leads, partners, today);
  const count = (k: CallRow["kind"]) => rows.filter((r) => r.kind === k).length;
  const customers = rows.filter((r) => r.kind !== "vendor");
  const vendorsToCall = rows.filter((r) => r.kind === "vendor");

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Customers"
        title="Calls for today"
        intro={`Who to phone on ${prettyDay(today, { weekday: "long", month: "long", day: "numeric" })}, most important first. Log how each call went and the list updates. No answer or a voicemail puts them back on the list in 2 days.`}
        actions={<Link href="/admin/pipeline" className="btn-ghost btn-sm">Pipeline</Link>}
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="rose" label="New customers" value={count("new")} note="Haven't heard from us yet" alert={count("new") > 0} />
        <Tile tone="blue" label="Follow-ups" value={count("follow_up")} note="Due today or overdue" />
        <Tile tone="wine" label="Event calls" value={count("task")} note="Before and after events" />
        <Tile tone="green" label="Rental partner calls" value={count("vendor")} note="Orders and pickups" />
      </div>

      <Panel title={`Customers to call (${customers.length})`} className="mt-8">
        {customers.length === 0 ? (
          <Empty>Nobody to call right now. New calls show up here as people send forms.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {customers.map((r) => (
              <CallItem key={r.id} row={r} today={today} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={`Rental partners to call (${vendorsToCall.length})`} className="mt-6">
        {vendorsToCall.length === 0 ? (
          <Empty>No rental partner calls due today.</Empty>
        ) : (
          <ul className="divide-y divide-line">
            {vendorsToCall.map((r) => (
              <CallItem key={r.id} row={r} today={today} />
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
