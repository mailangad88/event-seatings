import Link from "next/link";
import { statusLabel } from "@/lib/store";

// Building blocks for /admin pages, so every section looks the same.

export function AdminHeader({ group, title, intro, actions }: { group: string; title: string; intro?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{group}</p>
        <h1 className="mt-1 font-serif text-4xl sm:text-5xl">{title}</h1>
        {intro && <p className="mt-2 max-w-2xl text-sm text-muted">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const toneClass = {
  wine: "stat-wine",
  green: "stat-green",
  gold: "stat-gold",
  amber: "stat-amber",
  blue: "stat-blue",
  rose: "stat-rose",
} as const;
export type Tone = keyof typeof toneClass;

// Stat card with a coloured top border: wine = sales, green = money in, amber = waiting or owed,
// blue = dates and events, gold = quotes, rose = needs attention now (alert).
export function Tile({ label, value, note, href, alert, tone = "wine" }: { label: string; value: React.ReactNode; note?: React.ReactNode; href?: string; alert?: boolean; tone?: Tone }) {
  const cls = `stat-card block ${toneClass[alert ? "rose" : tone]}`;
  const body = (
    <>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {note && <p className="mt-2 text-xs text-muted">{note}</p>}
    </>
  );
  return href ? (
    <Link href={href} className={`${cls} card-hover`}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export function Panel({ title, more, children, className = "" }: { title: string; more?: { href: string; label: string }; children: React.ReactNode; className?: string }) {
  return (
    <section className={`card min-w-0 p-6 ${className}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-2xl">{title}</h2>
        {more && <Link href={more.href} className="text-sm text-accent">{more.label} →</Link>}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export const Empty = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted">{children}</p>;

const tones: Record<string, string> = {
  new: "badge-amber",
  contacted: "badge-blue",
  consult_booked: "badge-blue",
  quote_sent: "badge-wine",
  vendor_confirmed: "badge-green",
  booked: "badge-green",
  completed: "badge",
  future_season: "badge",
  lost: "badge-rose",
};

export function StagePill({ status }: { status?: string }) {
  return <span className={`${tones[status ?? "new"] ?? tones.new} whitespace-nowrap`}>{statusLabel(status)}</span>;
}

export function FeePill({ status }: { status?: string }) {
  const s = status ?? "unpaid";
  const tone = s === "paid" ? "badge-green" : s === "refunded" ? "badge" : "badge-amber";
  const label = s === "paid" ? "Paid" : s === "refunded" ? "Refunded" : "Not paid";
  return <span className={`${tone} whitespace-nowrap`}>{label}</span>;
}

export function Table({ head, children, min = 640, right = [] }: { head: string[]; children: React.ReactNode; min?: number; right?: number[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ minWidth: min }}>
        <thead className="text-left text-muted">
          <tr className="border-b border-line">
            {head.map((h, i) => (
              <th key={h} className={`py-2 pr-4 font-medium ${right.includes(i) ? "text-right" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-b [&>tr]:border-line [&>tr:last-child]:border-0 [&_td]:py-2.5 [&_td]:pr-4 [&_td]:align-top">{children}</tbody>
      </table>
    </div>
  );
}
