import type { Metadata } from "next";
import Link from "@/components/Link";
import { AdminHeader, Empty, StagePill, Table, Tile } from "@/components/admin/AdminUi";
import { chicagoDay, isConfirmed, money0, prettyDay } from "@/lib/admin-view";
import { listLeads, type Lead } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Customers", robots: { index: false } };

type Customer = {
  email: string;
  name?: string;
  phone?: string;
  city?: string;
  leads: Lead[];
  latest: Lead;
  quoted: number;
  booked: number;
  fees: number;
  nextEvent?: string;
  optedOut: boolean;
};

// One row per person (by email), across every form they sent.
function group(leads: Lead[], today: string): Customer[] {
  const map = new Map<string, Lead[]>();
  for (const l of leads) {
    const k = l.email.trim().toLowerCase();
    map.set(k, [...(map.get(k) ?? []), l]);
  }
  return [...map].map(([email, ls]) => {
    const sorted = ls.sort((a, b) => b.created_at.localeCompare(a.created_at));
    const pick = <K extends keyof Lead>(k: K) => sorted.find((l) => l[k])?.[k];
    return {
      email,
      name: pick("name") as string | undefined,
      phone: pick("phone") as string | undefined,
      city: pick("city") as string | undefined,
      leads: sorted,
      latest: sorted[0],
      quoted: sorted.reduce((s, l) => s + (l.quote_subtotal ?? 0), 0),
      booked: sorted.filter(isConfirmed).reduce((s, l) => s + (l.quote_subtotal ?? 0), 0),
      fees: sorted.filter((l) => l.fee_status === "paid").reduce((s, l) => s + (l.fee_amount ?? 0), 0),
      nextEvent: sorted.map((l) => l.event_date).filter((d): d is string => !!d && d >= today).sort()[0],
      optedOut: sorted.some((l) => l.opted_out_at),
    };
  });
}

const filters = [
  { id: "", label: "Everyone" },
  { id: "booked", label: "Booked with us" },
  { id: "repeat", label: "Asked more than once" },
  { id: "upcoming", label: "Event coming up" },
] as const;

export default async function CustomersPage(props: PageProps<"/admin/customers">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";
  const filter = typeof sp.f === "string" ? sp.f : "";
  const today = chicagoDay();
  const all = group((await listLeads()).filter((l) => l.kind !== "partner"), today).sort((a, b) => b.latest.created_at.localeCompare(a.latest.created_at));

  const shown = all.filter(
    (c) =>
      (!q || [c.name, c.email, c.phone, c.city].some((v) => v?.toLowerCase().includes(q))) &&
      (filter !== "booked" || c.booked > 0) &&
      (filter !== "repeat" || c.leads.length > 1) &&
      (filter !== "upcoming" || !!c.nextEvent),
  );
  const bookedCount = all.filter((c) => c.booked > 0).length;
  const href = (f: string) => `/admin/customers${f || q ? `?${new URLSearchParams({ ...(f && { f }), ...(q && { q }) })}` : ""}`;

  return (
    <div className="container-x py-10">
      <AdminHeader
        group="Sell"
        title="Customers"
        intro="Everyone who has sent a form, one row per email address, with what they asked for and what they booked."
        actions={<a href="/admin/export" className="btn-ghost btn-sm">Download CSV</a>}
      />

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile tone="blue" label="People" value={all.length.toLocaleString()} />
        <Tile tone="green" label="Booked with us" value={bookedCount} note={all.length ? `${Math.round((bookedCount / all.length) * 100)}% of everyone` : undefined} />
        <Tile tone="green" label="Booked value" value={money0(all.reduce((s, c) => s + c.booked, 0))} note="Rental totals on confirmed events" />
        <Tile tone="gold" label="Asked more than once" value={all.filter((c) => c.leads.length > 1).length} />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <nav aria-label="Filter customers" className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Link key={f.id} href={href(f.id)} className={f.id === filter ? "chip-active" : "chip"}>{f.label}</Link>
          ))}
        </nav>
        <form className="ml-auto flex gap-2" action="/admin/customers">
          {filter && <input type="hidden" name="f" value={filter} />}
          <label htmlFor="q" className="sr-only">Search customers</label>
          <input id="q" name="q" defaultValue={q} placeholder="Name, email, phone, town" className="field min-h-10 py-2" />
          <button type="submit" className="btn-ghost btn-sm">Search</button>
        </form>
      </div>

      <section className="card mt-4 p-6">
        {shown.length === 0 ? (
          <Empty>No one matches.</Empty>
        ) : (
          <Table head={["Name", "Contact", "Requests", "Next event", "Quoted", "Booked", "Fees paid", "Latest stage"]} right={[2, 4, 5, 6]} min={980}>
            {shown.slice(0, 300).map((c) => (
              <tr key={c.email}>
                <td>
                  <Link href={`/admin/leads/${c.latest.id}`} className="font-medium text-accent">{c.name || c.email}</Link>
                  <div className="text-xs text-muted">{[c.city, c.optedOut && "unsubscribed"].filter(Boolean).join(" · ")}</div>
                </td>
                <td className="[overflow-wrap:anywhere]">
                  <a href={`mailto:${c.email}`} className="text-accent">{c.email}</a>
                  {c.phone && <div><a href={`tel:${c.phone}`}>{c.phone}</a></div>}
                </td>
                <td className="text-right tabular-nums">
                  {c.leads.length}
                  <div className="text-xs text-muted">last {prettyDay(c.latest.created_at.slice(0, 10), { month: "short", day: "numeric" })}</div>
                </td>
                <td className="whitespace-nowrap">{c.nextEvent ? prettyDay(c.nextEvent) : <span className="text-muted">–</span>}</td>
                <td className="text-right tabular-nums">{c.quoted ? money0(c.quoted) : "–"}</td>
                <td className="text-right tabular-nums">{c.booked ? money0(c.booked) : "–"}</td>
                <td className="text-right tabular-nums">{c.fees ? money0(c.fees) : "–"}</td>
                <td><StagePill status={c.latest.status} /></td>
              </tr>
            ))}
          </Table>
        )}
        {shown.length > 300 && <p className="mt-3 text-xs text-muted">Showing the 300 most recent. Search to narrow it down.</p>}
      </section>
    </div>
  );
}
