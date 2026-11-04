import type { Metadata } from "next";
import Link from "next/link";
import { VendorListingForm } from "@/components/VendorListingForm";
import { Callout, FaqList, Figure, Icon, JsonLd, PageHero, Section, StepFlow, type Faq, type IconName } from "@/components/ui";
import { BOOKING_FEE_FULL } from "@/lib/catalog-types";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "For Rental Companies: How We List Prices, and How to Opt Out",
  description: `How ${site.name} uses Chicago-area rental companies' published rates, why your company name is never shown, and how to correct or remove your items in one step.`,
  alternates: { canonical: "/vendor-listings" },
});

const facts: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "search",
    title: "Only published rates",
    text: "Item prices come from price lists rental companies publish on their own websites, with the date we checked them. Where no price is published we show a market estimate, marked Est.",
  },
  {
    icon: "shield",
    title: "Your name is never shown",
    text: "We don't display rental company names, logos or photos on item pages. Customers see the item, our price and a note that the rental company confirms the final quote.",
  },
  {
    icon: "quote",
    title: "Our fee is shown separately",
    text: `We show your price with no markup. The customer pays us a separate booking and coordination fee, ${BOOKING_FEE_FULL} per event. Your price to the customer stays your price.`,
  },
  {
    icon: "chat",
    title: "Listing doesn't mean partnership",
    text: "Most companies whose rates we use have not signed anything with us. We contact the rental company directly before any booking, at its normal price and terms.",
  },
];

const steps = [
  { title: "Send the form", text: "Pick remove, correct or partner. No reason needed.", icon: "quote" as const },
  { title: "We act", text: "Removals happen within 2 business days, across every item and estimate.", icon: "check" as const },
  { title: "We confirm", text: "You get an email when it's done. We won't use your rates again unless you ask.", icon: "chat" as const },
];

const faqs: Faq[] = [
  {
    q: "Did you get permission to use our prices?",
    a: "Not in advance from most companies. The rates are ones you publish publicly, and we only use them to estimate a customer's budget. If you'd rather we didn't, tell us and we'll remove them, no questions asked.",
  },
  {
    q: "Will customers think we're affiliated with you?",
    a: "We don't name you, show your logo or use your photos on our pages, and we don't say a rental company has partnered with us unless it has. Our site says every final quote is confirmed by the rental company.",
  },
  {
    q: "Do you still send us bookings if we opt out?",
    a: "Only if you want them. Opting out removes your rates from our price estimates. You can still receive bookings from us at your normal terms, or join as a Founding Partner.",
  },
  {
    q: "A price is out of date. Can you fix it?",
    a: "Yes. Use the form and choose Correct a price, or email us a current price sheet, and we'll update it within 2 business days.",
  },
];

export default function VendorListingsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "For rental companies: how we list prices, and how to opt out",
          url: `${site.url}/vendor-listings`,
          publisher: { "@type": "Organization", name: site.name, url: site.url },
        }}
      />
      <PageHero
        breadcrumbs={[
          { name: "Partners", href: "/partners" },
          { name: "Listings & opt-out", href: "/vendor-listings" },
        ]}
        eyebrow="For rental companies"
        title="Your rates, your call."
        intro={`${site.name} estimates customer budgets from Chicago-area rental companies' published price lists. If you'd like your items corrected or removed, one form does it.`}
        actions={
          <>
            <a href="#request" className="btn-primary">Correct or remove my items</a>
            <Link href="/partners" className="btn-ghost">Become a partner</Link>
          </>
        }
        media={<Figure {...scenes.gildedIvory} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="How listings work" title="What we use, and what we don't">
        <ul className="grid gap-5 sm:grid-cols-2">
          {facts.map((f) => (
            <li key={f.title} className="card p-7">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-soft text-gold">
                <Icon name={f.icon} size={24} />
              </span>
              <h3 className="display-3 mt-5">{f.title}</h3>
              <p className="mt-3 leading-7 text-muted">{f.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand" eyebrow="Opt out" title="Three steps, no questions">
        <StepFlow steps={steps} caption="How a listing removal works: send the form, we remove your items within 2 business days, and we email you to confirm." />
        <Callout className="mt-10" title="Prefer email?">
          Write to <a href={`mailto:${site.email}?subject=Listing%20request`} className="text-accent">{site.email}</a> with your company
          name and what you&apos;d like changed.
        </Callout>
      </Section>

      <Section id="request" eyebrow="Request" title="Correct, remove or partner">
        <div className="mx-auto max-w-3xl">
          <VendorListingForm />
        </div>
      </Section>

      <Section tone="sand" eyebrow="Questions" title="Listing FAQ">
        <FaqList faqs={faqs} />
      </Section>
    </>
  );
}
