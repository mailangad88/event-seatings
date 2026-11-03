import type { Metadata } from "next";
import Link from "next/link";
import { vendors } from "@/data/catalog";
import { AdminHeader, Empty, StagePill } from "@/components/admin/AdminUi";
import { chicagoDay, eventLine, isConfirmed, prettyDay, stage } from "@/lib/admin-view";
import { listBlockedDates } from "@/lib/availability";
import { listLeads, type Lead } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Calendar", robots: { index: false } };

const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");
const vendorName = (id?: string) => vendors.find((v) => v.id === id)?.name;

export default async function CalendarPage(props: PageProps<"/admin/calendar">) {
  const sp = await props.searchParams;
  const today = chicagoDay();
  const showLost = sp.lost === "1";
  const month = typeof sp.month === "string" && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : today.slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
  const next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
  const short = (k: string) => new Date(`${k}-15T12:00:00Z`).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const title = new Date(Date.UTC(y, m - 1, 15)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

  const [leads, blockedRows] = await Promise.all([listLeads(), listBlockedDates(`${month}-01`)]);
  const blocked = new Map(blockedRows.map((b) => [b.date, b]));
  const inMonth = leads
    .filter((l) => l.kind !== "partner" && l.event_date?.startsWith(month) && (showLost || stage(l) !== "lost"))
    .sort((a, b) => a.event_date!.localeCompare(b.event_date!) || Number(isConfirmed(b)) - Number(isConfirmed(a)));
  const byDay = new Map<string, Lead[]>();
  for (const l of inMonth) byDay.set(l.event_date!, [...(byDay.get(l.event_date!) ?? []), l]);
  const confirmed = inMonth.filter(isConfirmed).length;
  const q = (p: Record<string, string>) => `/admin/calendar?${new URLSearchParams({ month, ...(showLost && { lost: "1" }), ...p })}`;

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Daily"
        title="Calendar"
        intro="Every event date people asked about, by month. Green means a rental partner has confirmed it. Tap a name to open the lead."
        actions={
          <>
            <Link href={q({ month: prev })} className="btn-ghost btn-sm">← {short(prev)}</Link>
            <Link href="/admin/calendar" className="btn-ghost btn-sm">This month</Link>
            <Link href={q({ month: next })} className="btn-ghost btn-sm">{short(next)} →</Link>
          </>
        }
      />

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <h2 className="font-serif text-3xl">{title}</h2>
        <span className="text-muted">{inMonth.length} event{inMonth.length === 1 ? "" : "s"} · {confirmed} confirmed</span>
        <span className="flex items-center gap-2 text-xs text-muted"><span className="h-3 w-3 rounded bg-sage" /> Confirmed</span>
        <span className="flex items-center gap-2 text-xs text-muted"><span className="h-3 w-3 rounded bg-gold-soft ring-1 ring-gold" /> Still a request</span>
        <span className="flex items-center gap-2 text-xs text-muted"><span className="h-3 w-3 rounded bg-rose" /> Blocked</span>
        <Link href={showLost ? `/admin/calendar?month=${month}` : `/admin/calendar?month=${month}&lost=1`} className="text-xs text-accent">{showLost ? "Hide lost" : "Show lost"}</Link>
        <Link href={`/admin/availability?month=${month}`} className="text-xs text-accent">Block or open dates →</Link>
      </div>

      {/* Month grid on tablets and up; phones get the list below. */}
      <div className="card mt-4 hidden overflow-hidden md:block">
        <div className="grid grid-cols-7 border-b border-line bg-surface-2 text-center text-xs text-muted">
          {weekdays.map((w) => <span key={w} className="py-2">{w}</span>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: first }, (_, i) => <div key={`b${i}`} className="min-h-28 border-r border-b border-line bg-surface-2/40" />)}
          {Array.from({ length: days }, (_, i) => {
            const date = `${month}-${pad(i + 1)}`;
            const evs = byDay.get(date) ?? [];
            const b = blocked.get(date);
            return (
              <div key={date} className={`min-h-28 min-w-0 border-r border-b border-line p-1.5 ${date < today ? "opacity-60" : ""}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={date === today ? "rounded-full bg-accent px-1.5 font-bold text-accent-ink" : "text-muted"}>{i + 1}</span>
                  {b && <span className="rounded bg-rose px-1 text-[10px] text-white" title={b.reason}>Blocked</span>}
                </div>
                <ul className="mt-1 space-y-1">
                  {evs.slice(0, 3).map((l) => (
                    <li key={l.id}>
                      <Link
                        href={`/admin/leads/${l.id}`}
                        title={`${l.name || l.email}: ${eventLine(l)}`}
                        className={`block truncate rounded px-1.5 py-0.5 text-xs ${isConfirmed(l) ? "bg-sage text-white" : stage(l) === "lost" ? "bg-surface-2 text-muted line-through" : "bg-gold-soft ring-1 ring-gold/40"}`}
                      >
                        {l.name?.split(" ")[0] || l.email.split("@")[0]}
                        {l.guest_count ? ` · ${l.guest_count}` : ""}
                      </Link>
                    </li>
                  ))}
                  {evs.length > 3 && <li className="text-[11px] text-muted">+ {evs.length - 3} more</li>}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <section className="card mt-6 p-6">
        <h2 className="font-serif text-2xl">Events in {title}</h2>
        {inMonth.length === 0 ? (
          <div className="mt-3"><Empty>No events this month.</Empty></div>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {inMonth.map((l) => {
              const partner = vendorName(l.assigned_vendor);
              return (
                <li key={l.id} className="grid gap-2 py-3 sm:grid-cols-[9rem_1fr_auto] sm:items-start">
                  <span className="text-sm font-medium">{prettyDay(l.event_date)}</span>
                  <div className="min-w-0">
                    <Link href={`/admin/leads/${l.id}`} className="font-medium text-accent">{l.name || l.email}</Link>
                    <p className="text-xs text-muted">{[eventLine(l), l.venue].filter(Boolean).join(" · ")}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:justify-end">
                    <span className={partner || !isConfirmed(l) ? "text-muted" : "text-rose"}>{partner ?? "No partner yet"}</span>
                    <StagePill status={l.status} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
