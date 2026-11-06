import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { PrintButton, printCss } from "@/components/admin/PrintButton";
import { chicagoDay, eventLine, money2, prettyDay } from "@/lib/admin-view";
import { usd } from "@/lib/catalog-types";
import { getInvoice, stageStatusLabel, type StageStatus } from "@/lib/invoices";
import { site } from "@/lib/site";
import { getLead } from "@/lib/store";
import { sendInvoice } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Invoice", robots: { index: false } };

const long = { month: "long", day: "numeric", year: "numeric" } as const;
const statusClass: Record<StageStatus, string> = { paid: "badge-green", due: "badge-amber", overdue: "badge-rose", upcoming: "badge" };
const sentText: Record<string, string> = { "1": "Invoice emailed to the customer." };
const errorText: Record<string, string> = {
  invoice: "That order could not be found or isn't invoiceable yet (the deposit must be paid first).",
  send: "The email didn't go out. Check RESEND_API_KEY and NOTIFY_FROM in Vercel, then try again.",
};

export default async function OrderInvoicePage(props: PageProps<"/admin/invoices/order/[id]">) {
  const { id } = await props.params;
  const sp = await props.searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const [lead, invoice] = await Promise.all([getLead(id), getInvoice(id)]);
  if (!lead || !invoice) notFound();

  const lines = lead.items ?? [];
  const canEmail = Boolean(lead.proposal_token) && Boolean(process.env.NOTIFY_FROM);

  return (
    <div className="container-x py-10">
      <style>{printCss}</style>
      <div data-no-print className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/invoices?tab=orders" className="text-sm text-accent">← Invoices</Link>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/leads/${lead.id}`} className="btn-ghost btn-sm">Open lead</Link>
          <form action={sendInvoice}>
            <input type="hidden" name="id" value={lead.id} />
            <button type="submit" disabled={!canEmail} className="btn-ghost btn-sm" title={canEmail ? undefined : "Needs a proposal link, RESEND_API_KEY and NOTIFY_FROM"}>
              Email invoice to customer
            </button>
          </form>
          <PrintButton />
        </div>
      </div>

      {sentText[one("sent")] && <p role="status" data-no-print className="badge-green mb-6">{sentText[one("sent")]}</p>}
      {errorText[one("error")] && <p role="alert" data-no-print className="badge-rose mb-6">{errorText[one("error")]}</p>}

      <article data-print-doc className="card mx-auto max-w-3xl p-8 sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-heading font-semibold text-3xl">{site.name}</p>
            <p className="mt-1 text-sm text-muted">{site.city}<br />{site.email}{site.phone && <><br />{site.phone}</>}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-heading font-semibold text-2xl">Invoice</p>
            <p className="mt-1 text-muted">No. {invoice.number}</p>
            <p className="text-muted">{prettyDay(chicagoDay(lead.created_at), long)}</p>
          </div>
        </header>

        <section className="mt-8 grid gap-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs tracking-wider text-muted uppercase">Billed to</p>
            <p className="mt-1">{lead.name || lead.email}<br />{lead.email}{lead.phone && <><br />{lead.phone}</>}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs tracking-wider text-muted uppercase">Event</p>
            <p className="mt-1">{eventLine(lead) || "Not set yet"}</p>
          </div>
        </section>

        <table className="mt-8 w-full text-sm">
          <thead className="text-left text-muted"><tr className="border-b border-line"><th className="py-2 font-medium">Item</th><th className="py-2 text-right font-medium">Qty</th><th className="py-2 text-right font-medium">Each</th><th className="py-2 text-right font-medium">Total</th></tr></thead>
          <tbody>
            {lines.map((l) => (
              <tr key={`${l.id}-${l.variant ?? ""}`} className="border-b border-line/60">
                <td className="py-2 pr-3">{l.name}</td>
                <td className="py-2 text-right tabular-nums">{l.qty}</td>
                <td className="py-2 text-right tabular-nums">{usd(l.unit_price)}</td>
                <td className="py-2 text-right tabular-nums">{usd(l.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="mt-5 space-y-1.5 text-sm">
          <div className="flex justify-between font-medium"><dt>Rentals</dt><dd className="tabular-nums">{usd(invoice.rentals)}</dd></div>
          {invoice.fees.map((f) => (
            <div key={f.label} className="flex justify-between"><dt className="text-muted">{f.label}{f.note ? ` (${f.note})` : ""}</dt><dd className="tabular-nums">{usd(f.amount)}</dd></div>
          ))}
          <div className="flex justify-between border-t border-line pt-2 font-medium"><dt>Order total</dt><dd className="tabular-nums">{usd(invoice.total)}</dd></div>
        </dl>

        <h2 className="mt-8 font-heading font-semibold text-xl">Payment schedule</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-muted"><tr className="border-b border-line"><th className="py-2 font-medium">Stage</th><th className="py-2 font-medium">Due</th><th className="py-2 text-right font-medium">Amount</th><th className="py-2 text-right font-medium">Paid</th><th className="py-2 text-right font-medium">Status</th></tr></thead>
          <tbody>
            {invoice.stages.map((s, i) => (
              <tr key={i} className="border-b border-line/60">
                <td className="py-2 pr-3">{s.label}</td>
                <td className="py-2">{s.dueDate ? prettyDay(s.dueDate, long) : "On booking"}</td>
                <td className="py-2 text-right tabular-nums">{usd(s.amount)}</td>
                <td className="py-2 text-right tabular-nums">{usd(s.paidAmount)}</td>
                <td className="py-2 text-right"><span className={`${statusClass[s.status]} whitespace-nowrap`}>{stageStatusLabel[s.status]}</span></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="pt-3 font-medium">Paid to date</td>
              <td className="pt-3 text-right font-medium tabular-nums" colSpan={2}>{money2(invoice.paidTotal)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="font-medium">Still due</td>
              <td className={`text-right font-medium tabular-nums ${invoice.overdue ? "text-rose" : ""}`} colSpan={2}>
                {money2(invoice.dueTotal)}{invoice.overdue && " · overdue"}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="mt-8 text-xs leading-5 text-muted">
          Rentals are our own prices; fees (delivery, setup, damage waiver and tax) are confirmed once we have your
          venue details and may change before the balance is due. See {site.url}/booking-promise for refunds and changes.
        </p>
      </article>
    </div>
  );
}
