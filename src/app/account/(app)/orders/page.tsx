import Link from "@/components/Link";
import { Card, PageTitle, StageTrack, StatusPill, daysLabel } from "@/components/account/AccountUi";
import { currentAccount, eventStages, fmtDay } from "@/lib/account";
import { usd } from "@/lib/catalog-types";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

// Every event's order, split into its deliveries.
export default async function AccountOrders() {
  const { events } = (await currentAccount())!;
  return (
    <div className="space-y-6">
      <PageTitle title="Orders" intro="Each event is one order. When it arrives in more than one delivery, you see each one and its times here." />
      {events.length ? (
        events.map((e) => (
          <Card key={e.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Link href={`/account/events/${e.id}`} className="text-lg font-semibold hover:text-accent">{e.title}</Link>
                <p className="text-sm text-muted">{[fmtDay(e.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" }), daysLabel(e.daysLeft), e.guests ? `${e.guests} guests` : undefined].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums">{usd(e.subtotal)}</p>
                <p className="text-xs text-muted">{eventStages[e.stage]}</p>
              </div>
            </div>
            <div className="mt-4"><StageTrack stage={e.stage} /></div>
            {e.parts.length > 0 && (
              <ul className="mt-5 divide-y divide-line rounded-xl border border-line">
                {e.parts.map((p) => (
                  <li key={p.key} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="font-medium">{p.name}</span>
                      <span className="block text-xs text-muted">{p.lines.map((l) => `${l.qty} ${l.name}`).join(", ")}</span>
                    </span>
                    <span className="text-xs text-muted">{p.delivery?.date ? `Delivery ${fmtDay(p.delivery.date)}` : ""}</span>
                    <StatusPill status={p.status} />
                  </li>
                ))}
              </ul>
            )}
            <Link href={`/account/events/${e.id}`} className="btn-ghost btn-sm mt-4">Open order</Link>
          </Card>
        ))
      ) : (
        <Card><p className="text-sm text-muted">No orders yet. <Link href="/quote" className="link">Start a quote</Link> and it shows up here.</p></Card>
      )}
    </div>
  );
}
