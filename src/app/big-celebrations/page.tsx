import type { Metadata } from "next";
import Link from "@/components/Link";
import { CallForm } from "@/components/CallForm";
import { CategoryTile, Figure, HubFaqs, Icon, IconCards, PageHero, Section, StepFlow, type Faq } from "@/components/ui";
import { BACKUP_CAP_LABEL, COORDINATION_FEE } from "@/lib/catalog-types";
import { categoryTile, scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { plannerEvents } from "@/lib/event-plan";
import { seo } from "@/lib/seo";

const { standard, large, largeFrom } = COORDINATION_FEE;
const over = largeFrom - 1;

export const metadata: Metadata = seo({
  title: "Rentals for Big Celebrations in Chicago (150 to 400 Guests)",
  description: `Big weddings, sangeets, quinceañeras and milestone parties in ${site.market}: we book every rental company you need for one flat fee ($${large} over ${over} guests), paid only after they all confirm.`,
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

// What a celebration this size usually needs, and why it takes more than one rental company.
const needs: { id: string; name: string; blurb: string }[] = [
  { id: "chairs", name: "Chairs", blurb: "Guest chairs, plus a different style for the head table or stage" },
  { id: "tables", name: "Tables", blurb: "Rounds or long tables, cocktail tables, buffet and cake tables" },
  { id: "linens", name: "Linens", blurb: "Tablecloths, runners and napkins in your colours, often from a linen specialist" },
  { id: "dinnerware", name: "Dishes and glasses", blurb: "Plates, flatware and glassware if your caterer doesn't bring them" },
  { id: "tents", name: "Tent", blurb: "For backyards and outdoor venues, with sidewalls, heaters and lighting" },
  { id: "dance-floors-staging", name: "Dance floor and stage", blurb: "Sized for your crowd, with a stage for the DJ or a mandap" },
  { id: "lighting", name: "Lighting", blurb: "String lights, uplights and chandeliers for tents and halls" },
  { id: "restrooms-power", name: "Power and restrooms", blurb: "Generators and restroom trailers for backyard and field events" },
];

const doForYou = [
  { icon: "quote" as const, title: "One written quote", text: "Every item at each company's own price, with each company named, and delivery, setup, damage waiver and tax shown." },
  { icon: "phone" as const, title: "We make the calls", text: "We check your date with each company, compare what they carry and book the ones that fit." },
  { icon: "calendar" as const, title: "Times lined up", text: "Tent first, then floor, then tables and chairs, then linens. Pickup times that fit your venue's rules." },
  { icon: "list" as const, title: "Changes handled", text: "Guest count went up by 40? Tell us once. We update every company until 14 days out." },
  { icon: "truck" as const, title: "Morning-of check", text: "On the day, we check every delivery is on its way and call you only if something changes." },
  { icon: "shield" as const, title: "Backup if a company cancels", text: `We find a replacement and cover up to ${BACKUP_CAP_LABEL} of any price difference, or refund our fee.` },
];

const faqs: Faq[] = [
  {
    q: "What does it cost?",
    a: `Each rental company's own price, with no markup, plus one flat fee: $${standard} up to ${over} guests or $${large} above. You pay our fee only after every company has confirmed your date in writing.`,
  },
  {
    q: "What if one rental company can do everything?",
    a: "Then you probably don't need us. We'll tell you which company to call and what to ask for, and there is no fee.",
  },
  {
    q: "We already have a decorator or planner. Can you still help?",
    a: "Yes. Decorators and planners usually bring the look, and we handle the furniture, tent, floor and dish companies around them. We send them the same plan and delivery times.",
  },
  {
    q: "Our events run over several days. Can you plan all of them?",
    a: "Yes. We make a list for each day and ask the companies whether items can stay in place between events. Where the venue and company allow it, that can save a second delivery and pickup.",
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
        title={<>One person for every rental company your <em className="text-gold">celebration</em> needs</>}
        intro={`Big weddings, sangeets, quinceañeras and milestone parties often need three or four rental companies. We get the quotes, book each one, line up delivery times and check every delivery on the morning of your event. You pay each company its own price, plus one flat fee of $${large} ($${standard} up to ${over} guests), only after every company confirms.`}
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
        eyebrow="Why it takes several companies"
        title="What a big celebration usually needs"
        intro="Few rental companies carry all of this, and the ones that do are often booked on summer Saturdays. So most big events end up with three or four."
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {needs.map((n) => (
            <CategoryTile key={n.id} href={`/rentals/${n.id}`} name={n.name} blurb={n.blurb} icon="spark" image={categoryTile(n.id)} />
          ))}
        </div>
      </Section>

      <Section eyebrow="What we do" title="What the flat fee covers">
        <IconCards columns={3} items={doForYou} />
        <p className="mt-8 text-sm text-muted">
          Full details on the <Link href="/pricing" className="link">pricing page</Link> and in{" "}
          <Link href="/booking-promise" className="link">who you pay and when</Link>.
        </p>
      </Section>

      <Section tone="sand" eyebrow="How it works" title="From first call to pickup">
        <StepFlow
          caption="How a big celebration is booked: a call, one written quote, every company confirms, then delivery is checked on the day."
          steps={[
            { icon: "phone", title: "A 15-minute call", text: "Your date, guest count, venue and the look you want." },
            { icon: "quote", title: "One written quote", text: "Every company named, at its own price. Change anything." },
            { icon: "check", title: "Every company confirms", text: "Only then do you pay our flat fee." },
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
              your venue and guest count, and tell you honestly whether you need us or just one rental company.
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
