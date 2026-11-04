import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { SideCard, sideImage } from "@/components/tools/CompareParts";
import { FaqList, Icon, JsonLd, PageHero, PriceDisclaimer, QuoteCta, Section } from "@/components/ui";
import { comparisons, comparisonPath, getComparison } from "@/data/comparisons";
import { getTool } from "@/data/tools";
import { getCatalogItem } from "@/data/catalog";
import { routeExists } from "@/lib/routes";
import { site } from "@/lib/site";
import { toolPrices } from "@/lib/tools/prices";

export const dynamicParams = false;

export function generateStaticParams() {
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/rental-comparisons/[slug]">): Promise<Metadata> {
  const c = getComparison((await props.params).slug);
  if (!c) return {};
  const img = sideImage(c.a);
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: comparisonPath(c) },
    openGraph: { title: c.title, description: c.description, url: comparisonPath(c), type: "article", images: [{ url: img.src, alt: img.alt }] },
  };
}

export default async function ComparisonPage(props: PageProps<"/rental-comparisons/[slug]">) {
  const c = getComparison((await props.params).slug);
  if (!c) notFound();
  const prices = toolPrices([c.a.item, c.b.item].filter((x): x is string => !!x));
  const pa = c.a.item ? prices[c.a.item] : undefined;
  const pb = c.b.item ? prices[c.b.item] : undefined;
  const itemHref = (id?: string) => {
    const i = id ? getCatalogItem(id) : undefined;
    return i ? `/rentals/${i.categoryId}/${i.id}` : "/rentals";
  };
  const others = comparisons.filter((x) => x.slug !== c.slug).slice(0, 6);
  const tools = c.tools.map(getTool).filter((t): t is NonNullable<typeof t> => !!t && routeExists(`/tools/${t.slug}`));
  const name = c.title.split(":")[0];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: c.title,
          description: c.description,
          url: `${site.url}${comparisonPath(c)}`,
          image: [sideImage(c.a), sideImage(c.b)].map((i) => `${site.url}${i.src}`),
          datePublished: "2026-11-03",
          dateModified: "2026-11-03",
          author: { "@type": "Organization", name: site.name, url: site.url },
          publisher: { "@type": "Organization", name: site.name, url: site.url },
          about: [c.a.name, c.b.name],
        }}
      />
      <PageHero
        eyebrow="Compare rentals"
        title={name}
        intro={
          <p data-answer className="rounded-2xl border border-gold/30 bg-surface/70 p-4 text-base leading-7 text-ink">
            {c.answer}
          </p>
        }
        breadcrumbs={[{ name: "Rental comparisons", href: "/rental-comparisons" }, { name, href: comparisonPath(c) }]}
        media={
          <div className="grid grid-cols-2 gap-4">
            <SideCard side={c.a} price={pa} label="Option A" />
            <SideCard side={c.b} price={pb} label="Option B" />
          </div>
        }
      />

      <Section eyebrow="Side by side" title={`${c.a.name} vs ${c.b.name}`}>
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">{`${c.a.name} compared with ${c.b.name}`}</caption>
            <thead className="bg-surface-2 text-xs tracking-wide uppercase">
              <tr>
                <th scope="col" className="p-4"><span className="sr-only">Feature</span></th>
                <th scope="col" className="p-4">{c.a.name}</th>
                <th scope="col" className="p-4">{c.b.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {c.rows.map(([k, a, b]) => (
                <tr key={k}>
                  <th scope="row" className="p-4 font-medium">{k}</th>
                  <td className="p-4 text-muted">{a}</td>
                  <td className="p-4 text-muted">{b}</td>
                </tr>
              ))}
              {(pa || pb) && (
                <tr>
                  <th scope="row" className="p-4 font-medium">Rental price</th>
                  <td className="p-4 text-muted">{pa ? <Link href={itemHref(c.a.item)} className="link">See the {c.a.name.toLowerCase()} price</Link> : "Ask for a quote"}</td>
                  <td className="p-4 text-muted">{pb ? <Link href={itemHref(c.b.item)} className="link">See the {c.b.name.toLowerCase()} price</Link> : "Ask for a quote"}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {(pa || pb) && <PriceDisclaimer className="mt-3" />}
      </Section>

      <Section tone="sand" eyebrow="The verdict" title="Which should you choose?">
        <div className="grid gap-6 md:grid-cols-2">
          {([[c.a, c.chooseA], [c.b, c.chooseB]] as const).map(([side, list]) => (
            <div key={side.id} className="card p-6">
              <h3 className="display-3">Choose a {side.name.toLowerCase()} if…</h3>
              <ul className="mt-4 space-y-2">
                {list.map((t) => (
                  <li key={t} className="flex gap-2 leading-7">
                    <Icon name="check" size={18} className="mt-1 shrink-0 text-gold" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="In detail" title="What to think about">
        <div className="prose-post max-w-3xl">
          {c.body.map((b) => (
            <div key={b.h}>
              <h3>{b.h}</h3>
              {b.p.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
            </div>
          ))}
          {tools.length > 0 && (
            <>
              <h3>Run your numbers</h3>
              <ul>
                {tools.map((t) => (
                  <li key={t.slug}>
                    <Link href={`/tools/${t.slug}`}>{t.name}</Link>: {t.short}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </Section>

      <Section tone="sand" eyebrow="Questions" title="FAQ">
        <FaqList faqs={c.faqs} className="max-w-3xl" />
      </Section>

      <Section eyebrow="More comparisons" title="Still deciding?" action={<Link href="/rental-comparisons" className="link-line">All comparisons <Icon name="arrow" size={16} /></Link>}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={comparisonPath(o)} className="card card-hover block h-full p-5">
                <p className="font-medium">{o.title.split(":")[0]}</p>
                <p className="mt-1 text-sm text-muted">{o.a.name} or {o.b.name.toLowerCase()}</p>
              </Link>
            </li>
          ))}
          {routeExists("/chair-comparisons") && (
            <li>
              <Link href="/chair-comparisons" className="card card-hover block h-full p-5">
                <p className="font-medium">Chair comparisons</p>
                <p className="mt-1 text-sm text-muted">Chiavari, folding, ghost, crossback and more.</p>
              </Link>
            </li>
          )}
        </ul>
      </Section>
      <QuoteCta source={`compare-${c.slug}`} />
    </>
  );
}
