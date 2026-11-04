import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { VendorOnboarding } from "@/components/tools/VendorOnboarding";
import { Callout, FaqList, Icon, PageHero, QuoteCta, Section, StepFlow } from "@/components/ui";
import { render } from "@/lib/scenes";
import { site } from "@/lib/site";
import { partnerFreeOrders, partnerRatePct } from "@/lib/partner-terms";

const title = "Vendor Onboarding: List Your Rental Company";
const description = `Chicago-area rental companies: sign up with ${site.name} in about five minutes. Tell us what you rent, where you deliver and when, upload your price list, and start getting event orders with items and quantities listed.`;
const hero = render("hero-tables");
const template = "/dl/vendor-onboarding/price-list-template.csv";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/partners/onboard" },
  openGraph: { title, description, url: "/partners/onboard", images: [{ url: hero.src, alt: hero.alt }] },
};

const faqs = [
  { q: "What does it cost to join?", a: `Nothing to join and no monthly fee. The commission is in our one-page partner terms: nothing on ${partnerFreeOrders}, then ${partnerRatePct} of the rental subtotal only on orders we send that book.` },
  { q: "What do I need to get started?", a: "Your company details, the categories you rent, where you deliver, your usual lead time and a price list. A link to your website price page is fine, or fill in our CSV template." },
  { q: "When does my listing go live?", a: "After we call to confirm your details and you've checked how your items and prices look. Nothing is published without your OK." },
  { q: "Can I check on my application?", a: "Yes. When you send the form you get a link to your own status page, and the same link is in your confirmation email." },
  { q: "Do you need my bank details?", a: "No. Customers pay you directly under your own agreement, so the form never asks for bank account numbers." },
  { q: "Can I change my prices later?", a: "Yes. Send updated prices any time and we update your listing. You always confirm the final quote for each order." },
  { q: "Is there any exclusivity?", a: "No. You can list with us and keep every other sales channel. Leaving takes 30 days' notice." },
  { q: "Can I use my own product photos?", a: `Yes, if you'd like. Tell us in the form. Otherwise ${site.name} shows its own renders of each item.` },
];

export default function PartnerOnboardPage() {
  return (
    <>
      <PageHero
        eyebrow="For rental companies"
        title={<>Sign up your rental company in <em className="text-gold">five minutes</em></>}
        intro={
          <p data-answer>
            Tell us what you rent, where and when you deliver, and how customers pay you, then upload your price list. We call to go over it within one business day, you check your listing, and event orders from Chicago-area hosts start coming to you. No monthly fee and no exclusivity.
          </p>
        }
        breadcrumbs={[{ name: "Partners", href: "/partners" }, { name: "Onboarding", href: "/partners/onboard" }]}
        actions={<a href="#onboard" className="btn-accent">Start onboarding <Icon name="arrow" size={18} /></a>}
        media={
          <figure className="media aspect-[4/3] shadow-lift">
            <Image src={hero.src} alt={hero.alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </figure>
        }
      />
      <Section eyebrow="How onboarding works" title="From form to first enquiry">
        <StepFlow
          steps={[
            { title: "Fill in the form", text: "Company, area, schedule, prices and payments.", icon: "quote" },
            { title: "We call you", text: "Within one business day to confirm the details.", icon: "phone" },
            { title: "Check your listing", text: "Nothing goes live until you've seen it.", icon: "check" },
            { title: "Get orders", text: "Items and quantities, with date, venue and guest count.", icon: "truck" },
          ]}
        />
      </Section>
      <section id="onboard" className="tone-sand scroll-mt-24">
        <div className="container-x section-y grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          <VendorOnboarding templateHref={template} />
          <aside className="space-y-6">
            <div className="card p-6">
              <h2 className="display-3">Have these ready</h2>
              <ul className="mt-4 space-y-2 text-sm leading-6">
                {["Your company name, website and a phone number for new orders", "The categories you rent and the areas you deliver to", "Your delivery days, notice period and dates you're already full", "A price list as a CSV (our template) or a link", "Your deposit, payment methods and who handles your bills", "Whether we can show your product photos"].map((t) => (
                  <li key={t} className="flex gap-2"><Icon name="check" size={16} className="mt-1 shrink-0 text-gold" /> {t}</li>
                ))}
              </ul>
              <a href={template} download className="btn-ghost btn-sm mt-5">Download the price list template (CSV)</a>
            </div>
            <Callout title="Already listed in our catalog?">
              Some items show published prices from rental companies&apos; own websites. You can <Link href="/vendor-listings" className="link">correct or remove a listing</Link>, or onboard here to manage it with us.
            </Callout>
          </aside>
        </div>
      </section>
      <Section eyebrow="Questions" title="Partner onboarding FAQ">
        <FaqList faqs={faqs} className="max-w-3xl" />
        <p className="mt-8 text-sm text-muted">
          Read the full <Link href="/partners#terms" className="link">Founding Partner terms</Link>, all <Link href="/partners/faq" className="link">partner questions</Link>, or <Link href="/how-we-work" className="link">how we work</Link> with hosts and rental companies.
        </p>
      </Section>
      <QuoteCta source="partners-onboard" title="Planning an event yourself?" />
    </>
  );
}
