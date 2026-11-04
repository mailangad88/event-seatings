"use client";

import Link from "@/components/Link";
import { useSyncExternalStore } from "react";
import { listCount, subscribeList } from "@/lib/quote-list";
import { Icon } from "./ui/Icon";

// Shown above the step-by-step planner when the visitor already has items on their list (added from
// item pages), so the list they built is never hidden behind the planner.
export function SavedListNotice() {
  const count = useSyncExternalStore(subscribeList, listCount, () => 0);
  if (!count) return null;
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-gold-soft p-4">
      <p className="flex items-center gap-2 text-sm">
        <Icon name="check" size={16} className="text-gold" />
        You have {count} {count === 1 ? "item" : "items"} on your list.
      </p>
      <Link href="/quote?browse=1&from=planner-saved-list" className="btn-primary btn-sm">
        Open my list <Icon name="arrow" size={16} />
      </Link>
    </div>
  );
}
