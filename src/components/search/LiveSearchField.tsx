"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/Link";
import { Icon } from "@/components/ui/Icon";
import { searchSite, type Hit } from "@/lib/site-search-client";

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

/**
 * The search field itself: a `field-pill` box with a search icon, plain GET form (works with no
 * JS) that upgrades to live suggestions as soon as the index has loaded. Used both inline (phone
 * menu) and inside the header's popover.
 */
export function LiveSearchField({
  autoFocus = false,
  limit = 6,
  onNavigate,
  className = "",
}: {
  autoFocus?: boolean;
  limit?: number;
  /** Called when a suggestion (or "see all results") is clicked, so the caller can close a menu/popover. */
  onNavigate?: () => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ query: string; hits: Hit[] } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const trimmed = query.trim();

  useEffect(() => {
    if (!trimmed) return;
    let cancelled = false;
    searchSite(trimmed, limit).then((hits) => {
      if (!cancelled) setResult({ query: trimmed, hits });
    });
    return () => {
      cancelled = true;
    };
  }, [trimmed, limit]);

  const hits = trimmed && result?.query === trimmed ? result.hits : [];

  return (
    <div className={className}>
      <form role="search" action="/search" method="get" className="field-pill flex items-center gap-2 px-4 shadow-soft">
        <Icon name="search" size={16} className="shrink-0 text-muted" />
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search rentals, guides, FAQs…"
          aria-label="Search the site"
          className="min-h-11 w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
        {trimmed && (
          <button type="submit" aria-label="Search" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-accent">
            <Icon name="arrow" size={16} />
          </button>
        )}
      </form>

      {hits.length > 0 && (
        <ul className="card mt-2 overflow-hidden p-1.5 shadow-lift">
          {hits.map((h) => (
            <li key={h.url}>
              <Link href={h.url} onClick={onNavigate} className="group flex items-start gap-2.5 rounded-lg px-3 py-2 hover:bg-surface-2">
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium transition-colors group-hover:text-accent">{h.title}</span>
                  <span className="block text-xs text-muted">{typeLabel[h.type] ?? h.type}</span>
                </span>
              </Link>
            </li>
          ))}
          <li className="border-t border-line pt-1">
            <Link href={`/search?q=${encodeURIComponent(trimmed)}`} onClick={onNavigate} className="block rounded-lg px-3 py-2 text-sm font-medium text-accent hover:bg-surface-2">
              See all results for &ldquo;{trimmed}&rdquo;
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
