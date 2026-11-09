"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "@/components/Link";
import { Icon } from "@/components/ui/Icon";
import type MiniSearch from "minisearch";

type Entry = { url: string; title: string; text: string; type: string };
type Hit = Entry & { score: number };

const typeLabel: Record<string, string> = {
  page: "Page",
  rental: "Rental item",
  "rental category": "Rental category",
  chair: "Chair",
  "blog post": "Blog post",
  venue: "Venue guide",
  area: "Area guide",
  "event type": "Event guide",
  "party ideas": "Party ideas",
  look: "Styled look",
  guide: "Planning guide",
  download: "Free download",
  answer: "Answer",
  tool: "Calculator",
  comparison: "Comparison",
  "cost guide": "Cost guide",
};

let indexPromise: Promise<{ search: MiniSearch<Entry>; byId: Map<string, Entry> }> | null = null;

// Loaded once per visit and reused: the index (public/search-index.json, generated at build time
// by scripts/build-search-index.ts) is small and has no vendor names or prices in it.
function loadIndex() {
  indexPromise ??= Promise.all([import("minisearch"), fetch("/search-index.json").then((r) => r.json() as Promise<Entry[]>)]).then(
    ([{ default: MiniSearch }, entries]) => {
      const byId = new Map(entries.map((e, i) => [String(i), e]));
      const search = new MiniSearch<Entry>({
        idField: "id",
        fields: ["title", "text"],
        storeFields: [],
        searchOptions: { boost: { title: 3 }, prefix: true, fuzzy: 0.2, combineWith: "OR" },
      });
      search.addAll(entries.map((e, i) => ({ ...e, id: String(i) })));
      return { search, byId };
    },
  );
  return indexPromise;
}

/** Live, as-you-type site search. Degrades to the plain GET form (SearchBox) with JS off. */
export function SiteSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  // The hits for the query they were searched for, so a result never shows up next to a query
  // it doesn't match while a later search is still in flight.
  const [result, setResult] = useState<{ query: string; hits: Hit[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) return;
    let cancelled = false;
    loadIndex().then(({ search, byId }) => {
      if (cancelled) return;
      const hits = search.search(trimmed).slice(0, 30).map((r) => ({ ...byId.get(String(r.id))!, score: r.score }));
      setResult({ query: trimmed, hits });
    });
    return () => {
      cancelled = true;
    };
  }, [trimmed]);

  const activeHits = trimmed && result?.query === trimmed ? result.hits : null;
  const loading = !!trimmed && !activeHits;

  const grouped = useMemo(() => {
    if (!activeHits) return [];
    const byType = new Map<string, Hit[]>();
    for (const h of activeHits) byType.set(h.type, [...(byType.get(h.type) ?? []), h]);
    return [...byType.entries()];
  }, [activeHits]);

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <Icon name="search" size={18} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rentals, guides, areas, FAQs…"
          aria-label="Search the site"
          className="input py-4 pl-11 text-lg"
        />
      </form>

      {!trimmed && (
        <p className="mt-6 text-sm text-muted">
          Try &ldquo;chiavari chairs&rdquo;, &ldquo;tent cost&rdquo;, &ldquo;Naperville&rdquo;, or &ldquo;quinceañera ideas&rdquo;.
        </p>
      )}

      {trimmed && loading && <p className="mt-6 text-sm text-muted">Searching…</p>}

      {trimmed && !loading && activeHits && activeHits.length === 0 && (
        <p className="mt-6 text-sm text-muted">
          No pages matched &ldquo;{query}&rdquo;. Try fewer words, or <Link href="/book" className="link-line">book a call</Link> and we&apos;ll help you find it.
        </p>
      )}

      {!loading && grouped.length > 0 && (
        <div className="mt-8 space-y-8">
          {grouped.map(([type, items]) => (
            <div key={type}>
              <p className="eyebrow border-b border-line pb-2">{typeLabel[type] ?? type}</p>
              <ul className="mt-3 space-y-1">
                {items.map((h) => (
                  <li key={h.url}>
                    <Link href={h.url} className="group card card-hover flex items-start gap-3 p-3">
                      <Icon name="arrow" size={16} className="mt-1 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                      <span className="min-w-0">
                        <span className="block font-medium transition-colors group-hover:text-accent">{h.title}</span>
                        {h.text && <span className="mt-0.5 line-clamp-1 block text-sm text-muted">{h.text}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
