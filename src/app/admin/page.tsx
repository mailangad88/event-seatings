import type { Metadata } from "next";
import Link from "next/link";
import { vendors } from "@/data/catalog";
import { AdminHeader, Empty, FeePill, Panel, StagePill, Tile } from "@/components/admin/AdminUi";
import { addDays, ago, chicagoDay, eventLine, isClosed, isConfirmed, isoDaysAgo, money0, prettyDay, stage } from "@/lib/admin-view";
import { listBlockedDates } from "@/lib/availability";
import { allTasks } from "@/lib/event-tasks";
import { listLeads, listPartners, type Lead } from "@/lib/store";
import { listVendorApplications } from "@/lib/vendor-applications";
import { TaskList } from "@/components/admin/TaskList";
import { markContacted } from "./leads/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Today", robots: { index: false } };

const vendorName = (id?: string) => vendors.find((v) => v.id === id)?.name;
const scoreRank = (l: Lead) => ({ A: 0, B: 1, C: 2 })[l.lead_score as "A" | "B" | "C"] ?? 3;

function LeadRow({ l, right, action }: { l: Lead; right?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <li className="flex flex-wrap items-start justify-between gap-3 py-3">
      <div className="min-w-0">
        <Link href={`/admin/leads/${l.id}`} className="font-medium text-accent">{l.name || l.email}</Link>
        {l.lead_score && <span className="ml-2 text-xs text-muted" title={l.lead_score_reasons}>{l.lead_score}</span>}
        <p className="text-xs text-muted">{[eventLine(l), l.event_date && prettyDay(l.event_date)].filter(Boolean).join(" · ") || l.kind}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        {right}
        {action}
      </div>
    </li>
  );
}

export default async function TodayPage() {
  const today = chicagoDay();
  const weekEnd = addDays(today, 7);
  const [leads, blocked, partners, applications] = await Promise.all([listLeads(), listBlockedDates(today), listPartners(), listVendorApplications()]);
  const people = leads.filter((l) => l.kind !== "partner");

  const fresh = people
    .filter((l) => stage(l) === "new")
    .sort((a, b) => scoreRank(a) - scoreRank(b) || a.created_at.localeCompare(b.created_at));
  const due = people
    .filter((l) => !isClosed(l) && l.follow_up_at && l.follow_up_at <= today)
    .sort((a, b) => a.follow_up_at!.localeCompare(b.follow_up_at!));
  const thisWeek = people
    .filter((l) => l.event_date && l.event_date >= today && l.event_date <= weekEnd && stage(l) !== "lost")
    .sort((a, b) => a.event_date!.localeCompare(b.event_date!));
  const confirmedThisWeek = thisWeek.filter(isConfirmed);
  const unpaid = people.filter((l) => l.proposal_token && (l.fee_status ?? "unpaid") === "unpaid");
  const unpaidTotal = unpaid.reduce((s, l) => s + (l.fee_amount ?? 0), 0);
  // Rental companies waiting on us: full applications (/partners) plus older short partner forms still marked New.
  const vendorApps = [
    ...applications.filter((a) => a.status === "submitted").map((a) => ({ id: a.id, name: a.company, at: a.created_at, href: `/admin/applications/${a.id}` })),
    ...leads.filter((l) => l.kind === "partner" && stage(l) === "new").map((l) => ({ id: l.id, name: l.name || l.email, at: l.created_at, href: `/admin/leads/${l.id}` })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  const tasks = allTasks(people, partners, today);
  const tasksDue = tasks.filter((t) => t.due <= today);
  const calls = tasksDue.filter((t) => t.kind === "call").length;

  const weekAgo = isoDaysAgo(7);
  const lastWeek = people.filter((l) => l.created_at >= weekAgo);
  const feesWeek = people.filter((l) => l.fee_status === "paid" && (l.fee_paid_at ?? "") >= weekAgo);
  const blockedSoon = blocked.filter((b) => b.date <= addDays(today, 14));

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Daily"
        title="Today"
        intro={`${prettyDay(today, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}, Chicago time. Start at the top: new people first, then follow-ups, then this week's events.`}
        actions={<Link href="/admin/leads" className="btn-primary btn-sm">All leads</Link>}
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="wine" label="New, not contacted" value={fresh.length} note="Reply within a business hour" href="/admin/leads?status=new" alert={fresh.length > 0} />
        <Tile tone="gold" label="To-dos due" value={tasksDue.length + due.length} note={`${calls} call${calls === 1 ? "" : "s"} · ${due.length} follow-up${due.length === 1 ? "" : "s"}`} href="/admin/week" alert={tasksDue.length + due.length > 0} />
        <Tile tone="blue" label="Events in the next 7 days" value={thisWeek.length} note={`${confirmedThisWeek.length} confirmed with a rental partner`} href="/admin/calendar" />
        <Tile tone="amber" label="Fees waiting" value={money0(unpaidTotal)} note={`${unpaid.length} proposal${unpaid.length === 1 ? "" : "s"} not paid yet`} href="/admin/proposals" />
      </div>

      <Panel title="Calls, emails and vendor checks due" more={{ href: "/admin/week", label: "This week" }} className="mt-8">
        {tasksDue.length === 0 ? (
          <Empty>Nothing due today. Booked events get reminder calls, emails and vendor checks here as their dates get close.</Empty>
        ) : (
          <TaskList tasks={tasksDue} today={today} />
        )}
      </Panel>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Panel title="Contact these first" more={{ href: "/admin/leads?status=new", label: "All new" }}>
          {fresh.length === 0 ? (
            <Empty>Everyone has had a reply. Nice.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {fresh.slice(0, 8).map((l) => (
                <LeadRow
                  key={l.id}
                  l={l}
                  right={<span className="text-xs text-muted">{ago(l.created_at)}{l.quote_subtotal ? ` · ${money0(l.quote_subtotal)}` : ""}</span>}
                  action={
                    <form action={markContacted}>
                      <input type="hidden" name="id" value={l.id} />
                      <button type="submit" className="btn-ghost btn-sm">Mark contacted</button>
                    </form>
                  }
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Follow-ups due" more={{ href: "/admin/leads", label: "Lead list" }}>
          {due.length === 0 ? (
            <Empty>No follow-ups due. Set a follow-up date on any lead and it shows up here on that day.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {due.slice(0, 8).map((l) => (
                <LeadRow
                  key={l.id}
                  l={l}
                  right={
                    <>
                      <span className={`text-xs ${l.follow_up_at! < today ? "text-rose" : "text-muted"}`}>
                        {l.follow_up_at! < today ? `Overdue since ${prettyDay(l.follow_up_at)}` : "Today"}
                      </span>
                      <StagePill status={l.status} />
                    </>
                  }
                />
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Events in the next 7 days" more={{ href: "/admin/calendar", label: "Calendar" }}>
          {thisWeek.length === 0 ? (
            <Empty>No events in the next week.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {thisWeek.map((l) => {
                const partner = vendorName(l.assigned_vendor);
                return (
                  <li key={l.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium tracking-wider text-gold uppercase">{prettyDay(l.event_date)}</p>
                      <Link href={`/admin/leads/${l.id}`} className="font-medium text-accent">{l.name || l.email}</Link>
                      <p className="text-xs text-muted">{[eventLine(l), l.venue].filter(Boolean).join(" · ")}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs">
                      <StagePill status={l.status} />
                      <span className={partner ? "text-muted" : "text-rose"}>{partner ?? "No rental partner yet"}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Proposals waiting on payment" more={{ href: "/admin/proposals", label: "All proposals" }}>
          {unpaid.length === 0 ? (
            <Empty>No proposals waiting. Create one from a lead with a priced quote.</Empty>
          ) : (
            <ul className="divide-y divide-line">
              {unpaid
                .sort((a, b) => (a.proposal_created_at ?? "").localeCompare(b.proposal_created_at ?? ""))
                .slice(0, 8)
                .map((l) => (
                  <LeadRow
                    key={l.id}
                    l={l}
                    right={
                      <>
                        <span className="text-xs text-muted">sent {ago(l.proposal_created_at)}</span>
                        <span className="tabular-nums">{money0(l.fee_amount)}</span>
                        <FeePill status={l.fee_status} />
                      </>
                    }
                  />
                ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Panel title="Last 7 days">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted">New requests</dt><dd className="tabular-nums">{lastWeek.length}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Quotes built</dt><dd className="tabular-nums">{lastWeek.filter((l) => l.quote_subtotal).length}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Quote value</dt><dd className="tabular-nums">{money0(lastWeek.reduce((s, l) => s + (l.quote_subtotal ?? 0), 0))}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Booking fees paid</dt><dd className="tabular-nums">{money0(feesWeek.reduce((s, l) => s + (l.fee_amount ?? 0), 0))}</dd></div>
          </dl>
          <Link href="/admin/reports" className="mt-4 inline-block text-sm text-accent">Full sales report →</Link>
        </Panel>
        <Panel title="Blocked in the next 2 weeks" more={{ href: "/admin/calendar", label: "Calendar" }}>
          {blockedSoon.length === 0 ? (
            <Empty>Every date is open for requests.</Empty>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {blockedSoon.map((b) => (
                <li key={b.date}>{prettyDay(b.date)}{b.reason && <span className="text-muted"> · {b.reason}</span>}</li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Rental companies asking to join" more={{ href: "/admin/applications", label: "Vendor applications" }}>
          {vendorApps.length === 0 ? (
            <Empty>No new sign-ups from rental companies.</Empty>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {vendorApps.slice(0, 6).map((a) => (
                <li key={a.id}>
                  <Link href={a.href} className="text-accent">{a.name}</Link>
                  <span className="text-muted"> · {ago(a.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
