import Link from "next/link";
import { Card, EventFacts, NeedsList, PageTitle, StageTrack, StatusPill, daysLabel } from "@/components/account/AccountUi";
import { Icon } from "@/components/ui/Icon";
import { currentAccount, firstName, fmtDay, nextEvent, type AccountEvent } from "@/lib/account";
import { usd } from "@/lib/catalog-types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overview" };

function greeting() {
  const hour = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Chicago" }));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

type Stop = { date: string; kind: "Delivery" | "Pickup"; window?: string; company: string; event: string; eventId: string };

function upcomingStops(events: AccountEvent[]): Stop[] {
  const today = new Date().toISOString().slice(0, 10);
  const out: Stop[] = [];
  for (const e of events)
    for (const p of e.parts) {
      if (p.delivery?.date && p.delivery.date >= today) out.push({ date: p.delivery.date, kind: "Delivery", window: p.delivery.window, company: p.name, event: e.title, eventId: e.id });
      if (p.pickup?.date && p.pickup.date >= today) out.push({ date: p.pickup.date, kind: "Pickup", window: p.pickup.window, company: p.name, event: e.title, eventId: e.id });
    }
  return out.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
}

export default async function AccountOverview() {
  const data = (await currentAccount())!;
  const { events } = data;
  const next = nextEvent(events);
  const upcoming = events.filter((e) => (e.daysLeft ?? 0) >= 0 && e.stage < 5);
  const needs = events.flatMap((e) => e.needs.map((n) => ({ ...n, event: e.title })));
  const unread = events.reduce((n, e) => n + e.unread, 0);
  const companies = upcoming.reduce((n, e) => n + e.parts.length, 0);
  const confirmed = upcoming.reduce((n, e) => n + e.parts.filter((p) => p.status.step >= 1).length, 0);
  const owed = events.filter((e) => e.fee.status === "unpaid" && e.proposalUrl).reduce((s, e) => s + (e.fee.due ?? 0), 0);
  const stops = upcomingStops(events);
  const latest = events
    .flatMap((e) => e.messages.map((m) => ({ ...m, event: e.title, eventId: e.id })))
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 3);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/Chicago" });

  return (
    <div className="space-y-6">
      <PageTitle eyebrow={today} title={`${greeting()}${firstName(data.name) ? `, ${firstName(data.name)}` : ""}`} />

      {/* Briefing band */}
      <section className="tone-dark relative overflow-hidden rounded-2xl bg-linear-to-br from-wine-deep to-espresso p-6 shadow-lift sm:p-8">
        {next ? (
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.18em] text-gold-bright uppercase">Next up · {next.title}</p>
              <p className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">
                {daysLabel(next.daysLeft)}.{" "}
                <span className="text-muted">
                  {needs.length ? `${needs.length} ${needs.length === 1 ? "thing needs" : "things need"} you.` : "Nothing needs you right now."}
                </span>
              </p>
              <div className="mt-3"><EventFacts e={next} /></div>
            </div>
            <div className="w-full max-w-sm">
              <p className="mb-2 text-sm text-muted">{next.stageNote}</p>
              <StageTrack stage={next.stage} compact />
              <Link href={`/account/events/${next.id}`} className="btn-primary btn-sm mt-4">Open this event</Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-2xl font-semibold text-ink sm:text-3xl">No upcoming events yet.</p>
              <p className="mt-2 text-muted">Pick your rentals and we&apos;ll send a quote. It shows up here as soon as you send it.</p>
            </div>
            <Link href="/quote" className="btn-primary">Start a quote</Link>
          </div>
        )}
      </section>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <div className="stat-card stat-blue"><p className="stat-label">Upcoming events</p><p className="stat-value">{upcoming.length}</p><p className="mt-2 text-xs text-muted">{next?.date ? `Next on ${fmtDay(next.date)}` : "None booked yet"}</p></div>
        <div className="stat-card stat-green"><p className="stat-label">Companies confirmed</p><p className="stat-value">{confirmed}<span className="text-xl text-muted">/{companies}</span></p><p className="mt-2 text-xs text-muted">Across your upcoming orders</p></div>
        <div className={`stat-card ${owed ? "stat-amber" : "stat-green"}`}><p className="stat-label">Booking fee due</p><p className="stat-value">{usd(owed, 0)}</p><p className="mt-2 text-xs text-muted">{owed ? "Pay to hold your date" : "All paid up"}</p></div>
        <div className="stat-card stat-wine"><p className="stat-label">Unread messages</p><p className="stat-value">{unread}</p><p className="mt-2 text-xs text-muted">{unread ? "From your coordinator" : "You're all caught up"}</p></div>
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card title="Needs you" className="xl:col-span-3">
          <NeedsList items={needs} />
        </Card>
        <Card title="Deliveries and pickups" className="xl:col-span-2" more={stops.length ? { href: "/account/orders", label: "All orders" } : undefined}>
          {stops.length ? (
            <ol className="space-y-3">
              {stops.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="grid w-12 shrink-0 place-items-center rounded-xl bg-blue-soft py-1.5 text-center text-blue">
                    <span className="text-xs font-semibold uppercase">{fmtDay(s.date, { month: "short" })}</span>
                    <span className="text-lg leading-6 font-semibold tabular-nums">{fmtDay(s.date, { day: "numeric" })}</span>
                  </span>
                  <Link href={`/account/events/${s.eventId}`} className="min-w-0 flex-1 hover:text-accent">
                    <p className="text-sm font-semibold">{s.kind}{s.window ? `, ${s.window}` : ""}</p>
                    <p className="truncate text-xs text-muted">{s.company} · {s.event}</p>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted">Delivery and pickup times show here once each rental company books its truck.</p>
          )}
        </Card>
      </div>

      <Card title="Your events" more={{ href: "/account/orders", label: "See all" }}>
        {events.length ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {events.slice(0, 4).map((e) => (
              <li key={e.id}>
                <Link href={`/account/events/${e.id}`} className="card-hover block rounded-xl border border-line p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{e.title}</p>
                      <p className="text-xs text-muted">{[fmtDay(e.date), daysLabel(e.daysLeft)].filter(Boolean).join(" · ")}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{usd(e.subtotal, 0)}</span>
                  </div>
                  <div className="mt-4"><StageTrack stage={e.stage} compact /></div>
                  <p className="mt-2 text-xs text-muted">{e.stageNote}</p>
                  {e.parts.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {e.parts.map((p) => (
                        <li key={p.key} className="flex items-center gap-1.5 text-xs"><Icon name="truck" size={14} className="text-muted" /><StatusPill status={p.status} /></li>
                      ))}
                    </ul>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">
            Quotes you send with this email address show up here. <Link href="/quote" className="link">Start a quote</Link> or{" "}
            <Link href="/my-events" className="link">plan an event</Link>.
          </p>
        )}
      </Card>

      {latest.length > 0 && (
        <Card title="Latest messages" more={{ href: "/account/messages", label: "All messages" }}>
          <ul className="divide-y divide-line">
            {latest.map((m, i) => (
              <li key={i} className="py-3 first:pt-0 last:pb-0">
                <Link href={`/account/events/${m.eventId}#messages`} className="flex gap-3 hover:text-accent">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold ${m.from === "team" ? "bg-wine-soft text-wine" : "bg-surface-2 text-ink"}`}>{m.from === "team" ? "BC" : "You"}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex justify-between gap-2 text-xs text-muted"><span>{m.from === "team" ? "Your coordinator" : "You"} · {m.event}</span><span>{fmtDay(m.at.slice(0, 10))}</span></span>
                    <span className={`mt-0.5 line-clamp-2 block text-sm ${m.from === "team" && !m.read_at ? "font-semibold" : ""}`}>{m.text}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
