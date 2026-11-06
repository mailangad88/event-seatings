import type { Metadata } from "next";
import Link from "@/components/Link";
import { Callout, FaqList, Figure, PageHero, Section, type Faq } from "@/components/ui";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our First 10 Customers",
  description: `${site.name} launched this month in Chicago. Here's how we're thanking our first 10 customers, and why we ask every one of them for an honest review.`,
  alternates: { canonical: "/founding-customers" },
};

const faqs: Faq[] = [
  {
    q: "Do I have to leave a review to count as a founding customer?",
    a: "No. Founding customer status is a thank-you for booking with us early, not a trade for a review. We ask every customer for an honest review a few days after their event, good or bad, and nothing changes whether you write one or not.",
  },
  {
    q: "Is there a discount for being a founding customer?",
    a: "The new-customer offer on /quote is open to everyone right now, not only our first 10. Founding customer status is separate: it's recognition, priority if you book with us again, and a direct line to Angad if anything about your order needs attention.",
  },
  {
    q: "Will you only publish good reviews?",
    a: `No. ${site.name} publishes every real review as written, including critical ones. See /reviews for how that works.`,
  },
];

export default function FoundingCustomersPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Founding customers", href: "/founding-customers" }]}
        eyebrow="Thank you"
        title="You're one of our first customers in Chicago"
        intro={`${site.name} opened this month. The first 10 people who book with us help us learn fast and get it right, so we're thanking you for that directly, not asking for anything in return.`}
        actions={
          <>
            <Link href="/reviews/write" className="btn-primary">Write an honest review</Link>
            <Link href="/quote" className="btn-ghost">Start a quote</Link>
          </>
        }
        media={<Figure {...scenes.blushGarden} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="What founding customer status means" title="Three things, no strings attached">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["A direct line to Angad", "If anything about delivery, setup or an item isn't right, you reach the owner, not a queue."],
            ["First pick next time", "Book with us again and your date gets priority over new enquiries for the same week."],
            ["A personal thank-you", "We'll reach out after your event to hear how it went, whether or not you write a review."],
          ].map(([title, text]) => (
            <div key={title} className="card p-7">
              <h3 className="display-3">{title}</h3>
              <p className="mt-3 leading-7 text-muted">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="sand" eyebrow="Why we ask for reviews" title="Honest, not traded for">
        <div className="max-w-2xl">
          <p className="leading-7 text-muted">
            A few days after your event, we&apos;ll ask if you&apos;d write a short review. It takes about two minutes, and we publish
            it exactly as written, good or bad. There&apos;s no discount, credit or gift for leaving one, and nothing changes if
            you skip it or write something critical. We ask because new customers in a new city have no way to check our
            work except through people who already booked with us, and that&apos;s you right now.
          </p>
          <Callout className="mt-8" title="Already booked?">
            You don&apos;t need to wait for our email. <Link href="/reviews/write" className="text-accent">Write your review now</Link>, or call or text{" "}
            {site.phone} if anything about your order needs attention first.
          </Callout>
        </div>
      </Section>

      <Section eyebrow="Questions" title="About founding customer status">
        <FaqList faqs={faqs} />
      </Section>

      <Section tone="sand" eyebrow="Where to go next" title="More about booking with us">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <li><Link href="/reviews" className="text-accent">Read our reviews</Link></li>
          <li><Link href="/how-it-works" className="text-accent">How booking works</Link></li>
          <li><Link href="/faq" className="text-accent">Frequently asked questions</Link></li>
          <li><Link href="/book" className="text-accent">Book a free seating consult</Link></li>
        </ul>
      </Section>
    </>
  );
}
