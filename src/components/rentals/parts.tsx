import Link from "@/components/Link";
import { QuickAdd } from "@/components/QuickAdd";
import { customerPrice, formatPrice, type CatalogItem } from "@/data/catalog";
import { RentalVisual } from "./RentalVisual";

// Server-only building blocks for the /rentals pages. They receive full catalog items but
// render only customer-safe fields (name, specs, marked-up price). Never render vendor fields.

export const itemHref = (i: Pick<CatalogItem, "categoryId" | "id">) => `/rentals/${i.categoryId}/${i.id}`;

// In a grid, cards share 4 rows (subgrid): picture, name, details, price. A name that wraps to two
// lines moves the details and price down on every card in that row, so the row stays lined up.
// Outside a grid the subgrid falls back to plain rows.
export function RentalCard({ item }: { item: CatalogItem }) {
  return (
    <article className="group relative row-span-4 grid h-full grid-rows-subgrid gap-y-0">
      <RentalVisual
        item={item}
        className="aspect-square transition-transform duration-700 ease-out group-hover:scale-[1.02]"
      />
      <h3 className="display-3 mt-3 sm:mt-4">
        <Link href={itemHref(item)} className="after:absolute after:inset-0">
          {item.name}
        </Link>
      </h3>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted sm:text-sm sm:leading-6">{item.specs}</p>
      <p className="mt-3 flex flex-wrap items-baseline gap-x-2 self-end border-t border-line pt-3">
        <span className="font-heading font-semibold text-xl text-wine sm:text-2xl">{formatPrice(customerPrice(item))}</span>
        <span className="text-xs text-muted">{item.unit === "each" ? "each" : item.unit}</span>
        {item.priceSource === "estimated" && <span className="chip">Est.</span>}
        <QuickAdd id={item.id} name={item.name} minQty={item.minQty} perGuest={!!item.perGuest} />
      </p>
    </article>
  );
}

/** Horizontal bar chart comparing customer prices. Plain HTML so crawlers can read every value. */
export function PriceBars({ items, caption }: { items: CatalogItem[]; caption: string }) {
  const rows = items.map((i) => ({ item: i, price: customerPrice(i) })).sort((a, b) => a.price - b.price);
  const max = Math.max(...rows.map((r) => r.price), 1);
  return (
    <figure>
      <figcaption className="text-sm text-muted">{caption}</figcaption>
      <ul className="mt-6 space-y-3">
        {rows.map(({ item, price }) => (
          <li key={item.id} className="grid grid-cols-[minmax(0,11rem)_1fr_5.5rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,15rem)_1fr_6.5rem]">
            <Link href={itemHref(item)} className="truncate hover:text-gold" title={item.name}>
              {item.name}
            </Link>
            <span className="h-2.5 rounded-full bg-gold/80" style={{ width: `${Math.max(2, (price / max) * 100)}%` }} />
            <span className="text-right tabular-nums">
              {formatPrice(price)}
              <span className="text-muted">{item.priceSource === "estimated" ? "*" : ""}</span>
            </span>
          </li>
        ))}
      </ul>
      {rows.some((r) => r.item.priceSource === "estimated") && (
        <p className="mt-4 text-xs text-muted">* Estimated from Chicago-area market rates; confirmed in your quote.</p>
      )}
    </figure>
  );
}

export function Steps({ steps, compact = false }: { steps: { title: string; body: string }[]; compact?: boolean }) {
  return (
    <ol className={`grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 ${compact ? "" : "lg:grid-cols-4"}`}>
      {steps.map((s, n) => (
        <li key={s.title} className="bg-bg p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold font-heading font-semibold text-lg text-gold">
            {n + 1}
          </span>
          <h3 className="mt-4 text-sm font-medium tracking-[0.12em] uppercase">{s.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{s.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function Faqs({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {faqs.map((f) => (
        <details key={f.q} className="group py-5" open={false}>
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-heading text-xl font-medium">
            <h3>{f.q}</h3>
            <span className="text-gold transition-transform group-open:rotate-45" aria-hidden>
              +
            </span>
          </summary>
          <p className="mt-3 max-w-3xl leading-7 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function Breadcrumb({ trail }: { trail: { name: string; href?: string }[] }) {
  return (
    <nav className="text-sm text-muted" aria-label="Breadcrumb">
      {trail.map((t, n) => (
        <span key={t.name}>
          {n > 0 && <span className="mx-2 text-line" aria-hidden>/</span>}
          {t.href ? (
            <Link href={t.href} className="inline-block py-1 hover:text-ink">
              {t.name}
            </Link>
          ) : (
            t.name
          )}
        </span>
      ))}
    </nav>
  );
}
