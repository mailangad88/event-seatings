import type { Metadata } from "next";
import Link from "@/components/Link";
import { vendors } from "@/data/vendors";
import { AdminHeader, Empty, Panel, Table, Tile } from "@/components/admin/AdminUi";
import { chicagoDay, money0, money2, prettyDay } from "@/lib/admin-view";
import { agingBuckets, COMMISSION_RATE, FREE_ORDERS, invoiceNumber, NET_DAYS, owedStatements, statements, type OwedStatement } from "@/lib/commissions";
import { ledgerMethods } from "@/lib/ledger";
import { site } from "@/lib/site";
import { listLeads, listPartners, type VendorPartner } from "@/lib/store";
import { markStatement } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Invoices", robots: { index: false } };

const monthName = (m: string) => new Date(`${m}-15T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
const vendorName = (id: string) => vendors.find((v) => v.id === id)?.name ?? id;

// A polite reminder for a statement that's past its 15 days.
function reminderMailto(s: OwedStatement, partner?: VendorPartner) {
  const to = partner?.contact_email ?? vendors.find((v) => v.id === s.vendorId)?.email ?? "";
  const first = partner?.contact_name?.split(" ")[0];
  const body = [
    `Hi${first ? ` ${first}` : ""},`,
    "",
    `A quick reminder about our commission statement ${s.number} for ${monthName(s.month)}: ${money2(s.commission)} for ${s.orders.length} booked order${s.orders.length === 1 ? "" : "s"}.`,
    s.dueDay ? `It was due on ${prettyDay(s.dueDay, { month: "long", day: "numeric" })}.` : "",
    "",
    "If you've already sent it, thank you, and just let me know how and when so I can match it up. If anything on the statement looks wrong, reply and we'll sort it out.",
    "",
    "Thanks,",
    site.name,
  ].filter((x, i, a) => x !== "" || a[i - 1] !== "").join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(`Reminder: ${site.name} statement ${s.number}`)}&body=${encodeURIComponent(body)}`;
}

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
  const owed = owedStatements(stmts, partners);
  const overdue = owed.filter((s) => s.overdue);
  const bucketTotals = agingBuckets.map((b) => {
    const xs = owed.filter((s) => s.bucket === b.id);
    return { ...b, count: xs.length, total: xs.reduce((t, s) => t + s.commission, 0) };
  });
  const receipts = leads.filter((l) => l.fee_status === "paid").sort((a, b) => (b.fee_paid_at ?? "").localeCompare(a.fee_paid_at ?? ""));

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Money"
        title="Invoices"
        intro={`Commission statements for rental partners (first ${FREE_ORDERS} booked orders free, then ${Math.round(COMMISSION_RATE * 1000) / 10}% of the rental total on booked orders, billed after the event month) and receipts for customers who paid the booking fee.`}
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="amber" label="Statements to send" value={notSent.length} note={money0(notSent.reduce((t, s) => t + s.commission, 0))} alert={notSent.length > 0} />
        <Tile tone="amber" label="Commission owed to us" value={money0(unpaid.reduce((t, s) => t + s.commission, 0))} note={`${unpaid.length} statements not paid${overdue.length ? `, ${overdue.length} overdue` : ""}`} alert={overdue.length > 0} href="#aging" />
        <Tile tone="green" label="Commission received" value={money0(paidTotal)} />
        <Tile tone="blue" label="Customer receipts" value={receipts.length} href="/admin/invoices?tab=receipts" />
      </div>

      <nav aria-label="Invoice type" className="mt-8 flex flex-wrap gap-2">
        <Link href="/admin/invoices" className={tab === "commission" ? "chip-active" : "chip"}>Rental partner commission</Link>
        <Link href="/admin/invoices?tab=receipts" className={tab === "receipts" ? "chip-active" : "chip"}>Customer receipts</Link>
      </nav>

      {tab === "commission" && (
        <section id="aging" className="card mt-4 min-w-0 scroll-mt-24 p-6">
          <h2 className="display-3">Owed commission by age</h2>
          <p className="mt-2 text-sm text-muted">Days since we sent the statement. Statements are due {NET_DAYS} days after they go out.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {bucketTotals.map((b) => (
              <div key={b.id} className="well p-4">
                <p className="text-xs text-muted">{b.label}</p>
                <p className={`mt-1 text-xl font-semibold tabular-nums ${b.id === "60+" && b.count ? "text-rose" : b.id === "31-60" && b.count ? "text-amber" : ""}`}>{money0(b.total)}</p>
                <p className="text-xs text-muted">{b.count} {b.count === 1 ? "statement" : "statements"}</p>
              </div>
            ))}
          </div>
          {owed.length > 0 && (
            <div className="mt-6">
              <Table head={["Statement", "Rental partner", "Month", "Sent", "Days out", "Amount", ""]} right={[4, 5]} min={860}>
                {owed.map((s) => {
                  const partner = partners.find((p) => p.vendor_id === s.vendorId);
                  return (
                    <tr key={s.number}>
                      <td className="whitespace-nowrap font-mono text-xs">{s.number}</td>
                      <td>{vendorName(s.vendorId)}</td>
                      <td className="whitespace-nowrap">{monthName(s.month)}</td>
                      <td className="whitespace-nowrap">{s.sentAt ? prettyDay(chicagoDay(s.sentAt)) : <span className="text-rose">Not sent</span>}</td>
                      <td className={`text-right tabular-nums ${s.overdue ? "text-rose" : ""}`}>{s.daysOut ?? "–"}{s.overdue && <div className="text-xs">overdue</div>}</td>
                      <td className="text-right tabular-nums">{money2(s.commission)}</td>
                      <td>
                        <div className="flex flex-wrap justify-end gap-2">
                          <Link href={`/admin/invoices/commission/${s.vendorId}/${s.month}`} className="btn-ghost btn-sm">Statement</Link>
                          {s.overdue && <a href={reminderMailto(s, partner)} className="btn-ghost btn-sm">Reminder email</a>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            </div>
          )}
        </section>
      )}

      {tab === "commission" ? (
        <Panel title="Commission by month" className="mt-6">
          {stmts.length === 0 ? (
            <Empty>No booked orders with a rental partner yet. Orders count once a lead is Vendor confirmed, Booked or Completed and has a rental partner.</Empty>
          ) : (
            <Table head={["Month", "Statement", "Rental partner", "Orders", "Rental total", "Commission", "Status", ""]} right={[3, 4, 5]} min={1080}>
              {stmts.map((s) => {
                const log = logOf(s.vendorId, s.month);
                const open = s.month >= thisMonth;
                const status = s.commission === 0 ? "Free period" : open ? "Month not over" : log?.paid_at ? `Paid ${prettyDay(chicagoDay(log.paid_at))}` : log?.sent_at ? `Sent ${prettyDay(chicagoDay(log.sent_at))}` : "Not sent";
                return (
                  <tr key={`${s.vendorId}-${s.month}`}>
                    <td className="whitespace-nowrap">{monthName(s.month)}</td>
                    <td className="whitespace-nowrap font-mono text-xs">{invoiceNumber(s.vendorId, s.month)}</td>
                    <td>{vendorName(s.vendorId)}</td>
                    <td className="text-right tabular-nums">{s.orders.length}</td>
                    <td className="text-right tabular-nums">{money0(s.rentals)}</td>
                    <td className="text-right tabular-nums">{money2(s.commission)}</td>
                    <td className={status === "Not sent" ? "text-rose" : "text-muted"}>{status}</td>
                    <td>
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link href={`/admin/invoices/commission/${s.vendorId}/${s.month}`} className="btn-ghost btn-sm">Statement</Link>
                        {!open && s.commission > 0 && !log?.paid_at && (
                          <form action={markStatement} className="flex gap-2">
                            <input type="hidden" name="vendor_id" value={s.vendorId} />
                            <input type="hidden" name="month" value={s.month} />
                            <input type="hidden" name="amount" value={s.commission} />
                            <input type="hidden" name="what" value={log?.sent_at ? "paid" : "sent"} />
                            {log?.sent_at && (
                              <>
                                <label htmlFor={`m-${s.vendorId}-${s.month}`} className="sr-only">Paid by</label>
                                <select id={`m-${s.vendorId}-${s.month}`} name="method" defaultValue="zelle" className="field min-h-9 py-1 text-sm">
                                  {ledgerMethods.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                                </select>
                              </>
                            )}
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
