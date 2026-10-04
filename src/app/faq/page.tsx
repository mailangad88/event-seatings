import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about wedding chair rentals, delivery, setup, pricing and our launch season.",
};

const faqs: [string, string][] = [
  [
    "Are you taking bookings now?",
    `We're a new company launching our ${site.launch.seasonLabel}. Right now we're collecting quote requests and finalizing our founding collection. When you request a quote, we'll email your personalized pricing and availability as soon as it's ready. Nothing is charged until you confirm.`,
  ],
  [
    "Where do you deliver?",
    `We're based in ${site.city} and serve ${site.serviceArea.join(", ")} and surrounding areas. Ask us about venues farther out.`,
  ],
  [
    "Do you deliver and set up?",
    "Yes. Delivery, setup and pickup are part of our full-service rentals. Exact fees depend on distance and venue access, and they're itemized in your quote.",
  ],
  [
    "How much do chairs cost?",
    "Each chair page shows an estimated per-chair range. Your quote will have exact pricing for your date, quantity and location.",
  ],
  [
    "Can I mix chair styles?",
    "Absolutely. Many couples use one chair for the ceremony and another for the reception, or a statement chair for the head table.",
  ],
  [
    "Are the chairs sturdy enough for events?",
    "Our collection is commercial-grade and weight-rated for event use. We don't use residential furniture.",
  ],
  [
    "How many chairs do I need?",
    "Usually one per guest for the reception, plus a few extras for vendors and late RSVPs. If your ceremony is in a different spot, you may need a second set or a flip, which we can plan for.",
  ],
  [
    "What happens to my vote on a chair?",
    "Votes are anonymous. We use them to decide which styles to stock first and in what quantities.",
  ],
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };
  return (
    <div className="container-x py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="grid gap-14 md:grid-cols-[1fr_1.6fr] md:gap-20">
        <div>
          <p className="eyebrow">Questions</p>
          <h1 className="headline mt-6 text-6xl leading-[0.95] sm:text-7xl">
            Frequently <em className="text-gold">asked</em>
          </h1>
          <p className="mt-6 leading-7 text-muted">
            Something else on your mind?{" "}
            <a href={`mailto:${site.email}`} className="underline decoration-gold underline-offset-4 hover:text-gold">
              {site.email}
            </a>
          </p>
        </div>
        <div className="border-t border-gold/40">
          {faqs.map(([q, a]) => (
            <details key={q} className="group border-b border-line">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6">
                <span className="font-serif text-2xl leading-snug">{q}</span>
                <span className="text-xl font-light text-gold transition-transform duration-300 group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="max-w-2xl pb-7 leading-8 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
