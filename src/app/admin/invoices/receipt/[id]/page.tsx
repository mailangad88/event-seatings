import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { PrintButton, printCss } from "@/components/admin/PrintButton";
import { chicagoDay, money2, prettyDay } from "@/lib/admin-view";
import { chargeLabel } from "@/lib/payments";
import { site } from "@/lib/site";
import { getLead } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Receipt", robots: { index: false } };

const long = { month: "long", day: "numeric", year: "numeric" } as const;

// A printable receipt for the deposit. The balance is due 7 days before the event.
export default async function ReceiptPage(props: PageProps<"/admin/invoices/receipt/[id]">) {
  const { id } = await props.params;
  const lead = await getLead(id);
  if (!lead || lead.fee_status !== "paid") notFound();
  const number = `BC-${chicagoDay(lead.fee_paid_at ?? lead.created_at).replaceAll("-", "")}-${lead.id.slice(0, 6).toUpperCase()}`;

  return (
    <div className="container-x py-10">
      <style>{printCss}</style>
      <div data-no-print className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/invoices?tab=receipts" className="text-sm text-accent">← Invoices</Link>
        <div className="flex gap-2">
          <a href={`mailto:${lead.email}?subject=${encodeURIComponent(`Your ${site.name} receipt ${number}`)}`} className="btn-ghost btn-sm">Email customer</a>
          <PrintButton />
        </div>
      </div>
      <article data-print-doc className="card mx-auto max-w-2xl p-8 sm:p-10">
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-heading font-semibold text-3xl">{site.name}</p>
            <p className="mt-1 text-sm text-muted">{site.city}<br />{site.email}{site.phone && <><br />{site.phone}</>}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-heading font-semibold text-2xl">Receipt</p>
            <p className="mt-1 text-muted">No. {number}</p>
            <p className="text-muted">Paid {prettyDay(chicagoDay(lead.fee_paid_at ?? lead.created_at), long)}</p>
          </div>
        </header>
        <section className="mt-8 text-sm">
          <p className="text-xs tracking-wider text-muted uppercase">Billed to</p>
          <p className="mt-1">{lead.name || lead.email}<br />{lead.email}{lead.phone && <><br />{lead.phone}</>}</p>
        </section>
        <table className="mt-8 w-full text-sm">
          <thead className="text-left text-muted"><tr className="border-b border-line"><th className="py-2 font-medium">Description</th><th className="py-2 text-right font-medium">Amount</th></tr></thead>
          <tbody>
            <tr className="border-b border-line align-top">
              <td className="py-3 pr-4">
                {chargeLabel()}
                <div className="text-xs text-muted">
                  {[lead.event_type, lead.event_date && prettyDay(lead.event_date, long), [lead.venue, lead.city].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}
                </div>
              </td>
              <td className="py-3 text-right tabular-nums">{money2(lead.fee_amount)}</td>
            </tr>
          </tbody>
          <tfoot><tr><td className="pt-3 font-medium">Total paid</td><td className="pt-3 text-right font-medium tabular-nums">{money2(lead.fee_amount)}</td></tr></tfoot>
        </table>
        <p className="mt-8 text-xs leading-5 text-muted">
          Paid {lead.stripe_session_id ? "by card" : "directly to us"}. This is the deposit on your rentals and counts toward your order. The balance,
          with delivery, setup, damage waiver and tax, is due 7 days before your event. See {site.url}/booking-promise for refunds and changes.
        </p>
      </article>
    </div>
  );
}
