import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { sideImage } from "@/components/tools/CompareParts";
import { FaqList, JsonLd, PageHero, QuoteCta, Section } from "@/components/ui";
import { comparisonPath, comparisons } from "@/data/comparisons";
import { routeExists } from "@/lib/routes";
import { render } from "@/lib/scenes";
import { site } from "@/lib/site";

const title = "Event Rental Comparisons for Chicago Hosts";
const description = "Side-by-side comparisons for Chicago hosts: tables, tents, tablecloths, lighting, dance floors and heaters, so you can pick with confidence.";
const hero = render("tent-reception-dusk");

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/rental-comparisons" },
  openGraph: { title, description, url: "/rental-comparisons", images: [{ url: hero.src, alt: hero.alt }] },
};

const faqs = [
  { q: "How do these comparisons work?", a: "Each page puts two rental options side by side: what they are, where they work, how they look and when to choose each. Where we rent both, you'll see a link to the real catalog price." },
  { q: "Are the prices current?", a: "They are our current prices, checked on the date shown in our catalog. Your written quote confirms the final price for your date." },
  { q: "Where are the chair comparisons?", a: "Chairs have their own set of comparisons, from Chiavari vs folding chairs to ghost vs crossback. They're linked at the bottom of this page." },
  { q: "What if I still can't decide?", a: "Book a free call. We'll look at your venue, guest count and style and recommend what fits." },
  { q: "Can I rent both options and use each where it fits best?", a: "Often, yes. A common split is one option for the ceremony and the other for the reception, or one for the head table and the other for the rest of the room. Put both on the same quote and we'll price it either way." },
];

export default function RentalComparisonsIndex() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description,
          url: `${site.url}/rental-comparisons`,
          mainEntity: { "@type": "ItemList", itemListElement: comparisons.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.title, url: `${site.url}${comparisonPath(c)}` })) },
        }}
      />
      <PageHero
        eyebrow="Compare rentals"
        title={<>This or that? <em className="text-gold">Compared.</em></>}
        intro={
          <p data-answer>
            Side-by-side comparisons of the event rentals people ask about most: tables, tents, linens, lighting, dance floors, cocktail tables and heaters. Each one says plainly when to choose which, shows real Chicago rental prices where we have them, and links to a free calculator so you can run your own numbers.
          </p>
        }
        breadcrumbs={[{ name: "Rental comparisons", href: "/rental-comparisons" }]}
        media={
          <figure className="media aspect-[4/3] shadow-lift">
            <Image src={hero.src} alt={hero.alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </figure>
        }
      />
      <Section eyebrow="All comparisons" title="Pick a decision">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {comparisons.map((c) => {
            const a = sideImage(c.a);
            const b = sideImage(c.b);
            return (
              <li key={c.slug}>
                <Link href={comparisonPath(c)} className="card card-hover block h-full overflow-hidden">
                  <div className="grid grid-cols-2">
                    <div className="media aspect-square rounded-none"><Image src={a.src} alt={a.alt} fill sizes="(min-width: 1024px) 11vw, 25vw" className="object-cover" /></div>
                    <div className="media aspect-square rounded-none"><Image src={b.src} alt={b.alt} fill sizes="(min-width: 1024px) 11vw, 25vw" className="object-cover" /></div>
                  </div>
                  <div className="p-5">
                    <h2 className="display-3">{c.title.split(":")[0]}</h2>
                    <p className="mt-1 text-sm text-muted">{c.answer.split(". ")[0]}.</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-sm text-muted">
          Choosing chairs? See the {routeExists("/chair-comparisons") ? <Link href="/chair-comparisons" className="link">chair comparisons</Link> : <Link href="/chairs" className="link">chair collection</Link>}.
          {routeExists("/compare") && <> Weighing how to book? See <Link href="/compare" className="link">booking options compared</Link>.</>} Want numbers? Try the <Link href="/tools" className="link">free planning tools</Link>.
        </p>
      </Section>
      <Section tone="sand" eyebrow="Questions" title="About these comparisons">
        <FaqList faqs={faqs} className="max-w-3xl" />
      </Section>
      <QuoteCta source="rental-comparisons" />
    </>
  );
}
