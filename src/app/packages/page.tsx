import type { Metadata } from "next";
import Link from "@/components/Link";
import { ReadyPackages } from "@/components/ReadyPackages";
import { PackageTable } from "@/components/PackageTable";
import { FaqList, Figure, JsonLd, PageHero, PriceDisclaimer, Section, StepFlow, type Faq } from "@/components/ui";
import { readyPackages } from "@/lib/packages";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: `Party Rental Packages in ${site.market}: Priced for Your Guest Count`,
  description: `Ready-made party rental packages for ${site.market} and the suburbs: backyard birthdays, graduations, showers, weddings, sangeets and company dinners. Each one lists every chair, table and linen with an all-in price.`,
  alternates: { canonical: "/packages" },
});

const faqs: Faq[] = [
  {
    q: "What is in a party rental package?",
    a: "Everything the guests sit at, eat from and drink from: chairs, tables, linens, plates, flatware and glasses, sized for the guest count. Most packages also add what that kind of party usually needs, like a bar, a buffet line, a dance floor or a tent.",
  },
  {
    q: "Can I change a package?",
    a: "Yes. Set your guest count right on the package card, and again at any time at the top of the planner: every chair, table, glass and linen follows it, and so does the price. You can also swap the chairs or linens for another style, or remove anything you don't need.",
  },
  {
    q: "What does the all-in price include?",
    a: "The rental items plus our estimate for delivery and pickup, setup and teardown, a 10% damage waiver and Chicago sales tax. Your proposal confirms the exact delivery cost for your address and date.",
  },
  {
    q: "Is the package price fixed?",
    a: "It is an estimate from current rental rates. Once you send your list we confirm stock for your date and send a proposal. The price is locked when you approve it.",
  },
  {
    q: "Do I pay anything to start from a package?",
    a: "No. Building and sending a list is free. Nothing is reserved or charged until you approve a proposal.",
  },
  {
    q: "What if my party isn't listed?",
    a: "Use the step-by-step planner. Answer four quick questions (occasion, guests, where, and how dressed up) and it builds the same kind of list for your party.",
  },
];

const steps = [
  { title: "Pick a package", text: "Choose the one closest to your party.", icon: "check" as const },
  { title: "Make it yours", text: "Set your guest count and swap anything.", icon: "chair" as const },
  { title: "Send your list", text: "Add your date. No payment, no commitment.", icon: "calendar" as const },
  { title: "Get your proposal", text: "We confirm stock and delivery within a day.", icon: "quote" as const },
];

export default function PackagesPage() {
  const hero = scenes.gildedIvory;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${site.name} party rental packages`,
          itemListElement: readyPackages.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: `${p.name} rental package for ${p.guests} guests`,
              description: p.blurb,
              image: `${site.url}${p.image}`,
              offers: { "@type": "Offer", price: p.allIn.toFixed(2), priceCurrency: "USD", areaServed: site.market, url: `${site.url}${p.href}` },
            },
          })),
        }}
      />
      <PageHero
        eyebrow="Ready-made packages"
        title="Party rental packages, priced for your guests"
        intro={
          <>
            Pick the party closest to yours and we&apos;ll open the full list: every chair, table, linen and plate, with an
            all-in price. Set your guest count right on the card and the price follows it. Change any item, then send it. No payment, no commitment.
          </>
        }
        breadcrumbs={[{ name: "Packages", href: "/packages" }]}
        media={<Figure src={hero.src} alt={hero.alt} caption={hero.caption} width={hero.width} height={hero.height} ratio="4/3" priority />}
      />

      <Section eyebrow="Pick one" title="Packages for the most common parties">
        <ReadyPackages />
        <p className="mt-6 text-sm text-muted">
          Planning something else?{" "}
          <Link href="/quote?from=packages" className="text-accent underline">
            Answer four quick questions
          </Link>{" "}
          and we&apos;ll build a list for your party.
        </p>
      </Section>

      <Section tone="white" eyebrow="Side by side" title="Compare the packages">
        <PackageTable packages={readyPackages} />
        <PriceDisclaimer className="mt-4" />
        <p className="mt-6 text-sm text-muted">
          Want to pick item by item instead? <Link href="/rentals" className="text-accent underline">Browse every rental</Link>, find a
          theme in <Link href="/party-ideas" className="text-accent underline">party ideas</Link>, check quantities with the{" "}
          <Link href="/tools/rental-calculator" className="text-accent underline">rental calculator</Link>, or read{" "}
          <Link href="/how-it-works" className="text-accent underline">how booking works</Link> and our{" "}
          <Link href="/booking-promise" className="text-accent underline">Booking Promise</Link>.
        </p>
      </Section>

      <Section eyebrow="How it works" title="From package to delivered party">
        <StepFlow steps={steps} caption="How a package works: pick one, make it yours, send your list, get your proposal." />
      </Section>

      <Section tone="white" eyebrow="Questions" title="About our packages">
        <FaqList faqs={faqs} className="max-w-3xl" />
      </Section>
    </>
  );
}
