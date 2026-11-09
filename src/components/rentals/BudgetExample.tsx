import Link from "next/link";
import { customerPrice, getCatalogItem } from "@/data/catalog";
import type { SampleBudget } from "@/data/sample-budgets";
import { itemHref } from "./parts";

const round = (n: number) => Math.round(n * 100) / 100;

// Kept for callers that still need a rough internal total (e.g. sorting budgets); not shown publicly.
export function budgetTotal(b: SampleBudget) {
  return round(
    b.lines.reduce((s, [id, qty]) => {
      const item = getCatalogItem(id);
      return item ? s + customerPrice(item) * qty : s;
    }, 0),
  );
}

/** A worked rental list: items and quantities, with no public price. Price shows once it's in a quote. */
export function BudgetExample({ budget }: { budget: SampleBudget }) {
  const lines = budget.lines
    .map(([id, qty]) => {
      const item = getCatalogItem(id);
      return item ? { item, qty } : null;
    })
    .filter((l) => l !== null);
  const quoteHref = `/quote?items=${budget.lines.map(([id]) => id).join(",")}&guests=${budget.guests}&from=budget-${budget.id}`;

  return (
    <figure className="border border-line bg-surface p-6 sm:p-8">
      <figcaption>
        <h3 className="font-serif text-3xl font-light">{budget.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted">{budget.summary}</p>
      </figcaption>
      <table className="mt-6 w-full text-sm">
        <caption className="sr-only">Rental line items for a {budget.title}</caption>
        <thead>
          <tr className="text-left text-[10px] tracking-[0.18em] text-muted uppercase">
            <th className="pb-2 font-medium">Item</th>
            <th className="pb-2 text-right font-medium">Qty</th>
          </tr>
        </thead>
        <tbody>
          {lines.map(({ item, qty }) => (
            <tr key={item.id} className="border-t border-line">
              <td className="py-2 pr-2">
                <Link href={itemHref(item)} className="hover:text-gold">
                  {item.name}
                </Link>
              </td>
              <td className="py-2 text-right tabular-nums">{qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-xs text-muted">
        Get your price for this list, including delivery, setup, teardown, a damage waiver and tax, in a free quote.
      </p>
      <Link href={quoteHref} className="btn-primary mt-6">
        Get my price
      </Link>
    </figure>
  );
}
