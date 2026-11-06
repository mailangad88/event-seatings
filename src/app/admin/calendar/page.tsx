import type { Metadata } from "next";
import Link from "@/components/Link";
import { vendors } from "@/data/catalog";
import { Empty, StagePill } from "@/components/admin/AdminUi";
import { chicagoDay, eventLine, money0, prettyDay } from "@/lib/admin-view";
import { listBlockedDates } from "@/lib/availability";
import { dayLoad, eventsPerDay, guestsPerDay, LIGHT_AT, LIMITED_AT, type DayLoad, type LoadLevel } from "@/lib/capacity";
import { listLeads, type Lead } from "@/lib/store";
import { blockRange, toggleDate } from "../availability/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Calendar", robots: { index: false } };

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");
const vendorName = (id?: string) => vendors.find((v) => v.id === id)?.name;
const isDay = (d: unknown): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);

// Shade each day from quiet (open) to heavy (full), light green through amber to red.
const heatTone: Record<LoadLevel, string> = {
  open: "bg-surface",
  light: "bg-green-soft",
  moderate: "bg-amber-soft",
  busy: "bg-amber/50",
  limited: "bg-rose-soft",
  full: "bg-rose",
};
const barTone: Record<LoadLevel, string> = {
  open: "bg-green",
  light: "bg-green",
  moderate: "bg-amber",
  busy: "bg-amber",
  limited: "bg-rose",
  full: "bg-rose",
};
const cellTone = (load: DayLoad, blocked: boolean) => (blocked ? "bg-surface-2" : heatTone[load.level]);

const badgeLabel: Partial<Record<LoadLevel, { text: string; cls: string }>> = {
  busy: { text: "Busy", cls: "badge-amber" },
  limited: { text: "Nearly full", cls: "badge-rose" },
  full: { text: "Full", cls: "badge-rose" },
};

function DayBadge({ load, blocked }: { load: DayLoad; blocked: boolean }) {
  if (blocked) return <span className="badge-rose">Blocked</span>;
  const b = badgeLabel[load.level];
  return b ? <span className={b.cls}>{b.text}</span> : null;
}

function Legend() {
  const items: { level: LoadLevel; label: string }[] = [
    { level: "open", label: "Open" },
    { level: "light", label: "Light" },
    { level: "moderate", label: "Moderate" },
    { level: "busy", label: "Busy" },
    { level: "limited", label: "Nearly full" },
    { level: "full", label: "Full" },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
      {items.map((it) => (
        <span key={it.level} className="flex items-center gap-1.5">
          <span className={`inline-block size-3 rounded-full border border-line ${heatTone[it.level]}`} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function EventRow({ l, pending }: { l: Lead; pending?: boolean }) {
  const partner = vendorName(l.assigned_vendor);
  return (
    <li className="grid gap-2 py-3 sm:grid-cols-[1fr_auto] sm:items-start">
      <div className="min-w-0">
        <Link href={`/admin/leads/${l.id}`} className="font-medium text-accent">{l.name || l.email}</Link>
        <p className="text-xs text-muted">{[eventLine(l), l.venue].filter(Boolean).join(" · ") || l.kind}</p>
        {!pending && <p className={`text-xs ${partner ? "text-muted" : "text-rose"}`}>{partner ?? "No rental partner yet"}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs sm:justify-end">
        {l.quote_subtotal ? <span className="tabular-nums text-muted">{money0(l.quote_subtotal)}</span> : null}
        <StagePill status={l.status} />
      </div>
    </li>
  );
}

export default async function CalendarPage(props: PageProps<"/admin/calendar">) {
  const sp = await props.searchParams;
  const today = chicagoDay();
  const selected = isDay(sp.day) ? sp.day : undefined;
  const month = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : (selected ?? today).slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
  const next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
  const short = (k: string) => new Date(`${k}-15T12:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const title = new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  const [leads, blockedRows] = await Promise.all([listLeads(), listBlockedDates(`${month}-01`)]);
  const blocked = new Map(blockedRows.map((b) => [b.date, b]));
  const byDay = new Map<string, Lead[]>();
  for (const l of leads) {
    if (l.kind === "partner" || !l.event_date?.startsWith(month)) continue;
    byDay.set(l.event_date, [...(byDay.get(l.event_date) ?? []), l]);
  }
  const dates = Array.from({ length: days }, (_, i) => `${month}-${pad(i + 1)}`);
  const loads = new Map(dates.map((d) => [d, dayLoad(byDay.get(d) ?? [])]));
  const totals = [...loads.values()].reduce((t, l) => ({ events: t.events + l.confirmed.length, guests: t.guests + l.guests, pending: t.pending + l.pending.length }), { events: 0, guests: 0, pending: 0 });
  const busy = dates.filter((d) => blocked.has(d) || loads.get(d)!.level !== "open");
  const capE = eventsPerDay();
  const capG = guestsPerDay();
  const dayHref = (d: string) => `/admin/calendar?month=${month}&day=${d}#day`;
  const sel = selected ? { date: selected, load: dayLoad(leads.filter((l) => l.kind !== "partner" && l.event_date === selected)), block: blocked.get(selected) } : undefined;

  return (
    <div className="container-x py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Bookings calendar</p>
          <h1 className="display-2 mt-1">{title}</h1>
          <p className="mt-2 text-sm text-muted">
            {totals.events} confirmed event{totals.events === 1 ? "" : "s"} · {totals.guests.toLocaleString()} guests · {totals.pending} pending ·
            capacity {capG.toLocaleString()} guests / {capE} events a day
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/calendar?month=${prev}`} className="btn-ghost btn-sm">← {short(prev)}</Link>
          <Link href={`/admin/calendar?month=${next}`} className="btn-ghost btn-sm">{short(next)} →</Link>
          <details className="relative">
            <summary className="btn-primary btn-sm cursor-pointer list-none [&::-webkit-details-marker]:hidden">Block a day</summary>
            <form action={blockRange} className="card absolute right-0 z-20 mt-2 grid w-80 gap-3 p-4 shadow-lift">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="label" htmlFor="from">From</label>
                  <input id="from" name="from" type="date" required min={today} defaultValue={selected && selected >= today ? selected : undefined} className="field" />
                </div>
                <div>
                  <label className="label" htmlFor="to">To (optional)</label>
                  <input id="to" name="to" type="date" min={today} className="field" />
                </div>
              </div>
              <div>
                <label className="label" htmlFor="reason">Reason (only you see this)</label>
                <input id="reason" name="reason" className="field" placeholder="Away, fully booked, holiday…" />
              </div>
              <div className="flex gap-2">
                <button type="submit" name="mode" value="block" className="btn-primary btn-sm">Block</button>
                <button type="submit" name="mode" value="open" className="btn-ghost btn-sm">Open again</button>
              </div>
              <p className="text-xs text-muted">Blocked days can&apos;t be picked in the quote form or the event planner.</p>
            </form>
          </details>
        </div>
      </div>

      {sel && (
        <section id="day" className="card mt-6 scroll-mt-24 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="display-3">{prettyDay(sel.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h2>
              <p className="mt-1 text-sm text-muted">
                {sel.load.confirmed.length} confirmed · {sel.load.guests} / {capG} guests · {sel.load.pending.length} pending
                {sel.block && <> · <span className="text-rose">Blocked{sel.block.reason ? `: ${sel.block.reason}` : ""}</span></>}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {sel.date >= today && (
                <form action={toggleDate}>
                  <input type="hidden" name="date" value={sel.date} />
                  <input type="hidden" name="blocked" value={sel.block ? "0" : "1"} />
                  <button type="submit" className="btn-ghost btn-sm">{sel.block ? "Open this day" : "Block this day"}</button>
                </form>
              )}
              <Link href={`/admin/calendar?month=${month}`} className="btn-ghost btn-sm">Close</Link>
            </div>
          </div>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-xs tracking-wider text-muted uppercase">Confirmed</h3>
              {sel.load.confirmed.length ? <ul className="divide-y divide-line">{sel.load.confirmed.map((l) => <EventRow key={l.id} l={l} />)}</ul> : <div className="mt-2"><Empty>Nothing confirmed.</Empty></div>}
            </div>
            <div>
              <h3 className="text-xs tracking-wider text-muted uppercase">Pending requests and quotes</h3>
              {sel.load.pending.length ? <ul className="divide-y divide-line">{sel.load.pending.map((l) => <EventRow key={l.id} l={l} pending />)}</ul> : <div className="mt-2"><Empty>No open requests.</Empty></div>}
            </div>
          </div>
        </section>
      )}

      {/* Month grid on tablets and up. */}
      <div className="card mt-6 hidden overflow-hidden p-0 md:block">
        <div className="grid grid-cols-7 border-b border-line bg-surface-2 text-center text-xs font-semibold tracking-wider text-muted uppercase">
          {weekdays.map((w) => <span key={w} className="py-2.5">{w}</span>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: first }, (_, i) => <div key={`b${i}`} className="min-h-28 border-r border-b border-line bg-surface-2" />)}
          {dates.map((date, i) => {
            const load = loads.get(date)!;
            const b = blocked.get(date);
            const isSel = date === selected;
            return (
              <Link
                key={date}
                href={dayHref(date)}
                aria-label={`${prettyDay(date)}: ${load.confirmed.length} events, ${load.guests} guests, ${load.pending.length} pending${b ? ", blocked" : ""}`}
                className={`relative block min-h-28 min-w-0 border-r border-b border-line p-2 transition hover:ring-2 hover:ring-accent/40 hover:ring-inset ${cellTone(load, !!b)} ${date < today ? "opacity-60" : ""} ${isSel || date === today ? "ring-2 ring-accent ring-inset" : ""}`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className={`text-sm font-semibold ${date === today ? "text-accent" : ""}`}>{i + 1}</span>
                  <DayBadge load={load} blocked={!!b} />
                </div>
                <p className="mt-1 flex items-baseline justify-between gap-1 text-xs">
                  <span className="text-sm font-semibold tabular-nums">{load.guests}</span>
                  <span className="truncate text-muted">/ {capG} guests</span>
                </p>
                <div className="mt-1 h-1.5 rounded-full bg-line/70">
                  <div className={`h-1.5 rounded-full ${barTone[load.level]}`} style={{ width: `${Math.min(100, Math.round(load.share * 100))}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-muted">
                  {load.confirmed.length} event{load.confirmed.length === 1 ? "" : "s"}
                  {load.pending.length ? ` · ${load.pending.length} pending` : ""}
                </p>
                {b ? (
                  <p className="truncate text-xs text-rose">{b.reason || "Blocked"}</p>
                ) : load.level === "full" ? (
                  <p className="text-xs text-rose">Fully booked</p>
                ) : load.level === "limited" ? (
                  <p className="text-xs text-rose">Nearly full</p>
                ) : load.level === "busy" ? (
                  <p className="text-xs text-amber">Busy day</p>
                ) : null}
              </Link>
            );
          })}
          {Array.from({ length: (7 - ((first + days) % 7)) % 7 }, (_, i) => <div key={`a${i}`} className="min-h-28 border-r border-b border-line bg-surface-2" />)}
        </div>
      </div>

      {/* Phones: only the days with something on them. */}
      <section className="card mt-6 p-5 md:hidden">
        <h2 className="display-3">Days with events</h2>
        {dates.filter((d) => blocked.has(d) || loads.get(d)!.confirmed.length || loads.get(d)!.pending.length).length === 0 ? (
          <div className="mt-2"><Empty>Nothing this month.</Empty></div>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {dates
              .filter((d) => blocked.has(d) || loads.get(d)!.confirmed.length || loads.get(d)!.pending.length)
              .map((d) => {
                const load = loads.get(d)!;
                return (
                  <li key={d}>
                    <Link href={dayHref(d)} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span>
                        <span className="font-medium">{prettyDay(d)}</span>
                        <span className="block text-xs text-muted">
                          {load.confirmed.length} events · {load.guests} guests{load.pending.length ? ` · ${load.pending.length} pending` : ""}
                        </span>
                      </span>
                      <DayBadge load={load} blocked={blocked.has(d)} />
                    </Link>
                  </li>
                );
              })}
          </ul>
        )}
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="display-3">Blocked and limited days</h2>
          {busy.length === 0 ? (
            <p className="mt-3 text-sm text-muted">None this month. Use Block a day when you are away or already at capacity.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {busy.map((d) => {
                const b = blocked.get(d);
                const load = loads.get(d)!;
                return (
                  <li key={d} className="flex items-center justify-between gap-3 py-2">
                    <Link href={dayHref(d)} className="min-w-0">
                      <span className="font-medium">{prettyDay(d)}</span>
                      <span className="text-muted"> · {b ? b.reason || "blocked" : `${load.confirmed.length} event${load.confirmed.length === 1 ? "" : "s"}, ${load.guests} guests`}</span>
                    </Link>
                    <span className="flex shrink-0 items-center gap-2">
                      <DayBadge load={load} blocked={!!b} />
                      {b && d >= today && (
                        <form action={toggleDate}>
                          <input type="hidden" name="date" value={d} />
                          <input type="hidden" name="blocked" value="0" />
                          <button type="submit" className="text-xs text-accent">Open</button>
                        </form>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="card p-6">
          <h2 className="display-3">How to read this</h2>
          <div className="mt-3"><Legend /></div>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
            <li>Events and guests count bookings a rental partner has confirmed or the customer has paid for. Requests and quotes still open show as pending.</li>
            <li>
              Each day is shaded by how full it is against our limit of {capE} events or {capG.toLocaleString()} guests a day, whichever runs out first:
              open below {Math.round(LIGHT_AT() * 100)}%, then light, moderate, busy and nearly full in steps up to {Math.round(LIMITED_AT() * 100)}%, and
              full at 100%. Change the limits with EVENTS_PER_DAY, GUESTS_PER_DAY, CAL_LIGHT_AT, CAL_MODERATE_AT, CAL_BUSY_AT and CAL_LIMITED_AT in Vercel.
            </li>
            <li>Blocked days can&apos;t be picked in the quote form or the event planner. Block a day when you&apos;re away or a partner has no stock left.</li>
            <li>Click a day to see who is booked and who is still asking.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
