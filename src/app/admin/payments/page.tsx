import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, Empty, Panel, Table, Tile } from "@/components/admin/AdminUi";
import { chicagoDay, money0, money2, prettyDay } from "@/lib/admin-view";
import { chargeLabel, chargeMode, stripeEnabled } from "@/lib/payments";
import { listLeads } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Booking fees", robots: { index: false } };

export default async function PaymentsPage() {
  const leads = (await listLeads()).filter((l) => l.proposal_token);
  const paid = leads.filter((l) => l.fee_status === "paid").sort((a, b) => (b.fee_paid_at ?? "").localeCompare(a.fee_paid_at ?? ""));
  const waiting = leads.filter((l) => (l.fee_status ?? "unpaid") === "unpaid");
  const refunded = leads.filter((l) => l.fee_status === "refunded");
  const sum = (ls: typeof leads) => ls.reduce((s, l) => s + (l.fee_amount ?? 0), 0);
  const thisMonth = chicagoDay().slice(0, 7);
  const monthPaid = paid.filter((l) => l.fee_paid_at && chicagoDay(l.fee_paid_at).startsWith(thisMonth));

  // Fees collected per month, newest first.
  const months = new Map<string, { count: number; total: number; rentals: number }>();
  for (const l of paid) {
    if (!l.fee_paid_at) continue;
    const m = chicagoDay(l.fee_paid_at).slice(0, 7);
    const row = months.get(m) ?? { count: 0, total: 0, rentals: 0 };
    row.count += 1;
    row.total += l.fee_amount ?? 0;
    row.rentals += l.quote_subtotal ?? 0;
    months.set(m, row);
  }
  const monthRows = [...months].sort((a, b) => b[0].localeCompare(a[0])).slice(0, 12);
  const webhook = !!process.env.STRIPE_WEBHOOK_SECRET;

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Money"
        title="Booking fees"
        intro={`What customers have paid us. We charge a ${chargeLabel().toLowerCase()} when they accept a proposal; the rental company bills the rentals directly.`}
        actions={<Link href="/admin/proposals" className="btn-ghost btn-sm">Proposals</Link>}
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="green" label="Collected, all time" value={money0(sum(paid))} note={`${paid.length} payments`} />
        <Tile tone="green" label="Collected this month" value={money0(sum(monthPaid))} note={`${monthPaid.length} payments`} />
        <Tile tone="amber" label="Waiting on payment" value={money0(sum(waiting))} note={`${waiting.length} proposals`} href="/admin/proposals" />
        <Tile tone="rose" label="Refunded" value={money0(sum(refunded))} note={`${refunded.length} refunds`} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Panel title="Payments">
          {paid.length === 0 ? (
            <Empty>No payments yet.</Empty>
          ) : (
            <Table head={["Paid", "Customer", "Event", "Rentals", "Fee", "How"]} right={[3, 4]} min={720}>
              {paid.slice(0, 100).map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap">{l.fee_paid_at ? prettyDay(chicagoDay(l.fee_paid_at)) : "–"}</td>
                  <td><Link href={`/admin/leads/${l.id}`} className="text-accent">{l.name || l.email}</Link></td>
                  <td className="whitespace-nowrap">{prettyDay(l.event_date) || "–"}</td>
                  <td className="text-right tabular-nums">{money0(l.quote_subtotal)}</td>
                  <td className="text-right tabular-nums">{money2(l.fee_amount)}</td>
                  <td className="text-muted">{l.stripe_session_id ? "Card" : "By hand"}</td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Card payments">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3"><dt className="text-muted">Stripe</dt><dd>{stripeEnabled() ? "On" : "Off"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">Payment alerts from Stripe</dt><dd>{webhook ? "On" : "Off"}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-muted">What we charge</dt><dd className="text-right">{chargeMode() === "hold" ? "Fixed refundable hold" : "10% booking fee"}</dd></div>
            </dl>
            {!stripeEnabled() && (
              <p className="mt-3 text-xs text-muted">Without Stripe, customers see &quot;we&apos;ll send you a payment link&quot;. Mark the fee paid on the lead once they pay.</p>
            )}
          </Panel>
          <Panel title="By month">
            {monthRows.length === 0 ? (
              <Empty>Nothing yet.</Empty>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {monthRows.map(([m, r]) => (
                  <li key={m} className="flex justify-between gap-3 py-2">
                    <span>{new Date(`${m}-15T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
                    <span className="tabular-nums">{money0(r.total)} <span className="text-xs text-muted">· {r.count}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
