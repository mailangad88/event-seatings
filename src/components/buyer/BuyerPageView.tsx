import Link from "next/link";
import { FaqList, Figure, Icon, JsonLd, PageHero, QuoteCta, Section } from "@/components/ui";
import type { BuyerPage } from "@/data/buyer-pages";
import { sceneFor } from "@/lib/scenes";
import { site } from "@/lib/site";

const hubLabel = { solutions: "Rental problems solved", compare: "Compare your options" } as const;

// Before/after as a visual: two panels with icons, so the change reads at a glance.
function BeforeAfter({ page }: { page: BuyerPage }) {
  return (
    <figure aria-label={`Before and after: ${page.before.title} vs ${page.after.title}`}>
      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch">
        <div className="rounded-2xl border border-line bg-surface-2 p-6">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Before</p>
          <p className="mt-1 font-heading font-semibold text-2xl">{page.before.title}</p>
          <ul className="mt-4 space-y-3 text-sm">
            {page.before.points.map((t) => (
              <li key={t} className="flex gap-3">
                <Icon name="close" size={16} className="mt-0.5 shrink-0 text-muted" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid place-items-center text-gold" aria-hidden>
          <span className="grid h-12 w-12 rotate-90 place-items-center rounded-full border border-gold/40 bg-gold-soft md:rotate-0">
            <Icon name="arrow" size={20} />
          </span>
        </div>
        <div className="rounded-2xl border border-gold/40 bg-gold-soft/60 p-6">
          <p className="text-xs font-semibold tracking-wide text-gold uppercase">After</p>
          <p className="mt-1 font-heading font-semibold text-2xl">{page.after.title}</p>
          <ul className="mt-4 space-y-3 text-sm">
            {page.after.points.map((t) => (
              <li key={t} className="flex gap-3">
                <Icon name="check" size={16} className="mt-0.5 shrink-0 text-gold" /> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </figure>
  );
}

export function BuyerPageView({ page }: { page: BuyerPage }) {
  const url = `${site.url}/${page.kind}/${page.slug}`;
  const scene = sceneFor(`${page.kind}-${page.slug}`);
  const quoteHref = `/quote?from=${page.kind}-${page.slug}`.slice(0, 80);
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "@id": url,
          url,
          name: page.title,
          description: page.description,
          abstract: page.answer,
          inLanguage: "en-US",
          isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
          about: { "@type": "Service", name: "Event rental booking", provider: { "@type": "Organization", name: site.name, url: site.url }, areaServed: site.serviceArea.map((c) => ({ "@type": "City", name: `${c}, IL` })) },
          primaryImageOfPage: { "@type": "ImageObject", url: `${site.url}${scene.src}`, caption: scene.alt },
          speakable: { "@type": "SpeakableSpecification", cssSelector: ["#short-answer"] },
        }}
      />
      <PageHero
        breadcrumbs={[
          { name: hubLabel[page.kind], href: `/${page.kind}` },
          { name: page.title, href: `/${page.kind}/${page.slug}` },
        ]}
        eyebrow={hubLabel[page.kind]}
        title={page.title}
        intro={
          <span id="short-answer" className="block" data-answer>
            <strong className="text-ink">Short answer: </strong>
            {page.answer}
          </span>
        }
        actions={
          <>
            <Link href={quoteHref} className="btn-primary btn-lg">
              Get a free quote <Icon name="arrow" size={18} />
            </Link>
            <Link href="/book" className="btn-ghost">Book a free call</Link>
          </>
        }
        media={<Figure {...scene} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="What changes" title={`${page.before.title} vs ${page.after.title.toLowerCase()}`}>
        <BeforeAfter page={page} />
      </Section>

      {page.sections.map((s, i) => (
        <Section key={s.h} title={s.h} tone={i % 2 === 0 ? "sand" : "default"}>
          <div className="max-w-3xl space-y-4 leading-8">
            {s.p.map((p) => (
              <p key={p}>{p}</p>
            ))}
            {s.list && (
              <ul className="space-y-3">
                {s.list.map((t) => (
                  <li key={t} className="flex gap-3">
                    <Icon name="check" size={18} className="mt-1.5 shrink-0 text-gold" /> <span>{t}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {i === 0 && (
            <p className="mt-8">
              <Link href={quoteHref} className="btn-primary">Price my list</Link>
            </p>
          )}
        </Section>
      ))}

      {page.table && (
        <Section title="Side by side">
          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full min-w-[520px] text-left text-sm">
              <caption className="caption-bottom px-4 py-3 text-left text-xs text-muted">{page.table.caption}</caption>
              <thead className="bg-surface-2">
                <tr>
                  {page.table.head.map((h, i) => (
                    <th key={i} scope="col" className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {page.table.rows.map((r) => (
                  <tr key={r[0]} className="border-t border-line">
                    {r.map((c, i) => (i === 0 ? <th key={i} scope="row" className="px-4 py-3 font-medium">{c}</th> : <td key={i} className="px-4 py-3">{c}</td>))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      <Section tone="sand" eyebrow="FAQ" title="Questions people ask">
        <FaqList faqs={page.faqs} />
      </Section>

      <Section title="Keep reading">
        <ul className="grid gap-3 sm:grid-cols-3">
          {page.related.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="card flex items-center justify-between gap-3 p-5 transition-colors hover:border-gold">
                <span className="font-medium">{r.label}</span>
                <Icon name="arrow" size={16} className="text-gold" />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <QuoteCta title={page.cta.title} text={page.cta.text} source={`${page.kind}-${page.slug}`} />
    </>
  );
}
