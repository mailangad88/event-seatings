import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ReadinessScore } from "@/components/ReadinessScore";
import { bands, readinessAreas, statementCount } from "@/data/readiness";
import { bookingHref, firstLink } from "@/lib/routes";
import { site } from "@/lib/site";

const title = "Seating Readiness Score: Are You Ready to Book Event Chairs?";
const description = `Free ${statementCount}-question check for weddings and events in the Chicago area. Score your guest count, venue, layout, chair style and weather plan out of 100, see your weakest area, and get the fix.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools/seating-readiness" },
  openGraph: { title, description, url: "/tools/seating-readiness", images: [{ url: "/chairs/render/cross-back.jpg", alt: `Cross-back chair from ${site.name}` }] },
};

const faqs: [string, string][] = [
  [
    "What is the Seating Readiness Score?",
    `A free ${statementCount}-statement check that shows how ready your event's seating plan is. It covers five areas: guest count, venue and logistics, layout and flow, chair style, and season and backup plan. Each area and the overall plan get a score out of 100.`,
  ],
  [
    "How is the score calculated?",
    `Each statement scores 0 for "Not yet", 1 for "Partly" and 2 for "Done". An area's score is its three answers out of 6, shown out of 100. The overall score is all ${statementCount} answers out of ${statementCount * 2}, shown out of 100.`,
  ],
  [
    "What do the score bands mean?",
    bands.map((b, i) => `${b.name} (${b.min}–${i < bands.length - 1 ? bands[i + 1].min - 1 : 100}): ${b.summary}`).join(" "),
  ],
  [
    "Do I need to give my email to see my score?",
    "No. Your score shows right away. Emailing yourself the result is optional, and nothing is saved unless you send it.",
  ],
  [
    "Can I share my result with my partner or planner?",
    "Yes. The page link updates as you answer, so copying it shares your exact answers. Anyone who opens it sees the same score.",
  ],
  [
    "When should I book event chairs in Chicago?",
    `Book as soon as your date, venue and rough guest count are set. Popular Chicago-area dates in late spring, summer and fall fill first.`,
  ],
];

const steps = [
  ["Answer 15 statements", "Not yet, partly or done. About two minutes."],
  ["See five area scores", "Each area fills in as you finish it."],
  ["Get your weakest area", "With the fix and a guide to read."],
  ["Book a free call", "We turn the gaps into a seating plan."],
];

export default function SeatingReadinessPage() {
  const guides = {
    guests: firstLink(["/seating-planner", "Work out your exact chair count"], ["/blog/how-many-chairs-do-i-need", "Read how to count chairs"]),
    venue: firstLink(["/blog/chicago-venue-rules-chair-rentals", "Read what Chicago venues require"], ["/faq", "Read our delivery and setup answers"]),
    layout: firstLink(["/blog/ceremony-vs-reception-chairs", "Plan ceremony and reception chairs"]),
    style: firstLink(["/quiz", "Take the 4-question style quiz"]),
    season: firstLink(
      ["/blog/outdoor-event-chairs-chicago-weather", "Plan seating for Chicago weather"],
      ["/blog/winter-wedding-seating", "Read the winter seating guide"],
    ),
  };

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `${site.name} Seating Readiness Score`,
      url: `${site.url}/tools/seating-readiness`,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Any",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description,
      areaServed: { "@type": "City", name: "Chicago" },
      provider: { "@type": "Organization", name: site.name, url: site.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Free tools", item: `${site.url}/tools` },
        { "@type": "ListItem", position: 2, name: "Seating Readiness Score", item: `${site.url}/tools/seating-readiness` },
      ],
    },
  ];

  return (
    <div className="container-x py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <nav aria-label="Breadcrumb" className="text-[11px] tracking-[0.25em] text-muted uppercase">
        <Link href="/tools" className="hover:text-ink">Free tools</Link>
        <span className="mx-3 text-gold" aria-hidden>·</span>
        <span>Seating Readiness Score</span>
      </nav>

      <div className="mt-10 grid items-end gap-10 md:grid-cols-[1.5fr_1fr]">
        <div>
          <p className="eyebrow">Free planning tool</p>
          <h1 className="headline mt-6 text-5xl leading-[0.98] sm:text-7xl">
            Are you <em className="text-gold">ready</em> to book your chairs?
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
            Score your seating plan out of 100 in about two minutes. You&apos;ll see the one area to settle first
            and how to fix it. No sign-up needed.
          </p>
        </div>
        <div className="hidden grid-cols-5 gap-2 md:grid">
          {readinessAreas.map((a) => (
            <Image key={a.key} src={a.image} alt={a.imageAlt} width={1000} height={1250} sizes="8vw" className="aspect-[4/5] w-full object-cover" />
          ))}
        </div>
      </div>

      <figure className="mt-16 border-y border-line py-8">
        <svg viewBox="0 0 960 90" role="img" aria-labelledby="ready-flow-title ready-flow-desc" className="w-full">
          <title id="ready-flow-title">How the Seating Readiness Score works</title>
          <desc id="ready-flow-desc">Four steps: answer 15 statements, see five area scores, get your weakest area with the fix, then book a free seating call.</desc>
          {steps.map(([name], i) => (
            <g key={name}>
              <circle cx={60 + i * 280} cy="30" r="22" fill="none" stroke="var(--gold)" strokeWidth="1.25" />
              <text x={60 + i * 280} y="36" textAnchor="middle" fill="var(--gold)" fontSize="18" fontFamily="var(--font-display)">{i + 1}</text>
              <text x={60 + i * 280} y="78" textAnchor="middle" fill="var(--ink)" fontSize="14">{name}</text>
              {i < steps.length - 1 && <line x1={90 + i * 280} y1="30" x2={310 + i * 280} y2="30" stroke="var(--line)" strokeWidth="1.25" />}
            </g>
          ))}
        </svg>
        <figcaption className="sr-only">
          {steps.map(([name, text]) => `${name}: ${text}`).join(" ")}
        </figcaption>
      </figure>

      <div className="mt-16">
        <ReadinessScore guides={guides} bookHref={bookingHref("seating-readiness")} siteName={site.name} />
      </div>

      <section className="mt-28 border-t border-gold/40 pt-16">
        <p className="eyebrow">The method</p>
        <h2 className="headline mt-6 text-4xl sm:text-5xl">What the score checks</h2>
        <ul className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {readinessAreas.map((a) => (
            <li key={a.key} className="border-t border-line pt-6">
              <Image src={a.image} alt={a.imageAlt} width={1000} height={1250} sizes="(min-width: 1024px) 18vw, 45vw" className="aspect-[4/5] w-full object-cover" />
              <h3 className="mt-5 font-serif text-2xl">{a.name}</h3>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
                {a.statements.map((s) => <li key={s}>{s}</li>)}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-28 grid gap-14 border-t border-gold/40 pt-16 md:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="headline mt-6 text-4xl sm:text-5xl">About the score</h2>
        </div>
        <dl className="divide-y divide-line border-y border-line">
          {faqs.map(([q, a]) => (
            <div key={q} className="py-6">
              <dt className="font-serif text-2xl">{q}</dt>
              <dd className="mt-3 leading-7 text-muted">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-16 text-center text-sm text-muted">
        More free tools: <Link href="/tools" className="underline decoration-gold underline-offset-4">see them all</Link>
      </p>
    </div>
  );
}
