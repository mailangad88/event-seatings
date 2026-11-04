import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { CountdownTool } from "@/components/tools/CountdownTool";
import { FaqList, JsonLd, PageHero, QuoteCta, Section, StepFlow } from "@/components/ui";
import { routeExists } from "@/lib/routes";
import { render } from "@/lib/scenes";
import { site } from "@/lib/site";
import { tasks } from "@/lib/tools/timeline";

const title = "Event Countdown: Days Until Your Wedding or Party";
const description = "Free event countdown for weddings, parties and corporate events. Make a live countdown page to share with family and friends, see your next planning deadlines, add them to your calendar and sign up for milestone reminders.";

const img = render("sweetheart-stage");

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/countdown" },
  openGraph: { title, description, url: "/countdown", images: [{ url: img.src, alt: img.alt }] },
};

const faqs = [
  { q: "How do I make a countdown to my wedding?", a: "Enter your event name, date and start time. The countdown starts straight away and the page link holds your details, so you can share it or bookmark it. Nothing to install and no account." },
  { q: "Can I share my countdown?", a: "Yes. Tap 'Share this countdown' to copy the link. Anyone who opens it sees the same live countdown and your event name." },
  { q: "What are the deadlines under the countdown?", a: "The next few tasks from our timeline builder, counted back from your date: things like booking rentals, sending invitations, the RSVP deadline and sending final counts. They are planning guidance; your vendors' contracts set the real dates." },
  { q: "Will you email me reminders?", a: "Milestone reminder emails are starting soon. If you sign up, we save your date and will email you before each deadline once reminders start. Until then, use 'Add to calendar' for reminders today." },
  { q: "Is my information private?", a: "The countdown itself lives only in your browser and the page link. If you sign up for reminders, we store your name, email and date to send them. We never sell it." },
];

export default function CountdownPage() {
  const available = [...new Set(tasks.map((t) => t.href).filter((h): h is string => !!h && routeExists(h)))];
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${site.name} event countdown`,
          url: `${site.url}/countdown`,
          description,
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Any",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          image: `${site.url}${img.src}`,
          provider: { "@type": "Organization", name: site.name, url: site.url },
        }}
      />
      <PageHero
        eyebrow="Free countdown"
        title={<>How many days until <em className="text-gold">the big day?</em></>}
        intro={
          <>
            <p>Make a live countdown for your wedding, party or event. Share it with everyone who&apos;s coming, and keep your next planning deadlines in view.</p>
            <p data-answer className="mt-4 rounded-2xl border border-gold/30 bg-surface/70 p-4 text-base leading-7 text-ink">
              Enter your event name, date and start time to get a live countdown in days, hours, minutes and seconds. The page link holds your details so you can share it. Below the clock you see your next planning deadlines, worked back from your date, and can add them all to your calendar.
            </p>
          </>
        }
        breadcrumbs={[{ name: "Free tools", href: "/tools" }, { name: "Event countdown", href: "/countdown" }]}
        actions={<a href="#countdown" className="btn-accent">Start my countdown</a>}
        media={
          <figure className="media aspect-[4/3] shadow-lift">
            <Image src={img.src} alt={img.alt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </figure>
        }
      />
      <section id="countdown" className="container-x scroll-mt-24 py-12 md:py-16">
        <CountdownTool available={available} />
      </section>
      <Section tone="sand" eyebrow="How it works" title="A countdown that keeps you on track">
        <StepFlow
          steps={[
            { title: "Name it and pick the date", text: "Add a start time for a to-the-second clock.", icon: "calendar" },
            { title: "Share the link", text: "Family and friends see the same countdown.", icon: "heart" },
            { title: "Watch your deadlines", text: "The next tasks, worked back from your date.", icon: "check" },
            { title: "Add to calendar", text: "Every deadline in one .ics file.", icon: "arrow" },
          ]}
        />
      </Section>
      <Section eyebrow="Plan the rest" title="Tools that pair with your countdown">
        <ul className="grid gap-4 sm:grid-cols-3">
          {[
            ["/tools/timeline", "Timeline builder", "Every planning task with a real deadline."],
            ["/tools/guest-count", "Guest count estimator", "How many of your invited guests will come."],
            ["/tools/budget-splitter", "Budget splitter", "Split the budget by category and between hosts."],
            ["/tools/tables-and-chairs", "Tables and chairs", "Turn your guest count into a rental list."],
            ["/tools/rain-plan", "Rain plan checklist", "The backup plan for anything outdoors."],
            ["/quote", "Build a rental quote", "Live prices from Chicago rental companies."],
          ].map(([href, name, text]) => (
            <li key={href}>
              <Link href={href} className="card card-hover block h-full p-5">
                <p className="font-medium">{name}</p>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </Section>
      <Section tone="sand" eyebrow="Questions" title="Event countdown FAQ">
        <FaqList faqs={faqs} className="max-w-3xl" />
      </Section>
      <QuoteCta source="countdown" />
    </>
  );
}
