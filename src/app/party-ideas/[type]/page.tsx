import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityGrid, IdeaCard, ideaScene, plannerHref } from "@/components/party-ideas/parts";
import { FaqList, Figure, Icon, JsonLd, PageHero, QuoteCta, Section } from "@/components/ui";
import { customerPrice, formatPrice, getCatalogItem, type CatalogItem } from "@/data/catalog";
import { getPartyType, ideaPath, ideasFor, fullAnswer, withPartyFaqs, PARTY_IDEAS_UPDATED, partyTypes, typePath } from "@/data/party-ideas";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return partyTypes.map((t) => ({ type: t.slug }));
}

export async function generateMetadata(props: PageProps<"/party-ideas/[type]">): Promise<Metadata> {
  const t = getPartyType((await props.params).type);
  if (!t) return {};
  const sc = ideaScene(t.scene, t.sceneAlt);
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: { canonical: typePath(t.slug) },
    openGraph: { title: t.metaTitle, description: t.metaDescription, url: typePath(t.slug), images: [{ url: sc.src, alt: sc.alt }] },
  };
}

export default async function PartyTypePage(props: PageProps<"/party-ideas/[type]">) {
  const t = getPartyType((await props.params).type);
  if (!t) notFound();
  const list = ideasFor(t.slug);
  const sc = ideaScene(t.scene, t.sceneAlt);
  const others = partyTypes.filter((o) => o.slug !== t.slug);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${t.name} ideas`,
          description: t.metaDescription,
          url: `${site.url}${typePath(t.slug)}`,
          dateModified: PARTY_IDEAS_UPDATED,
          image: `${site.url}${sc.src}`,
          publisher: { "@type": "Organization", name: site.name, url: site.url },
          mainEntity: {
            "@type": "ItemList",
            itemListElement: list.map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.name, url: `${site.url}${ideaPath(i)}` })),
          },
        }}
      />
      <PageHero
        eyebrow={`${t.name} ideas`}
        title={`${t.name}: themes, setups and activities`}
        intro={fullAnswer(t.intro, `This page lists ${list.length} ${t.single} themes, each with a palette, setups for backyards, tents and indoor rooms, activities, and the rentals it needs with live ${site.market} prices.`)}
        breadcrumbs={[
          { name: "Party ideas", href: "/party-ideas" },
          { name: t.name, href: typePath(t.slug) },
        ]}
        actions={
          <Link href={plannerHref(t.planner, undefined, `ideas-${t.slug}`)} className="btn-accent btn-lg">
            Plan your {t.single} <Icon name="arrow" size={18} />
          </Link>
        }
        media={<Figure src={sc.src} alt={sc.alt} caption={sc.caption} width={sc.width} height={sc.height} ratio="4/3" priority />}
      />

      <Section eyebrow="Themes" title={`${list.length} ${t.single} themes`} intro="Each theme lists a palette, decor, setups, activities, props and the rentals with live prices.">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((i) => (
            <IdeaCard key={i.slug} idea={i} />
          ))}
        </div>
      </Section>

      <Section tone="sand" eyebrow="Setup ideas" title={`How to set up a ${t.single}`} intro="Layouts for backyards, tents and indoor rooms, with the rentals each one takes.">
        <ol className="grid gap-4 md:grid-cols-2">
          {t.setups.map((s, n) => {
            const items = s.rentals.map(getCatalogItem).filter((i): i is CatalogItem => !!i);
            return (
              <li key={s.title} className="card p-6">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold text-accent-ink font-serif text-lg">{n + 1}</span>
                  <div>
                    <h3 className="font-serif text-2xl leading-tight">{s.title}</h3>
                    <p className="text-xs tracking-wide text-muted uppercase">{s.where}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6">{s.text}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {items.map((i) => (
                    <li key={i.id}>
                      <Link href={`/rentals/${i.categoryId}/${i.id}`} className="chip">
                        {i.name} · {formatPrice(customerPrice(i))}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section eyebrow="Activities, games and props" title={`Things to do at a ${t.single}`}>
        <ActivityGrid activities={t.activities} />
      </Section>

      <Section eyebrow="Questions" title={`${t.name} FAQs`}>
        <FaqList faqs={withPartyFaqs(t.faqs, t.single)} className="max-w-3xl" />
      </Section>

      <Section eyebrow="More ideas" title="Other kinds of party">
        <ul className="flex flex-wrap gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={typePath(o.slug)} className="chip">
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-muted">Last updated {PARTY_IDEAS_UPDATED}.</p>
      </Section>

      <QuoteCta title={`Price your ${t.single} in minutes`} source={`ideas-${t.slug}`} />
    </>
  );
}
