import Link from "next/link";
import { customerPrice, formatPrice, getCatalogItem } from "@/data/catalog";
import type { SampleBudget } from "@/data/sample-budgets";
import { itemHref } from "./parts";

const round = (n: number) => Math.round(n * 100) / 100;

export function budgetTotal(b: SampleBudget) {
  return round(
    b.lines.reduce((s, [id, qty]) => {
      const item = getCatalogItem(id);
      return item ? s + customerPrice(item) * qty : s;
    }, 0),
  );
}

/** A worked rental budget: line items, a proportional bar per line, and the total. */
export function BudgetExample({ budget }: { budget: SampleBudget }) {
  const lines = budget.lines
    .map(([id, qty]) => {
      const item = getCatalogItem(id);
      return item ? { item, qty, total: round(customerPrice(item) * qty) } : null;
    })
    .filter((l) => l !== null);
  const total = budgetTotal(budget);
  const max = Math.max(...lines.map((l) => l.total), 1);
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
            <th className="hidden w-1/4 pb-2 sm:table-cell" aria-hidden />
            <th className="pb-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {lines.map(({ item, qty, total: t }) => (
            <tr key={item.id} className="border-t border-line">
              <td className="py-2 pr-2">
                <Link href={itemHref(item)} className="inline-block py-0.5 hover:text-gold">
                  {item.name}
                </Link>
              </td>
              <td className="py-2 text-right tabular-nums">{qty}</td>
              <td className="hidden py-2 pl-4 sm:table-cell">
                <span className="block h-1.5 rounded-full bg-gold/70" style={{ width: `${Math.max(3, (t / max) * 100)}%` }} />
              </td>
              <td className="py-2 text-right tabular-nums">{formatPrice(t)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-ink/40">
            <th className="pt-3 text-left font-medium" colSpan={2}>
              Rental subtotal
            </th>
            <td className="hidden sm:table-cell" />
            <td className="pt-3 text-right font-serif text-2xl text-wine tabular-nums">{formatPrice(total)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-3 text-xs text-muted">
        About {formatPrice(Math.round(total / budget.guests))} per guest before delivery, setup, damage waiver and tax.
      </p>
      <Link href={quoteHref} className="btn-ghost mt-6">
        Customize this list
      </Link>
    </figure>
  );
}
