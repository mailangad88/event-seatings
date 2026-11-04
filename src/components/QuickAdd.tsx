"use client";

import { useSyncExternalStore } from "react";
import { addToList, readList, subscribeList } from "@/lib/quote-list";
import { track } from "@/lib/analytics";
import { Icon } from "./ui/Icon";

// Small "+" on catalog cards: adds the item to the visitor's quote list without leaving the page.
export function QuickAdd({ id, name, minQty, perGuest }: { id: string; name: string; minQty?: number; perGuest?: boolean }) {
  const on = useSyncExternalStore(subscribeList, () => id in readList().items, () => false);
  return (
    <button
      type="button"
      aria-label={on ? `${name} is on your quote list` : `Add ${name} to your quote`}
      aria-pressed={on}
      title={on ? "On your quote list" : "Add to quote"}
      onClick={() => {
        if (on) return;
        addToList(id, { qty: Math.max(1, minQty ?? 1), auto: !!perGuest });
        track("add_to_quote", { item: id, from: "card" });
      }}
      className={`relative z-10 ml-auto grid h-8 w-8 shrink-0 place-items-center self-center rounded-full border transition-colors ${
        on ? "border-gold bg-gold-soft text-gold" : "border-line bg-surface text-ink hover:border-wine hover:text-wine"
      }`}
    >
      <Icon name={on ? "check" : "plus"} size={14} />
    </button>
  );
}
