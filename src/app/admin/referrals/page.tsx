import type { Metadata } from "next";
import Link from "next/link";
import { usd } from "@/lib/catalog-types";
import { listReferrers, referralReward } from "@/lib/referrals";
import { site } from "@/lib/site";
import { listLeads, statusLabel } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Referrals", robots: { index: false } };

// Who shared a /refer link, and which leads arrived through it.
export default async function AdminReferralsPage() {
  const [referrers, leads] = await Promise.all([listReferrers(), listLeads()]);
  const referred = leads.filter((l) => l.referral_code);
  const byCode = new Map<string, typeof referred>();
  for (const l of referred) byCode.set(l.referral_code!, [...(byCode.get(l.referral_code!) ?? []), l]);
  const won = (ls: typeof referred) => ls.filter((l) => l.status === "booked" || l.status === "completed");
  const rows = referrers
    .map((r) => ({ r, leads: byCode.get(r.code) ?? [] }))
    .sort((a, b) => b.leads.length - a.leads.length || b.r.created_at.localeCompare(a.r.created_at));
  const unknown = [...byCode.entries()].filter(([code]) => !referrers.some((r) => r.code === code));
  const reward = referralReward();

  return (
    <div className="container-x py-12">
      <Link href="/admin" className="text-sm text-accent">← Dashboard</Link>
      <p className="eyebrow mt-3">Admin</p>
      <h1 className="mt-1 font-serif text-5xl">Referrals</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        People who made a share link on /refer, and the leads that came in through it (kept for 90 days in the visitor&apos;s browser).
        {reward ? ` Reward shown on the site: ${reward}.` : " No reward is promised on the site; set REFERRAL_REWARD once you've chosen a real one."}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Share links made", referrers.length],
          ["Referred leads", referred.length],
          ["Referred bookings", won(referred).length],
        ].map(([label, n]) => (
          <div key={label} className="card p-5">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-serif text-4xl">{n}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-2">Referrer</th>
              <th>Code</th>
              <th>Leads</th>
              <th>Booked</th>
              <th>Quote value</th>
              <th>Referred leads</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map(({ r, leads: ls }) => (
              <tr key={r.code} className="align-top">
                <td className="py-3">
                  {r.name}
                  <br />
                  <a href={`mailto:${r.email}`} className="text-accent">{r.email}</a>
                </td>
                <td className="py-3 font-mono text-xs">
                  <a href={`${site.url}/?ref=${r.code}`} className="text-accent">{r.code}</a>
                </td>
                <td className="py-3">{ls.length}</td>
                <td className="py-3">{won(ls).length}</td>
                <td className="py-3">{usd(ls.reduce((s, l) => s + (l.quote_subtotal ?? 0), 0), 0)}</td>
                <td className="py-3">
                  {ls.map((l) => (
                    <Link key={l.id} href={`/admin/leads/${l.id}`} className="mr-3 block text-accent">
                      {l.name ?? l.email} · {statusLabel(l.status)}
                    </Link>
                  ))}
                </td>
              </tr>
            ))}
            {unknown.map(([code, ls]) => (
              <tr key={code}>
                <td className="py-3 text-muted">Unknown code</td>
                <td className="py-3 font-mono text-xs">{code}</td>
                <td className="py-3">{ls.length}</td>
                <td className="py-3">{won(ls).length}</td>
                <td className="py-3">{usd(ls.reduce((s, l) => s + (l.quote_subtotal ?? 0), 0), 0)}</td>
                <td className="py-3">
                  {ls.map((l) => (
                    <Link key={l.id} href={`/admin/leads/${l.id}`} className="mr-3 block text-accent">{l.name ?? l.email}</Link>
                  ))}
                </td>
              </tr>
            ))}
            {!rows.length && !unknown.length && (
              <tr>
                <td colSpan={6} className="py-6 text-muted">No referral links yet. Share {site.url}/refer with happy customers.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
