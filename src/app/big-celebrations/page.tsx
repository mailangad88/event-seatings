import type { Metadata } from "next";
import Link from "@/components/Link";
import { CallForm } from "@/components/CallForm";
import { CategoryTile, Figure, HubFaqs, Icon, IconCards, PageHero, Section, StepFlow, type Faq } from "@/components/ui";
import { DEPOSIT_LABEL, PAYMENT_SCHEDULE } from "@/lib/catalog-types";
import { categoryTile, scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { plannerEvents } from "@/lib/event-plan";
import { seo } from "@/lib/seo";
import { termsPolicy } from "@/lib/terms";


export const metadata: Metadata = seo({
  title: "Rentals for Big Celebrations in Chicago (150 to 400 Guests)",
  description: `Big weddings, sangeets, quinceañeras and milestone parties in ${site.market}: chairs, tables, linens, tents, floors and lighting on one quote, with delivery and setup lined up for you. No separate booking fee.`,
  alternates: { canonical: "/big-celebrations" },
});

const who = [
  { title: "Weddings and receptions", text: "Ceremony, cocktail hour and reception, often at a hall or tent with no furniture of its own.", href: "/events/weddings" },
  { title: "Sangeet, mehndi and wedding weekends", text: "Several events over two or three days. We plan each day's list and line up delivery and pickup between them.", href: "/events/south-asian-weddings" },
  { title: "Quinceañeras", text: "Big guest lists, a head table, a dance floor and often a tent or backyard.", href: "/events/quinceaneras" },
  { title: "Milestone birthdays and anniversaries", text: "50th, 60th and 75th parties in a backyard, a hall or a tent.", href: "/events/birthday-parties" },
  { title: "Religious and community celebrations", text: "Gurdwara, temple, church and community hall events with long tables and simple setups.", href: "/events/religious-events" },
  { title: "Galas and fundraisers", text: "Rounds, linens, a stage and lighting, delivered to a tight load-in window.", href: "/events/galas-fundraisers" },
];

// What a celebration this size usually needs.
const needs: { id: string; name: string; blurb: string }[] = [
  { id: "chairs", name: "Chairs", blurb: "Guest chairs, plus a different style for the head table or stage" },
  { id: "tables", name: "Tables", blurb: "Rounds or long tables, cocktail tables, buffet and cake tables" },
  { id: "linens", name: "Linens", blurb: "Tablecloths, runners and napkins in your colours" },
  { id: "dinnerware", name: "Dishes and glasses", blurb: "Plates, flatware and glassware if your caterer doesn't bring them" },
  { id: "tents", name: "Tent", blurb: "For backyards and outdoor venues, with sidewalls, heaters and lighting" },
  { id: "dance-floors-staging", name: "Dance floor and stage", blurb: "Sized for your crowd, with a stage for the DJ or a mandap" },
  { id: "lighting", name: "Lighting", blurb: "String lights, uplights and chandeliers for tents and halls" },
  { id: "restrooms-power", name: "Power and restrooms", blurb: "Generators and restroom trailers for backyard and field events" },
];

const doForYou = [
  { icon: "quote" as const, title: "One written quote", text: "Every item at the price on our site, with delivery, setup, damage waiver and tax shown." },
  { icon: "phone" as const, title: "We check every item", text: "We check your date for every item on your list and suggest swaps if something is booked." },
  { icon: "calendar" as const, title: "Times lined up", text: "Tent first, then floor, then tables and chairs, then linens. Pickup times that fit your venue's rules." },
  { icon: "list" as const, title: "Changes handled", text: `Guest count went up by 40? Tell us once. We update your order until ${termsPolicy.changeCutoffDays} days out.` },
  { icon: "truck" as const, title: "Morning-of check", text: "On the day, we check every delivery is on its way and call you only if something changes." },
  { icon: "shield" as const, title: "If an item falls through", text: "We replace it with the same or better at the price you agreed, or refund what you paid for it." },
];

const faqs: Faq[] = [
  {
    q: "What does it cost?",
    a: `The item prices on our site, plus delivery, setup, damage waiver and tax on your quote. No separate booking fee. You book with a ${DEPOSIT_LABEL}, then pay the rest in stages before your event.`,
  },
  {
    q: "Can we see an example price first?",
    a: "Yes. Our ready-made packages price a 150-guest wedding and a 250-guest sangeet from the catalog, and you can change the guest count to see your number.",
  },
  {
    q: "We already have a decorator or planner. Can you still help?",
    a: "Yes. Decorators and planners usually bring the look, and we handle the furniture, tent, floor and dishes around them. We send them the same plan and delivery times.",
  },
  {
    q: "Our events run over several days. Can you plan all of them?",
    a: "Yes. We make a list for each day and check whether items can stay in place between events. Where the venue allows it, that can save a second delivery and pickup.",
  },
  {
    q: "How early should we start?",
    a: "As early as you can, especially for May to October dates, when tents and popular chairs go first. A month and a rough guest count are enough to start.",
  },
  {
    q: "Do you work across the suburbs?",
    a: `Yes. ${site.serviceArea.join(", ")} and the towns around them. Ask about venues farther out.`,
  },
];

export default function BigCelebrationsPage() {
  const hero = plannerEvents.find((e) => e.id === "indian-wedding");
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Big celebrations", href: "/big-celebrations" }]}
        eyebrow={`Big celebrations, 150 to 400 guests`}
        title={<>One order for everything your <em className="text-gold">celebration</em> needs</>}
        intro={`Big weddings, sangeets, quinceañeras and milestone parties need chairs, tables, linens, a tent, a floor and lighting, all arriving in the right order. We put it on one quote, line up delivery times and check every delivery on the morning of your event. No separate booking fee.`}
        actions={
          <>
            <a href="#tell-us" className="btn-primary">
              Tell us about your celebration <Icon name="arrow" size={16} />
            </a>
            <Link href="/quote?event=wedding&from=big-celebrations" className="link-line">Or plan it yourself</Link>
          </>
        }
        media={
          <Figure
            src={hero?.image ?? scenes.midnightGold.src}
            alt={hero?.alt ?? scenes.midnightGold.alt}
            ratio="4/5"
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="mx-auto max-w-md"
          />
        }
      />

      <Section eyebrow="Who this is for" title="Celebrations we plan most">
        <IconCards
          columns={3}
          items={who.map((w) => ({
            title: w.title,
            text: w.text,
            extra: (
              <Link href={w.href} className="link-line mt-3 text-sm">
                Rental ideas <Icon name="arrow" size={14} />
              </Link>
            ),
          }))}
        />
      </Section>

      <Section
        tone="sand"
        eyebrow="The full list"
        title="What a big celebration usually needs"
        intro="Most big events need most of this. Book early for May to October Saturdays, when tents and popular chairs go first."
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {needs.map((n) => (
            <CategoryTile key={n.id} href={`/rentals/${n.id}`} name={n.name} blurb={n.blurb} icon="spark" image={categoryTile(n.id)} />
          ))}
        </div>
      </Section>

      <Section eyebrow="What we do" title="What's included">
        <IconCards columns={3} items={doForYou} />
        <p className="mt-8 text-sm text-muted">
          Full details on the <Link href="/pricing" className="link">pricing page</Link> and in{" "}
          <Link href="/booking-promise" className="link">who you pay and when</Link>.
        </p>
      </Section>

      <Section tone="sand" eyebrow="How it works" title="From first call to pickup">
        <StepFlow
          caption="How a big celebration is booked: a call, one written quote, a deposit to book, then the rest in stages before delivery is checked on the day."
          steps={[
            { icon: "phone", title: "A 15-minute call", text: "Your date, guest count, venue and the look you want." },
            { icon: "quote", title: "One written quote", text: "Every item and price in writing. Change anything." },
            { icon: "check", title: "Book with a deposit", text: `${PAYMENT_SCHEDULE.firstShare * 100}% of the rentals, refundable for ${PAYMENT_SCHEDULE.refundHours} hours.` },
            { icon: "truck", title: "Delivered and checked", text: "We check each delivery on the morning of your event." },
          ]}
        />
      </Section>


      <section id="tell-us" className="container-x section-y scroll-mt-24">
        <div className="grid gap-12 md:grid-cols-[1fr_1.3fr] md:items-start">
          <div>
            <p className="eyebrow">Free {site.callLength} call</p>
            <h2 className="display-2 mt-3">Tell us about your celebration</h2>
            <p className="lede mt-4">
              Leave your number and a good time to call. We&apos;ll call you back within one business day, talk through
              your venue and guest count, and give you a straight answer on what it will cost.
            </p>
            <ul className="mt-6 space-y-2 text-sm">
              {["No cost and no obligation", "A rough guest count is fine", "Your planner or family are welcome on the call"].map((t) => (
                <li key={t} className="flex gap-2">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-gold" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6 sm:p-10">
            <CallForm source="big-celebrations" />
          </div>
        </div>
      </section>

      <HubFaqs faqs={faqs} title="Big celebration questions" />
    </>
  );
}
