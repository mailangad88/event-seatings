import Link from "next/link";
import { CallCta } from "@/components/CallCta";
import { GUIDES_UPDATED } from "@/lib/planning";
import { site } from "@/lib/site";

export type GuideProps = {
  /** Path of this page, e.g. /seating-layouts/wedding-reception-100-guests */
  path: string;
  crumbs: { name: string; href: string }[];
  eyebrow: string;
  title: string;
  description: string;
  intro: string;
  quick: { q: string; a: string };
  /** Main visual (an accessible SVG diagram, chair art, or both). Required: no text-only pages. */
  visual: React.ReactNode;
  visualCaption: string;
  visualAlt: string;
  /** Optional second visual, e.g. a chart. */
  visual2?: React.ReactNode;
  visual2Caption?: string;
  sections: { h: string; body: React.ReactNode }[];
  faqs: { q: string; a: string }[];
  related: { href: string; label: string }[];
  source: string;
};

export function GuideShell(p: GuideProps) {
  const url = `${site.url}${p.path}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: p.title,
      description: p.description,
      url,
      mainEntityOfPage: url,
      dateModified: GUIDES_UPDATED,
      datePublished: GUIDES_UPDATED,
      image: { "@type": "ImageObject", url: `${url}/opengraph-image`, caption: p.visualAlt, description: p.visualAlt },
      author: { "@type": "Organization", name: site.name, url: site.url },
      publisher: { "@type": "Organization", name: site.name, url: site.url },
      about: { "@type": "Thing", name: "Event chair rental and seating planning in Chicago" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [{ name: "Home", href: "/" }, ...p.crumbs].map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: `${site.url}${c.href === "/" ? "" : c.href}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: p.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];
  return (
    <>
      <div className="container-x py-14">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
        <nav className="text-sm text-muted" aria-label="Breadcrumb">
          <Link href="/" className="inline-block py-1 hover:text-ink">Home</Link>
          {p.crumbs.map((c, i) => (
            <span key={c.href}>
              <span className="mx-2 text-line" aria-hidden>/</span>
              {i === p.crumbs.length - 1 ? c.name : <Link href={c.href} className="inline-block py-1 hover:text-ink">{c.name}</Link>}
            </span>
          ))}
        </nav>

        <header className="mt-10 max-w-3xl">
          <p className="eyebrow">{p.eyebrow}</p>
          <h1 className="headline mt-5 text-4xl leading-[1.05] sm:text-6xl">{p.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted">{p.intro}</p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.25fr_1fr]">
          <figure className="rounded-xl border border-line bg-surface p-4 sm:p-6">
            {p.visual}
            <figcaption className="mt-4 text-sm text-muted">{p.visualCaption}</figcaption>
          </figure>
          <aside className="self-start rounded-xl border border-gold bg-gold-soft p-6">
            <p className="text-[11px] tracking-[0.2em] text-gold uppercase">Quick answer</p>
            <h2 className="mt-3 font-serif text-2xl leading-snug">{p.quick.q}</h2>
            <p className="mt-4 leading-7">{p.quick.a}</p>
            <Link href={`/book?from=${p.source}`} className="btn-primary mt-6 inline-block">Book a free call</Link>
          </aside>
        </div>

        <div className="mt-16 max-w-3xl space-y-12">
          {p.sections.map((s) => (
            <section key={s.h}>
              <h2 className="headline text-3xl sm:text-4xl">{s.h}</h2>
              <div className="mt-5 space-y-4 leading-8">{s.body}</div>
            </section>
          ))}
        </div>

        {p.visual2 && (
          <figure className="mt-16 max-w-3xl rounded-xl border border-line bg-surface p-4 sm:p-6">
            {p.visual2}
            {p.visual2Caption && <figcaption className="mt-4 text-sm text-muted">{p.visual2Caption}</figcaption>}
          </figure>
        )}

        <section className="mt-16 max-w-3xl">
          <h2 className="headline text-3xl sm:text-4xl">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {p.faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="cursor-pointer font-serif text-xl">{f.q}</summary>
                <p className="mt-3 leading-8 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {p.related.length > 0 && (
          <section className="mt-16 max-w-3xl">
            <h2 className="headline text-3xl">Keep planning</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {p.related.map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="block rounded-lg border border-line px-4 py-3 hover:border-gold">{r.label}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-12 max-w-3xl text-sm text-muted">
          Figures are planning rules of thumb and our own estimates, last reviewed {GUIDES_UPDATED}. Your venue&apos;s posted capacity, fire code and
          final quote always take precedence.
        </p>
      </div>
      <CallCta source={p.source} />
    </>
  );
}

/** Simple hub page list. */
export function HubLinks({ items }: { items: { href: string; label: string; note?: string }[] }) {
  return (
    <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((r) => (
        <li key={r.href}>
          <Link href={r.href} className="block rounded-lg border border-line px-4 py-3 hover:border-gold">
            <span className="block">{r.label}</span>
            {r.note && <span className="mt-1 block text-sm text-muted">{r.note}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );
}
