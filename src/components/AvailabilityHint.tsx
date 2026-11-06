"use client";

import { useId, useState } from "react";
import { blockedMessage, useBlockedDates } from "@/lib/use-blocked-dates";
import { Icon } from "./ui/Icon";

// "Pick a date, see if we're already fully booked": sits on the item page next to "Add to my quote" so
// a visitor can check before they build out a whole list. It checks the same sitewide blocked dates as
// the quote builder; it isn't a per-item stock count (we don't track that), so it only ever rules a date
// out, never confirms this specific item is on the truck. The wording below says exactly that.
export function AvailabilityHint() {
  const id = useId();
  const [date, setDate] = useState("");
  const blocked = useBlockedDates();
  const today = new Date().toLocaleDateString("en-CA");
  const isBlocked = !!date && blocked.has(date);

  return (
    <div className="mt-6 rounded-xl border border-line bg-surface p-4 text-sm">
      <label htmlFor={id} className="label !mb-2 text-sm">
        Check your date before you add it to your quote
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <input id={id} type="date" min={today} className="field w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        {date &&
          (isBlocked ? (
            <span className="flex items-center gap-1.5 text-rose">
              <Icon name="alert" size={16} />
              {blockedMessage}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-gold">
              <Icon name="check" size={16} />
              Open as of today. Your quote confirms it for this item.
            </span>
          ))}
      </div>
    </div>
  );
}
