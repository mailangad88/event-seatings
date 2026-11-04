import type { Metadata } from "next";
import Link from "@/components/Link";
import { AdminHeader, Empty, StagePill, Tile } from "@/components/admin/AdminUi";
import { Icon } from "@/components/ui/Icon";
import { eventLine, money0, prettyDay } from "@/lib/admin-view";
import { buildBoard, nextStage, prevStage, stageLimits, type BoardCard } from "@/lib/pipeline";
import { listLeads, statusLabel, type LeadStatus } from "@/lib/store";
import { moveStage } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Pipeline", robots: { index: false } };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const monthName = (m: string) => prettyDay(`${m}-01`, { month: "long", year: "numeric" });
const daysText = (n: number) => (n === 0 ? "Today" : n === 1 ? "1 day" : `${n} days`);

function MoveButton({ id, from, dir, to }: { id: string; from: LeadStatus; dir: "back" | "forward"; to?: LeadStatus }) {
  if (!to) return <span />;
  return (
    <form action={moveStage}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="from" value={from} />
      <input type="hidden" name="dir" value={dir} />
      <button type="submit" className="btn-ghost min-h-9 px-3 py-1 text-sm" title={`Move to ${statusLabel(to)}`} aria-label={`Move to ${statusLabel(to)}`}>
        {dir === "back" ? "← Back" : "Next →"}
      </button>
    </form>
  );
}

function Card({ card, status }: { card: BoardCard; status: LeadStatus }) {
  const l = card.lead;
  const limit = stageLimits[status];
  return (
    <li className="card p-4">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/admin/leads/${l.id}`} className="min-w-0 font-medium text-accent [overflow-wrap:anywhere]">
          {l.name || l.email}
        </Link>
        {l.quote_subtotal ? <span className="shrink-0 text-sm font-semibold tabular-nums">{money0(l.quote_subtotal)}</span> : null}
      </div>
      {eventLine(l) && <p className="mt-1 text-xs text-muted">{eventLine(l)}</p>}
      <p className="mt-1 flex items-center gap-1 text-xs text-muted">
        <Icon name="calendar" size={14} />
        {l.event_date ? prettyDay(l.event_date, { weekday: "short", month: "short", day: "numeric", year: "numeric" }) : "No date yet"}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {card.stale ? (
          <span className="badge-rose" title={`Over ${limit} ${limit === 1 ? "day" : "days"} in this stage`}>
            {daysText(card.days)} here
          </span>
        ) : (
          <span className="badge">{daysText(card.days)} here</span>
        )}
        {l.follow_up_at && <span className="badge-blue">Follow up {prettyDay(l.follow_up_at, { month: "short", day: "numeric" })}</span>}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3">
        <MoveButton id={l.id} from={status} dir="back" to={prevStage(status)} />
        <MoveButton id={l.id} from={status} dir="forward" to={nextStage(status)} />
      </div>
    </li>
  );
}

export default async function PipelinePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const month = typeof sp.month === "string" ? sp.month : "";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : "";
  const board = buildBoard(await listLeads(), { month, q });

  const openCount = board.columns.reduce((s, c) => s + c.count, 0);
  const openValue = board.columns.reduce((s, c) => s + c.value, 0);
  const booked = board.columns.filter((c) => c.id === "vendor_confirmed" || c.id === "booked");
  const bookedValue = booked.reduce((s, c) => s + c.value, 0);
  const filtered = !!(month || q);

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Customers"
        title="Pipeline"
        intro="Every open customer by stage. Cards that have waited too long in a stage turn red. Use the arrows to move a customer along."
        actions={
          <>
            <Link href="/admin/calls" className="btn-ghost btn-sm">Today&apos;s calls</Link>
            <Link href="/admin/leads" className="btn-ghost btn-sm">Customer list</Link>
          </>
        }
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="wine" label="Open customers" value={openCount} note={filtered ? "Matching your filter" : "Across all open stages"} />
        <Tile tone="gold" label="Open quote value" value={money0(openValue)} note="Customer prices" />
        <Tile tone="green" label="Confirmed or booked" value={money0(bookedValue)} note={`${booked.reduce((s, c) => s + c.count, 0)} customers`} />
        <Tile tone="amber" label="Waiting too long" value={board.staleCount} note="Red cards on the board" alert={board.staleCount > 0} />
      </div>

      <form action="/admin/pipeline" className="mt-8 flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1 sm:max-w-xs">
          <span className="label">Search by name</span>
          <input name="q" defaultValue={q} placeholder="Name, email or phone" className="field" />
        </label>
        <label>
          <span className="label">Event month</span>
          <select name="month" defaultValue={month} className="field w-auto">
            <option value="">All months</option>
            {board.months.map((m) => (
              <option key={m} value={m}>{monthName(m)}</option>
            ))}
            <option value="none">No date yet</option>
          </select>
        </label>
        <button type="submit" className="btn-primary btn-sm">Filter</button>
        {filtered && <Link href="/admin/pipeline" className="btn-ghost btn-sm">Clear</Link>}
      </form>

      <div className="mt-6 overflow-x-auto pb-4" tabIndex={0} role="region" aria-label="Pipeline board, scrolls sideways">
        <div className="flex gap-4">
          {board.columns.map((col) => (
            <section key={col.id} className="well flex w-64 shrink-0 flex-col p-3">
              <header className="flex items-center justify-between gap-2 px-1 pb-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold">
                  <StagePill status={col.id} />
                  <span className="tabular-nums">{col.count}</span>
                </h2>
                <span className="text-xs text-muted tabular-nums">{money0(col.value)}</span>
              </header>
              {col.cards.length === 0 ? (
                <p className="px-1 text-xs text-muted">Nobody here.</p>
              ) : (
                <ul className="space-y-3">
                  {col.cards.map((c) => (
                    <Card key={c.lead.id} card={c} status={col.id} />
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>

      <section className="card mt-6 p-6">
        <h2 className="display-3">Closed and later</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {board.closed.map((g) => (
            <details key={g.id} className="rounded-lg border border-line p-4">
              <summary className="flex cursor-pointer items-center justify-between gap-2">
                <StagePill status={g.id} />
                <span className="text-sm font-semibold tabular-nums">{g.leads.length}</span>
              </summary>
              {g.leads.length === 0 ? (
                <div className="mt-3"><Empty>Nobody here.</Empty></div>
              ) : (
                <ul className="mt-3 space-y-1 text-sm">
                  {g.leads.slice(0, 30).map((l) => (
                    <li key={l.id} className="flex justify-between gap-2">
                      <Link href={`/admin/leads/${l.id}`} className="min-w-0 truncate text-accent">{l.name || l.email}</Link>
                      <span className="shrink-0 text-muted">{l.event_date ? prettyDay(l.event_date, { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href={`/admin/leads?status=${g.id}`} className="mt-3 inline-block text-sm text-accent">See all in the customer list →</Link>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
