"use client";

import Link from "@/components/Link";
import { silentAuction } from "@/lib/tools/calc";
import { NumberField, ShareBar, Stat, ToolFrame, useUrlState } from "./controls";

export function SilentAuctionTool() {
  const [s, set] = useUrlState({ guests: 150, itemsPerGuest: 0.4, itemsPerTable: 6 });
  const r = silentAuction({ guests: s.guests, itemsPerGuest: s.itemsPerGuest, itemsPerTable: s.itemsPerTable });

  return (
    <ToolFrame
      inputs={
        <>
          <NumberField id="sa-guests" label="Guests" value={s.guests} onChange={(n) => set({ guests: n })} max={2000} step={5} />
          <NumberField
            id="sa-ratio"
            label="Items per guest"
            value={s.itemsPerGuest}
            onChange={(n) => set({ itemsPerGuest: n })}
            min={0.2}
            max={1}
            step={0.05}
            hint="A common target is 1 item for every 2 to 3 guests, which is 0.33 to 0.5 here."
          />
          <NumberField
            id="sa-table"
            label="Items per 6 ft display table"
            value={s.itemsPerTable}
            onChange={(n) => set({ itemsPerTable: n })}
            min={3}
            max={10}
            hint="Larger items such as framed art or a trip card use more space; smaller baskets fit more per table."
          />
        </>
      }
      results={
        <div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Stat big value={`${r.itemsLow} to ${r.itemsHigh}`} label="Auction items to source" note="A range, since donations vary in size" />
            <Stat big value={r.displayTables} label="6 ft display tables" note="Plus risers or easels for height" />
          </div>
          <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
            <p className="text-sm font-medium">Checkout</p>
            <div className="mt-3 flex justify-between text-sm">
              <span>Checkout tables (staffed)</span>
              <span className="tabular-nums font-medium">{r.checkoutTables}</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">
              About one checkout table for every 150 guests, so winners don&apos;t queue at the end of the night. See the full{" "}
              <Link href="/blog/silent-auction-planning-guide" className="link">
                silent auction planning guide
              </Link>{" "}
              for sourcing items, bidding formats and room flow.
            </p>
          </div>
          <ShareBar tool="silent-auction-calculator" quoteHref={`/quote?items=round-60&guests=${s.guests}&from=tool-silent-auction-calculator`} />
        </div>
      }
    />
  );
}
