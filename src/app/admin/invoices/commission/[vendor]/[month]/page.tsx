import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { getVendor } from "@/data/vendors";
import { PrintButton, printCss } from "@/components/admin/PrintButton";
import { addDays, chicagoDay, money2, prettyDay } from "@/lib/admin-view";
import { COMMISSION_RATE, FREE_ORDERS, invoiceNumber, statements } from "@/lib/commissions";
import { site } from "@/lib/site";
import { listLeads, listPartners } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Commission statement", robots: { index: false } };

const long = { month: "long", day: "numeric", year: "numeric" } as const;

// A printable monthly statement for one rental partner: booked orders from our customers and the commission due.
export default async function StatementPage(props: PageProps<"/admin/invoices/commission/[vendor]/[month]">) {
  const { vendor: vendorId, month } = await props.params;
  const vendor = getVendor(vendorId);
  if (!vendor || !/^\d{4}-\d{2}$/.test(month)) notFound();
  const [leads, partners] = await Promise.all([listLeads(), listPartners()]);
  const s = statements(leads, partners).find((x) => x.vendorId === vendorId && x.month === month);
  if (!s) notFound();
  const partner = partners.find((p) => p.vendor_id === vendorId);
  const log = partner?.commission_log?.[month];
  const issued = chicagoDay(log?.sent_at ?? new Date());
  const number = invoiceNumber(vendorId, month);
  const monthName = new Date(`${month}-15T12:00:00`).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const body = `Hi${partner?.contact_name ? ` ${partner.contact_name.split(" ")[0]}` : ""},\n\nHere is our commission statement for ${monthName}: ${s.orders.length} booked order${s.orders.length === 1 ? "" : "s"}, ${money2(s.commission)} due within 15 days.\n\nThanks,\n${site.name}`;

  return (
    <div className="container-x py-10">
      <style>{printCss}</style>
      <div data-no-print className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/invoices" className="text-sm text-accent">← Invoices</Link>
        <div className="flex gap-2">
          <a href={`mailto:${partner?.contact_email ?? ""}?subject=${encodeURIComponent(`${site.name} statement ${number}`)}&body=${encodeURIComponent(body)}`} className="btn-ghost btn-sm">Email draft</a>
          <PrintButton />
        </div>
      </div>
      <article data-print-doc className="card mx-auto max-w-3xl p-8 sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-heading font-semibold text-3xl">{site.name}</p>
            <p className="mt-1 text-sm text-muted">{site.city}<br />{site.email}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-heading font-semibold text-2xl">Commission statement</p>
            <p className="mt-1 text-muted">No. {number}</p>
            <p className="text-muted">Issued {prettyDay(issued, long)}</p>
            <p className="text-muted">Due {prettyDay(addDays(issued, 15), long)}</p>
          </div>
        </header>
        <section className="mt-8 text-sm">
          <p className="text-xs tracking-wider text-muted uppercase">To</p>
          <p className="mt-1">{vendor.name}{partner?.contact_name && <><br />Attn: {partner.contact_name}</>}{vendor.address && <><br />{vendor.address}</>}</p>
        </section>
        <p className="mt-6 text-sm">Booked orders from {site.name} customers with events in {monthName}.</p>
        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-line">
              <th className="py-2 pr-3 font-medium">Event date</th>
              <th className="py-2 pr-3 font-medium">Customer</th>
              <th className="py-2 pr-3 text-right font-medium">Rental total</th>
              <th className="py-2 text-right font-medium">Commission</th>
            </tr>
          </thead>
          <tbody>
            {s.orders.map((o) => (
              <tr key={o.lead.id} className="border-b border-line">
                <td className="py-2.5 pr-3 whitespace-nowrap">{prettyDay(o.lead.event_date)}</td>
                <td className="py-2.5 pr-3">{o.lead.name || o.lead.email}</td>
                <td className="py-2.5 pr-3 text-right tabular-nums">{money2(o.rentals)}</td>
                <td className="py-2.5 text-right tabular-nums">{o.free ? "Free period" : money2(o.commission)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3} className="pt-3 font-medium">Total due</td><td className="pt-3 text-right font-medium tabular-nums">{money2(s.commission)}</td></tr>
          </tfoot>
        </table>
        <p className="mt-8 text-xs leading-5 text-muted">
          {Math.round(COMMISSION_RATE * 1000) / 10}% of the rental total on booked orders. Your first {FREE_ORDERS} booked orders after signing, and any booked before you signed, are
          free. Rental totals are your prices before delivery, damage waiver and tax. Questions: {site.email}.
        </p>
      </article>
    </div>
  );
}
