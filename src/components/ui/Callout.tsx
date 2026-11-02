import { Icon, type IconName } from "./Icon";

const kinds = {
  tip: { icon: "spark", cls: "border-gold/30 bg-gold-soft/70" },
  note: { icon: "info", cls: "border-line bg-surface-2" },
  check: { icon: "check", cls: "border-sage/30 bg-sage/10" },
} satisfies Record<string, { icon: IconName; cls: string }>;

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
    <aside className={`flex gap-4 rounded-2xl border p-5 ${k.cls} ${className}`}>
      <Icon name={k.icon} size={22} className="mt-0.5 shrink-0 text-gold" />
      <div className="leading-7">
        {title && <p className="font-semibold">{title}</p>}
        <div className="text-ink/85">{children}</div>
      </div>
    </aside>
  );
}
