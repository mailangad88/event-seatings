import type { Metadata } from "next";
import Link from "next/link";
import { AdminHeader, Empty, Panel, StagePill, Tile } from "@/components/admin/AdminUi";
import { OfficeTabs, pickTab } from "@/components/office/OfficeTabs";
import { Icon } from "@/components/ui/Icon";
import { addDays, chicagoDay, prettyDay } from "@/lib/admin-view";
import { eventsPerDay } from "@/lib/capacity";
import { buildStops, pointFor, routeUrl, summarizeDays, vendorPoint, type Stop } from "@/lib/deliveries";
import { partStateBadge, partStateLabel } from "@/lib/orders";
import { listLeads } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Deliveries", robots: { index: false } };

const tabs = ["day", "plan", "map"] as const;
const isDay = (v: unknown): v is string => typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

export default async function DeliveriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const tab = pickTab(sp.tab, tabs);
  const today = chicagoDay();
  const day = isDay(sp.day) ? sp.day : today;
  const stops = buildStops(await listLeads());
  const onDay = stops.filter((s) => s.day === day);
  const strip = summarizeDays(stops, today, 14);
  const limit = eventsPerDay();
  const dayHref = (d: string, t = tab) => {
    const q = new URLSearchParams();
    if (t !== "day") q.set("tab", t);
    if (d !== today) q.set("day", d);
    const s = q.toString();
    return s ? `/admin/deliveries?${s}` : "/admin/deliveries";
  };

  const byVendor = new Map<string, Stop[]>();
  for (const s of onDay) byVendor.set(s.vendorId, [...(byVendor.get(s.vendorId) ?? []), s]);
  const deliveries = onDay.filter((s) => s.kind === "delivery");
  const pickups = onDay.filter((s) => s.kind === "pickup");
  const unconfirmed = onDay.filter((s) => !s.confirmed);

  return (
    <div className="container-x space-y-6 py-8">
      <AdminHeader
        group="Daily"
        title="Deliveries and pickups"
        intro="Every truck stop from booked orders, by day. One order split across rental partners shows as one stop per partner. Dates and windows come from each partner's confirmation; without one, delivery is the event day and pickup the day after."
        actions={<Link href="/admin/orders" className="btn-ghost btn-sm">Orders by vendor</Link>}
      />

      <nav aria-label="Pick a day" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {strip.map((d) => {
          const on = d.day === day;
          const n = d.deliveries + d.pickups;
          const busy = d.deliveries > limit;
          return (
            <Link key={d.day} href={dayHref(d.day)} aria-current={on ? "page" : undefined} className={`flex w-20 shrink-0 flex-col items-center rounded-xl border px-2 py-2 text-center ${on ? "border-ink bg-ink text-surface" : "border-line bg-surface hover:bg-surface-2"}`}>
              <span className="text-xs">{d.day === today ? "Today" : prettyDay(d.day, { weekday: "short" })}</span>
              <span className="text-lg font-semibold tabular-nums">{prettyDay(d.day, { day: "numeric" })}</span>
              <span className={`text-xs ${on ? "" : busy ? "text-rose" : n ? "text-blue" : "text-muted"}`}>{n ? `${n} stop${n === 1 ? "" : "s"}` : "Free"}</span>
            </Link>
          );
        })}
      </nav>

      <OfficeTabs
        base="/admin/deliveries"
        current={tab}
        keep={{ day: day === today ? undefined : day }}
        tabs={[
          { id: "day", label: "Day sheet", count: onDay.length },
          { id: "plan", label: "Next 2 weeks" },
          { id: "map", label: "Map" },
        ]}
      />

      {tab === "day" && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Tile tone="blue" label={`Deliveries · ${day === today ? "today" : prettyDay(day)}`} value={deliveries.length} note={deliveries.length > limit ? `More than your ${limit}-a-day limit` : `Limit ${limit} a day`} alert={deliveries.length > limit} />
            <Tile tone="green" label="Pickups" value={pickups.length} />
            <Tile tone="gold" label="Rental partners on the road" value={byVendor.size} note={`${onDay.reduce((t, s) => t + s.items, 0).toLocaleString()} pieces`} />
            <Tile tone="rose" label="Not confirmed" value={unconfirmed.length} alert={unconfirmed.length > 0} note="Call for a written yes" href="/admin/orders?tab=confirmations" />
          </div>
          {onDay.length === 0 ? (
            <Panel title="Nothing on the road"><Empty>No deliveries or pickups on {prettyDay(day, { weekday: "long", month: "long", day: "numeric" })}.</Empty></Panel>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {[...byVendor].map(([vendorId, list]) => {
                const route = routeUrl(vendorId, list);
                return (
                  <section key={vendorId || "none"} className="office-card min-w-0 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold">{vendorId ? <Link href={`/admin/vendors/${vendorId}?tab=orders`} className="hover:text-accent">{list[0].vendorName}</Link> : "No rental partner yet"}</h2>
                        <p className="text-xs text-muted">{list.filter((s) => s.kind === "delivery").length} drop-off · {list.filter((s) => s.kind === "pickup").length} pickup</p>
                      </div>
                      {route && (
                        <a href={route} target="_blank" rel="noopener" className="btn-ghost btn-sm">
                          <Icon name="route" size={16} /> Route in Google Maps
                        </a>
                      )}
                    </div>
                    <ol className="mt-3 divide-y divide-line">
                      {list.map((s) => (
                        <li key={s.id} className="flex gap-3 py-3">
                          <span className={`mt-0.5 h-fit shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${s.kind === "delivery" ? "bg-blue-soft text-blue" : "bg-green-soft text-green"}`}>{s.kind === "delivery" ? "Drop-off" : "Pickup"}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium">
                              {s.window ?? <span className="text-amber">No time window yet</span>}
                              <span className="font-normal text-muted"> · </span>
                              <Link href={`/admin/orders/${s.lead.id}`} className="text-accent">{s.lead.name || s.lead.email}</Link>
                            </p>
                            <p className="text-xs text-muted">{s.address || "No address yet"} · {s.items.toLocaleString()} pieces in {s.lines} line{s.lines === 1 ? "" : "s"}</p>
                            <p className="mt-1 flex flex-wrap gap-2"><StagePill status={s.lead.status} /><span className={partStateBadge[s.state]}>{partStateLabel[s.state]}</span></p>
                          </div>
                          {s.lead.phone && <a href={`tel:${s.lead.phone}`} className="btn-ghost btn-sm h-fit shrink-0" aria-label={`Call ${s.lead.name ?? "the customer"}`}><Icon name="phone" size={16} /></a>}
                        </li>
                      ))}
                    </ol>
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}

      {tab === "plan" && (
        <Panel title="Next 2 weeks">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 560 }}>
              <thead className="text-left text-muted">
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 font-medium">Day</th>
                  <th className="py-2 pr-4 font-medium">Drop-offs</th>
                  <th className="py-2 pr-4 font-medium">Pickups</th>
                  <th className="py-2 pr-4 font-medium">Partners</th>
                  <th className="py-2 pr-4 font-medium">Pieces</th>
                  <th className="py-2 font-medium">Not confirmed</th>
                </tr>
              </thead>
              <tbody>
                {strip.map((d) => (
                  <tr key={d.day} className="border-b border-line last:border-0">
                    <td className="py-2.5 pr-4"><Link href={dayHref(d.day, "day")} className="text-accent">{d.day === today ? "Today" : prettyDay(d.day)}</Link></td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 tabular-nums">{d.deliveries}</span>
                        <span className="h-2 rounded-full bg-blue" style={{ width: `${Math.min(100, (d.deliveries / Math.max(1, limit)) * 100)}px` }} />
                        {d.deliveries > limit && <span className="badge-rose">Over limit</span>}
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 tabular-nums">{d.pickups}</td>
                    <td className="py-2.5 pr-4 tabular-nums">{d.vendors}</td>
                    <td className="py-2.5 pr-4 tabular-nums">{d.pieces.toLocaleString()}</td>
                    <td className="py-2.5">{d.unconfirmed ? <span className="badge-rose">{d.unconfirmed}</span> : <span className="text-muted">–</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted">The daily limit ({limit} events) is set with EVENTS_PER_DAY, the same number the calendar uses.</p>
        </Panel>
      )}

      {tab === "map" && <MapPanel stops={onDay.length ? onDay : stops.filter((s) => s.day >= today && s.day <= addDays(today, 6))} title={onDay.length ? `Stops on ${prettyDay(day)}` : "Stops in the next 7 days"} />}
    </div>
  );
}

// A simple map of the Chicago area: no map service or key, just the approximate spot of each stop's city
// and each rental partner's yard. Good for seeing how spread out a day is.
const box = { north: 42.25, south: 41.45, west: -88.45, east: -87.4 };
const W = 600;
const H = Math.round(W * ((box.north - box.south) / ((box.east - box.west) * Math.cos((41.9 * Math.PI) / 180))));
const xy = (p: { lat: number; lng: number }) => ({ x: ((p.lng - box.west) / (box.east - box.west)) * W, y: ((box.north - p.lat) / (box.north - box.south)) * H });
const landmarks = ["Chicago", "Evanston", "Schaumburg", "Naperville", "Aurora", "Joliet", "Lake Forest", "Oak Brook", "Elgin", "Orland Park"];

function MapPanel({ stops, title }: { stops: Stop[]; title: string }) {
  const placed = stops.filter((s) => s.point);
  const missing = stops.length - placed.length;
  const yards = [...new Set(stops.map((s) => s.vendorId))].map((id) => ({ id, name: stops.find((s) => s.vendorId === id)!.vendorName, p: vendorPoint(id) })).filter((y) => y.p);
  // Lake Michigan shoreline, roughly, north to south.
  const shore = [[42.25, -87.79], [42.2, -87.78], [42.05, -87.67], [41.9, -87.62], [41.75, -87.53], [41.66, -87.4]].map(([lat, lng]) => xy({ lat, lng }));
  const lake = `M${shore.map((p) => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(" L")} L${W},${shore[shore.length - 1].y.toFixed(0)} L${W},0 Z`;
  return (
    <Panel title={title}>
      <div className="grid gap-6 lg:grid-cols-3">
        <figure className="lg:col-span-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-xl border border-line bg-surface-2" role="img" aria-label={`Map with ${placed.length} stops`}>
            <path d={lake} fill="var(--blue-soft)" />
            <text x={W - 12} y={40} fontSize="12" fill="var(--blue)" textAnchor="end">Lake Michigan</text>
            {landmarks.map((n) => {
              const p = pointFor(n);
              if (!p) return null;
              const { x, y } = xy(p);
              return (
                <g key={n}>
                  <circle cx={x} cy={y} r="2" fill="var(--muted)" />
                  <text x={x + 5} y={y + 4} fontSize="11" fill="var(--muted)">{n}</text>
                </g>
              );
            })}
            {yards.map((y) => {
              const { x, y: yy } = xy(y.p!);
              return <rect key={y.id} x={x - 5} y={yy - 5} width="10" height="10" rx="2" fill="var(--gold)"><title>{`${y.name} (yard)`}</title></rect>;
            })}
            {placed.map((s, i) => {
              const { x, y } = xy(s.point!);
              const jitter = (i % 5) * 3;
              return (
                <circle key={s.id} cx={x + jitter} cy={y - jitter} r="7" fill={s.kind === "delivery" ? "var(--blue)" : "var(--green)"} stroke="var(--surface)" strokeWidth="2">
                  <title>{`${s.kind === "delivery" ? "Drop-off" : "Pickup"} · ${s.lead.name ?? ""} · ${s.address} · ${s.vendorName}`}</title>
                </circle>
              );
            })}
          </svg>
          <figcaption className="mt-2 flex flex-wrap gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-blue" /> Drop-off</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-green" /> Pickup</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-gold" /> Rental partner yard</span>
            <span>Spots are by town, not street address.</span>
          </figcaption>
        </figure>
        <div>
          <h3 className="text-sm font-semibold">Stops</h3>
          {stops.length === 0 ? (
            <div className="mt-2"><Empty>No stops to show.</Empty></div>
          ) : (
            <ul className="mt-2 max-h-96 divide-y divide-line overflow-y-auto text-sm">
              {stops.map((s) => (
                <li key={s.id} className="py-2">
                  <p><span className={s.kind === "delivery" ? "text-blue" : "text-green"}>{s.kind === "delivery" ? "Drop-off" : "Pickup"}</span> · {prettyDay(s.day)} {s.window && `· ${s.window}`}</p>
                  <p className="text-xs text-muted">{s.lead.name || s.lead.email} · {s.address || "no address"} · {s.vendorName}</p>
                </li>
              ))}
            </ul>
          )}
          {missing > 0 && <p className="mt-3 text-xs text-amber">{missing} stop{missing === 1 ? " is" : "s are"} not on the map because the town is not in our area list.</p>}
        </div>
      </div>
    </Panel>
  );
}
