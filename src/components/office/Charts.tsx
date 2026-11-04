// Small, quiet charts for back-office cards. Plain SVG and divs, no chart library, colours from tokens.

type Tone = "wine" | "green" | "amber" | "blue" | "gold" | "rose";
const color = (t: Tone) => `var(--${t})`;
const soft = (t: Tone) => `var(--${t === "gold" ? "gold" : t}-soft)`;

// Rounded vertical bars, last one highlighted (usually "today").
export function Bars({ data, tone = "wine", height = 96, label }: { data: { label: string; value: number }[]; tone?: Tone; height?: number; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <figure aria-label={label}>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d, i) => {
          const last = i === data.length - 1;
          return (
            <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end" title={`${d.label}: ${d.value}`}>
              <div
                className="w-full max-w-8 rounded-full"
                style={{ height: `${Math.max(8, (d.value / max) * 100)}%`, background: last ? color(tone) : soft(tone) }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 text-center text-xs text-muted">{d.label}</span>
        ))}
      </div>
      <figcaption className="sr-only">{data.map((d) => `${d.label} ${d.value}`).join(", ")}</figcaption>
    </figure>
  );
}

// Ring with a big number in the middle, plus an optional legend.
export function Ring({ parts, center, sub, label, size = 120 }: { parts: { label: string; value: number; tone: Tone }[]; center: string; sub?: string; label: string; size?: number }) {
  const total = parts.reduce((s, p) => s + p.value, 0);
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <figure className="flex flex-wrap items-center gap-5" aria-label={label}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="10" />
          {total > 0 &&
            parts.map((p) => {
              const len = (p.value / total) * c;
              const el = (
                <circle key={p.label} cx="50" cy="50" r={r} fill="none" stroke={color(p.tone)} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-offset} />
              );
              offset += len;
              return el;
            })}
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xl font-semibold tabular-nums">{center}</p>
            {sub && <p className="text-xs text-muted">{sub}</p>}
          </div>
        </div>
      </div>
      <ul className="min-w-0 space-y-1.5 text-sm">
        {parts.map((p) => (
          <li key={p.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color(p.tone) }} />
            <span className="text-muted">{p.label}</span>
            <span className="ml-auto pl-4 tabular-nums">{p.value}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}

// Thin trend line with a dot on the last point.
export function Trend({ values, tone = "blue", label, height = 64 }: { values: number[]; tone?: Tone; label: string; height?: number }) {
  const max = Math.max(1, ...values);
  const n = Math.max(1, values.length - 1);
  const pts = values.map((v, i) => [(i / n) * 100, 36 - (v / max) * 32] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full" style={{ height }} role="img" aria-label={label}>
      <path d={`${d} L100,40 L0,40 Z`} fill={soft(tone)} />
      <path d={d} fill="none" stroke={color(tone)} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {last && <circle cx={last[0]} cy={last[1]} r="1.8" fill={color(tone)} />}
    </svg>
  );
}

// Horizontal bars for "top N" lists (lead sources, cities, categories).
export function RankBars({ rows, tone = "wine", format = (n: number) => String(n) }: { rows: { label: string; value: number; href?: string }[]; tone?: Tone; format?: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="text-sm">
          <div className="flex justify-between gap-3">
            <span className="truncate">{r.label}</span>
            <span className="shrink-0 tabular-nums text-muted">{format(r.value)}</span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-surface-2">
            <div className="h-2 rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: color(tone) }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
