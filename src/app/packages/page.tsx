import type { Metadata } from "next";
import Link from "next/link";
import { ReadyPackages } from "@/components/ReadyPackages";
import { FaqList, Figure, Icon, JsonLd, PageHero, PriceDisclaimer, Section, StepFlow, formatPrice, type Faq } from "@/components/ui";
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
    a: "Yes. Tapping a package opens it in our planner with the full list. Change the guest count and every quantity follows it, swap the chairs or linens for another style, or remove anything you don't need.",
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
            all-in price. Change the guest count or any item, then send it. No payment, no commitment.
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
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <caption className="sr-only">Every package with its guest count, setting, item count and estimated price</caption>
            <thead>
              <tr className="border-b border-line text-muted">
                <th scope="col" className="py-3 pr-4 font-medium">Package</th>
                <th scope="col" className="px-4 py-3 font-medium">Guests</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">All-in est.</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Per guest</th>
                <th scope="col" className="px-4 py-3 text-right font-medium">Rentals</th>
                <th scope="col" className="px-4 py-3 font-medium">Where</th>
                <th scope="col" className="px-4 py-3 font-medium">Style</th>
                <th scope="col" className="py-3 pl-4"><span className="sr-only">Start</span></th>
              </tr>
            </thead>
            <tbody>
              {readyPackages.map((p) => (
                <tr key={p.id} className="border-b border-line">
                  <th scope="row" className="py-3 pr-4 font-medium">{p.name}</th>
                  <td className="px-4 py-3 tabular-nums">{p.guests}</td>
                  <td className="px-4 py-3 text-right font-medium tabular-nums">{formatPrice(p.allIn)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(p.perGuest)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(p.rentals)}</td>
                  <td className="px-4 py-3">{p.settingName}</td>
                  <td className="px-4 py-3">{p.styleName}</td>
                  <td className="py-3 pl-4 text-right">
                    <Link href={p.href} className="inline-flex items-center gap-1 text-accent underline underline-offset-4">
                      Start <Icon name="arrow" size={14} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PriceDisclaimer className="mt-4" />
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
