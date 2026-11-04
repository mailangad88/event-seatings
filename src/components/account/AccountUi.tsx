import Link from "@/components/Link";
import { Icon } from "@/components/ui/Icon";
import { eventStages, fmtDay, type AccountEvent, type AccountPart, type NeedsYou, type PartStatus } from "@/lib/account";
import { usd } from "@/lib/catalog-types";

// Building blocks for the renter account pages, so every section looks the same.

export function PageTitle({ eyebrow, title, intro, actions }: { eyebrow?: string; title: string; intro?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="text-sm text-muted">{eyebrow}</p>}
        <h1 className="display-2 mt-1">{title}</h1>
        {intro && <p className="mt-2 max-w-2xl text-sm text-muted">{intro}</p>}
      </div>
      {actions && <div className="cta-row">{actions}</div>}
    </div>
  );
}

const badge = { amber: "badge-amber", green: "badge-green", blue: "badge-blue", rose: "badge-rose", plain: "badge" } as const;

export function StatusPill({ status }: { status: PartStatus }) {
  return <span className={`${badge[status.tone]} whitespace-nowrap`}>{status.label}</span>;
}

export function FeeStatus({ fee }: { fee: AccountEvent["fee"] }) {
  if (fee.status === "paid") return <span className="badge-green">Paid</span>;
  if (fee.status === "refunded") return <span className="badge">Refunded</span>;
  return <span className="badge-amber">Not paid</span>;
}

export function Card({ title, more, children, className = "", id }: { title?: string; more?: { href: string; label: string }; children: React.ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={`card min-w-0 scroll-mt-28 p-5 sm:p-6 ${className}`}>
      {title && (
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-semibold">{title}</h2>
          {more && <Link href={more.href} className="text-sm font-medium text-accent">{more.label} →</Link>}
        </div>
      )}
      {children}
    </section>
  );
}

// The six steps every event goes through, with the current one highlighted.
export function StageTrack({ stage, compact = false }: { stage: number; compact?: boolean }) {
  return (
    <ol className={`grid gap-2 ${compact ? "grid-cols-6" : "grid-cols-3 sm:grid-cols-6"}`} aria-label="Order progress">
      {eventStages.map((s, i) => {
        const done = i < stage;
        const now = i === stage;
        return (
          <li key={s} aria-current={now ? "step" : undefined} className="min-w-0">
            <span className={`block h-1.5 rounded-full ${done ? "bg-green" : now ? "bg-accent" : "bg-surface-2"}`} />
            {!compact && (
              <span className={`mt-2 block text-xs ${now ? "font-semibold text-ink" : done ? "text-ink" : "text-muted"}`}>
                {done && <Icon name="check" size={12} className="mr-1 inline text-green" />}
                {s}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

const toneWell = { wine: "bg-wine-soft text-wine", amber: "bg-amber-soft text-amber", blue: "bg-blue-soft text-blue" } as const;
const toneIcon = { wine: "wallet", amber: "info", blue: "chat" } as const;

export function NeedsList({ items }: { items: (NeedsYou & { event?: string })[] }) {
  if (!items.length)
    return (
      <p className="flex items-center gap-3 text-sm text-muted">
        <span className="grid size-9 place-items-center rounded-full bg-green-soft text-green"><Icon name="check" size={18} /></span>
        Nothing needs you right now. We&apos;ll post here when it does.
      </p>
    );
  return (
    <ul className="divide-y divide-line">
      {items.map((n, i) => (
        <li key={`${n.id}-${i}`} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${toneWell[n.tone]}`}><Icon name={toneIcon[n.tone]} size={18} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{n.text}</p>
            <p className="truncate text-xs text-muted">{n.event ? `${n.event} · ` : ""}{n.detail}</p>
          </div>
          <Link href={n.href} className={`${n.tone === "wine" ? "btn-primary" : "btn-ghost"} btn-sm shrink-0`}>{n.action}</Link>
        </li>
      ))}
    </ul>
  );
}

const when = (w?: { date?: string; window?: string }) => (w ? [fmtDay(w.date), w.window].filter(Boolean).join(", ") : undefined);

// One rental company's part of the order: its items, status, delivery and pickup.
export function PartCard({ part, open = false }: { part: AccountPart; open?: boolean }) {
  const delivery = when(part.delivery);
  const pickup = when(part.pickup);
  return (
    <details className="group rounded-xl border border-line bg-surface" open={open}>
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold"><Icon name="truck" size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{part.name}</p>
          <p className="text-xs text-muted">
            {part.lines.length} {part.lines.length === 1 ? "item" : "items"} · {usd(part.total)}
            {delivery ? ` · Delivery ${delivery}` : ""}
          </p>
        </div>
        <StatusPill status={part.status} />
        <Icon name="arrow" size={16} className="text-muted transition-transform group-open:rotate-90" />
      </summary>
      <div className="border-t border-line p-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-xs text-muted">Delivery</dt><dd className="mt-0.5 font-medium">{delivery ?? "Time to be set"}</dd></div>
          <div><dt className="text-xs text-muted">Pickup</dt><dd className="mt-0.5 font-medium">{pickup ?? "Time to be set"}</dd></div>
          <div>
            <dt className="text-xs text-muted">Contact</dt>
            <dd className="mt-0.5 font-medium">
              {part.revealed ? (part.phone ? <a href={`tel:${part.phone}`} className="text-accent">{part.phone}</a> : "Through us") : "Shared once your booking is secured"}
            </dd>
          </div>
        </dl>
        {part.note && <p className="mt-3 rounded-lg bg-blue-soft px-3 py-2 text-sm text-blue">{part.note}</p>}
        <ul className="mt-4 divide-y divide-line text-sm">
          {part.lines.map((l, i) => (
            <li key={`${l.name}-${i}`} className="flex justify-between gap-4 py-2">
              <span className="min-w-0">
                {l.name}
                {l.variant ? <span className="text-muted"> · {l.variant}</span> : null}
                <span className="block text-xs text-muted">{l.qty} × {usd(l.each)}</span>
              </span>
              <span className="tabular-nums">{usd(l.total)}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

export function EventFacts({ e }: { e: AccountEvent }) {
  const facts = [
    { icon: "calendar" as const, text: fmtDay(e.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" }) ?? "Date to be set" },
    e.guests ? { icon: "users" as const, text: `${e.guests} guests` } : undefined,
    e.place ? { icon: "pin" as const, text: e.place } : undefined,
  ].filter(Boolean) as { icon: "calendar" | "users" | "pin"; text: string }[];
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
      {facts.map((f) => (
        <li key={f.text} className="flex items-center gap-1.5"><Icon name={f.icon} size={16} />{f.text}</li>
      ))}
    </ul>
  );
}

export const daysLabel = (d?: number) =>
  d === undefined ? "No date yet" : d === 0 ? "Today" : d === 1 ? "Tomorrow" : d > 0 ? `In ${d} days` : d === -1 ? "Yesterday" : `${-d} days ago`;
