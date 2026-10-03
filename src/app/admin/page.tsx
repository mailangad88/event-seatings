import type { Metadata } from "next";
import { chairs } from "@/data/chairs";
import { getVoteCounts, listLeads } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

function tally<T>(items: T[], key: (t: T) => string | undefined) {
  const out: Record<string, number> = {};
  for (const i of items) {
    const k = key(i);
    if (k) out[k] = (out[k] ?? 0) + 1;
  }
  return Object.entries(out).sort((a, b) => b[1] - a[1]);
}

function Bars({ rows, empty }: { rows: [string, number][]; empty: string }) {
  const max = Math.max(1, ...rows.map(([, n]) => n));
  if (rows.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="space-y-2 text-sm">
      {rows.map(([label, n]) => (
        <li key={label} className="grid grid-cols-[minmax(0,10rem)_1fr_2.5rem] items-center gap-3">
          <span className="truncate" title={label}>{label}</span>
          <span className="h-2.5 rounded-full bg-accent" style={{ width: `${(n / max) * 100}%` }} />
          <span className="text-right tabular-nums">{n}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminPage() {
  const [votes, leads] = await Promise.all([getVoteCounts(), listLeads()]);
  const quotes = leads.filter((l) => l.kind === "quote");

  const demand = chairs
    .map((c) => {
      const q = quotes.filter((l) => l.chairs?.includes(c.slug));
      return {
        chair: c,
        votes: votes[c.slug] ?? 0,
        quotes: q.length,
        guests: q.reduce((s, l) => s + (l.guest_count ?? 0), 0),
      };
    })
    .map((d) => ({ ...d, score: d.votes + d.quotes * 5 }))
    .sort((a, b) => b.score - a.score);

  const byMonth = tally(quotes, (l) =>
    l.event_date ? new Date(`${l.event_date}T12:00:00`).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : undefined,
  ).sort((a, b) => new Date(`1 ${a[0]}`).getTime() - new Date(`1 ${b[0]}`).getTime());

  const stats: [string, number][] = [
    ["Chair votes", Object.values(votes).reduce((a, b) => a + b, 0)],
    ["Quote requests", quotes.length],
    ["Waitlist", leads.filter((l) => l.kind === "waitlist").length],
    ["Quiz emails", leads.filter((l) => l.kind === "quiz").length],
    ["Guests in quotes", quotes.reduce((s, l) => s + (l.guest_count ?? 0), 0)],
  ];

  const card = "rounded-2xl border border-line bg-surface p-6";

  return (
    <div className="container-x py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-1 font-serif text-5xl">Demand dashboard</h1>
        </div>
        <a href="/admin/export" className="btn-ghost">Download leads (CSV)</a>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map(([label, n]) => (
          <div key={label} className={card}>
            <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
            <p className="mt-2 font-serif text-4xl tabular-nums">{n.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <section className={`${card} mt-8 overflow-x-auto`}>
        <h2 className="font-serif text-2xl">Which chairs to order</h2>
        <p className="mt-1 text-sm text-muted">
          Ranked by demand score = votes + 5 × quote requests. &ldquo;Guests&rdquo; adds up guest counts on quotes that
          include the chair, a rough ceiling on how many of that chair people asked for.
        </p>
        <table className="mt-4 w-full min-w-[560px] text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-line">
              <th className="py-2 font-medium">#</th>
              <th className="py-2 font-medium">Chair</th>
              <th className="py-2 text-right font-medium">Votes</th>
              <th className="py-2 text-right font-medium">Quotes</th>
              <th className="py-2 text-right font-medium">Guests</th>
              <th className="py-2 text-right font-medium">Score</th>
            </tr>
          </thead>
          <tbody>
            {demand.map((d, i) => (
              <tr key={d.chair.slug} className="border-b border-line last:border-0">
                <td className="py-2.5 text-muted">{i + 1}</td>
                <td className="py-2.5">{d.chair.name}</td>
                <td className="py-2.5 text-right tabular-nums">{d.votes}</td>
                <td className="py-2.5 text-right tabular-nums">{d.quotes}</td>
                <td className="py-2.5 text-right tabular-nums">{d.guests.toLocaleString()}</td>
                <td className="py-2.5 text-right font-semibold tabular-nums">{d.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className={card}>
          <h2 className="mb-4 font-serif text-2xl">Event months</h2>
          <Bars rows={byMonth} empty="No quote requests yet." />
        </section>
        <section className={card}>
          <h2 className="mb-4 font-serif text-2xl">Event types</h2>
          <Bars rows={tally(quotes, (l) => l.event_type)} empty="No quote requests yet." />
        </section>
        <section className={card}>
          <h2 className="mb-4 font-serif text-2xl">Cities</h2>
          <Bars rows={tally(quotes, (l) => l.city?.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()))} empty="No quote requests yet." />
        </section>
      </div>

      <section className={`${card} mt-8 overflow-x-auto`}>
        <h2 className="font-serif text-2xl">Recent leads</h2>
        <table className="mt-4 w-full min-w-[760px] text-sm">
          <thead className="text-left text-muted">
            <tr className="border-b border-line">
              <th className="py-2 font-medium">Received</th>
              <th className="py-2 font-medium">Type</th>
              <th className="py-2 font-medium">Name / email</th>
              <th className="py-2 font-medium">Event</th>
              <th className="py-2 font-medium">Chairs</th>
            </tr>
          </thead>
          <tbody>
            {leads.slice(0, 100).map((l) => (
              <tr key={l.id} className="border-b border-line align-top last:border-0">
                <td className="py-2.5 whitespace-nowrap text-muted">{new Date(l.created_at).toLocaleDateString("en-US")}</td>
                <td className="py-2.5"><span className="chip">{l.kind}</span></td>
                <td className="py-2.5">
                  {l.name && <div>{l.name}</div>}
                  <a href={`mailto:${l.email}`} className="text-accent">{l.email}</a>
                  {l.phone && <div className="text-muted">{l.phone}</div>}
                </td>
                <td className="py-2.5">
                  {[l.event_date, l.event_type, l.guest_count && `${l.guest_count} guests`, l.city, l.venue]
                    .filter(Boolean)
                    .join(" · ")}
                  {l.message && <div className="mt-1 max-w-xs text-muted">{l.message}</div>}
                </td>
                <td className="py-2.5">{l.chairs?.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && <p className="py-6 text-sm text-muted">No leads yet.</p>}
      </section>
    </div>
  );
}
