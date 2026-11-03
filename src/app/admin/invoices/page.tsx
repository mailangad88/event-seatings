import type { Metadata } from "next";
import Link from "next/link";
import { vendors } from "@/data/vendors";
import { AdminHeader, Empty, Panel, Table, Tile } from "@/components/admin/AdminUi";
import { chicagoDay, money0, money2, prettyDay } from "@/lib/admin-view";
import { COMMISSION_RATE, FREE_DAYS, statements } from "@/lib/commissions";
import { listLeads, listPartners } from "@/lib/store";
import { markStatement } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Invoices", robots: { index: false } };

const monthName = (m: string) => new Date(`${m}-15T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name ?? id;

export default async function InvoicesPage(props: PageProps<"/admin/invoices">) {
  const sp = await props.searchParams;
  const tab = sp.tab === "receipts" ? "receipts" : "commission";
  const [leads, partners] = await Promise.all([listLeads(), listPartners()]);
  const thisMonth = chicagoDay().slice(0, 7);
  const stmts = statements(leads, partners);
  const logOf = (vendorId: string, month: string) => partners.find((p) => p.vendor_id === vendorId)?.commission_log?.[month];
  // A month is ready to bill once it is over.
  const billable = stmts.filter((s) => s.month < thisMonth && s.commission > 0);
  const unpaid = billable.filter((s) => !logOf(s.vendorId, s.month)?.paid_at);
  const notSent = unpaid.filter((s) => !logOf(s.vendorId, s.month)?.sent_at);
  const paidTotal = billable.filter((s) => logOf(s.vendorId, s.month)?.paid_at).reduce((t, s) => t + s.commission, 0);
  const receipts = leads.filter((l) => l.fee_status === "paid").sort((a, b) => (b.fee_paid_at ?? "").localeCompare(a.fee_paid_at ?? ""));

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Money"
        title="Invoices"
        intro={`Commission statements for rental partners (free for their first ${FREE_DAYS} days, then ${Math.round(COMMISSION_RATE * 100)}% of the rental total on booked orders, billed after the event month) and receipts for customers who paid the booking fee.`}
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Statements to send" value={notSent.length} note={money0(notSent.reduce((t, s) => t + s.commission, 0))} alert={notSent.length > 0} />
        <Tile label="Commission owed to us" value={money0(unpaid.reduce((t, s) => t + s.commission, 0))} note={`${unpaid.length} statements not paid`} />
        <Tile label="Commission received" value={money0(paidTotal)} />
        <Tile label="Customer receipts" value={receipts.length} href="/admin/invoices?tab=receipts" />
      </div>

      <nav aria-label="Invoice type" className="mt-8 flex flex-wrap gap-2">
        <Link href="/admin/invoices" className={tab === "commission" ? "chip-active" : "chip"}>Rental partner commission</Link>
        <Link href="/admin/invoices?tab=receipts" className={tab === "receipts" ? "chip-active" : "chip"}>Customer receipts</Link>
      </nav>

      {tab === "commission" ? (
        <Panel title="Commission by month" className="mt-4">
          {stmts.length === 0 ? (
            <Empty>No booked orders with a rental partner yet. Orders count once a lead is Vendor confirmed, Booked or Completed and has a rental partner.</Empty>
          ) : (
            <Table head={["Month", "Rental partner", "Orders", "Rental total", "Commission", "Status", ""]} right={[2, 3, 4]} min={900}>
              {stmts.map((s) => {
                const log = logOf(s.vendorId, s.month);
                const open = s.month >= thisMonth;
                const status = s.commission === 0 ? "Free period" : open ? "Month not over" : log?.paid_at ? `Paid ${prettyDay(chicagoDay(log.paid_at))}` : log?.sent_at ? `Sent ${prettyDay(chicagoDay(log.sent_at))}` : "Not sent";
                return (
                  <tr key={`${s.vendorId}-${s.month}`}>
                    <td className="whitespace-nowrap">{monthName(s.month)}</td>
                    <td>{vendorName(s.vendorId)}</td>
                    <td className="text-right tabular-nums">{s.orders.length}</td>
                    <td className="text-right tabular-nums">{money0(s.rentals)}</td>
                    <td className="text-right tabular-nums">{money2(s.commission)}</td>
                    <td className={status === "Not sent" ? "text-rose" : "text-muted"}>{status}</td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link href={`/admin/invoices/commission/${s.vendorId}/${s.month}`} className="btn-ghost btn-sm">Statement</Link>
                        {!open && s.commission > 0 && !log?.paid_at && (
                          <form action={markStatement}>
                            <input type="hidden" name="vendor_id" value={s.vendorId} />
                            <input type="hidden" name="month" value={s.month} />
                            <input type="hidden" name="amount" value={s.commission} />
                            <input type="hidden" name="what" value={log?.sent_at ? "paid" : "sent"} />
                            <button type="submit" className="btn-ghost btn-sm">{log?.sent_at ? "Mark paid" : "Mark sent"}</button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </Table>
          )}
        </Panel>
      ) : (
        <Panel title="Booking fee receipts" className="mt-4">
          {receipts.length === 0 ? (
            <Empty>No paid booking fees yet.</Empty>
          ) : (
            <Table head={["Paid", "Customer", "Event", "Fee", ""]} right={[3]} min={640}>
              {receipts.map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap">{l.fee_paid_at ? prettyDay(chicagoDay(l.fee_paid_at)) : "–"}</td>
                  <td><Link href={`/admin/leads/${l.id}`} className="text-accent">{l.name || l.email}</Link></td>
                  <td className="whitespace-nowrap">{prettyDay(l.event_date) || "–"}</td>
                  <td className="text-right tabular-nums">{money2(l.fee_amount)}</td>
                  <td className="text-right"><Link href={`/admin/invoices/receipt/${l.id}`} className="btn-ghost btn-sm">Receipt</Link></td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      )}
    </div>
  );
}
