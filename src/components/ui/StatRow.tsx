// Each number gets its own colour so the row is easy to scan.
const tones = ["stat-wine", "stat-green", "stat-gold", "stat-blue"];

// Row of big numbers with labels. Use real, defensible figures only.
export function StatRow({ stats, className = "" }: { stats: { value: string; label: string }[]; className?: string }) {
  return (
    <dl className={`grid grid-cols-2 gap-6 md:grid-cols-4 ${className}`}>
      {stats.map((s, i) => (
        <div key={s.label} className={`border-l-4 pl-4 ${tones[i % tones.length]}`} style={{ borderColor: "var(--stat)" }}>
          <dt className="sr-only">{s.label}</dt>
          <dd className="font-heading text-4xl leading-none font-medium sm:text-5xl" style={{ color: "var(--stat)" }}>{s.value}</dd>
          <dd className="mt-2 text-sm text-muted">{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}
