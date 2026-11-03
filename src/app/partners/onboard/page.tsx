import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { VendorOnboarding } from "@/components/tools/VendorOnboarding";
import { Callout, FaqList, Icon, PageHero, QuoteCta, Section, StepFlow } from "@/components/ui";
import { render } from "@/lib/scenes";
import { site } from "@/lib/site";

const title = "Vendor Onboarding: List Your Rental Company";
const description = `Chicago-area rental companies: set up your ${site.name} partner profile in about three minutes. Tell us what you rent, where you deliver and how you work, share a price list, and start receiving itemized event enquiries.`;
const hero = render("hero-tables");
const template = "/dl/vendor-onboarding/price-list-template.csv";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/partners/onboard" },
  openGraph: { title, description, url: "/partners/onboard", images: [{ url: hero.src, alt: hero.alt }] },
};

const faqs = [
  { q: "What does it cost to join?", a: "Nothing to join and no monthly fee. The Founding Partner terms on our partners page explain the commission: 0% in your first 90 days, then 5% of the rental subtotal only on orders we send that book." },
  { q: "What do I need to get started?", a: "Your company details, the categories you rent, where you deliver, your usual lead time and a price list. A link to your website price page is fine, or fill in our CSV template." },
  { q: "When does my listing go live?", a: "After we call to confirm your details and you've checked how your items and prices look. Nothing is published without your OK." },
  { q: "Can I change my prices later?", a: "Yes. Send updated prices any time and we update your listing. You always confirm the final quote for each order." },
  { q: "Is there any exclusivity?", a: "No. You can list with us and keep every other sales channel. Leaving takes 30 days' notice." },
  { q: "Can I use my own product photos?", a: `Yes, if you'd like. Tell us in the form. Otherwise ${site.name} shows its own renders of each item.` },
];

export default function PartnerOnboardPage() {
  return (
    <>
      <PageHero
        eyebrow="For rental companies"
        title={<>Set up your partner profile in <em className="text-gold">three minutes</em></>}
        intro={
          <p data-answer>
            Tell us what you rent, where you deliver and how you work, then share your price list. We confirm the details by phone, you check your listing, and itemized event enquiries from Chicago-area hosts start coming to you. No monthly fee and no exclusivity.
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
            { title: "Fill in the form", text: "Company, categories, area, lead time and prices.", icon: "quote" },
            { title: "We call you", text: "Within one business day to confirm the details.", icon: "phone" },
            { title: "Check your listing", text: "Nothing goes live until you've seen it.", icon: "check" },
            { title: "Receive enquiries", text: "Itemized, with date, venue and guest count.", icon: "truck" },
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
                {["Your company name, website and a phone number for leads", "The categories you rent", "The towns or regions you deliver to", "Your usual notice period and order minimum", "A price list link, or our CSV template filled in"].map((t) => (
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
          Read the full <Link href="/partners#terms" className="link">Founding Partner terms</Link>, or see <Link href="/how-it-works" className="link">how it works for customers</Link>.
        </p>
      </Section>
      <QuoteCta source="partners-onboard" title="Planning an event yourself?" />
    </>
  );
}
