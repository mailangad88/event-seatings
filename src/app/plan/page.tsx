import type { Metadata } from "next";
import Link from "next/link";
import { FaqList } from "@/components/FaqList";
import { SeatingPlanner } from "@/components/SeatingPlanner";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Many Chairs Do I Need? Wedding & Event Seating Calculator",
  description:
    "Free seating calculator for weddings and events: how many chairs to rent for the ceremony, reception and lounge, plus an estimated cost. Chicagoland delivery and setup.",
  alternates: { canonical: "/plan" },
  openGraph: {
    title: "How many chairs do you actually need?",
    description: "Answer five taps and get your seating plan and an estimated cost.",
    url: "/plan",
    images: [{ url: "/chairs/render/cross-back.jpg", width: 1000, height: 1250 }],
  },
};

const faqs: [string, string][] = [
  [
    "How many chairs do I need for a wedding?",
    "Start with one chair per guest for dinner, then add about 3% (at least four) for vendors, photographers and late RSVPs. If the ceremony is in a different space from dinner, you need a second set or a flip.",
  ],
  [
    "What is a ceremony flip?",
    "Instead of renting two sets, the ceremony chairs are carried into the reception layout during cocktail hour. It saves money but needs a crew and a room where guests can wait. We can plan and staff the flip for you.",
  ],
  [
    "How many lounge seats should I plan for cocktail hour?",
    "Seating for roughly a quarter of your guests is a good rule. Most people stand and mingle, but older guests and anyone in heels will thank you.",
  ],
  [
    "How much does it cost to rent chairs for 100 guests?",
    "With about 104 chairs, a folding garden chair costs roughly $520 to $730, a cross-back about $830 to $1,150 and a velvet dining chair about $1,870 to $2,600, before delivery and setup. Use the calculator for your exact count.",
  ],
  [
    "How far ahead should I book chairs?",
    `Popular Saturdays from May to October go first, so ask 6 to 12 months ahead. We're now reserving the ${site.launch.seasonLabel}.`,
  ],
  [
    "Do you deliver to my venue?",
    `We deliver, set up and collect across Chicagoland, including ${site.serviceArea.join(", ")}.`,
  ],
];

export default function PlanPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Wedding & Event Seating Calculator",
    url: `${site.url}/plan`,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    provider: { "@type": "LocalBusiness", name: site.name, url: site.url },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-x pt-10 md:pt-16">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="eyebrow justify-center">The seating planner</p>
          <h1 className="headline mt-6 text-[3.2rem] leading-[0.95] sm:text-7xl lg:text-8xl">
            How many chairs do you <em className="text-gold">actually</em> need?
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted">
            Five taps. You&apos;ll get a count for the ceremony, dinner and lounge, and what it should cost, before you
            talk to anyone.
          </p>
        </div>
        <SeatingPlanner />
      </div>

      <section className="container-x mt-28">
        <div className="grid gap-14 md:grid-cols-[1fr_1.6fr] md:gap-20">
          <div>
            <p className="eyebrow">Planning questions</p>
            <h2 className="headline mt-6 text-5xl leading-[0.95] sm:text-6xl">
              Seating, <em className="text-gold">answered</em>
            </h2>
            <p className="mt-6 leading-7 text-muted">
              Still choosing a style? Browse the{" "}
              <Link href="/looks" className="underline decoration-gold underline-offset-4 hover:text-gold">look book</Link>{" "}
              or take the{" "}
              <Link href="/quiz" className="underline decoration-gold underline-offset-4 hover:text-gold">style quiz</Link>.
            </p>
          </div>
          <FaqList faqs={faqs} />
        </div>
      </section>
    </>
  );
}
