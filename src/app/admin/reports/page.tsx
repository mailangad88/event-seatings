import type { Metadata } from "next";
import Link from "@/components/Link";
import { chairs } from "@/data/chairs";
import { usd } from "@/lib/catalog-types";
import { buildDashboard, dayKey, formDetail, formName, getRange, kindLabels, rangeStart, leadChannel, ranges, type DayPoint, type Row } from "@/lib/dashboard";
import { getVoteCounts, leadStatuses, listLeads, listPageViews, statusLabel, type Lead } from "@/lib/store";
import { Bars as ColumnBars, Ring } from "@/components/office/Charts";
import { OfficeTabs, pickTab } from "@/components/office/OfficeTabs";
import { chicagoDay } from "@/lib/admin-view";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Business reports", robots: { index: false } };

// One tab per question, so nothing is a long scroll: how are we doing, where do people come from,
// how far do they get, what do they want, which rental partners get the work, and the money.
const reportTabs = ["overview", "money", "sources", "pipeline", "demand", "vendors", "latest"] as const;
const reportTabLabel: Record<(typeof reportTabs)[number], string> = {
  overview: "Overview",
  money: "Money",
  sources: "Lead sources",
  pipeline: "Conversion",
  demand: "What people want",
  vendors: "Rental partners",
  latest: "Latest enquiries",
};
const rangeHref = (id: string, tab: string) => {
  const q = new URLSearchParams();
  if (id !== "30") q.set("range", id);
  if (tab !== "overview") q.set("tab", tab);
  const s = q.toString();
  return s ? `/admin/reports?${s}` : "/admin/reports";
};

const card = "card min-w-0 p-6";
const pct = (n?: number) => (n === undefined ? "–" : `${(n * 100).toFixed(n > 0 && n < 0.1 ? 1 : 0)}%`);
const money = (n: number) => usd(n, 0);
const shortDay = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const hours = (h?: number) => (h === undefined ? "–" : h < 1 ? `${Math.round(h * 60)} min` : h < 48 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} days`);

function Stat({ label, value, note }: { label: string; value: string; note?: React.ReactNode }) {
  return (
    <div className={card}>
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-2 font-heading font-semibold text-4xl tabular-nums">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}

// Horizontal bars, one hue. The count is always printed, so the bar is never the only way to read the value.
function Bars({ rows, empty, value, limit = 10 }: { rows: Row[]; empty: string; value?: boolean; limit?: number }) {
  if (rows.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  const shown = rows.slice(0, limit);
  const max = Math.max(1, ...shown.map((r) => r.count));
  return (
    <ul className="space-y-2.5 text-sm">
      {shown.map((r) => (
        <li key={r.label} title={`${r.label}: ${r.count}${value && r.value ? ` · ${money(r.value)}` : ""}`}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="min-w-0 truncate">{r.label}</span>
            <span className="shrink-0 tabular-nums">
              {r.count}
              {value && r.value ? <span className="ml-2 text-xs text-muted">{money(r.value)}</span> : null}
            </span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-surface-2">
            <div className="h-1.5 rounded-full bg-accent" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
      {rows.length > limit && <li className="text-xs text-muted">+ {rows.length - limit} more</li>}
    </ul>
  );
}

// Enquiries per day (or week) as columns, with visitors as a quiet line of numbers in the tooltip.
function Timeline({ points, weekly }: { points: DayPoint[]; weekly: boolean }) {
  const max = Math.max(1, ...points.map((p) => p.count));
  const W = 1000;
  const H = 180;
  const gap = points.length > 60 ? 1 : 2;
  const bw = W / points.length;
  const ticks = [0, Math.ceil(max / 2), max].filter((v, i, a) => a.indexOf(v) === i);
  const labelEvery = Math.ceil(points.length / 8);
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="w-full" role="img" aria-label={`Enquiries per ${weekly ? "week" : "day"}`}>
        {ticks.map((t) => {
          const y = H - (t / max) * (H - 10);
          return (
            <g key={t}>
              <line x1={0} x2={W} y1={y} y2={y} stroke="var(--line)" strokeWidth={1} />
              <text x={0} y={y - 3} fontSize={11} fill="var(--muted)">{t}</text>
            </g>
          );
        })}
        {points.map((p, i) => {
          const h = (p.count / max) * (H - 10);
          return (
            <g key={p.day}>
              <rect x={i * bw} y={0} width={bw} height={H} fill="transparent">
                <title>
                  {`${weekly ? "Week of " : ""}${shortDay(p.day)}: ${p.count} enquir${p.count === 1 ? "y" : "ies"}, ${p.quotes} quote${p.quotes === 1 ? "" : "s"}${p.value ? `, ${money(p.value)}` : ""}${p.visitors ? `, ${p.visitors} visitors` : ""}`}
                </title>
              </rect>
              {p.count > 0 && (
                <rect x={i * bw + gap / 2} y={H - h} width={Math.max(1, bw - gap)} height={h} rx={Math.min(4, bw / 3)} fill="var(--accent)" pointerEvents="none" />
              )}
              {i % labelEvery === 0 && (
                <text x={i * bw + bw / 2} y={H + 16} fontSize={11} fill="var(--muted)" textAnchor="middle">{shortDay(p.day)}</text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">
        {points.filter((p) => p.count).map((p) => `${shortDay(p.day)}: ${p.count}`).join(", ") || "No enquiries in this period."}
      </figcaption>
    </figure>
  );
}

function Table({ head, rows, min = 560 }: { head: string[]; rows: React.ReactNode[][]; min?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth: min }}>
        <thead className="text-left text-muted">
          <tr className="border-b border-line">
            {head.map((h, i) => (
              <th key={h} className={`py-2 pr-4 font-medium ${i > 0 ? "text-right" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-line last:border-0">
              {r.map((c, j) => (
                <td key={j} className={`py-2 pr-4 ${j > 0 ? "text-right tabular-nums" : ""}`}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminPage(props: PageProps<"/admin/reports">) {
  const sp = await props.searchParams;
  const tab = pickTab(sp.tab, reportTabs);
  const range = getRange(typeof sp.range === "string" ? sp.range : undefined);
  const since = rangeStart(range.days);
  const [votes, allLeads, views] = await Promise.all([getVoteCounts(), listLeads(), listPageViews(since)]);
  const d = buildDashboard(allLeads, views, range.days);
  const k = d.kpis;
  const weekly = d.weekly;

  const change =
    d.prevCount === undefined ? undefined : d.prevCount === 0 ? (k.enquiries ? "new this period" : undefined) : `${k.enquiries >= d.prevCount ? "+" : ""}${Math.round(((k.enquiries - d.prevCount) / d.prevCount) * 100)}% vs previous ${range.label}`;

  const stageRows = leadStatuses.map((s) => {
    const ls = d.leads.filter((l) => (l.status ?? "new") === s.id);
    return { ...s, count: ls.length, value: ls.reduce((a, l) => a + (l.quote_subtotal ?? 0), 0) };
  });
  const stageMax = Math.max(1, ...stageRows.map((s) => s.count));

  const demand = chairs
    .map((c) => {
      const q = d.quotes.filter((l) => l.chairs?.includes(c.slug));
      return { chair: c, votes: votes[c.slug] ?? 0, quotes: q.length, score: (votes[c.slug] ?? 0) + q.length * 5 };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div className="container-x py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-muted uppercase">Grow</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Business reports</h1>
          <p className="mt-2 text-sm text-muted">Times in Chicago time. Today is {shortDay(dayKey(new Date()))}.</p>
        </div>
        <a href="/admin/export" className="btn-ghost btn-sm">Download all leads (CSV)</a>
      </div>

      <nav aria-label="Date range" className="mt-6 flex flex-wrap gap-2">
        {ranges.map((r) => (
          <Link key={r.id} href={rangeHref(r.id, tab)} className={r.id === range.id ? "chip-active" : "chip"} aria-current={r.id === range.id ? "page" : undefined}>
            {r.label}
          </Link>
        ))}
      </nav>

      <div className="mt-4">
        <OfficeTabs base="/admin/reports" current={tab} keep={{ range: range.id === "30" ? undefined : range.id }} label="Report" tabs={reportTabs.map((id) => ({ id, label: reportTabLabel[id] }))} />
      </div>

      {tab === "overview" && (<>
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Enquiries" value={k.enquiries.toLocaleString()} note={change} />
        <Stat label="Website visitors" value={d.hasViews ? k.visitors.toLocaleString() : "–"} note={d.hasViews ? `${k.views.toLocaleString()} page views` : "Counting starts after deploy"} />
        <Stat label="Visitor → enquiry" value={pct(k.conversion)} note="Enquiries ÷ unique visitors" />
        <Stat label="Not contacted yet" value={k.uncontacted.toLocaleString()} note={<Link href="/admin/leads?status=new" className="text-accent">Open new leads</Link>} />
        <Stat label="Quote value requested" value={money(k.quoteValue)} note={`${k.quotes} quotes · avg ${k.avgQuote ? money(k.avgQuote) : "–"}`} />
        <Stat label="Est. margin on quotes" value={money(k.margin)} note="15% markup on item prices (about 13% of the customer price)" />
        <Stat label="Booked" value={money(k.wonValue)} note={`${k.wonCount} booked · ${money(k.wonMargin)} margin · win rate ${pct(k.winRate)}`} />
        <Stat label="Median first response" value={hours(k.medianResponse)} note="Lead in → first call, email, text or stage change" />
      </div>

      <section className={`${card} mt-8`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="display-3">Enquiries per {weekly ? "week" : "day"}</h2>
          <p className="text-sm text-muted">Hover a column for quotes, value and visitors.</p>
        </div>
        <div className="mt-4">
          <Timeline points={d.series} weekly={weekly} />
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-3 font-medium">By type</h3>
            <Bars rows={d.byKind} empty="No enquiries in this period." />
          </div>
          <div>
            <h3 className="mb-3 font-medium">By form</h3>
            <Bars rows={d.forms} empty="No enquiries in this period." value />
          </div>
          <div>
            <h3 className="mb-3 font-medium">By lead score</h3>
            <Bars rows={d.byScore} empty="No scored enquiries yet (scores start with this release)." />
          </div>
          <div>
            <h3 className="mb-3 font-medium">Form starts vs sends</h3>
            <p className="text-sm text-muted">
              {d.hasViews
                ? `${d.formStarts} visitors started a form, ${d.leads.length} sent one${d.formStarts ? ` (${Math.round((d.leads.length / d.formStarts) * 100)}%)` : ""}. The gap is people who gave up mid-form.`
                : "Needs the page_views table (Supabase) to count form starts."}
            </p>
          </div>
        </div>
      </section>

      </>)}

      {tab === "money" && <MoneyReport leads={d.leads} all={allLeads} />}

      {tab === "sources" && (
      <section className="mt-8">
        <h2 className="sr-only">Where they came from</h2>
        <p className="mt-1 max-w-3xl text-sm text-muted">
          Each lead carries the search, ad, post or link that brought the visitor in (the converting visit), plus the
          page and form they used. Spend more where channels convert; write more pages like the ones that produce enquiries.
        </p>
        <div className={`${card} mt-6`}>
          <h3 className="display-3">Channels</h3>
          <div className="mt-4">
            <Table
              head={["Channel", "Visitors", "Enquiries", "Conversion", "Quote value"]}
              rows={d.channels.map((c) => [c.label, d.hasViews ? c.visitors.toLocaleString() : "–", c.count, pct(c.rate), money(c.value ?? 0)])}
            />
            {d.channels.length === 0 && <p className="mt-3 text-sm text-muted">No enquiries in this period.</p>}
          </div>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className={card}>
            <h3 className="display-3 mb-4">Source / medium</h3>
            <Bars rows={d.sources} empty="No tracked enquiries yet." />
          </section>
          <section className={card}>
            <h3 className="display-3 mb-4">Referring sites</h3>
            <Bars rows={d.referrers} empty="No referring sites yet." />
          </section>
          <section className={card}>
            <h3 className="display-3 mb-4">Campaigns</h3>
            <Bars rows={d.campaigns} empty="No campaign-tagged enquiries yet. Add ?utm_campaign= to ad and email links." />
          </section>
          <section className={card}>
            <h3 className="display-3 mb-4">First landing page</h3>
            <Bars rows={d.landing} empty="No tracked enquiries yet." />
          </section>
          <section className={`${card} lg:col-span-2`}>
            <h3 className="display-3 mb-4">Which link or preset</h3>
            <Bars rows={d.formLinks} empty="No preset or link-tagged enquiries yet." />
          </section>
        </div>

        <section className={`${card} mt-6`}>
          <h3 className="display-3">Conversion by page</h3>
          <p className="mt-1 text-sm text-muted">The page each form was sent from, against the unique visitors who saw it.</p>
          <div className="mt-4">
            <Table
              head={["Page", "Visitors", "Views", "Form starts", "Enquiries", "Conversion", "Quote value"]}
              rows={d.pages.map((p) => [
                <a key={p.path} href={p.path} target="_blank" rel="noopener" className="text-accent [overflow-wrap:anywhere]">{p.path}</a>,
                d.hasViews ? p.visitors.toLocaleString() : "–",
                d.hasViews ? p.views.toLocaleString() : "–",
                d.hasViews ? p.starts : "–",
                p.enquiries,
                pct(p.rate),
                p.value ? money(p.value) : "–",
              ])}
              min={640}
            />
            {d.pages.length === 0 && <p className="mt-3 text-sm text-muted">No page data in this period yet.</p>}
          </div>
        </section>
      </section>

      )}

      {tab === "pipeline" && (
      <section className="mt-8">
        <h2 className="sr-only">Pipeline</h2>
        <Funnel leads={d.leads} />
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className={`${card} lg:col-span-2`}>
            <h3 className="display-3 mb-4">Enquiries by stage</h3>
            <ul className="space-y-2.5 text-sm">
              {stageRows.map((s) => (
                <li key={s.id}>
                  <Link href={`/admin/leads?status=${s.id}`} className="block hover:text-accent">
                    <div className="flex items-baseline justify-between gap-3">
                      <span>{s.label}</span>
                      <span className="tabular-nums">
                        {s.count}
                        {s.value ? <span className="ml-2 text-xs text-muted">{money(s.value)}</span> : null}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-surface-2">
                      <div className="h-1.5 rounded-full bg-accent" style={{ width: `${(s.count / stageMax) * 100}%` }} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section className={card}>
            <h3 className="display-3 mb-4">Why we lost</h3>
            <Bars rows={d.lostReasons} empty="No lost leads in this period." />
          </section>
        </div>
      </section>

      )}

      {tab === "demand" && (<>
      <section className="mt-8">
        <h2 className="sr-only">What people want</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className={card}>
            <h3 className="display-3">Top items</h3>
            <div className="mt-4">
              <Table head={["Item", "Quotes", "Qty", "Value"]} rows={d.items.map((i) => [i.label, i.quotes, i.qty.toLocaleString(), money(i.value)])} min={420} />
              {d.items.length === 0 && <p className="mt-3 text-sm text-muted">No priced quotes in this period.</p>}
            </div>
          </section>
          <section className={card}>
            <h3 className="display-3">Categories</h3>
            <div className="mt-4">
              <Table head={["Category", "Quotes", "Qty", "Value"]} rows={d.categories.map((c) => [c.label, c.quotes, c.qty.toLocaleString(), money(c.value)])} min={420} />
              {d.categories.length === 0 && <p className="mt-3 text-sm text-muted">No priced quotes in this period.</p>}
            </div>
          </section>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <section className={card}>
            <h3 className="display-3 mb-4">Event types</h3>
            <Bars rows={d.eventTypes} empty="No quotes yet." value />
          </section>
          <section className={card}>
            <h3 className="display-3 mb-4">Event months</h3>
            <Bars rows={d.eventMonths} empty="No quotes yet." limit={12} />
          </section>
          <section className={card}>
            <h3 className="display-3 mb-4">Cities</h3>
            <Bars rows={d.cities} empty="No quotes yet." />
          </section>
          <section className={card}>
            <h3 className="display-3 mb-4">Guest count</h3>
            <Bars rows={d.guestBands} empty="No quotes yet." />
            <p className="mt-3 text-xs text-muted">{k.guests.toLocaleString()} guests across all quotes</p>
          </section>
        </div>
      </section>

      {demand.length > 0 && (
        <section className={`${card} mt-6`}>
          <h2 className="display-3">Chair demand (votes + quotes)</h2>
          <p className="mt-1 text-sm text-muted">Score = all-time votes + 5 × quotes in this period that include the chair.</p>
          <div className="mt-4">
            <Table head={["Chair", "Votes", "Quotes", "Score"]} rows={demand.map((x) => [x.chair.name, x.votes, x.quotes, x.score])} min={420} />
          </div>
        </section>
      )}
      </>)}

      {tab === "vendors" && (
      <section className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold">Vendor routing</h2>
          <Link href="/admin/vendors" className="text-sm text-accent">All vendors and contacts →</Link>
        </div>
        {d.unassignedOpen > 0 && (
          <p className="mt-3 text-sm">
            <strong>{d.unassignedOpen}</strong> open quote{d.unassignedOpen === 1 ? " has" : "s have"} no rental partner yet.{" "}
            <Link href="/admin/leads" className="text-accent">Assign in the pipeline</Link>
          </p>
        )}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className={`${card} lg:col-span-2`}>
            <h3 className="display-3">Who the requested items come from</h3>
            <p className="mt-1 text-sm text-muted">Quote lines grouped by the vendor each item is priced from.</p>
            <div className="mt-4">
              <Table
                head={["Vendor", "Quotes", "Lines", "Vendor cost", "Customer value"]}
                rows={d.vendorDemand.map((v) => [v.label, v.quotes, v.lines, money(v.cost), money(v.value)])}
                min={560}
              />
              {d.vendorDemand.length === 0 && <p className="mt-3 text-sm text-muted">No priced quotes in this period.</p>}
            </div>
          </section>
          <section className={card}>
            <h3 className="display-3 mb-4">Leads handed to</h3>
            <Bars rows={d.assigned} empty="No leads assigned to a partner yet." value />
          </section>
        </div>
      </section>

      )}

      {tab === "latest" && (
      <section className={`${card} mt-8`}>
        <h2 className="display-3">Latest enquiries</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="text-left text-muted">
              <tr className="border-b border-line">
                <th className="py-2 pr-4 font-medium">Received</th>
                <th className="py-2 pr-4 font-medium">Who</th>
                <th className="py-2 pr-4 font-medium">Type / form</th>
                <th className="py-2 pr-4 font-medium">Channel / page</th>
                <th className="py-2 pr-4 font-medium">Stage</th>
                <th className="py-2 text-right font-medium">Quote</th>
              </tr>
            </thead>
            <tbody>
              {d.leads.slice(0, 25).map((l) => (
                <tr key={l.id} className="border-b border-line align-top last:border-0">
                  <td className="py-2.5 pr-4 whitespace-nowrap text-muted">
                    {new Date(l.created_at).toLocaleString("en-US", { timeZone: "America/Chicago", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </td>
                  <td className="py-2.5 pr-4">
                    <Link href={`/admin/leads/${l.id}`} className="font-medium text-accent">{l.name || l.email}</Link>
                    {[l.event_type, l.guest_count && `${l.guest_count} guests`, l.city].filter(Boolean).length > 0 && (
                      <div className="text-xs text-muted">{[l.event_type, l.guest_count && `${l.guest_count} guests`, l.city].filter(Boolean).join(" · ")}</div>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    {kindLabels[l.kind] ?? l.kind}
                    <div className="text-xs text-muted">{formName(l)}{formDetail(l) ? ` · ${formDetail(l)}` : ""}</div>
                  </td>
                  <td className="py-2.5 pr-4">
                    {leadChannel(l)}
                    <div className="text-xs text-muted [overflow-wrap:anywhere]">{l.page_path}</div>
                  </td>
                  <td className="py-2.5 pr-4">{statusLabel(l.status)}</td>
                  <td className="py-2.5 text-right tabular-nums">{l.quote_subtotal ? money(l.quote_subtotal) : "–"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {d.leads.length === 0 && <p className="mt-3 text-sm text-muted">No enquiries in this period.</p>}
        </div>
      </section>
      )}
    </div>
  );
}

// How far people get: each step counts everyone who reached it (now or before they were lost).
const funnelSteps = [
  { id: "all", label: "Enquiries" },
  { id: "contacted", label: "Had a reply" },
  { id: "quote_sent", label: "Got a quote" },
  { id: "paid", label: "Paid the deposit" },
  { id: "completed", label: "Event done" },
] as const;
const order = leadStatuses.map((x) => x.id as string);
function reached(l: Lead, step: string) {
  if (step === "all") return true;
  if (step === "paid") return l.fee_status === "paid" || l.fee_status === "refunded" || ["booked", "completed"].includes(l.status ?? "");
  const idx = order.indexOf(step);
  const cur = order.indexOf(l.status ?? "new");
  if (cur >= idx && cur <= order.indexOf("completed")) return true;
  // Lost or parked leads: look back through their stage changes.
  return (l.activity ?? []).some((a) => a.type === "status" && order.slice(idx, order.indexOf("completed") + 1).some((s) => a.text.includes(`→ ${statusLabel(s)}`)));
}

function Funnel({ leads }: { leads: Lead[] }) {
  const people = leads.filter((l) => l.kind !== "partner");
  const steps = funnelSteps.map((s) => ({ ...s, n: people.filter((l) => reached(l, s.id)).length }));
  const top = Math.max(1, steps[0].n);
  return (
    <section className={card}>
      <h3 className="display-3">How far people get</h3>
      <p className="mt-1 text-sm text-muted">Everyone who sent an enquiry in this period, and how many reached each step.</p>
      <ol className="mt-5 space-y-3">
        {steps.map((s, i) => (
          <li key={s.id}>
            <div className="flex justify-between gap-3 text-sm">
              <span>{s.label}</span>
              <span className="tabular-nums">
                {s.n}
                <span className="ml-2 text-xs text-muted">{pct(s.n / top)}{i > 0 && steps[i - 1].n ? ` · ${pct(s.n / steps[i - 1].n)} of the step before` : ""}</span>
              </span>
            </div>
            <div className="mt-1 h-3 rounded-full bg-surface-2">
              <div className="h-3 rounded-full bg-accent" style={{ width: `${(s.n / top) * 100}%` }} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

// Money in: deposits by month, booked rental value and our margin.
function MoneyReport({ leads, all }: { leads: Lead[]; all: Lead[] }) {
  const paid = leads.filter((l) => l.fee_status === "paid");
  const fees = paid.reduce((s, l) => s + (l.fee_amount ?? 0), 0);
  const rentals = paid.reduce((s, l) => s + (l.quote_subtotal ?? 0), 0);
  const margin = paid.reduce((s, l) => s + Math.max(0, (l.quote_subtotal ?? 0) - (l.quote_cost ?? 0)), 0);
  const refunded = leads.filter((l) => l.fee_status === "refunded");
  const waiting = leads.filter((l) => l.proposal_token && (l.fee_status ?? "unpaid") === "unpaid");
  const thisMonth = chicagoDay().slice(0, 7);
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(`${thisMonth}-15T12:00:00Z`);
    d.setUTCMonth(d.getUTCMonth() - (11 - i));
    return d.toISOString().slice(0, 7);
  });
  const byMonth = months.map((m) => ({
    label: new Date(`${m}-15T12:00:00`).toLocaleDateString("en-US", { month: "short" }),
    value: Math.round(all.filter((l) => l.fee_status === "paid" && l.fee_paid_at && chicagoDay(l.fee_paid_at).startsWith(m)).reduce((s, l) => s + (l.fee_amount ?? 0), 0)),
  }));
  const proposals = leads.filter((l) => l.proposal_token);
  return (
    <div className="mt-6 space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Deposits paid" value={money(fees)} note={`${paid.length} booking${paid.length === 1 ? "" : "s"}`} />
        <Stat label="Average fee" value={paid.length ? money(fees / paid.length) : "–"} note="Per paid booking" />
        <Stat label="Rentals we booked" value={money(rentals)} note={`${money(margin)} margin on those orders`} />
        <Stat label="Waiting on payment" value={money(waiting.reduce((s, l) => s + (l.fee_amount ?? 0), 0))} note={`${waiting.length} proposal${waiting.length === 1 ? "" : "s"} · ${refunded.length} refunded`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className={`${card} lg:col-span-2`}>
          <h3 className="display-3">Deposits, last 12 months</h3>
          <div className="mt-5"><ColumnBars data={byMonth} tone="green" height={160} label="Deposits per month, last 12 months" /></div>
        </section>
        <section className={card}>
          <h3 className="display-3">Proposals in this period</h3>
          <div className="mt-5">
            <Ring
              label="Proposals by payment status"
              center={proposals.length ? pct(paid.length / proposals.length) : "–"}
              sub="paid"
              parts={[
                { label: "Paid", value: paid.length, tone: "green" },
                { label: "Waiting", value: waiting.length, tone: "amber" },
                { label: "Refunded", value: refunded.length, tone: "rose" },
              ]}
            />
          </div>
          <p className="mt-4 text-sm"><Link href="/admin/payments" className="text-accent">Payments →</Link> · <Link href="/admin/invoices" className="text-accent">Commission owed →</Link></p>
        </section>
      </div>
    </div>
  );
}
