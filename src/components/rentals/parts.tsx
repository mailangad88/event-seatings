import Link from "next/link";
import type { CatalogItem } from "@/data/catalog";
import { RentalVisual } from "./RentalVisual";

// Server-only building blocks for the /rentals pages. They receive full catalog items but
// render only customer-safe fields (name, specs). Never render vendor fields or a public price:
// Angad asked (2026-11-09) for item prices to come out of the public site; they now only show
// once someone starts a quote, labeled as an estimate.

export const itemHref = (i: Pick<CatalogItem, "categoryId" | "id">) => `/rentals/${i.categoryId}/${i.id}`;

export function RentalCard({ item }: { item: CatalogItem }) {
  return (
    <article className="group relative flex flex-col">
      <RentalVisual
        item={item}
        className="aspect-square transition-transform duration-700 ease-out group-hover:scale-[1.02]"
      />
      <h3 className="mt-4 font-serif text-2xl leading-tight font-light">
        <Link href={itemHref(item)} className="after:absolute after:inset-0">
          {item.name}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-muted">{item.specs}</p>
      <p className="mt-3 border-t border-line pt-3 text-sm text-muted">Get your price in a free quote</p>
    </article>
  );
}

export function Steps({ steps, compact = false }: { steps: { title: string; body: string }[]; compact?: boolean }) {
  return (
    <ol className={`grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 ${compact ? "" : "lg:grid-cols-4"}`}>
      {steps.map((s, n) => (
        <li key={s.title} className="bg-bg p-6">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gold font-serif text-lg text-gold">
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
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-serif text-xl font-light">
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
    <nav className="text-[11px] tracking-[0.2em] text-muted uppercase" aria-label="Breadcrumb">
      {trail.map((t, n) => (
        <span key={t.name}>
          {n > 0 && <span className="mx-3 text-gold" aria-hidden>/</span>}
          {t.href ? (
            <Link href={t.href} className="hover:text-ink">
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
