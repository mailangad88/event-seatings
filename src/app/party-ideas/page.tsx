import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { IdeaCard, ideaScene } from "@/components/party-ideas/parts";
import { FaqList, Figure, Icon, JsonLd, PageHero, QuoteCta, Section, type Faq } from "@/components/ui";
import { ideaPath, ideas, ideasFor, partyTypes, typePath } from "@/data/party-ideas";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Party Ideas by Occasion, With Rentals",
  description: `${ideas.length} party themes with setups, activities and the rentals to make each one, priced live for ${site.market}.`,
  alternates: { canonical: "/party-ideas" },
};

const faqs: Faq[] = [
  { q: "How do I pick a party theme?", a: "Start with the format (seated dinner, cocktail party or open house), then pick a palette of three or four colours. The theme follows from the chair, linen and lighting in those colours." },
  { q: "Can I add a theme's rentals to my quote?", a: "Yes. Every idea has a 'Plan this party' button that opens the planner with the theme selected, and you can also pick ideas on the planner's Add-ons step. Prices update for your guest count." },
  { q: "Are the prices on these pages final?", a: "They are live rental prices for each item. Your proposal confirms availability for your date and adds delivery, setup and tax for your address." },
  { q: "Do you supply the props and crafts too?", a: "We rent the furniture, tableware, lighting, tents, games and equipment. Props marked DIY, such as favours, signs and craft supplies, are things you buy or make." },
];

export default function PartyIdeasHub() {
  const hero = ideaScene("hero-parties", "Party scene with tables, decor and lighting");
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Party ideas by occasion",
          url: `${site.url}/party-ideas`,
          hasPart: partyTypes.map((t) => ({ "@type": "CollectionPage", name: `${t.name} ideas`, url: `${site.url}${typePath(t.slug)}` })),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: ideas.length,
            itemListElement: ideas.map((i, n) => ({ "@type": "ListItem", position: n + 1, name: i.name, url: `${site.url}${ideaPath(i)}` })),
          },
        }}
      />
      <PageHero
        eyebrow="Party ideas"
        title="Party ideas for every occasion"
        intro={
          <>
            {ideas.length} themes across {partyTypes.length} kinds of party, each with a colour palette, backyard and indoor setups, activities,
            games and props, and the exact rentals with live prices. Tap any idea to add it to your plan.
          </>
        }
        breadcrumbs={[{ name: "Party ideas", href: "/party-ideas" }]}
        actions={
          <Link href="/quote" className="btn-accent btn-lg">
            Start the planner <Icon name="arrow" size={18} />
          </Link>
        }
        media={<Figure src={hero.src} alt={hero.alt} caption={hero.caption} width={hero.width} height={hero.height} ratio="4/3" priority />}
      />

      <Section eyebrow="Browse by occasion" title="Pick your kind of party">
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {partyTypes.map((t) => {
            const sc = ideaScene(t.scene, t.sceneAlt);
            return (
              <li key={t.slug}>
                <Link href={typePath(t.slug)} className="group card card-hover block h-full overflow-hidden">
                  <div className="relative aspect-[4/3] bg-surface-2">
                    <Image src={sc.src} alt={`${t.name} ideas: ${t.sceneAlt}`} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
                  </div>
                  <div className="p-4">
                    <p className="font-heading font-semibold text-xl leading-tight">{t.name}</p>
                    <p className="mt-1 text-xs text-muted">{ideasFor(t.slug).length} themes · {t.setups.length} setups · {t.activities.length} activities</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      {partyTypes.map((t) => (
        <Section
          key={t.slug}
          id={t.slug}
          eyebrow={t.name}
          title={`${t.name} themes`}
          action={
            <Link href={typePath(t.slug)} className="text-sm text-accent underline">
              Setups and activities for {t.name.toLowerCase()}
            </Link>
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ideasFor(t.slug).map((i) => (
              <IdeaCard key={i.slug} idea={i} />
            ))}
          </div>
        </Section>
      ))}

      <Section eyebrow="Questions" title="Planning with party ideas">
        <FaqList faqs={faqs} className="max-w-3xl" />
      </Section>
      <QuoteCta title="Turn an idea into a priced plan" text="Pick your occasion, guests and a theme. We'll build the rental list with live prices and a free planning checklist." source="party-ideas" />
    </>
  );
}
