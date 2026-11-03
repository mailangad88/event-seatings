import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ActivityGrid, IdeaCard, IdeaRentals, PaletteStrip, SetupPair, ideaScene, plannerHref } from "@/components/party-ideas/parts";
import { FaqList, Figure, Icon, JsonLd, PageHero, QuoteCta, Section } from "@/components/ui";
import { getCatalogItem } from "@/data/catalog";
import { getIdea, getPartyType, ideaPath, ideas, ideasFor, fullAnswer, withPartyFaqs, PARTY_IDEAS_UPDATED, typePath } from "@/data/party-ideas";
import { getPlannerEvent } from "@/lib/event-plan";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return ideas.map((i) => ({ type: i.type, idea: i.slug }));
}

async function load(props: PageProps<"/party-ideas/[type]/[idea]">) {
  const { type, idea } = await props.params;
  const i = getIdea(idea);
  return i && i.type === type ? i : undefined;
}

export async function generateMetadata(props: PageProps<"/party-ideas/[type]/[idea]">): Promise<Metadata> {
  const i = await load(props);
  if (!i) return {};
  const t = getPartyType(i.type)!;
  const sc = ideaScene(i.scene, i.sceneAlt);
  const title = `${i.name} Ideas: Setup, Games & Rentals`;
  const description = `${i.tagline}. ${t.single[0].toUpperCase()}${t.single.slice(1)} theme with palette, backyard and indoor setups, activities, props and the rentals with live ${site.market} prices.`;
  return {
    title,
    description: description.slice(0, 300),
    alternates: { canonical: ideaPath(i) },
    openGraph: { title, description, url: ideaPath(i), images: [{ url: sc.src, alt: `${i.name}: ${i.sceneAlt}` }] },
  };
}

export default async function IdeaPage(props: PageProps<"/party-ideas/[type]/[idea]">) {
  const i = await load(props);
  if (!i) notFound();
  const t = getPartyType(i.type)!;
  const sc = ideaScene(i.scene, i.sceneAlt);
  const more = ideasFor(t.slug).filter((x) => x.slug !== i.slug);
  const url = `${site.url}${ideaPath(i)}`;
  // Sample quantities use the planner's typical guest count for this occasion (30 for a kids' party, 150 for a wedding).
  const guests = getPlannerEvent(t.planner)?.defaultGuests ?? 100;
  const plan = plannerHref(t.planner, i.slug, `idea-${i.slug}`);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `How to throw a ${i.name.toLowerCase()}`,
          description: i.summary,
          url,
          image: { "@type": "ImageObject", url: `${site.url}${sc.src}`, caption: `${i.name}: ${i.sceneAlt}` },
          dateModified: PARTY_IDEAS_UPDATED,
          publisher: { "@type": "Organization", name: site.name, url: site.url },
          supply: i.props.map((p) => ({ "@type": "HowToSupply", name: p })),
          tool: i.rentals.flatMap((l) => {
            const it = getCatalogItem(l.id);
            return it ? [{ "@type": "HowToTool", name: it.name }] : [];
          }),
          step: [
            { "@type": "HowToStep", name: "Pick the palette", text: i.palette.map((p) => p.name).join(", ") },
            { "@type": "HowToStep", name: "Set up a backyard or tented lawn", text: i.setup.backyard },
            { "@type": "HowToStep", name: "Or set up indoors", text: i.setup.indoors },
            ...i.decor.map((d) => ({ "@type": "HowToStep", name: "Decorate", text: d })),
            ...i.activities.map((a) => ({ "@type": "HowToStep", name: a.name, text: a.text })),
          ],
        }}
      />
      <PageHero
        eyebrow={`${t.name} idea`}
        title={i.name}
        intro={fullAnswer(i.summary, `Below you will find the palette, backyard and indoor setups, activities, props and the rentals for ${guests} guests with live ${site.market} prices, ready to open in the free planner.`)}
        breadcrumbs={[
          { name: "Party ideas", href: "/party-ideas" },
          { name: t.name, href: typePath(t.slug) },
          { name: i.name, href: ideaPath(i) },
        ]}
        actions={
          <>
            <Link href={plan} className="btn-accent btn-lg">
              Plan this party <Icon name="arrow" size={18} />
            </Link>
            <Link href={`/book?from=idea-${i.slug}`} className="btn-ghost">
              Book a free {site.callLength} call
            </Link>
          </>
        }
        media={<Figure src={sc.src} alt={`${i.name}: ${i.sceneAlt}`} caption={sc.ai ? `${sc.caption} (AI-generated example)` : sc.caption} width={sc.width} height={sc.height} ratio="4/3" priority />}
      />

      <Section eyebrow="The look" title="Palette and decor">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <PaletteStrip name={i.name} palette={i.palette} />
          <ul className="space-y-3">
            {i.decor.map((d) => (
              <li key={d} className="flex gap-3 text-sm leading-6">
                <Icon name="check" size={18} className="mt-0.5 shrink-0 text-gold" /> {d}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section tone="sand" eyebrow="Setup ideas" title="How to set it up">
        <SetupPair setup={i.setup} name={i.name} />
      </Section>

      <Section eyebrow="Activities and games" title="Things for guests to do">
        <ActivityGrid activities={i.activities} />
      </Section>

      <Section eyebrow="Props and DIY" title="What to buy or make">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {i.props.map((p) => (
            <li key={p} className="card flex items-center gap-3 p-4 text-sm">
              <Icon name="star" size={18} className="shrink-0 text-gold" /> {p}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">These aren&apos;t rentals: they&apos;re the finishing touches most hosts buy or make.</p>
      </Section>

      <Section
        tone="sand"
        eyebrow="Rent the look"
        title={`Rentals for a ${i.name.toLowerCase()}`}
        intro={`Quantities shown for ${guests} guests. In the planner they adjust to your guest count, and you can change or remove anything.`}
        action={
          <Link href={plan} className="btn-primary">
            Add to my plan <Icon name="arrow" size={16} />
          </Link>
        }
      >
        <IdeaRentals lines={i.rentals} guests={guests} />
      </Section>

      <Section eyebrow="Questions" title={`${i.name} FAQs`}>
        <FaqList faqs={withPartyFaqs([...i.faqs, ...t.faqs.slice(0, 2)], t.single)} className="max-w-3xl" />
      </Section>

      {more.length > 0 && (
        <Section eyebrow="More ideas" title={`Other ${t.single} themes`}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {more.map((m) => (
              <IdeaCard key={m.slug} idea={m} />
            ))}
          </div>
          <p className="mt-6 text-xs text-muted">Last updated {PARTY_IDEAS_UPDATED}.</p>
        </Section>
      )}

      <QuoteCta title={`Price your ${i.name.toLowerCase()}`} source={`idea-${i.slug}`} />
    </>
  );
}
