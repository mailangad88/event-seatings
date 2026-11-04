import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { vendors } from "@/data/vendors";
import { AdminHeader } from "@/components/admin/AdminUi";
import { LeadFlow } from "@/components/admin/LeadFlow";
import { eventLine, money2, prettyDay } from "@/lib/admin-view";
import { MARKUP } from "@/lib/catalog-types";
import { amountDue, chargeLabel } from "@/lib/payments";
import { getLead } from "@/lib/store";
import { saveQuote } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Edit quote", robots: { index: false } };

export default async function EditQuotePage(props: PageProps<"/admin/leads/[id]/quote">) {
  const { id } = await props.params;
  const lead = await getLead(id);
  if (!lead) notFound();
  const lines = lead.items ?? [];
  const locked = lead.fee_status === "paid";
  const vendorName = (v: string) => vendors.find((x) => x.id === v)?.name ?? v;

  return (
    <div className="container-x py-10">
      <Link href={`/admin/leads/${lead.id}`} className="text-sm text-accent">← Back to {lead.name || lead.email}</Link>
      <div className="mt-3">
        <AdminHeader
          group="Sell"
          title="Edit quote"
          intro={
            <>
              {[eventLine(lead), lead.event_date && prettyDay(lead.event_date)].filter(Boolean).join(" · ")}. Change quantities or put in the
              rental company&apos;s real price after you talk to them. Customer prices are the supplier&apos;s price plus {Math.round(MARKUP * 100)}%, with no separate fee.
              {lead.proposal_token && !locked && ` The proposal link and the ${chargeLabel().toLowerCase()} update as soon as you save.`}
            </>
          }
        />
      </div>
      <LeadFlow lead={lead} current="quote" />

      {locked && (
        <p className="card mt-6 border-rose/40 p-4 text-sm">
          The deposit is paid, so this quote is locked. If the order changes, agree it with the customer and the rental company in writing,
          and note it on the lead.
        </p>
      )}

      <form action={saveQuote} className="card mt-6 p-6">
        <input type="hidden" name="id" value={lead.id} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-left text-muted">
              <tr className="border-b border-line">
                <th className="py-2 pr-4 font-medium">Item</th>
                <th className="py-2 pr-4 font-medium">Qty</th>
                <th className="py-2 pr-4 font-medium">Vendor price each</th>
                <th className="py-2 pr-4 text-right font-medium">Customer each</th>
                <th className="py-2 pr-4 text-right font-medium">Line total</th>
                <th className="py-2 font-medium">Remove</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={`${l.id}-${i}`} className="border-b border-line align-top">
                  <td className="py-2.5 pr-4">
                    {l.name}
                    <div className="text-xs text-muted">{[l.variant, l.unit, vendorName(l.vendor_id)].filter(Boolean).join(" · ")}</div>
                  </td>
                  <td className="py-2.5 pr-4">
                    <label className="sr-only" htmlFor={`qty_${i}`}>Quantity of {l.name}</label>
                    <input id={`qty_${i}`} name={`qty_${i}`} type="number" min={0} max={10000} defaultValue={l.qty} disabled={locked} className="field w-24 py-1.5" />
                  </td>
                  <td className="py-2.5 pr-4">
                    <label className="sr-only" htmlFor={`vendor_price_${i}`}>Vendor price for {l.name}</label>
                    <input id={`vendor_price_${i}`} name={`vendor_price_${i}`} type="number" min={0} step="0.01" defaultValue={l.vendor_price} disabled={locked} className="field w-28 py-1.5" />
                  </td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{money2(l.unit_price)}</td>
                  <td className="py-2.5 pr-4 text-right tabular-nums">{money2(l.line_total)}</td>
                  <td className="py-2.5">
                    <label className="flex items-center gap-2"><input type="checkbox" name={`remove_${i}`} disabled={locked} /> <span className="sr-only">Remove {l.name}</span></label>
                  </td>
                </tr>
              ))}
              {lines.length === 0 && (
                <tr><td colSpan={6} className="py-3 text-muted">No items yet. Add the first one below.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <dl className="mt-4 ml-auto max-w-xs space-y-1 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Customer total</dt><dd className="tabular-nums">{money2(lead.quote_subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Rental companies charge</dt><dd className="tabular-nums">{money2(lead.quote_cost)}</dd></div>
          <div className="flex justify-between font-medium"><dt>{chargeLabel()}</dt><dd className="tabular-nums">{money2(lead.fee_amount ?? amountDue(lead))}</dd></div>
        </dl>

        {!locked && (
          <fieldset className="mt-6 border-t border-line pt-5">
            <legend className="font-heading font-semibold text-xl">Add a line</legend>
            <p className="text-xs text-muted">For delivery, setup, or anything the rental company adds that isn&apos;t in the catalog.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-2">
                <label className="label" htmlFor="new_name">Item</label>
                <input id="new_name" name="new_name" className="field" placeholder="Delivery and pickup" />
              </div>
              <div>
                <label className="label" htmlFor="new_qty">Qty</label>
                <input id="new_qty" name="new_qty" type="number" min={1} defaultValue={1} className="field" />
              </div>
              <div>
                <label className="label" htmlFor="new_vendor_price">Vendor price each</label>
                <input id="new_vendor_price" name="new_vendor_price" type="number" min={0} step="0.01" className="field" />
              </div>
              <div>
                <label className="label" htmlFor="new_unit">Unit</label>
                <input id="new_unit" name="new_unit" className="field" placeholder="each" />
              </div>
              <div className="sm:col-span-2 lg:col-span-5">
                <label className="label" htmlFor="new_vendor_id">Rental company</label>
                <select id="new_vendor_id" name="new_vendor_id" defaultValue={lead.assigned_vendor ?? lines[0]?.vendor_id ?? ""} className="field">
                  <option value="">Choose one</option>
                  {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            </div>
          </fieldset>
        )}

        {!locked && (
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" className="btn-primary">Save quote</button>
            <Link href={`/admin/leads/${lead.id}`} className="btn-ghost">Cancel</Link>
          </div>
        )}
      </form>
    </div>
  );
}
