import type { Metadata } from "next";
import Link from "@/components/Link";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { Stars } from "@/components/reviews/Stars";
import { Callout, FaqList, Figure, JsonLd, PageHero, Section, type Faq } from "@/components/ui";
import { displayName, publicReviews, summarize } from "@/lib/reviews";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Customer Reviews: Event Rentals in Chicago",
  description: `Reviews from people who booked event rentals through ${site.name} in Chicago and the suburbs, published unedited, good or bad.`,
  alternates: { canonical: "/reviews" },
};

const faqs: Faq[] = [
  {
    q: "Are these reviews real?",
    a: `Yes. ${site.name} only publishes reviews written by real people about events they planned or attended. We never write, buy or edit reviews, and we don't remove a review because it is critical.`,
  },
  {
    q: "What does \"Verified booking\" mean?",
    a: "The reviewer used a personal review link we sent after their event, and our records show a confirmed booking for them.",
  },
  {
    q: "Why might a review not appear?",
    a: "We hide only reviews that contain personal information about someone else, hateful language, spam, or that are clearly about a different company. Everything else is published.",
  },
  {
    q: "Can I review my rental experience?",
    a: "Yes. Use the Write a review button. It takes about two minutes, and we reply to every review.",
  },
];

export default async function ReviewsPage() {
  const reviews = await publicReviews();
  const { count, average, byStar } = summarize(reviews);

  // Review and AggregateRating markup only when real, approved reviews exist.
  const schema = count
    ? {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: site.name,
        url: site.url,
        aggregateRating: { "@type": "AggregateRating", ratingValue: average, reviewCount: count, bestRating: 5, worstRating: 1 },
        review: reviews.slice(0, 20).map((r) => ({
          "@type": "Review",
          reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
          author: { "@type": "Person", name: displayName(r.name) },
          datePublished: (r.approved_at ?? r.created_at).slice(0, 10),
          ...(r.title ? { name: r.title } : {}),
          reviewBody: r.body,
        })),
      }
    : { "@context": "https://schema.org", "@type": "WebPage", name: `${site.name} customer reviews`, url: `${site.url}/reviews` };

  return (
    <>
      <JsonLd data={schema} />
      <PageHero
        breadcrumbs={[{ name: "Reviews", href: "/reviews" }]}
        eyebrow="Customer reviews"
        title={count ? <>What Chicago planners say</> : <>Real reviews only</>}
        intro={
          count
            ? `${count} review${count === 1 ? "" : "s"} from people who booked event rentals through ${site.name}. Published as written, good or bad.`
            : `${site.name} is new, so we don't have customer reviews yet. When we do, they'll appear here exactly as written. We will never invent or buy one.`
        }
        actions={
          <>
            <Link href="/reviews/write" className="btn-primary">Write a review</Link>
            <Link href="/quote" className="btn-ghost">Start a quote</Link>
          </>
        }
        media={
          count ? (
            <div className="card mx-auto max-w-sm p-8 text-center">
              <p className="font-heading font-semibold text-6xl">{average.toFixed(1)}</p>
              <Stars rating={average} size={26} className="mt-3" />
              <p className="mt-2 text-sm text-muted">from {count} review{count === 1 ? "" : "s"}</p>
              <ul className="mt-6 grid gap-2 text-left text-sm">
                {byStar.map((s) => (
                  <li key={s.star} className="grid grid-cols-[3rem_1fr_2rem] items-center gap-3">
                    <span>{s.star} star</span>
                    <span className="h-2 overflow-hidden rounded-full bg-surface-2">
                      <span className="block h-full rounded-full bg-gold" style={{ width: `${(s.count / count) * 100}%` }} />
                    </span>
                    <span className="text-right text-muted">{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <Figure {...scenes.gildedIvory} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />
          )
        }
      />

      {count ? (
        <Section eyebrow="Reviews" title="Newest first">
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <li key={r.id}>
                <ReviewCard review={r} />
              </li>
            ))}
          </ul>
        </Section>
      ) : (
        <Section eyebrow="Our promise" title="How reviews work here">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              ["Real customers only", "Reviews come from people who planned or attended an event with rentals booked through us."],
              ["Published as written", "We don't edit wording or remove critical reviews. We reply publicly instead."],
              ["Never invented", "No paid, swapped or made-up reviews, and no star ratings until real ones exist."],
            ].map(([title, text]) => (
              <div key={title} className="card p-7">
                <Stars rating={5} />
                <h3 className="display-3 mt-4">{title}</h3>
                <p className="mt-3 leading-7 text-muted">{text}</p>
              </div>
            ))}
          </div>
          <Callout className="mt-10" title="Booked with us already?">
            Thank you. <Link href="/reviews/write" className="text-accent">Write the first review</Link> and help other Chicago planners decide.
            We&apos;re also thanking our <Link href="/founding-customers" className="text-accent">first 10 customers</Link> directly, no review required.
          </Callout>
        </Section>
      )}

      <Section tone="sand" eyebrow="Questions" title="About our reviews">
        <FaqList faqs={faqs} />
      </Section>
    </>
  );
}
