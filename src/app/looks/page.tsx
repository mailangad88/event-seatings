import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { LookScene } from "@/components/LookScene";
import { Reveal } from "@/components/Reveal";
import { getChair } from "@/data/chairs";
import { looks } from "@/data/looks";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Elegant Wedding Decor Looks & the Chairs Behind Them",
  description: `Eight of the most elegant wedding and event decor themes, from gilded ballroom to garden estate, each built around one statement chair. Get any look sent to you with pricing for your Chicagoland date.`,
  alternates: { canonical: "/looks" },
  openGraph: {
    title: "The Look Book: elegant event decor, chair first",
    description: "Tap a look, get the full recipe and pricing for your date.",
    url: "/looks",
    images: [{ url: "/chairs/render/louis-medallion.jpg", width: 1000, height: 1250 }],
  },
};

const faqs: [string, string][] = [
  [
    "What is a look board?",
    "A one-page recipe for the look: the chairs, linens, florals, lighting and tableware that create it, with chair pricing for your date and guest count. It's free, and you can hand it to your planner or florist.",
  ],
  [
    "Do you provide the flowers and linens too?",
    "We specialize in chairs, and every look is built around one. We'll tell you exactly which florals, linens and lighting complete it, and we're happy to coordinate with your florist, planner and venue.",
  ],
  [
    "Can I mix two looks?",
    "Yes. A common mix is ghost chairs for the ceremony and velvet chairs for dinner, or a pair of statement chairs for the couple in any look. Tell us what you love on the call and we'll put it together.",
  ],
  [
    "Where do you deliver?",
    `We deliver across Chicago and the suburbs: ${site.serviceArea.join(", ")} and nearby. Delivery, setup and pickup are included in our full-service rentals.`,
  ],
  [
    "When can I book?",
    `We're reserving the ${site.launch.seasonLabel}, with first events from April 2027. Founding-season dates are limited, so the earlier you ask, the more likely your date is open.`,
  ],
];

export default function LooksPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "The Look Book",
    url: `${site.url}/looks`,
    about: "Elegant wedding and event decor looks built around rental chairs",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: looks.map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${site.url}/looks/${l.slug}`,
        name: l.name,
      })),
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero: a strip of looks so the page is visual from the first pixel */}
      <section className="container-x pt-10 pb-16 md:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow justify-center">The look book · Chicagoland</p>
          <h1 className="headline mt-6 text-[3.2rem] leading-[0.95] sm:text-7xl lg:text-8xl">
            Steal the look. <em className="text-gold">Rent the chairs.</em>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted">
            The most elegant event looks we know, each built around one chair. Tap a look for the full recipe, and
            we&apos;ll send it to you with pricing for your date.
          </p>
        </div>
        <div className="-mx-4 mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 lg:grid-cols-8">
          {looks.map((l, i) => (
            <Link
              key={l.slug}
              href={`/looks/${l.slug}`}
              className="group w-[38%] shrink-0 snap-start sm:w-auto"
              aria-label={l.name}
            >
              <LookScene look={l} priority={i < 4} showPalette={false} className="aspect-[9/16] transition-transform duration-700 group-hover:-translate-y-1" />
              <p className="mt-2 truncate text-center text-[10px] tracking-[0.2em] text-muted uppercase">{l.name.replace(/^The /, "")}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* The looks */}
      <section className="container-x py-12" id="looks">
        <div className="grid gap-x-8 gap-y-20 sm:grid-cols-2 lg:grid-cols-3">
          {looks.map((l, i) => {
            const chair = getChair(l.heroChair);
            return (
              <Reveal key={l.slug} delay={(i % 3) * 120}>
                <article className="group relative">
                  <LookScene look={l} className="aspect-[4/5]" />
                  <p className="mt-5 font-serif text-lg text-gold italic">No. {String(i + 1).padStart(2, "0")}</p>
                  <h2 className="headline mt-1 text-4xl leading-tight">
                    <Link href={`/looks/${l.slug}`} className="after:absolute after:inset-0">
                      {l.name}
                    </Link>
                  </h2>
                  <p className="mt-2 text-muted">{l.kicker}</p>
                  <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                    <span className="text-[11px] tracking-[0.18em] text-muted uppercase">
                      The chair: <span className="text-ink">{chair?.name}</span>
                    </span>
                    <span className="text-[11px] tracking-[0.22em] text-gold uppercase transition-transform group-hover:translate-x-1">
                      Get it →
                    </span>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="paper mt-20">
        <div className="container-x py-24">
          <p className="eyebrow">How it works</p>
          <h2 className="headline mt-6 text-5xl sm:text-6xl">
            From saved post to <em>set table</em>
          </h2>
          <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-10">
            {[
              ["Pick a look", "Choose the look you saved on Instagram, Facebook or YouTube, or the one that made you stop scrolling here."],
              ["Get the board", "We email the full recipe for that look with chair pricing for your date and guest count. Free."],
              ["15 minutes, then relax", "A quick call to fit it to your venue. On the day we deliver, place every chair and collect afterward."],
            ].map(([t, d], i) => (
              <li key={t}>
                <span className="headline text-7xl text-gold/70">0{i + 1}</span>
                <h3 className="mt-4 text-[11px] font-medium tracking-[0.25em] uppercase">{t}</h3>
                <p className="mt-3 leading-7 text-muted">{d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap items-center gap-6">
            <Link href="/book?from=looks" className="btn-primary">Book a free 15-min call</Link>
            <Link href="/chairs" className="link-line">See every chair</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container-x py-24">
        <div className="grid gap-14 md:grid-cols-[1fr_1.6fr] md:gap-20">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="headline mt-6 text-5xl leading-[0.95] sm:text-6xl">
              About the <em className="text-gold">looks</em>
            </h2>
          </div>
          <FaqList faqs={faqs} />
        </div>
      </section>
    </>
  );
}
