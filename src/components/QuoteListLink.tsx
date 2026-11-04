"use client";

import Link from "@/components/Link";
import { useSyncExternalStore } from "react";
import { listCount, subscribeList } from "@/lib/quote-list";

// The header "Get a quote" button. Once the visitor has items on their list it reads "Your quote · 3"
// and opens the builder with that list.
export function QuoteListLink({ className, label, filledLabel = "Your quote" }: { className?: string; label: string; filledLabel?: string }) {
  const count = useSyncExternalStore(subscribeList, listCount, () => 0);
  return (
    <Link href={count > 0 ? "/quote?browse=1&from=header-list" : "/quote"} className={className}>
      {count > 0 ? filledLabel : label}
      {count > 0 && (
        <span className="ml-1.5 inline-grid min-w-5 place-items-center rounded-full bg-surface px-1.5 text-xs font-semibold text-wine tabular-nums" aria-label={`${count} items on your list`}>
          {count}
        </span>
      )}
    </Link>
  );
}
