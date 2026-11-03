import { Icon, type IconName } from "./Icon";

// Colour = meaning: gold tip, blue note, green done / good to know, amber watch out, rose problem.
const kinds = {
  tip: { icon: "spark", cls: "border-gold/40 border-l-gold bg-gold-soft", ic: "text-gold" },
  note: { icon: "info", cls: "border-blue/25 border-l-blue bg-blue-soft", ic: "text-blue" },
  check: { icon: "check", cls: "border-green/25 border-l-green bg-green-soft", ic: "text-green" },
  warn: { icon: "info", cls: "border-amber/30 border-l-amber bg-amber-soft", ic: "text-amber" },
  alert: { icon: "info", cls: "border-rose/30 border-l-rose bg-rose-soft", ic: "text-rose" },
} satisfies Record<string, { icon: IconName; cls: string; ic: string }>;

// Highlighted aside for tips, notes and key takeaways inside content pages.
export function Callout({
  kind = "tip",
  title,
  children,
  className = "",
}: {
  kind?: keyof typeof kinds;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const k = kinds[kind];
  return (
    <aside className={`flex gap-4 rounded-2xl border border-l-4 p-5 ${k.cls} ${className}`}>
      <Icon name={k.icon} size={22} className={`mt-0.5 shrink-0 ${k.ic}`} />
      <div className="leading-7">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-ink/85">{children}</div>
      </div>
    </aside>
  );
}
