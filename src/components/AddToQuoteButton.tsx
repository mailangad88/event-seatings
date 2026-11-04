"use client";

import Link from "@/components/Link";
import { useState, useSyncExternalStore } from "react";
import { addToList, readList, subscribeList } from "@/lib/quote-list";
import { track } from "@/lib/analytics";
import { Icon } from "./ui/Icon";

// "Add to quote" on item pages: adds the item to the visitor's list and keeps them on the page, so they
// can carry on shopping. Once added it becomes "View my quote (n)".
export function AddToQuoteButton({
  id,
  minQty,
  perGuest,
  from,
  className = "btn-primary",
  compact = false,
}: {
  id: string;
  minQty?: number;
  perGuest?: boolean;
  from: string;
  className?: string;
  compact?: boolean;
}) {
  const snapshot = useSyncExternalStore(
    subscribeList,
    () => {
      const l = readList();
      return `${id in l.items ? 1 : 0}:${Object.keys(l.items).length}`;
    },
    () => "0:0",
  );
  const [inList, count] = snapshot.split(":").map(Number);
  const [just, setJust] = useState(false);

  if (inList) {
    return (
      <span className={`inline-flex flex-wrap items-center gap-x-3 gap-y-1 ${compact ? "" : "mt-0"}`}>
        <Link href={`/quote?browse=1&from=${from}`} className={className}>
          {compact ? "View quote" : "View my quote"} ({count}) <Icon name="arrow" size={16} />
        </Link>
        {!compact && (
          <span className="text-sm text-muted" role="status">
            {just ? "Added. " : "On your list. "}
            <Link href="/rentals" className="link">Keep browsing</Link>
          </span>
        )}
      </span>
    );
  }
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addToList(id, { qty: Math.max(1, minQty ?? 1), auto: !!perGuest });
        setJust(true);
        track("add_to_quote", { item: id, from });
      }}
    >
      <Icon name="plus" size={16} /> Add to quote
    </button>
  );
}
