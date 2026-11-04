"use client";

import Link from "@/components/Link";
import { useSyncExternalStore } from "react";
import { listCount, subscribeList } from "@/lib/quote-list";

// The header "Get a quote" button. Once the visitor has items on their list it reads "Your quote · 3"
// and opens the builder with that list.
// `bubble` puts the count on the button's corner instead of beside the label, so the phone header doesn't get wider.
export function QuoteListLink({
  className = "",
  label,
  filledLabel = "Your quote",
  bubble = false,
}: {
  className?: string;
  label: string;
  filledLabel?: string;
  bubble?: boolean;
}) {
  const count = useSyncExternalStore(subscribeList, listCount, () => 0);
  return (
    <Link href={count > 0 ? "/quote?browse=1&from=header-list" : "/quote"} className={`${bubble ? "relative" : ""} ${className}`}>
      {count > 0 ? filledLabel : label}
      {count > 0 && bubble && (
        <span
          className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full border border-wine bg-surface px-1 text-xs font-semibold text-wine tabular-nums"
          aria-label={`${count} items on your list`}
        >
          {count}
        </span>
      )}
      {count > 0 && !bubble && (
        <span className="ml-1.5 inline-grid min-w-5 place-items-center rounded-full bg-surface px-1.5 text-xs font-semibold text-wine tabular-nums" aria-label={`${count} items on your list`}>
          {count}
        </span>
      )}
    </Link>
  );
}
