import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { vendors } from "@/data/vendors";
import { usd } from "@/lib/catalog-types";
import { site } from "@/lib/site";
import {
  applicationStatuses,
  applicationStatusLabel,
  getVendorApplication,
  insuranceOptions,
} from "@/lib/vendor-applications";
import { saveApplication } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vendor application", robots: { index: false } };

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/Chicago" });

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  if (children === undefined || children === null || children === "" || (Array.isArray(children) && !children.length)) return null;
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-3 py-1.5">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 [overflow-wrap:anywhere]">{children}</dd>
    </div>
  );
}

const ext = (url?: string) => (url ? <a href={url} target="_blank" rel="noreferrer noopener" className="link">{url}</a> : undefined);

export default async function ApplicationPage(props: PageProps<"/admin/applications/[id]">) {
  const { id } = await props.params;
  const app = await getVendorApplication(id);
  if (!app) notFound();
  const card = "card min-w-0 p-6";
  // Suggest a catalog vendor with a matching name, for companies we already list.
  const guess = vendors.find((v) => v.name.toLowerCase().split(/\s+/)[0] === app.company.toLowerCase().split(/\s+/)[0]);

  return (
    <div className="container-x py-12">
      <Link href="/admin/applications" className="text-sm text-accent">← Vendor applications</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Vendor application · {applicationStatusLabel(app.status)}</p>
          <h1 className="display-2 mt-1">{app.company}</h1>
          <p className="mt-2 text-sm text-muted">Sent {when(app.created_at)}{app.source ? ` from ${app.source}` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${app.phone}`} className="btn-primary">Call {app.contact_name.split(" ")[0]}</a>
          <a href={`mailto:${app.email}`} className="btn-ghost">Email</a>
          <a href={`/partners/status/${app.status_token}`} target="_blank" className="btn-ghost">Their status page</a>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="display-3">Company</h2>
            <dl className="mt-3 text-sm">
              <Row label="Contact">{[app.contact_name, app.contact_role].filter(Boolean).join(", ")}</Row>
              <Row label="Email">{app.email}</Row>
              <Row label="Phone">{app.phone}</Row>
              <Row label="Website">{ext(app.website)}</Row>
              <Row label="Years in business">{app.years_in_business}</Row>
            </dl>
          </section>
          <section className={card}>
            <h2 className="display-3">Rentals, area and schedule</h2>
            <dl className="mt-3 text-sm">
              <Row label="Rents">{app.categories.join(", ")}</Row>
              <Row label="Delivers to">{app.areas.join(", ")}</Row>
              <Row label="Area notes">{app.area_notes}</Row>
              <Row label="Notice needed">{app.lead_time}</Row>
              <Row label="Delivery days">{app.open_days?.join(", ")}</Row>
              <Row label="Events per day">{app.max_events_per_day}</Row>
              <Row label="Order minimum">{app.order_minimum}</Row>
              <Row label="Setup">{app.setup}</Row>
              <Row label="Weekends">{app.weekends}</Row>
              <Row label="Full or closed">{app.blackout_dates}</Row>
            </dl>
          </section>
          <section className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="display-3">Price list</h2>
              {!!app.price_items?.length && (
                <a href={`/admin/applications/${app.id}/prices`} className="btn-ghost btn-sm">Download CSV ({app.price_items.length} rows)</a>
              )}
            </div>
            {app.price_list_url && <p className="mt-3 text-sm">Link: {ext(app.price_list_url)}</p>}
            {app.price_items?.length ? (
              <div className="mt-4 max-h-[420px] overflow-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead className="sticky top-0 bg-surface text-left text-muted">
                    <tr className="border-b border-line">
                      <th className="py-2 pr-3 font-medium">Item</th>
                      <th className="py-2 pr-3 font-medium">Category</th>
                      <th className="py-2 pr-3 font-medium">Unit</th>
                      <th className="py-2 pr-3 text-right font-medium">Their price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {app.price_items.map((r, i) => (
                      <tr key={i} className="border-b border-line">
                        <td className="py-1.5 pr-3">{r.name}{r.specs ? <span className="text-muted"> · {r.specs}</span> : null}</td>
                        <td className="py-1.5 pr-3 text-muted">{r.category}</td>
                        <td className="py-1.5 pr-3 text-muted">{r.unit}</td>
                        <td className="py-1.5 pr-3 text-right">{r.price !== undefined ? usd(r.price) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !app.price_list_url && <p className="mt-3 text-sm text-muted">No prices sent yet. Ask for them on the call.</p>
            )}
          </section>
          <section className={card}>
            <h2 className="display-3">Payments, insurance and photos</h2>
            <dl className="mt-3 text-sm">
              <Row label="Deposit">{app.deposit_policy}</Row>
              <Row label="Customers pay by">{app.payment_methods?.join(", ")}</Row>
              <Row label="Damage waiver">{app.damage_waiver}</Row>
              <Row label="Billing contact">{[app.billing_name, app.billing_email].filter(Boolean).join(", ")}</Row>
              <Row label="Pays our statement by">{app.commission_pay}</Row>
              <Row label="Insurance">{insuranceOptions.find((o) => o.id === app.insurance)?.label}</Row>
              <Row label="Photos">{app.photo_permission === "yes" ? "OK to use with credit" : "No, use our images"}</Row>
              <Row label="Photo link">{ext(app.photo_link)}</Row>
              <Row label="Agreed to terms">{app.agreed_terms_at ? when(app.agreed_terms_at) : undefined}</Row>
              <Row label="Their notes">{app.notes}</Row>
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <form key={app.updated_at ?? app.created_at} action={saveApplication} className={`${card} space-y-4`}>
            <h2 className="display-3">Review</h2>
            <input type="hidden" name="id" value={app.id} />
            <div>
              <label className="label" htmlFor="a-status">Status</label>
              <select id="a-status" name="status" defaultValue={app.status} className="field">
                {applicationStatuses.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <label className="flex gap-2 text-sm">
              <input type="checkbox" name="email_vendor" defaultChecked className="mt-1" />
              <span>Email the vendor when the status changes{process.env.NOTIFY_FROM ? "" : " (needs NOTIFY_FROM set)"}</span>
            </label>
            <div>
              <label className="label" htmlFor="a-msg">Your message to them, optional</label>
              <textarea id="a-msg" name="vendor_message" rows={3} className="field" placeholder="E.g. could you send prices for your tents?" />
            </div>
            <div>
              <label className="label" htmlFor="a-link">Same company as catalog vendor</label>
              <select id="a-link" name="linked_vendor_id" defaultValue={app.linked_vendor_id ?? ""} className="field">
                <option value="">Not in the catalog yet</option>
                {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
              {!app.linked_vendor_id && guess && <p className="hint mt-1">Possible match: {guess.name}</p>}
            </div>
            <div>
              <label className="label" htmlFor="a-notes">Private notes</label>
              <textarea id="a-notes" name="admin_notes" rows={4} defaultValue={app.admin_notes ?? ""} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="a-note">Log a call, email or note</label>
              <div className="flex gap-2">
                <select name="note_type" className="field w-28" aria-label="Type">
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="note">Note</option>
                </select>
                <input id="a-note" name="note" className="field" placeholder="Left a voicemail…" />
              </div>
            </div>
            <button className="btn-primary w-full">Save</button>
          </form>

          <section className={card}>
            <h2 className="display-3">History</h2>
            <ol className="mt-3 space-y-3 text-sm">
              <li><span className="text-muted">{when(app.created_at)}</span> · Application sent</li>
              {(app.activity ?? []).map((a, i) => (
                <li key={i}><span className="text-muted">{when(a.at)} · {a.type}</span><br />{a.text}</li>
              ))}
            </ol>
          </section>
          <section className={`${card} text-sm text-muted`}>
            <h2 className="display-3 text-ink">After approval</h2>
            <ol className="mt-3 list-decimal space-y-1 pl-5">
              <li>Send the one-page partner agreement (terms on {site.url.replace(/^https?:\/\//, "")}/partners#terms).</li>
              <li>Ask for their insurance certificate if they have one.</li>
              <li>Add their prices to the catalog (download the CSV above) and send them a preview.</li>
              <li>Set them to &ldquo;Referral deal signed&rdquo; in Rental partners once they sign.</li>
            </ol>
          </section>
        </div>
      </div>
    </div>
  );
}
