import type { Metadata } from "next";
import Link from "@/components/Link";
import { applicationStatuses, applicationStatusLabel, listVendorApplications } from "@/lib/vendor-applications";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Vendor applications", robots: { index: false } };

const ago = (iso: string) => {
  const h = (Date.now() - new Date(iso).getTime()) / 36e5;
  return h < 1 ? `${Math.max(1, Math.round(h * 60))}m ago` : h < 48 ? `${Math.round(h)}h ago` : `${Math.round(h / 24)}d ago`;
};

// Every vendor sign-up from /partners/onboard, newest first, filterable by review status.
export default async function ApplicationsPage(props: PageProps<"/admin/applications">) {
  const sp = await props.searchParams;
  const filter = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const all = await listVendorApplications();
  const rows = all.filter(
    (a) =>
      (!filter || a.status === filter) &&
      (!q || [a.company, a.contact_name, a.email, a.phone, ...a.categories, ...a.areas].some((v) => v?.toLowerCase().includes(q))),
  );

  return (
    <div className="container-x py-12">
      <Link href="/admin" className="text-sm text-accent">← Dashboard</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="display-2 mt-1">Vendor applications</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Rental companies that signed up on /partners/onboard. Call each one, check their prices, then approve. Approving
            emails them (if you tick the box) and, when linked to a catalog vendor, moves that vendor to &ldquo;In talks&rdquo;.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/vendors" className="btn-ghost">Rental partners</Link>
          <Link href="/partners/onboard" className="btn-ghost">Open the sign-up form</Link>
        </div>
      </div>

      <nav aria-label="Filter by status" className="mt-6 flex flex-wrap gap-2">
        <Link href="/admin/applications" className={!filter ? "chip chip-active" : "chip"}>All {all.length}</Link>
        {applicationStatuses.map((s) => (
          <Link key={s.id} href={`/admin/applications?status=${s.id}`} className={filter === s.id ? "chip chip-active" : "chip"}>
            {s.label} {all.filter((a) => a.status === s.id).length}
          </Link>
        ))}
      </nav>
      <form className="mt-4 flex max-w-md gap-2">
        {filter && <input type="hidden" name="status" value={filter} />}
        <input name="q" defaultValue={q} placeholder="Search company, name, category, area" className="field" />
        <button className="btn-ghost">Search</button>
      </form>

      <section className="card mt-6 min-w-0 overflow-x-auto p-6">
        {rows.length === 0 ? (
          <p className="text-sm text-muted">
            No applications {filter || q ? "match" : "yet"}. If you expected some, check that supabase/schema.sql has been re-run
            (the vendor_applications table). Until then, sign-ups are saved as partner leads in <Link href="/admin/leads?kind=partner" className="link">Leads</Link>.
          </p>
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead className="text-left text-muted">
              <tr className="border-b border-line">
                <th className="py-2 pr-4 font-medium">Company</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 pr-4 font-medium">Rents</th>
                <th className="py-2 pr-4 font-medium">Delivers to</th>
                <th className="py-2 pr-4 font-medium">Prices</th>
                <th className="py-2 pr-4 font-medium">Sent</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-b border-line align-top">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/applications/${a.id}`} className="font-medium text-accent">{a.company}</Link>
                    <span className="block text-xs text-muted">{a.contact_name} · {a.phone}</span>
                  </td>
                  <td className="py-3 pr-4"><span className={a.status === "submitted" ? "chip chip-active" : "chip"}>{applicationStatusLabel(a.status)}</span></td>
                  <td className="py-3 pr-4">{a.categories.join(", ")}</td>
                  <td className="py-3 pr-4">{a.areas.join(", ")}</td>
                  <td className="py-3 pr-4">{a.price_items?.length ? `${a.price_items.length} rows` : a.price_list_url ? "Link" : "None"}</td>
                  <td className="py-3 pr-4 whitespace-nowrap text-muted">{ago(a.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
