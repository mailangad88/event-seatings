import type { Metadata } from "next";
import Link from "@/components/Link";
import { AdminHeader, Empty, FeePill, Panel, StagePill, Table, Tile } from "@/components/admin/AdminUi";
import { addDays, chicagoDay, eventLine, money0, prettyDay } from "@/lib/admin-view";
import {
  isPartConfirmed,
  needsConfirmation,
  partStateBadge,
  partStateLabel,
  partUrgent,
  vendorParts,
  type PartState,
  type VendorPart,
} from "@/lib/orders";
import { listLeads, listPartners, type Lead } from "@/lib/store";
import { PartDetails, PartLinkActions } from "./PartActions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Orders", robots: { index: false } };

// Every booked or paid order, with one chip per rental partner on it. The Confirmations tab lists each
// rental partner's part on its own row, with its link and answer.
export default async function OrdersPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await props.searchParams;
  const tab = sp.tab === "confirmations" ? "confirmations" : "orders";
  const today = chicagoDay();
  const [leads, partners] = await Promise.all([listLeads(), listPartners()]);
  const partnerMap = new Map(partners.map((p) => [p.vendor_id, p]));
  const orders = leads
    .filter((l) => needsConfirmation(l, today))
    .sort((a, b) => (a.event_date ?? "9999").localeCompare(b.event_date ?? "9999"))
    .map((lead) => ({ lead, parts: vendorParts(lead) }));
  const rows = orders.flatMap(({ lead, parts }) => parts.map((part) => ({ lead, part })));

  const count = (states: PartState[]) => rows.filter((r) => states.includes(r.part.state)).length;
  const urgent = rows.filter((r) => partUrgent(r.lead, r.part, today)).length;
  const fully = orders.filter((o) => o.parts.length && o.parts.every((p) => p.vendorId && isPartConfirmed(p.state))).length;

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Orders"
        title="Orders"
        intro="Booked and paid orders from today on. One order can be split across several rental partners; each one confirms their own part on a link we send them."
        actions={
          <div className="flex gap-2" role="tablist">
            <Link href="/admin/orders" className={tab === "orders" ? "chip-active" : "chip"} role="tab" aria-selected={tab === "orders"}>Orders</Link>
            <Link href="/admin/orders?tab=confirmations" className={tab === "confirmations" ? "chip-active" : "chip"} role="tab" aria-selected={tab === "confirmations"}>Confirmations</Link>
          </div>
        }
      />

      {tab === "orders" ? (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Tile tone="blue" label="Open orders" value={orders.length} note="Paid or with a rental partner" />
            <Tile tone="green" label="Every partner said yes" value={fully} />
            <Tile tone="amber" label="Waiting on a partner" value={orders.length - fully} href="/admin/orders?tab=confirmations" />
            <Tile tone="rose" label="Within 7 days, not confirmed" value={urgent} alert={urgent > 0} href="/admin/orders?tab=confirmations" />
          </div>
          <Panel title="Orders by event date" className="mt-8">
            {orders.length === 0 ? (
              <Empty>No booked or paid orders right now.</Empty>
            ) : (
              <Table head={["Event", "Customer", "Stage", "Deposit", "Rental partners", "Order total"]} right={[5]} min={860}>
                {orders.map(({ lead, parts }) => (
                  <tr key={lead.id}>
                    <td className="whitespace-nowrap">
                      {prettyDay(lead.event_date) || "No date"}
                      {soon(lead, today) && !parts.every((p) => isPartConfirmed(p.state)) && <span className="badge-rose ml-2">Soon</span>}
                    </td>
                    <td>
                      <Link href={`/admin/orders/${lead.id}`} className="text-accent">{lead.name || lead.email}</Link>
                      <p className="text-xs text-muted">{eventLine(lead)}</p>
                    </td>
                    <td><StagePill status={lead.status} /></td>
                    <td><FeePill status={lead.fee_status} /></td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {parts.length ? parts.map((p) => <PartChip key={p.vendorId || "none"} part={p} />) : <span className="text-xs text-muted">No items or rental partner yet</span>}
                      </div>
                    </td>
                    <td className="text-right tabular-nums">{money0(lead.quote_subtotal ?? parts.reduce((s, p) => s + p.subtotal, 0))}</td>
                  </tr>
                ))}
              </Table>
            )}
          </Panel>
        </>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Tile tone="amber" label="No link yet" value={count(["no_link"])} />
            <Tile tone="blue" label="Sent, not opened" value={count(["sent"])} />
            <Tile tone="gold" label="Opened, no answer" value={count(["opened"])} />
            <Tile tone="green" label="Confirmed" value={count(["confirmed", "delivered", "picked_up"])} />
            <Tile tone="rose" label="Said no" value={count(["declined"])} alert={count(["declined"]) > 0} />
          </div>
          <Panel title="Confirmations by event date" className="mt-8">
            {rows.length === 0 ? (
              <Empty>No rental partner parts to confirm right now.</Empty>
            ) : (
              <Table head={["Event", "Customer", "Rental partner", "Answer", "Details", ""]} min={980}>
                {rows.map(({ lead, part }) => (
                  <tr key={`${lead.id}-${part.vendorId}`}>
                    <td className="whitespace-nowrap">
                      {prettyDay(lead.event_date) || "No date"}
                      {partUrgent(lead, part, today) && <span className="badge-rose ml-2">{daysLeft(lead, today)}</span>}
                    </td>
                    <td>
                      <Link href={`/admin/orders/${lead.id}`} className="text-accent">{lead.name || lead.email}</Link>
                      <p className="text-xs text-muted">{eventLine(lead)}</p>
                    </td>
                    <td>
                      {part.vendorName}
                      <p className="text-xs text-muted">{part.lines.length} {part.lines.length === 1 ? "line" : "lines"} · {money0(part.cost)} at their prices</p>
                    </td>
                    <td><span className={`${partStateBadge[part.state]} whitespace-nowrap`}>{partStateLabel[part.state]}</span></td>
                    <td className="text-xs"><PartDetails part={part} /></td>
                    <td><PartLinkActions lead={lead} part={part} partner={partnerMap.get(part.vendorId)} /></td>
                  </tr>
                ))}
              </Table>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

const soon = (l: Lead, today: string) => !!l.event_date && l.event_date >= today && l.event_date <= addDays(today, 7);

function daysLeft(l: Lead, today: string) {
  const n = Math.round((Date.parse(`${l.event_date}T12:00:00Z`) - Date.parse(`${today}T12:00:00Z`)) / 864e5);
  return n === 0 ? "Today" : n === 1 ? "Tomorrow" : `In ${n} days`;
}

function PartChip({ part }: { part: VendorPart }) {
  return <span className={`${partStateBadge[part.state]} whitespace-nowrap`}>{part.vendorName}: {partStateLabel[part.state]}</span>;
}
