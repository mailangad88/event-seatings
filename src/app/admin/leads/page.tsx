import type { Metadata } from "next";
import Link from "next/link";
import { vendors } from "@/data/catalog";
import { usd } from "@/lib/catalog-types";
import { leadStatuses, listLeads, statusLabel, type Lead } from "@/lib/store";
import { markContacted } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Leads", robots: { index: false } };

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/Chicago" });
const day = (d?: string) =>
  d ? new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
const ago = (iso: string) => {
  const h = (Date.now() - new Date(iso).getTime()) / 36e5;
  return h < 1 ? `${Math.max(1, Math.round(h * 60))}m ago` : h < 48 ? `${Math.round(h)}h ago` : `${Math.round(h / 24)}d ago`;
};
const vendorName = (id?: string) => vendors.find((v) => v.id === id)?.name ?? "";
const source = (l: Lead) =>
  [[l.utm_source, l.utm_medium].filter(Boolean).join(" / "), l.source].filter(Boolean).join(" · ");

export default async function LeadsPage(props: PageProps<"/admin/leads">) {
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";
  const kind = typeof sp.kind === "string" ? sp.kind : "";
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";

  const all = await listLeads();
  const open = all.filter((l) => !["completed", "lost"].includes(l.status ?? "new"));
  const due = open
    .filter((l) => l.follow_up_at && l.follow_up_at <= today())
    .sort((a, b) => a.follow_up_at!.localeCompare(b.follow_up_at!));
  const untouched = all.filter((l) => (l.status ?? "new") === "new");

  const leads = all.filter(
    (l) =>
      (!status || (l.status ?? "new") === status) &&
      (!kind || l.kind === kind) &&
      (!q ||
        [l.name, l.email, l.phone, l.city, l.venue, l.event_type, l.message].some((v) => v?.toLowerCase().includes(q))),
  );

  const stages = leadStatuses.map((s) => {
    const inStage = all.filter((l) => (l.status ?? "new") === s.id);
    return { ...s, count: inStage.length, value: inStage.reduce((sum, l) => sum + (l.quote_subtotal ?? 0), 0) };
  });
  const pipelineValue = open.reduce((s, l) => s + (l.quote_subtotal ?? 0), 0);
  const pipelineMargin = open.reduce((s, l) => s + ((l.quote_subtotal ?? 0) - (l.quote_cost ?? 0)), 0);

  const card = "card p-6";
  const href = (p: Record<string, string>) => {
    const u = new URLSearchParams({ ...(status && { status }), ...(kind && { kind }), ...(q && { q }), ...p });
    for (const [k, v] of [...u]) if (!v) u.delete(k);
    return `/admin/leads${u.size ? `?${u}` : ""}`;
  };

  return (
    <div className="container-x py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">CRM</p>
          <h1 className="mt-1 font-serif text-5xl">Lead pipeline</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin" className="btn-ghost">Dashboard</Link>
          <Link href="/admin/vendors" className="btn-ghost">Vendors</Link>
          <a href="/admin/export" className="btn-ghost">Download CSV</a>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {(
          [
            ["Open leads", open.length.toLocaleString()],
            ["Not contacted yet", untouched.length.toLocaleString()],
            ["Open quote value", usd(pipelineValue, 0)],
            ["Est. margin in pipeline", usd(pipelineMargin, 0)],
          ] as const
        ).map(([label, v]) => (
          <div key={label} className={card}>
            <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
            <p className="mt-2 font-serif text-4xl tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <nav className="mt-8 flex gap-2 overflow-x-auto pb-2" aria-label="Pipeline stages">
        <Link href={href({ status: "" })} className={`chip shrink-0 ${!status ? "ring-1 ring-gold" : ""}`}>
          All · {all.length}
        </Link>
        {stages.map((s) => (
          <Link key={s.id} href={href({ status: s.id })} className={`chip shrink-0 ${status === s.id ? "ring-1 ring-gold" : ""}`}>
            {s.label} · {s.count}
            {s.value > 0 && <span className="text-muted"> · {usd(s.value, 0)}</span>}
          </Link>
        ))}
      </nav>

      {due.length > 0 && (
        <section className={`${card} mt-6 border-gold`}>
          <h2 className="font-serif text-2xl">Follow-ups due ({due.length})</h2>
          <ul className="mt-3 divide-y divide-line text-sm">
            {due.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 py-2">
                <Link href={`/admin/leads/${l.id}`} className="text-accent">{l.name ?? l.email}</Link>
                <span className="text-muted">
                  {statusLabel(l.status)} · due {day(l.follow_up_at)}
                  {l.follow_up_at! < today() && <strong className="ml-2 text-red-400">overdue</strong>}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form className="mt-6 flex flex-wrap gap-3" action="/admin/leads">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={q} placeholder="Search name, email, phone, city, venue…" className="field max-w-md" />
        <select name="kind" defaultValue={kind} className="field w-auto">
          <option value="">All forms</option>
          <option value="quote">Quote builder</option>
          <option value="call">Call request</option>
          <option value="waitlist">Waitlist</option>
          <option value="quiz">Style quiz</option>
        </select>
        <button className="btn-ghost">Filter</button>
      </form>

      <section className={`${card} mt-6 overflow-x-auto`}>
        <table className="w-full min-w-[980px] text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-line">
              <th className="py-2 font-medium">Received</th>
              <th className="py-2 font-medium">Lead</th>
              <th className="py-2 font-medium">Event</th>
              <th className="py-2 pr-6 text-right font-medium">Quote</th>
              <th className="py-2 font-medium">Stage</th>
              <th className="py-2 font-medium">Vendor</th>
              <th className="py-2 font-medium">Follow-up</th>
              <th className="py-2 font-medium">Source</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-line align-top last:border-0">
                <td className="py-2.5 whitespace-nowrap text-muted" title={new Date(l.created_at).toLocaleString("en-US")}>
                  {ago(l.created_at)}
                </td>
                <td className="py-2.5">
                  <Link href={`/admin/leads/${l.id}`} className="font-medium text-accent">{l.name ?? l.email}</Link>
                  <div className="text-muted">{l.phone ?? l.email}</div>
                  <span className="chip mt-1">{l.kind}</span>
                </td>
                <td className="py-2.5">
                  {l.event_type && <div>{l.event_type}</div>}
                  <div className="text-muted">
                    {[day(l.event_date), l.guest_count && `${l.guest_count} guests`, l.city].filter(Boolean).join(" · ")}
                  </div>
                </td>
                <td className="py-2.5 pr-6 text-right tabular-nums">
                  {l.quote_subtotal ? usd(l.quote_subtotal, 0) : ""}
                  {l.items?.length ? <div className="text-muted">{l.items.length} items</div> : null}
                </td>
                <td className="py-2.5 whitespace-nowrap">{statusLabel(l.status)}</td>
                <td className="py-2.5">{vendorName(l.assigned_vendor)}</td>
                <td className={`py-2.5 whitespace-nowrap ${l.follow_up_at && l.follow_up_at < today() ? "text-red-400" : ""}`}>
                  {day(l.follow_up_at)}
                </td>
                <td className="py-2.5 text-muted">{source(l)}</td>
                <td className="py-2.5 text-right">
                  {(l.status ?? "new") === "new" && (
                    <form action={markContacted}>
                      <input type="hidden" name="id" value={l.id} />
                      <button className="text-xs whitespace-nowrap text-accent underline">Mark contacted</button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-muted">No leads match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
