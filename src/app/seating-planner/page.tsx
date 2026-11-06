import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { SeatingPlanner } from "@/components/SeatingPlanner";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Free Event Seating Planner: How Many Chairs & Tables Do I Need?",
  description:
    "Free Chicago event seating calculator. Enter your guest count to get exact chair and table numbers for the ceremony, cocktail hour and reception, plus a printable planning checklist.",
  alternates: { canonical: "/seating-planner" },
});

const howTo = [
  ["Count reception seats", "Guests, plus vendors who sit to eat, plus a buffer of a few percent for late RSVPs."],
  ["Decide on the ceremony", "Reuse reception chairs with a flip during cocktail hour, or rent a separate set."],
  ["Seat part of cocktail hour", "A portion of guests, prioritizing older relatives, plus a lounge grouping."],
  ["Convert seats to tables", "Divide reception seats by 8 for 60-inch rounds, or 10 for 72-inch rounds and banquet tables."],
];

export default function SeatingPlannerPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: `${site.name} Event Seating Planner`,
      url: `${site.url}/seating-planner`,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: "Calculates how many chairs and tables an event needs and builds a planning checklist.",
      provider: { "@type": "Organization", name: site.name, url: site.url },
    },
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "How to calculate how many chairs to rent for an event",
      step: howTo.map(([name, text], i) => ({ "@type": "HowToStep", position: i + 1, name, text })),
    },
  ];

  return (
    <div className="container-x py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs items={[{ name: "Seating planner", href: "/seating-planner" }]} className="mb-6 print:hidden" />
      <div className="grid items-end gap-10 md:grid-cols-[1.5fr_1fr] print:hidden">
        <div>
          <p className="eyebrow">Free planning tool</p>
          <h1 className="display-1 mt-6">
            How many <em className="text-gold">chairs</em> do you need?
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
            Enter your guest count and we&apos;ll work out chairs and tables for the ceremony, cocktail hour and
            reception, then build a checklist tuned to your venue and Chicago&apos;s season.
          </p>
        </div>
        <div className="hidden grid-cols-3 gap-3 md:grid" aria-hidden>
          {["cross-back", "ghost", "velvet-dining"].map((s) => (
            <Image
              key={s}
              src={`/chairs/render/${s}.jpg`}
              alt={`${s.replace(/-/g, " ")} event chair, one of the styles the seating planner suggests`}
              width={1000}
              height={1250}
              sizes="12vw"
              className="aspect-[4/5] w-full object-cover"
            />
          ))}
        </div>
      </div>

      <div className="mt-16">
        <SeatingPlanner />
      </div>

      <section className="mt-28 border-t border-gold/40 pt-16 print:hidden">
        <p className="eyebrow">The method</p>
        <h2 className="display-2 mt-6">How the planner counts</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-4">
          {howTo.map(([title, text], i) => (
            <li key={title} className="border-t border-line pt-6">
              <span className="font-heading font-semibold text-3xl text-gold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-medium">{title}</h3>
              <p className="mt-2 leading-7 text-muted">{text}</p>
            </li>
          ))}
        </ol>
        <Image
          src="/answers/chair-count-formula.svg"
          alt="Infographic: guests plus vendors plus a small buffer equals reception chairs, with separate counts for ceremony, cocktail hour and head table"
          width={1200}
          height={650}
          className="mt-14 w-full border border-line"
        />
        <p className="mt-10 leading-7 text-muted">
          More questions about counts, costs, venue rules or delivery?{" "}
          <Link href="/answers" className="text-ink underline decoration-gold underline-offset-4 hover:text-gold">
            See every Chicago chair rental answer
          </Link>
          .
        </p>
      </section>
    </div>
  );
}
