import type { Metadata } from "next";
import Link from "next/link";
import { chicagoToday, listBlockedDates } from "@/lib/availability";
import { listLeads } from "@/lib/store";
import { blockRange, toggleDate } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Availability", robots: { index: false } };

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthKey = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}`;
const pretty = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

export default async function AvailabilityPage(props: PageProps<"/admin/availability">) {
  const sp = await props.searchParams;
  const today = chicagoToday();
  const start = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : today.slice(0, 7);
  const [y0, m0] = start.split("-").map(Number);
  const months = [0, 1, 2].map((i) => {
    const d = new Date(Date.UTC(y0, m0 - 1 + i, 1));
    return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
  });
  const prev = new Date(Date.UTC(y0, m0 - 2, 1));
  const next = new Date(Date.UTC(y0, m0, 1));

  const [blockedRows, leads] = await Promise.all([listBlockedDates(), listLeads()]);
  const blocked = new Map(blockedRows.map((b) => [b.date, b]));
  // Events already on the books, so a busy day is easy to spot before blocking it.
  const events = new Map<string, { enquiries: number; booked: number }>();
  for (const l of leads) {
    if (!l.event_date) continue;
    const e = events.get(l.event_date) ?? { enquiries: 0, booked: 0 };
    e.enquiries += 1;
    if (l.status === "booked" || l.status === "vendor_confirmed" || l.status === "completed") e.booked += 1;
    events.set(l.event_date, e);
  }
  const upcoming = blockedRows.filter((b) => b.date >= today);

  return (
    <div className="container-x py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-1 font-serif text-5xl">Availability</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Tap a day to block it. Blocked days show as unavailable in the event planner and quote form, so no one requests
            a date you can&apos;t take. Tap again to open it.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/availability?month=${monthKey(prev.getUTCFullYear(), prev.getUTCMonth())}`} className="btn-ghost btn-sm">← Earlier</Link>
          <Link href="/admin/availability" className="btn-ghost btn-sm">Today</Link>
          <Link href={`/admin/availability?month=${monthKey(next.getUTCFullYear(), next.getUTCMonth())}`} className="btn-ghost btn-sm">Later →</Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted">
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-rose" /> Blocked</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-sage" /> Booked event</span>
        <span className="flex items-center gap-2"><span className="h-3 w-3 rounded bg-gold-soft ring-1 ring-gold" /> Enquiry for that date</span>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {months.map(({ y, m }) => {
          const first = new Date(Date.UTC(y, m, 1)).getUTCDay();
          const days = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
          return (
            <section key={`${y}-${m}`} className="card min-w-0 p-5">
              <h2 className="font-serif text-2xl">{new Date(Date.UTC(y, m, 15)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}</h2>
              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs text-muted">
                {weekdays.map((w) => <span key={w}>{w}</span>)}
              </div>
              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: first }, (_, i) => <span key={`b${i}`} />)}
                {Array.from({ length: days }, (_, i) => {
                  const date = `${monthKey(y, m)}-${String(i + 1).padStart(2, "0")}`;
                  const b = blocked.get(date);
                  const ev = events.get(date);
                  const past = date < today;
                  const tone = b
                    ? "bg-rose text-white"
                    : ev?.booked
                      ? "bg-sage text-white"
                      : ev
                        ? "bg-gold-soft ring-1 ring-gold"
                        : "bg-surface-2";
                  const label = `${pretty(date)}${b ? `, blocked${b.reason ? `: ${b.reason}` : ""}` : ""}${ev ? `, ${ev.enquiries} enquir${ev.enquiries === 1 ? "y" : "ies"}${ev.booked ? `, ${ev.booked} booked` : ""}` : ""}`;
                  return (
                    <form key={date} action={toggleDate}>
                      <input type="hidden" name="date" value={date} />
                      <input type="hidden" name="blocked" value={b ? "0" : "1"} />
                      <button
                        type="submit"
                        disabled={past}
                        title={label}
                        aria-label={`${label}. ${b ? "Open this date" : "Block this date"}`}
                        className={`relative aspect-square w-full rounded-lg text-sm tabular-nums transition hover:ring-2 hover:ring-ink/30 disabled:opacity-35 ${tone} ${date === today ? "font-bold underline" : ""}`}
                      >
                        {i + 1}
                        {ev && !b && <span className="absolute right-1 bottom-0.5 text-[9px]">{ev.enquiries}</span>}
                      </button>
                    </form>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card min-w-0 p-6">
          <h2 className="font-serif text-2xl">Block a range</h2>
          <p className="mt-1 text-sm text-muted">For holidays, a fully booked weekend, or a partner&apos;s blackout dates.</p>
          <form action={blockRange} className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="from">From</label>
              <input id="from" name="from" type="date" required min={today} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="to">To</label>
              <input id="to" name="to" type="date" min={today} className="field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="reason">Reason (only you see this)</label>
              <input id="reason" name="reason" className="field" placeholder="Fully booked, Thanksgiving, chairs all out…" />
            </div>
            <div className="flex gap-3 sm:col-span-2">
              <button type="submit" name="mode" value="block" className="btn-primary btn-sm">Block these dates</button>
              <button type="submit" name="mode" value="open" className="btn-ghost btn-sm">Open these dates</button>
            </div>
          </form>
        </section>
        <section className="card min-w-0 p-6">
          <h2 className="font-serif text-2xl">Upcoming blocked dates</h2>
          {upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Nothing blocked. Every future date is open for requests.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line text-sm">
              {upcoming.slice(0, 60).map((b) => (
                <li key={b.date} className="flex items-center justify-between gap-3 py-2">
                  <span>
                    {pretty(b.date)}
                    {b.reason && <span className="text-muted"> · {b.reason}</span>}
                  </span>
                  <form action={toggleDate}>
                    <input type="hidden" name="date" value={b.date} />
                    <input type="hidden" name="blocked" value="0" />
                    <button type="submit" className="text-accent">Open</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
