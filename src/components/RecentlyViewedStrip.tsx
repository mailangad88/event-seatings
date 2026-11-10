"use client";

import { useSyncExternalStore } from "react";
import Link from "@/components/Link";
import { recentlyViewed, subscribeRecentlyViewed } from "@/lib/recently-viewed";

// A strip of the last few items this visitor opened, so comparing a handful of chairs or table sizes
// doesn't mean re-searching every time. Renders nothing until there's something to show, and nothing on
// the server (the list only exists in this browser).
export function RecentlyViewedStrip({ excludeId, className = "" }: { excludeId?: string; className?: string }) {
  const items = useSyncExternalStore(
    subscribeRecentlyViewed,
    () => recentlyViewed(excludeId),
    () => [],
  );
  if (items.length === 0) return null;

  return (
    <section className={className} aria-labelledby="recently-viewed">
      <h2 id="recently-viewed" className="headline text-2xl">
        Recently viewed
      </h2>
      <ul className="mt-6 flex gap-4 overflow-x-auto pb-2">
        {items.slice(0, 8).map((i) => (
          <li key={i.id} className="w-32 shrink-0">
            <Link href={i.href} className="block">
              <span className="media relative block aspect-square overflow-hidden rounded-xl border border-line bg-surface-2">
                {i.image && (
                  // eslint-disable-next-line @next/next/no-img-element -- arbitrary cached image paths from any item page; no need for the optimizer on a small thumbnail
                  <img src={i.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                )}
              </span>
              <span className="mt-2 block truncate text-sm">{i.name}</span>
              <span className="block text-xs text-muted">Get a quote</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
