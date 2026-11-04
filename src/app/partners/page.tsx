import type { Metadata } from "next";
import Link from "@/components/Link";
import { PartnerForm } from "@/components/PartnerForm";
import { Callout, FaqList, Figure, Icon, PageHero, Section, StepFlow, type Faq, type IconName } from "@/components/ui";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Become a Rental Partner: Chicago Event Rental Leads",
  description: `Chicago-area rental companies: get event bookings with items and quantities already listed from ${site.name}. Free for 90 days, then 5% only on orders we send that book. No monthly fee, no exclusivity.`,
  alternates: { canonical: "/partners" },
});

const reasons: { icon: IconName; title: string; text: string }[] = [
  {
    icon: "quote",
    title: "Orders with the details filled in",
    text: "Every enquiry arrives with the date, venue, guest count and exact items and quantities, confirmed on a call before it reaches you.",
  },
  {
    icon: "search",
    title: "Customers you don't reach today",
    text: "Our site has pages for thousands of Chicago-area searches, from town names to cultural celebrations. People find us there, and we send their orders to you.",
  },
  {
    icon: "calendar",
    title: "Fill the dates you want filled",
    text: "Tell us your open weekends, weekdays and slow months. We route those first.",
  },
  {
    icon: "shield",
    title: "Your price, your contract",
    text: "Customers pay our booking fee to us. You keep your list price, your rental agreement, your deposit and your damage waiver.",
  },
  {
    icon: "chat",
    title: "We handle the back-and-forth",
    text: "Questions, changes, venue paperwork and day-of calls come through one coordinator, so your team spends less time on the phone.",
  },
  {
    icon: "spark",
    title: "Your items listed for free",
    text: "Your items in our catalog with 3D renders, a partner card, and reviews that say “Booked through Beyond Chiavari”.",
  },
];

const steps = [
  { icon: "users" as const, title: "Apply", text: "Two-minute form. We call within one business day." },
  { icon: "quote" as const, title: "Share your price sheet", text: "Items, delivery zones, minimums and policies." },
  { icon: "chat" as const, title: "Get enquiries", text: "Availability requests with a quote ID. Reply yes, no or swap within 4 business hours." },
  { icon: "check" as const, title: "Book and deliver", text: "We introduce the customer. Your contract, your deposit, your crew." },
];

const terms = [
  ["Joining", "Free. No setup fee, no monthly fee."],
  ["Founding Partner period", "0% commission on bookings from enquiries we send in your first 90 days."],
  ["After 90 days", "5% of the rental subtotal (excluding delivery, damage waiver and tax), only on orders we send that book."],
  ["Paid", "Monthly statement, 15 days after the end of the month the event happens in."],
  ["Your pricing", "You set it. We quote customers from your price sheet, valid 14 days."],
  ["Exclusivity", "None. Leave any time with 30 days' notice."],
  ["What we ask", "General liability insurance with a certificate on file, availability replies within 4 business hours, and weekly status on open enquiries."],
];

const faqs: Faq[] = [
  {
    q: "Why would a customer pay Beyond Chiavari instead of calling us directly?",
    a: "They pay for one itemized quote across every category, a coordinator who handles every vendor, and our Booking Promise. Most of our customers need four or five rental categories and don't want five phone calls.",
  },
  {
    q: "Do you mark up our prices?",
    a: "Your price to the customer stays your price. The customer pays our booking and coordination fee to us separately, and their proposal shows both lines.",
  },
  {
    q: "How is the commission tracked?",
    a: "Every enquiry has a quote ID (BC-YYYY-####). You update its status weekly, and we send a monthly statement listing completed events. A customer we introduce stays attributed to us for 24 months.",
  },
  {
    q: "What if we can't take an enquiry?",
    a: "Reply no or suggest a substitute. There's no charge for enquiries you decline, and declining doesn't affect your standing.",
  },
  {
    q: "Is there a contract?",
    a: "A one-page Founding Partner agreement covering the commission, attribution, insurance and response times. No exclusivity and 30 days' notice to leave.",
  },
  {
    q: "Which areas and categories do you need?",
    a: `All of ${site.marketLong}: chairs, tables, linens, dinnerware, tents, lounge, lighting, dance floors, photo booths, AV, restrooms, power and fencing. Specialty items and tents are especially in demand.`,
  },
];

export default function PartnersPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Rental partners", href: "/partners" }]}
        eyebrow="For rental companies"
        title="Get booked Chicago events sent to you."
        intro={`${site.name} sends Chicago-area rental companies event bookings with the items and quantities already listed, from planners who have already chosen items and quantities. It's free for 90 days, then 5% only on orders that book. No monthly fees, no exclusivity, and you keep your own prices, contract and deposit.`}
        actions={
          <>
            <a href="#apply" className="btn-primary">Apply as a partner</a>
            <a href="#terms" className="btn-ghost">See the terms</a>
          </>
        }
        media={<Figure {...scenes.midnightLongTable} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="Why partners join" title="New customers you don't pay to find">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((r) => (
            <li key={r.title} className="card p-7">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-soft text-gold">
                <Icon name={r.icon} size={24} />
              </span>
              <h3 className="display-3 mt-5">{r.title}</h3>
              <p className="mt-3 leading-7 text-muted">{r.text}</p>
            </li>
          ))}
        </ul>
        <Callout kind="tip" title="Compare it with what you pay now" className="mt-8">
          A featured directory listing costs every month whether it books or not, and search ads charge for every
          click. With us, a booked $5,000 wedding order costs you $250 after your first 90 days, and nothing before
          then.
        </Callout>
      </Section>

      <Section tone="sand" eyebrow="How it works" title="From enquiry to delivery">
        <StepFlow
          steps={steps}
          caption={`How rental partners work with ${site.name}: apply, share a price sheet, receive itemized enquiries with a quote ID, then book and deliver under your own contract.`}
        />
        <p className="mt-8 max-w-3xl leading-7 text-muted">
          See what customers see: the <Link href="/rentals" className="link-line">rental catalog with prices</Link>, the{" "}
          <Link href="/quote" className="link-line">quote builder</Link>, <Link href="/how-it-works" className="link-line">how booking works</Link>,
          the <Link href="/booking-promise" className="link-line">Booking Promise</Link> and the{" "}
          <Link href="/chair-rentals" className="link-line">areas we serve</Link>. Already listed without asking?{" "}
          <Link href="/vendor-listings" className="link-line">Manage or remove your listing</Link>.
        </p>
      </Section>

      <Section id="terms" eyebrow="Founding Partner terms" title="Simple, and free until it works">
        <dl className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
          {terms.map(([k, v]) => (
            <div key={k} className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6 sm:px-6">
              <dt className="font-medium">{k}</dt>
              <dd className="leading-7 text-muted">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section id="apply" tone="sand" eyebrow="Apply" title="Become a Founding Partner" intro="Takes two minutes. We'll call you within one business day.">
        <div className="max-w-3xl">
          <PartnerForm />
          <p className="mt-4 text-sm text-muted">
            Prefer to set everything up now (lead time, minimums, setup and your price list)?{" "}
            <Link href="/partners/onboard" className="link">Use the full onboarding form</Link>.
          </p>
        </div>
      </Section>

      <Section eyebrow="Already listed?" title="Your rates, your call">
        <Callout title="We use published rates, and you can opt out any time">
          Our price estimates use rates rental companies publish on their own websites. We never show your company name, and most
          companies listed haven&apos;t signed anything with us. To correct or remove your items, use the{" "}
          <a href="/vendor-listings" className="text-accent">listing request form</a>. Removals take up to 2 business days.
        </Callout>
      </Section>

      <Section eyebrow="Questions" title="Partner FAQ">
        <FaqList faqs={faqs} className="max-w-3xl" />
        <p className="mt-8 text-sm text-muted">
          More answers on the <Link href="/partners/faq" className="link">full partner FAQ</Link>, and{" "}
          <Link href="/how-we-work" className="link">how we work</Link> with hosts and rental companies, including who pays whom.
        </p>
      </Section>
    </>
  );
}
