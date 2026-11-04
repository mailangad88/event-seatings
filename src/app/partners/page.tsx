import type { Metadata } from "next";
import Link from "@/components/Link";
import { PartnerForm } from "@/components/PartnerForm";
import { Callout, FaqList, Figure, Icon, PageHero, Section, StepFlow, type Faq, type IconName } from "@/components/ui";
import { scenes } from "@/lib/scenes";
import { getPackage } from "@/lib/packages";
import { PARTNER_TERMS, partnerFeeLine, partnerFeeOn, partnerRatePct } from "@/lib/partner-terms";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Become a Rental Partner: Chicago Event Rental Leads",
  description: `Chicago-area rental companies: get event bookings with items and quantities already listed from ${site.name}. Free for ${PARTNER_TERMS.freeDays} days, then ${partnerRatePct} only on orders we send that book. No monthly fee, no exclusivity.`,
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

const T = PARTNER_TERMS;

const terms = [
  ["Joining", "Free. No setup fee, no monthly fee."],
  ["Founding Partner period", `Nothing on bookings from enquiries we send in your first ${T.freeDays} days.`],
  [`After ${T.freeDays} days`, `${partnerRatePct} of the rental subtotal (not delivery, setup labor, damage waiver or tax), only on orders we send that book and only after the event happens.`],
  ["Paid", `Monthly statement by event month, due ${T.netDays} days after we send it. ACH, Zelle or check.`],
  ["Your pricing", `You set it and we never mark it up. We quote customers from your price sheet, valid ${T.quoteValidDays} days.`],
  ["Customers we introduce", `Count as ours for ${T.attributionMonths} months, including their next events.`],
  ["Exclusivity", `None. Leave any time with ${T.noticeDays} days' notice.`],
  ["What we ask", `Availability replies within ${T.replyHours} business hours, weekly status on open orders, and an insurance certificate for our file.`],
];

// What rental companies already pay to find customers. Ranges reported by companies that pay them (Nov 2026).
const compare: [string, string, string][] = [
  ["Wedding directory listing", "About $200 to $450 a month in mid-size cities, more in Chicago, often on a 12-month contract", "Every month, booked or not"],
  ["Pay-per-lead apps", "About $20 to $100 for each customer contact", "For every contact, booked or not"],
  ["Search ads", "About $2 to $6 a click for rental searches", "For every click, booked or not"],
  [site.name, `Nothing for ${T.freeDays} days, then ${partnerRatePct} of the rentals`, "Only when an order books and the event happens"],
];

const asks: { icon: IconName; title: string; text: string }[] = [
  { icon: "quote", title: "Your price sheet", text: "Or confirm the prices on your website are current. Plus minimums, delivery zones, deposit and damage waiver." },
  { icon: "phone", title: "Who takes orders", text: "A name, cell and email for availability checks, and a backup person." },
  { icon: "calendar", title: "Quick replies", text: `Yes, no or a suggested swap within ${T.replyHours} business hours. Same day for events less than 14 days out.` },
  { icon: "shield", title: "An insurance certificate", text: "General liability, kept on file before your first booking." },
  { icon: "spark", title: "Photos, if you say yes", text: "Your own photos of your items, credited to you. Only with your written OK, and you can take them back any time." },
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
  const sample = getPackage("wedding-150");
  const sampleRentals = sample?.rentals ?? 3800;
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Rental partners", href: "/partners" }]}
        eyebrow="For rental companies"
        title="Get booked Chicago events sent to you."
        intro={`${site.name} sends Chicago-area rental companies event bookings with the items and quantities already listed, It's ${partnerFeeLine}. No monthly fees, no exclusivity, and you keep your own prices, contract and deposit.`}
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
          click. With us, a booked $5,000 wedding order costs you ${partnerFeeOn(5000).toLocaleString()} after your first {T.freeDays} days, and nothing before
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

      <Section eyebrow="An example" title="What one order looks like">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-7">
            <p className="text-sm text-muted">A sample order (not a real customer). The email you get, subject line:</p>
            <p className="mt-1 font-medium">Availability: Saturday, June 12, Naperville, 150 guests</p>
            <ul className="mt-5 space-y-2 leading-7 text-muted">
              <li>Wedding reception at a banquet hall, ground floor, loading dock</li>
              <li>{sample?.highlights.slice(0, 3).join(", ") ?? "Chairs, tables and linens"}</li>
              <li>Delivery Friday after 2 pm, pickup Sunday morning</li>
              <li>Quoted to the customer at your price sheet total: ${sampleRentals.toLocaleString()} in rentals</li>
            </ul>
            <p className="mt-5 leading-7">You reply <strong>yes</strong>, <strong>no</strong> or <strong>yes with changes</strong>. A no costs nothing.</p>
          </div>
          <div className="card p-7">
            <h3 className="display-3">Who pays what on that order</h3>
            <dl className="mt-5 divide-y divide-line">
              <div className="flex justify-between gap-4 py-3"><dt className="text-muted">Customer pays you, under your contract</dt><dd className="font-medium">${sampleRentals.toLocaleString()} + your delivery, waiver and tax</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-muted">You pay us in your first {T.freeDays} days</dt><dd className="font-medium">$0</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-muted">You pay us after that ({partnerRatePct})</dt><dd className="font-medium">${partnerFeeOn(sampleRentals).toLocaleString()}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-muted">If the event is cancelled and refunded</dt><dd className="font-medium">$0</dd></div>
            </dl>
            <p className="mt-4 text-sm text-muted">The customer pays our coordination fee to us, on its own line. Your price is never changed.</p>
          </div>
        </div>
      </Section>

      <Section tone="sand" eyebrow="Compare" title="What you pay now to find customers">
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[36rem] text-left">
            <thead className="border-b border-line text-sm text-muted">
              <tr><th className="px-5 py-3 font-medium">Where customers come from</th><th className="px-5 py-3 font-medium">Typical cost</th><th className="px-5 py-3 font-medium">When you pay</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {compare.map(([k, cost, when], i) => (
                <tr key={k} className={i === compare.length - 1 ? "bg-gold-soft" : ""}>
                  <th scope="row" className="px-5 py-4 font-medium">{k}</th>
                  <td className="px-5 py-4 leading-7 text-muted">{cost}</td>
                  <td className="px-5 py-4 leading-7 text-muted">{when}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-muted">Directory, app and ad costs are ranges other rental and event companies report paying. Your own costs may differ.</p>
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
        <p className="mt-6 leading-7 text-muted">
          Every term fits on one page you can print or forward:{" "}
          <Link href="/partners/terms" className="link-line">read the one-page partner terms</Link>.
        </p>
      </Section>

      <Section eyebrow="What we need from you" title="Five things to get started">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {asks.map((r) => (
            <li key={r.title} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-soft text-gold">
                <Icon name={r.icon} size={22} />
              </span>
              <h3 className="mt-4 font-medium">{r.title}</h3>
              <p className="mt-2 leading-7 text-muted">{r.text}</p>
            </li>
          ))}
        </ul>
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
          <a href="/vendor-listings" className="text-accent">listing request form</a>. Removals take up to {T.removalDays} business days.
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
