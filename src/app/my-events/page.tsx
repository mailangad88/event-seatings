import type { Metadata } from "next";
import Link from "next/link";
import { MyEvents } from "@/components/myevents/MyEvents";
import { FaqList, Figure, JsonLd, PageHero, Section, StepFlow, type Faq } from "@/components/ui";
import { routeExists } from "@/lib/routes";
import { site } from "@/lib/site";

const title = "My Events: Free Event Countdown, Checklist and Reminders";
const description = `Save your wedding, party or corporate event in ${site.name}'s free planner: a countdown, a checklist dated back from your event, Chicago weather and sunset for your date, calendar reminders and a share link. No account needed.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/my-events" },
  openGraph: { title, description, url: "/my-events", images: [{ url: "/rentals/styled/garden-ceremony.webp", alt: "Garden ceremony set with white chairs and an arch" }] },
};

const faqs: Faq[] = [
  {
    q: "Do I need an account to save my event?",
    a: "No. Your event is saved in this browser on this device. To open it somewhere else, use \"Share with partner or planner\" and open the link on your other device, then tap Save.",
  },
  {
    q: "Where does the checklist come from?",
    a: `It uses the same planning timeline as our rental planner: what most Chicago-area hosts book and confirm at about 9, 2 and 1 months out, then 2 weeks, 1 week, the day before and the day itself. It changes with your occasion, guest count and setting, so a backyard or tent event gets site, permit and rain-plan steps that a venue event doesn't.`,
  },
  {
    q: "How do the calendar reminders work?",
    a: "Add reminders to my calendar downloads one .ics file with an all-day entry for each upcoming milestone, and an alert the evening before. It opens in Google Calendar, Apple Calendar and Outlook. Nothing is sent from our side.",
  },
  {
    q: "Where do the weather and sunset numbers come from?",
    a: "The normal high is the National Weather Service's 1991-2020 average for that month at O'Hare. Sunrise and sunset are calculated for downtown Chicago on your exact date. Check the 10-day forecast the week before; normals tell you what to plan for, not what will happen.",
  },
  {
    q: "Can I plan more than one event?",
    a: "Yes. Use Plan another event to add a shower, rehearsal dinner, graduation or company party. Each one keeps its own countdown, checklist and notes.",
  },
  {
    q: "Is my information shared with anyone?",
    a: `No. Your plan stays in your browser. ${site.name} only receives your details if you choose to send your email for a planning check-in, or request a quote.`,
  },
];

const steps = [
  { icon: "calendar" as const, title: "Save your date", text: "Occasion, date, guests and setting." },
  { icon: "check" as const, title: "Tick off the checklist", text: "Dated back from your event day." },
  { icon: "spark" as const, title: "Get reminders", text: "One calendar file for every milestone." },
  { icon: "users" as const, title: "Share it", text: "Send the plan to a partner or planner." },
];

const moreTools = [
  { href: "/tools/floor-plan", name: "Floor plan builder", text: "Drag tables and chairs into your room and see what fits." },
  { href: "/tools/event-date", name: "Event date checker", text: "Forecast and weather history for your exact date." },
  { href: "/tools/event-weather", name: "Sunset and dark-by times", text: "When the light goes, and what to plan for lights and heat." },
  { href: "/tools/guest-count", name: "Guest count estimator", text: "How many invited guests will actually come." },
  { href: "/tools/budget-splitter", name: "Budget splitter", text: "Split one budget across categories and between hosts." },
  { href: "/tools/rain-plan", name: "Rain plan checklist", text: "Every backup decision for an outdoor event." },
  { href: "/vendor-guide", name: "Vendor guide", text: "Who to hire, in booking order, with questions to ask." },
  { href: "/countdown", name: "Countdown reminders", text: "Sign up for reminders as your date gets close." },
  { href: "/tools", name: "All free tools", text: "Calculators, plans and checklists." },
];

export default function MyEventsPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${site.name} My Events planner`,
          url: `${site.url}/my-events`,
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Any",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description,
          areaServed: { "@type": "City", name: "Chicago" },
          provider: { "@type": "Organization", name: site.name, url: site.url },
        }}
      />
      <PageHero
        breadcrumbs={[
          { name: "Free tools", href: "/tools" },
          { name: "My events", href: "/my-events" },
        ]}
        eyebrow="Free event planner"
        title="Your event, counted down and checked off."
        intro="Save your date once and come back any time: a countdown, a checklist dated back from your event, Chicago weather and sunset for your date, and reminders in your own calendar. No sign-up."
        media={<Figure src="/rentals/styled/garden-ceremony.webp" alt="Garden ceremony set with white chairs facing a floral arch" ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 45vw" caption="Plan the ceremony, reception and everything around it in one place." />}
      />

      <Section>
        <MyEvents site={{ name: site.name, url: site.url }} />
      </Section>

      <Section eyebrow="Go deeper" title="More tools for your event">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {moreTools.filter((t) => routeExists(t.href)).map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="card card-hover block h-full p-5">
                <span className="block font-medium">{t.name}</span>
                <span className="mt-1 block text-sm text-muted">{t.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand" eyebrow="How it works" title="Set it up once, then check back">
        <StepFlow steps={steps} />
      </Section>

      <Section eyebrow="Questions" title="About My Events">
        <FaqList faqs={faqs} />
        <p className="mt-8 text-center text-sm text-muted">
          More free planning help: <Link href="/tools" className="link">all tools</Link> · <Link href="/ideas" className="link">seasonal ideas</Link> · <Link href="/downloads" className="link">free kits</Link> · <Link href="/quote" className="link">free quote</Link> · <Link href="/blog" className="link">planning guides</Link>
        </p>
      </Section>
    </>
  );
}
