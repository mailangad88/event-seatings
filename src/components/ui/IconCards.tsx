import { iconFor } from "@/lib/icon-for";
import { Icon, type IconName } from "./Icon";

export type IconCard = { title: string; text?: React.ReactNode; extra?: React.ReactNode; icon?: IconName };

const cols = {
  1: "",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
} as const;

// A grid of short points, each with an icon, a heading and a line or two of text.
// Use it in place of stacked paragraphs or long bullet lists.
export function IconCards({
  items,
  columns = 2,
  headingLevel = 3,
  className = "",
}: {
  items: IconCard[];
  columns?: keyof typeof cols;
  headingLevel?: 3 | 4;
  className?: string;
}) {
  const H = `h${headingLevel}` as "h3" | "h4";
  return (
    <ul className={`grid gap-4 ${cols[columns]} ${className}`}>
      {items.map((it) => (
        <li key={it.title} className="card flex gap-4 p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold">
            <Icon name={it.icon ?? iconFor(it.title, "check")} size={22} />
          </span>
          <div className="min-w-0">
            <H className="font-heading text-lg leading-snug font-semibold">{it.title}</H>
            {it.text && <p className="mt-1 text-sm leading-6 text-muted">{it.text}</p>}
            {it.extra && <div className="mt-2 text-sm leading-6">{it.extra}</div>}
          </div>
        </li>
      ))}
    </ul>
  );
}

// A short list with a check icon per line, in a soft card. For notes, tips and "bring this" lists.
export function CheckList({ items, className = "" }: { items: React.ReactNode[]; className?: string }) {
  return (
    <ul className={`space-y-3 rounded-2xl border border-line bg-surface p-5 ${className}`}>
      {items.map((t, i) => (
        <li key={i} className="flex gap-3 text-sm leading-6">
          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-soft text-green">
            <Icon name="check" size={14} />
          </span>
          <span className="text-muted">{t}</span>
        </li>
      ))}
    </ul>
  );
}
