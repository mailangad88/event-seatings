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
    <div className="container-x max-w-3xl py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <span className="eyebrow">🤔 faq</span>
      <h1 className="mt-4 display text-5xl leading-[0.95] sm:text-7xl">questions, <span className="font-italic font-normal normal-case tracking-normal">answered</span></h1>
      <div className="mt-10 space-y-3">
        {faqs.map(([q, a]) => (
          <details key={q} className="group pop rounded-2xl bg-surface px-5 py-4 open:bg-butter">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
              {q}
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 border-ink bg-surface text-xl transition-transform group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="mt-3 leading-7">{a}</p>
          </details>
        ))}
      </div>
      <p className="mt-8 font-medium">
        still curious? <a href={`mailto:${site.email}`} className="underline decoration-accent decoration-2 underline-offset-4">{site.email}</a>
      </p>
    </div>
  );
}
