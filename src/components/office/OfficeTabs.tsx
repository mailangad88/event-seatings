import Link from "next/link";

// Link tabs for long back-office pages: each tab is a ?tab= link, so the page stays a server page,
// tabs can be bookmarked, and only one section shows at a time (no long scrolling).
export type OfficeTab = { id: string; label: string; count?: number; tone?: "rose" | "amber" };

export function OfficeTabs({
  tabs,
  current,
  base,
  param = "tab",
  keep = {},
  label = "Sections",
}: {
  tabs: OfficeTab[];
  current: string;
  base: string; // page path, e.g. "/admin/reports"
  param?: string;
  keep?: Record<string, string | undefined>; // other search params to carry over (filters)
  label?: string;
}) {
  const href = (id: string) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(keep)) if (v) q.set(k, v);
    if (id !== tabs[0]?.id) q.set(param, id);
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };
  return (
    <nav aria-label={label} className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
      {tabs.map((t) => {
        const on = t.id === current;
        return (
          <Link key={t.id} href={href(t.id)} aria-current={on ? "page" : undefined} className={`office-tab ${on ? "office-tab-on" : ""}`}>
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`rounded-full px-1.5 text-xs tabular-nums ${on ? "bg-surface/20" : t.tone === "rose" ? "bg-rose-soft text-rose" : t.tone === "amber" ? "bg-amber-soft text-amber" : "bg-surface-2"}`}>{t.count}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

// Reads the current tab from search params, falling back to the first tab.
export function pickTab<T extends string>(value: unknown, ids: readonly T[]): T {
  return typeof value === "string" && (ids as readonly string[]).includes(value) ? (value as T) : ids[0];
}
