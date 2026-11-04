import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminHeader, Empty, FeePill, Panel, StagePill, Table } from "@/components/admin/AdminUi";
import { vendors } from "@/data/vendors";
import { chicagoDay, eventLine, money0, money2, prettyDay } from "@/lib/admin-view";
import { partStateBadge, partStateLabel, partUrgent, vendorParts } from "@/lib/orders";
import { getLead, listPartners } from "@/lib/store";
import { movePartLine } from "../actions";
import { PartDetails, PartLinkActions, PartMarks } from "../PartActions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Order", robots: { index: false } };

// One customer's order, split by rental partner. Each line can be sent to another partner; each partner's
// part has its own confirmation link and delivered / picked up / paid marks.
// Typed by hand: generated route types only pick up new routes on the next `next dev` / `next build`.
export default async function OrderPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [lead, partners] = await Promise.all([getLead(id), listPartners()]);
  if (!lead) notFound();
  const today = chicagoDay();
  const parts = vendorParts(lead);
  const partnerMap = new Map(partners.map((p) => [p.vendor_id, p]));
  const sorted = [...vendors].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Orders"
        title={lead.name || lead.email}
        intro={[eventLine(lead), prettyDay(lead.event_date, { weekday: "long", month: "long", day: "numeric", year: "numeric" }), [lead.venue, lead.city].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
        actions={
          <>
            <Link href="/admin/orders" className="btn-ghost btn-sm">All orders</Link>
            <Link href={`/admin/leads/${lead.id}`} className="btn-ghost btn-sm">Customer page</Link>
          </>
        }
      />
      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <StagePill status={lead.status} />
        <FeePill status={lead.fee_status} />
        {lead.phone && <a href={`tel:${lead.phone}`} className="text-accent">{lead.phone}</a>}
        <span className="text-muted">Order total {money0(lead.quote_subtotal ?? parts.reduce((s, p) => s + p.subtotal, 0))}</span>
      </div>

      {parts.length === 0 && (
        <Panel title="Rental partners" className="mt-8">
          <Empty>This order has no items and no rental partner yet. Pick one on the customer page.</Empty>
        </Panel>
      )}

      {parts.map((part) => {
        const partner = partnerMap.get(part.vendorId);
        const vendor = vendors.find((v) => v.id === part.vendorId);
        const phone = partner?.contact_phone ?? vendor?.phone;
        return (
          <Panel key={part.vendorId || "none"} title={part.vendorName} className="mt-8">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className={partStateBadge[part.state]}>{partStateLabel[part.state]}</span>
              {partUrgent(lead, part, today) && <span className="badge-rose">Event within 7 days</span>}
              {part.order?.paid_at && <span className="badge-green">Paid</span>}
              {partner?.contact_name && <span className="text-muted">Ask for {partner.contact_name}</span>}
              {phone && <a href={`tel:${phone}`} className="text-accent">{phone}</a>}
              {partner?.contact_email && <a href={`mailto:${partner.contact_email}`} className="text-accent">{partner.contact_email}</a>}
            </div>

            <div className="mt-4">
              {part.lines.length === 0 ? (
                <Empty>No item lines on this order. The rental partner comes from the customer page.</Empty>
              ) : (
                <Table head={["Item", "Qty", "Customer pays", "Their price", "Send to"]} right={[1, 2, 3]} min={760}>
                  {part.lines.map(({ line, index }) => (
                    <tr key={`${line.id}-${index}`}>
                      <td>{line.name}{line.variant && <span className="text-muted"> ({line.variant})</span>}</td>
                      <td className="text-right tabular-nums">{line.qty}</td>
                      <td className="text-right tabular-nums">{money2(line.line_total)}</td>
                      <td className="text-right tabular-nums">{money2(line.vendor_price * line.qty)}</td>
                      <td>
                        <form action={movePartLine} className="flex items-center gap-2">
                          <input type="hidden" name="id" value={lead.id} />
                          <input type="hidden" name="index" value={index} />
                          <input type="hidden" name="line" value={line.id} />
                          <label className="sr-only" htmlFor={`to-${index}`}>Send {line.name} to</label>
                          <select id={`to-${index}`} name="to" defaultValue={part.vendorId} className="field py-1 text-sm">
                            {!part.vendorId && <option value="">Pick one</option>}
                            {sorted.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                          </select>
                          <button type="submit" className="btn-ghost btn-sm">Move</button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </Table>
              )}
              {part.lines.length > 0 && (
                <p className="mt-2 text-xs text-muted">
                  {money2(part.cost)} at their prices for {money2(part.subtotal)} to the customer. Moving a line keeps its price, so check it with the new rental partner.
                </p>
              )}
            </div>

            {part.vendorId && (
              <div className="mt-5 grid gap-4 border-t border-line pt-4 md:grid-cols-2">
                <div className="text-sm">
                  <p className="stat-label">Their answer</p>
                  <div className="mt-1"><PartDetails part={part} /></div>
                </div>
                <div className="space-y-3">
                  <PartLinkActions lead={lead} part={part} partner={partner} />
                  <PartMarks lead={lead} part={part} />
                </div>
              </div>
            )}
          </Panel>
        );
      })}
    </div>
  );
}
