import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { allAnswers, answerTopics, answersUpdated } from "@/data/answers";
import { formatDate, getPosts } from "@/lib/blog";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = seo({
  title: "Chicago Event Chair Rental Answers: Cost, Counts, Venues & Delivery",
  description:
    "Straight answers to the questions Chicago hosts ask before renting event chairs: how many you need, Chiavari vs. folding cost, winter and outdoor events, venue rules, last-minute rentals and suburban delivery.",
  alternates: { canonical: "/answers" },
});

// Posts written to go deeper on these answers. Shown when published.
const deepDives = [
  "chiavari-vs-folding-chairs-cost-chicago",
  "outdoor-event-chairs-chicago-weather",
  "chicago-venue-rules-chair-rentals",
  "when-to-book-event-chair-rentals-chicago",
  "last-minute-chair-rental-chicago",
  "chair-rental-delivery-chicago-suburbs",
  "how-many-chairs-do-i-need",
  "wedding-chair-rental-cost",
];

export default async function AnswersPage() {
  const posts = (await getPosts()).filter((p) => deepDives.includes(p.slug));

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      dateModified: answersUpdated,
      mainEntity: allAnswers.map((x) => ({
        "@type": "Question",
        name: x.q,
        acceptedAnswer: { "@type": "Answer", text: x.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Chicago chair rental answers", item: `${site.url}/answers` },
      ],
    },
  ];

  return (
    <div className="container-x py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <div className="grid items-end gap-12 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="eyebrow">Chicago event chair answers</p>
          <h1 className="headline mt-6 text-5xl leading-[0.98] sm:text-7xl">
            Every question about renting <em className="text-gold">chairs</em>, answered
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted" data-answer>
            Counts, costs, Chicago weather, venue rules and delivery. Straight answers from a local event seating
            company in {site.city}, written so you can plan in minutes: how many chairs you need, what they cost,
            which styles survive a Chicago summer and how delivery works at your venue.
          </p>
          <p className="mt-4 text-[11px] tracking-[0.22em] text-muted uppercase">
            Updated {formatDate(answersUpdated)} · {allAnswers.length} answers
          </p>
        </div>
        <Link
          href="/seating-planner"
          className="group block border border-gold/60 bg-gold-soft/40 p-8 transition-colors hover:bg-gold-soft"
        >
          <p className="text-[11px] tracking-[0.25em] text-gold uppercase">Free tool</p>
          <p className="headline mt-3 text-3xl leading-tight">The Chicago event seating planner</p>
          <p className="mt-3 leading-7 text-muted">
            Your exact chair and table count in 60 seconds, plus a printable planning checklist.
          </p>
          <span className="link-line mt-6 text-gold">Plan my seating</span>
        </Link>
      </div>

      <nav aria-label="Topics" className="mt-16 flex flex-wrap gap-3 border-y border-line py-6">
        {answerTopics.map((t) => (
          <a key={t.id} href={`#${t.id}`} className="chip transition-colors hover:border-gold hover:text-ink">
            {t.title}
          </a>
        ))}
      </nav>

      {answerTopics.map((topic, i) => (
        <section key={topic.id} id={topic.id} className="scroll-mt-40 border-b border-line py-20">
          <div className="grid gap-12 md:grid-cols-[1fr_1.3fr] md:gap-16">
            <div className={i % 2 ? "md:order-2" : ""}>
              <p className="text-[11px] tracking-[0.25em] text-gold uppercase">
                {String(i + 1).padStart(2, "0")} / {String(answerTopics.length).padStart(2, "0")}
              </p>
              <h2 className="headline mt-4 text-4xl leading-tight sm:text-5xl">{topic.title}</h2>
              <p className="mt-4 leading-7 text-muted">{topic.intro}</p>
              <Image
                src={topic.image.src}
                alt={topic.image.alt}
                width={topic.image.width}
                height={topic.image.height}
                sizes="(min-width: 768px) 40vw, 100vw"
                className={`mt-8 w-full border border-line ${
                  topic.image.width < topic.image.height ? "mx-auto max-w-xs" : ""
                }`}
              />
            </div>
            <div className="border-t border-gold/40">
              {topic.answers.map((x, j) => (
                <details key={x.q} className="group border-b border-line" open={j === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6">
                    <h3 className="font-serif text-2xl leading-snug">{x.q}</h3>
                    <span
                      className="text-xl font-light text-gold transition-transform duration-300 group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </summary>
                  <div className="pb-7">
                    <p className="max-w-2xl leading-8 text-muted">{x.a}</p>
                    {x.link && (
                      <Link href={x.link.href} className="link-line mt-4 text-gold">
                        {x.link.label}
                      </Link>
                    )}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      ))}

      {posts.length > 0 && (
        <section className="py-20">
          <p className="eyebrow">Go deeper</p>
          <h2 className="headline mt-6 text-4xl sm:text-5xl">Guides for Chicago hosts</h2>
          <div className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="group block border-t border-line pt-6">
                {p.image && (
                  <Image
                    src={p.image}
                    alt={p.imageAlt ?? ""}
                    width={1000}
                    height={1250}
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="mb-6 aspect-[4/5] w-full object-cover"
                  />
                )}
                <p className="text-[11px] tracking-[0.2em] text-muted uppercase">{p.readingMinutes} min read</p>
                <h3 className="headline mt-3 text-2xl leading-tight transition-colors group-hover:text-gold">
                  {p.title}
                </h3>
                <p className="mt-3 line-clamp-3 leading-7 text-muted">{p.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="paper mt-8 px-6 py-16 text-center sm:px-16">
        <p className="eyebrow">Still deciding?</p>
        <h2 className="headline mt-6 text-4xl sm:text-6xl">
          Talk it through with a <em className="text-gold">seating</em> specialist
        </h2>
        <p className="mx-auto mt-5 max-w-xl leading-8 text-muted">
          Tell us your date, guest count and venue. We&apos;ll suggest chairs that suit the room, the season and your
          budget, with no obligation.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/seating-planner" className="btn-ghost">Free seating planner</Link>
          <Link href="/quote" className="btn-primary">Request a quote</Link>
        </div>
      </section>
    </div>
  );
}
