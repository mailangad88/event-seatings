import type { Metadata } from "next";
import Link from "next/link";
import { CallCta } from "@/components/CallCta";
import { Callout, FaqList, Figure, Icon, PageHero, Section, StepFlow, type Faq } from "@/components/ui";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Event Rentals Work: One Quote for Everything",
  description: `How ${site.name} works: pick chairs, tables, linens, dinnerware and more, see live prices, get one itemized quote, and we coordinate delivery and setup across Chicago and the suburbs.`,
  alternates: { canonical: "/how-it-works" },
};

const detail = [
  {
    icon: "search",
    title: "1. Build your list",
    text: "Browse rentals by category or start from a styled look. Add quantities as you go; your running total updates instantly.",
    points: ["14 categories, chairs to chafers", "Styled looks you can price in one click", "Save and come back any time"],
  },
  {
    icon: "quote",
    title: "2. Send your quote request",
    text: "Tell us your date, venue and guest count. It takes about two minutes and there is no charge or obligation.",
    points: ["Itemized prices", "Delivery and setup shown separately", "Venue notes for the crew"],
  },
  {
    icon: "users",
    title: "3. We confirm with vendors",
    text: "We check availability with trusted Chicago-area rental houses and send your confirmed quote, usually within one business day.",
    points: ["Substitutes if something is booked", "One contact for every vendor", "Changes handled for you"],
  },
  {
    icon: "truck",
    title: "4. Delivered, set and collected",
    text: "Your rentals arrive on schedule, are set up if you chose it, and are picked up after the event.",
    points: ["Coordinated delivery windows", "Optional full setup", "Pickup the same night or next morning"],
  },
] as const;

const faqs: Faq[] = [
  { q: "How long does a quote take?", a: "Most confirmed quotes go out within one business day. Peak-season Saturdays can take a little longer when we are checking several vendors." },
  { q: "Can I change my order after booking?", a: "Yes. Quantities can usually be adjusted until about two weeks before the event, subject to availability." },
  { q: "What if an item is unavailable?", a: "We suggest the closest match in style and price, and you choose whether to swap it." },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "How it works", href: "/how-it-works" }]}
        eyebrow="How it works"
        title="One list. One quote. Every rental handled."
        intro={`Here is exactly what happens from the moment you start browsing to the moment the last chair leaves your venue.`}
        actions={
          <>
            <Link href="/quote?from=how-it-works" className="btn-primary">Start my quote</Link>
            <Link href="/rentals" className="btn-ghost">Browse rentals</Link>
          </>
        }
        media={<Figure {...scenes.midnightGold} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="The process" title="Four steps, about two minutes of your time">
        <StepFlow
          caption={`The ${site.name} booking process: build your list, send your quote request, we confirm with vendors, and rentals are delivered, set and collected.`}
          steps={detail.map((d) => ({ icon: d.icon, title: d.title.slice(3), text: d.text }))}
        />
      </Section>

      <Section tone="sand">
        <div className="grid gap-5 md:grid-cols-2">
          {detail.map((d) => (
            <article key={d.title} className="card p-7">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-gold-soft text-gold">
                <Icon name={d.icon} size={24} />
              </span>
              <h2 className="display-3 mt-5">{d.title}</h2>
              <p className="mt-3 leading-7 text-muted">{d.text}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {d.points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Icon name="check" size={16} className="text-gold" /> {p}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <Callout kind="tip" title="Planning tip" className="mt-8">
          Book tents, dance floors and popular chairs first. They sell out earliest for summer Saturdays, while linens and
          dinnerware are usually easier to source closer to the date.
        </Callout>
      </Section>

      <Section eyebrow="Questions" title="About the process">
        <FaqList faqs={faqs} className="max-w-3xl" />
      </Section>

      <div className="-mb-32">
        <CallCta source="how-it-works" />
      </div>
    </>
  );
}
