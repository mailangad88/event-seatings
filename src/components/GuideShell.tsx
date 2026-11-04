import Link from "@/components/Link";
import { CallCta } from "@/components/CallCta";
import { FaqList, LinkCards } from "@/components/ui";
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

const sectionId = (h: string, i: number) =>
  h.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `section-${i + 1}`;

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
          <h1 className="display-1 mt-5">{p.title}</h1>
          <p className="mt-6 text-lg leading-8 text-muted">{p.intro}</p>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.25fr_1fr]">
          <figure className="rounded-xl border border-line bg-surface p-4 sm:p-6">
            {p.visual}
            <figcaption className="mt-4 text-sm text-muted">{p.visualCaption}</figcaption>
          </figure>
          <aside className="self-start rounded-xl border border-gold bg-gold-soft p-6">
            <p className="text-xs tracking-[0.2em] text-gold uppercase">Quick answer</p>
            <h2 className="display-3 mt-3">{p.quick.q}</h2>
            <p className="mt-4 leading-7" data-answer>{p.quick.a}</p>
            <Link href={`/book?from=${p.source}`} className="btn-primary mt-6 inline-block">Book a free call</Link>
          </aside>
        </div>

        {p.sections.length >= 3 && (
          <nav aria-label="On this page" className="mt-12 max-w-3xl">
            <p className="eyebrow">On this page</p>
            <LinkCards
              compact
              scrollOnPhone
              columns={2}
              className="mt-4"
              items={[
                ...p.sections.map((s, i) => ({ href: `#${sectionId(s.h, i)}`, label: s.h })),
                { href: "#faq", label: "Frequently asked questions", icon: "help" as const },
              ]}
            />
          </nav>
        )}

        <div className="mt-14 max-w-3xl space-y-10">
          {p.sections.map((s, i) => (
            <section key={s.h} id={sectionId(s.h, i)} className="scroll-mt-28">
              <h2 className="display-2 flex items-start gap-3">
                <span aria-hidden className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-wine text-sm font-semibold text-white tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{s.h}</span>
              </h2>
              <div className="prose-post mt-5 [&>*:first-child]:mt-0 [&>p]:my-4">{s.body}</div>
            </section>
          ))}
        </div>

        {p.visual2 && (
          <figure className="mt-16 max-w-3xl rounded-xl border border-line bg-surface p-4 sm:p-6">
            {p.visual2}
            {p.visual2Caption && <figcaption className="mt-4 text-sm text-muted">{p.visual2Caption}</figcaption>}
          </figure>
        )}

        <section id="faq" className="mt-16 max-w-3xl scroll-mt-28">
          <h2 className="display-2">Frequently asked questions</h2>
          <FaqList className="mt-6" faqs={p.faqs} schema={false} />
        </section>

        {p.related.length > 0 && (
          <section className="mt-16 max-w-3xl">
            <h2 className="display-2">Keep planning</h2>
            <LinkCards columns={2} className="mt-6" items={p.related.map((r) => ({ href: r.href, label: r.label }))} />
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
    <LinkCards className="mt-8" items={items.map((r) => ({ href: r.href, label: r.label, text: r.note }))} />
  );
}
