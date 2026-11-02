// Row of big numbers with labels. Use real, defensible figures only.
export function StatRow({ stats, className = "" }: { stats: { value: string; label: string }[]; className?: string }) {
  return (
    <dl className={`grid grid-cols-2 gap-6 md:grid-cols-4 ${className}`}>
      {stats.map((s) => (
        <div key={s.label} className="border-l border-gold/40 pl-4">
          <dt className="sr-only">{s.label}</dt>
          <dd className="font-serif text-4xl leading-none sm:text-5xl">{s.value}</dd>
          <dd className="mt-2 text-sm text-muted">{s.label}</dd>
        </div>
      ))}
    </dl>
  );
}
