import { vendorPageRobots } from "@/lib/vendor-pages";
import type { Metadata } from "next";
import Link from "@/components/Link";
import { FaqList, Figure, JsonLd, PageHero, QuoteCta, Section, StepFlow, type Faq } from "@/components/ui";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";
import { partnerFreeCount, partnerFreeOrders, partnerRatePct } from "@/lib/partner-terms";

export const metadata: Metadata = seo({
  title: "Rental Partner FAQ: Joining, Orders, Fees and Payments",
  description: `Answers for Chicago-area rental companies thinking about listing with ${site.name}: how sign-up works, how orders reach you, what it costs, who pays whom, and how to change prices or leave.`,
  alternates: { canonical: "/partners/faq" },
  // For rental companies only: kept out of search and AI answers so customers don't land here (see src/lib/vendor-pages.ts).
  robots: vendorPageRobots,
});

const groups: { id: string; title: string; faqs: Faq[] }[] = [
  {
    id: "joining",
    title: "Signing up",
    faqs: [
      { q: "Who can join?", a: `Any rental company that delivers event rentals somewhere in ${site.marketLong}: chairs, tables, linens, dinnerware, tents, lighting, dance floors, lounge furniture, photo booths, AV, restrooms, power or fencing. One category is enough.` },
      { q: "How do I sign up?", a: "Fill in the onboarding form at /partners/onboard. It takes about five minutes and asks for your company details, what you rent, where you deliver, your schedule, your prices and how customers pay you. Your answers save in your browser as you go." },
      { q: "What happens after I send the form?", a: "We call you within one business day to go over your details. Then we send the one-page partner agreement and a preview of your listing. Your listing goes live only after you've checked it." },
      { q: "Can I see where my application is?", a: "Yes. After you apply, you get a link to your own status page. It shows whether we've received it, are checking your details, need something from you, or have approved it. The same link is in your confirmation email." },
      { q: "Do I need to send a price list to apply?", a: "No. You can skip that step and go through prices on the call. If you have one, upload a CSV (our template is on the form) or paste a link to your price page, Google Sheet or PDF." },
      { q: "Do I need insurance?", a: "We ask every partner for a certificate of general liability insurance before we send orders. If you're getting it now, say so on the form and we'll wait for it." },
    ],
  },
  {
    id: "orders",
    title: "Getting orders",
    faqs: [
      { q: "How do orders reach me?", a: "By email and phone. Each one has a quote ID (BC-YYYY-####), the event date, venue, town, guest count, and the exact items and quantities. We've already spoken with the host before it reaches you." },
      { q: "How fast do I need to reply?", a: "Within 4 business hours: yes, no, or a suggested swap. Hosts often book the first company that confirms, so a quick reply wins more orders." },
      { q: "What if I can't take an order?", a: "Reply no or suggest a substitute. There's no charge for orders you turn down, and turning one down doesn't affect how many you get." },
      { q: "Can I block dates I'm already full?", a: "Yes. List them on the form, or email us any time. We don't send orders on dates you've blocked, and we send more on the dates you'd like filled." },
      { q: "Will you send me orders outside my area?", a: "No. We only send orders inside the delivery areas you picked. If you take far-away orders for an extra fee, put that in the area notes." },
      { q: "Do customers contact me directly?", a: "No. Customers book and pay with us, and we stay their contact. You'll only talk to them on the day about the delivery itself. We handle changes and day-of calls." },
    ],
  },
  {
    id: "money",
    title: "Prices, fees and payments",
    faqs: [
      { q: "What does it cost?", a: `Nothing to join and no monthly fee. Founding Partners pay nothing on their first ${partnerFreeCount} booked orders. After that, ${partnerRatePct} of the rental subtotal (not delivery, damage waiver or tax), only on orders we send that book. The full terms fit on one page.` },
      { q: "Do you change my prices?", a: "No. You're paid your full price-sheet rate for every order. Customers book with us at our own prices, so your rates aren't shown to them." },
      { q: "Who pays whom?", a: "Customers pay us. We pay you: your usual deposit when we place the order and the balance before the event. After your first two booked orders, you pay us the referral fee on a monthly statement." },
      { q: "How do I pay your commission?", a: "We send one statement a month listing the completed events we sent you. It's due 15 days after the end of that month, by bank transfer, check or card on file." },
      { q: "Do you need my bank details?", a: "No. We don't pay you, so the form never asks for bank account numbers. If that ever changes, we'd set it up by phone through a secure payment provider." },
      { q: "How long are customers we introduce counted as yours?", a: "24 months. If a host we introduced books with you again directly in that time, it's counted as an order we sent. It's in the partner agreement." },
    ],
  },
  {
    id: "listing",
    title: "Your listing",
    faqs: [
      { q: "Is my company name shown to customers?", a: "No. Customers book with us and see our name. Your crew may be the one at the door, so please keep it friendly and on time." },
      { q: "Can I change my prices later?", a: "Yes. Email new prices any time and we update your listing, usually within two business days. Prices we've already quoted to a host are held for 14 days." },
      { q: "Can you use our product photos?", a: "Only if you say yes on the form. We credit you on the photo. If you say no, we show our own pictures of each item." },
      { q: "Some of our items are already on your site. Why?", a: "Our price estimates use rates rental companies publish on their own websites. You can correct or remove them on the listing request page, or sign up and manage them with us." },
      { q: "Is there exclusivity?", a: "No. Keep every other sales channel you have. To leave, give 30 days' notice and we take your listing down." },
    ],
  },
];

const all = groups.flatMap((g) => g.faqs);

export default function PartnerFaqPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: all.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        }}
      />
      <PageHero
        breadcrumbs={[{ name: "Partners", href: "/partners" }, { name: "FAQ", href: "/partners/faq" }]}
        eyebrow="For rental companies"
        title="Questions from rental companies"
        intro={
          <p data-answer>
            Joining {site.name} is free. Sign up online in about five minutes, we call you within one business day, and your listing goes live after you&apos;ve checked it. You pay nothing on {partnerFreeOrders}, then {partnerRatePct} only on orders we send that book. We pay you for every order. Here are the answers to the questions rental companies ask us most.
          </p>
        }
        actions={
          <>
            <Link href="/partners/onboard" className="btn-primary">Sign up as a partner</Link>
            <Link href="/partners/terms" className="btn-ghost">Partner terms</Link>
          </>
        }
        media={<Figure {...scenes.blushLongTable} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="The short version" title="From sign-up to your first order">
        <StepFlow
          caption={`How a rental company joins ${site.name}: sign up online, take our call, check your listing, then reply to orders.`}
          steps={[
            { title: "Sign up online", text: "About five minutes. Skip any step you're not ready for.", icon: "quote" },
            { title: "Take our call", text: "Within one business day, to go over your details.", icon: "phone" },
            { title: "Check your listing", text: "Nothing goes live until you say it's right.", icon: "check" },
            { title: "Reply to orders", text: "Yes, no or a swap, within 4 business hours.", icon: "truck" },
          ]}
        />
        <nav aria-label="Jump to a topic" className="mt-10 flex flex-wrap gap-2">
          {groups.map((g) => <a key={g.id} href={`#${g.id}`} className="chip">{g.title}</a>)}
        </nav>
      </Section>

      {groups.map((g, i) => (
        <Section key={g.id} id={g.id} tone={i % 2 === 0 ? "sand" : undefined} eyebrow="Questions" title={g.title}>
          <FaqList faqs={g.faqs} schema={false} className="max-w-3xl" />
        </Section>
      ))}

      <Section eyebrow="Still have a question?" title="Talk to us">
        <p className="max-w-2xl leading-7 text-muted">
          Email <a href={`mailto:${site.email}`} className="link">{site.email}</a> or read the{" "}
          <Link href="/partners#terms" className="link">Founding Partner terms</Link>. Already listed and want something changed? Use the{" "}
          <Link href="/vendor-listings" className="link">listing request form</Link>.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/partners/onboard" className="btn-primary">Start your sign-up</Link>
          <Link href="/partners" className="btn-ghost">Partner program overview</Link>
        </div>
      </Section>
      <QuoteCta source="partners-faq" title="Planning an event instead?" />
    </>
  );
}
