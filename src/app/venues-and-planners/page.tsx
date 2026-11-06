import type { Metadata } from "next";
import Link from "@/components/Link";
import { CallForm } from "@/components/CallForm";
import { ReferForm } from "@/components/ReferForm";
import { Figure, HubFaqs, Icon, IconCards, PageHero, Section, StepFlow, type Faq } from "@/components/ui";
import { plannerEvents } from "@/lib/event-plan";
import { referralReward } from "@/lib/referrals";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "For Venues, Planners and Decorators: Send Us Your Rental Lists",
  description: `Banquet halls, planners, decorators and caterers in ${site.market}: send families who need chairs, tables, tents and dishes to us. We handle the whole order and line up delivery around your load-in.`,
  alternates: { canonical: "/venues-and-planners" },
});

const who = [
  { icon: "pin" as const, title: "Halls without furniture", text: "Banquet halls, community halls, gurdwaras, temples and churches where families bring their own tables and chairs." },
  { icon: "list" as const, title: "Planners and coordinators", text: "Hand us the rental list and the floor plan. We chase the companies, you keep planning." },
  { icon: "spark" as const, title: "Decorators and mandap companies", text: "You bring the look. We bring the tables, chairs, linens, tent and floor around it." },
  { icon: "chafer" as const, title: "Caterers", text: "Clients who need dishes, glassware, chafers or tables you don't carry." },
  { icon: "chat" as const, title: "DJs and photographers", text: "Families ask you who to call for a dance floor, stage or lighting. Send them here." },
  { icon: "users" as const, title: "Friends who plan a lot", text: "Aunties and uncles who organise every family event. You are welcome too." },
];

const forYou = [
  { icon: "calendar" as const, title: "Your load-in times", text: "Tell us your delivery and pickup rules once. We plan every delivery around them." },
  { icon: "ruler" as const, title: "One plan for everyone", text: "You get the same item list, floor plan and delivery times we send the family." },
  { icon: "phone" as const, title: "One person on the day", text: "If a delivery is late, you call us, not three companies." },
  { icon: "check" as const, title: "Your client stays yours", text: "We only book rentals. We don't sell planning, decor or catering." },
];

export default function VenuesAndPlannersPage() {
  const reward = referralReward();
  const hero = plannerEvents.find((e) => e.id === "indian-wedding");
  const faqs: Faq[] = [
    {
      q: "Do you pay a referral fee?",
      a: reward
        ? `Yes: ${reward}. We confirm it by email once the booking is confirmed.`
        : "Not at the moment. If we add one, this page will say so. What you get today is one contact for everything your client rents.",
    },
    {
      q: "Will you try to sell my client other services?",
      a: "No. We only book rentals: chairs, tables, linens, dishes, tents, floors, lighting and the like. Planning, decor, food and music stay with you.",
    },
    {
      q: "What does it cost the family?",
      a: "By the item, at the prices on our site, plus delivery, setup, damage waiver and tax on one written quote. There is no separate booking fee.",
    },
    {
      q: "Can you work to our floor plan and rules?",
      a: "Yes. Send the floor plan, door sizes, elevator and loading dock details, and delivery windows. We pass them to every company and plan quantities to fit.",
    },
    {
      q: "How do I send someone to you?",
      a: "Share your link below, or send us their name and number with their permission and we'll call them.",
    },
  ];
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Venues and planners", href: "/venues-and-planners" }]}
        eyebrow="For venues, planners and decorators"
        title={<>Send us the families who need <em className="text-gold">rentals</em></>}
        intro={`If your hall doesn't come with tables and chairs, or you plan or decorate events and don't want to chase rentals, send the family to us. We handle the whole order and line up delivery around your load-in times.`}
        actions={
          <>
            <a href="#link" className="btn-primary">
              Get a link to share <Icon name="arrow" size={16} />
            </a>
            <a href="#call" className="link-line">Or talk to us first</a>
          </>
        }
        media={
          <Figure
            src={hero?.image ?? scenes.gildedIvory.src}
            alt={hero?.alt ?? scenes.gildedIvory.alt}
            ratio="4/5"
            priority
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="mx-auto max-w-md"
          />
        }
      />

      <Section eyebrow="Who this is for" title="Who sends families to us">
        <IconCards columns={3} items={who} />
      </Section>

      <Section tone="sand" eyebrow="What you get" title="What changes for you">
        <IconCards columns={2} items={forYou} />
        <p className="mt-8 text-sm text-muted">
          Planning an event at a specific hall, museum or taproom? See{" "}
          <Link href="/venues" className="link">venue guides for popular Chicago spaces</Link> and what each one usually
          needs. How we price it for the family: <Link href="/pricing" className="link">pricing</Link>. Big events:{" "}
          <Link href="/big-celebrations" className="link">big celebrations</Link>. Families can also browse{" "}
          <Link href="/rentals" className="link">every rental and its price</Link>, read{" "}
          <Link href="/how-it-works" className="link">how booking works</Link> and our{" "}
          <Link href="/booking-promise" className="link">Booking Promise</Link>, or{" "}
          <Link href="/quote?from=venues" className="link">start a quote</Link>.
        </p>
      </Section>

      <Section eyebrow="How it works" title="From your client to delivery day">
        <StepFlow
          caption="How a referral works: share your link, we call the family, the order is booked, and delivery fits your load-in."
          steps={[
            { icon: "chat", title: "Share your link", text: "Text or WhatsApp it to the family." },
            { icon: "phone", title: "We call them", text: "Guest count, date and what your space needs." },
            { icon: "quote", title: "One quote", text: "Every item and its price, in writing." },
            { icon: "truck", title: "Delivered on your terms", text: "Inside your load-in window, picked up after." },
          ]}
        />
      </Section>

      <Section id="link" tone="sand" eyebrow="Your link" title="Make a link to share">
        <div className="mx-auto max-w-3xl">
          <ReferForm />
        </div>
      </Section>

      <section id="call" className="container-x section-y scroll-mt-24">
        <div className="grid gap-12 md:grid-cols-[1fr_1.3fr] md:items-start">
          <div>
            <p className="eyebrow">Talk first</p>
            <h2 className="display-2 mt-3">Tell us about your venue or business</h2>
            <p className="lede mt-4">
              Leave your number and a good time. We&apos;ll call within one business day to hear how your events run and
              what your clients usually need.
            </p>
          </div>
          <div className="card p-6 sm:p-10">
            <CallForm source="venue-partner" />
          </div>
        </div>
      </section>


      <HubFaqs faqs={faqs} title="Questions from venues and planners" />
    </>
  );
}
