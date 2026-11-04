import { readyPackages } from "@/lib/packages";
import { PackageCard } from "./PackageCard";

// Ready-made packages: a sized, priced list for a typical party that opens in the planner with one tap.
// Each card has its own guest count, so the price and list follow the visitor's party size.
// On phones the cards scroll sideways so the section stays short; on wider screens they sit in a grid.
export function ReadyPackages({ ids, compact = false, className = "" }: { ids?: string[]; compact?: boolean; className?: string }) {
  const list = ids ? readyPackages.filter((p) => ids.includes(p.id)) : readyPackages;
  return (
    <ul className={`-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4 ${className}`}>
      {list.map((p) => (
        <li key={p.id} className="w-[80%] shrink-0 snap-start sm:w-auto">
          <PackageCard p={p} compact={compact} />
        </li>
      ))}
    </ul>
  );
}
