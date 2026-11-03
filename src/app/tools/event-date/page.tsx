import type { Metadata } from "next";
import Link from "next/link";
import { EventDateTool, type Place } from "@/components/EventDateTool";
import { FaqList, Figure, JsonLd, PageHero, Section, type Faq } from "@/components/ui";
import { locations } from "@/data/geo";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";

const title = "Event Date Weather, Sunset & Holiday Checker for Chicago";
const description =
  "Check your Chicago-area event date: what the weather actually did on that date over the last 10 years (or the live forecast within a week), sunset and golden hour, nearby holidays, and an add-to-calendar file.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools/event-date" },
  openGraph: { title, description, url: "/tools/event-date" },
};

const faqs: Faq[] = [
  {
    q: "Can you predict the weather for my wedding date?",
    a: "Not months ahead, and no one can. What we show instead is what actually happened within three days of your date in each of the last 10 years at your town, from NOAA's daily weather records for the nearest long-record station. Within a week of your date, the tool switches to the National Weather Service forecast.",
  },
  {
    q: "When is golden hour on my event date?",
    a: "Pick your date and town: the tool calculates golden hour, sunset and dusk for that exact location and day, so you can time the ceremony and portraits. Remember that tall buildings and trees bring shade earlier than the sunset time.",
  },
  {
    q: "Why do holidays matter for event rentals?",
    a: "Holiday weekends are popular for events, so rental inventory, delivery crews and venues book up earlier, and some companies charge holiday delivery fees. Confirm rentals early if your date is near one.",
  },
  {
    q: "Do I need a tent?",
    a: "If any part of your event is outdoors and the rain share for your date is meaningful, hold a tent or an indoor backup. The tool flags rain, heat, cold and wind and links to the rentals that solve each.",
  },
];

export default async function EventDatePage(props: PageProps<"/tools/event-date">) {
  const sp = await props.searchParams;
  const date = typeof sp.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(sp.date) ? sp.date : undefined;
  const place = typeof sp.place === "string" ? sp.place : undefined;
  // Chicago first, then everything else alphabetically.
  const places: Place[] = [...locations]
    .sort((a, b) => (a.slug === "chicago" ? -1 : b.slug === "chicago" ? 1 : a.name.localeCompare(b.name)))
    .map((l) => ({ slug: l.slug, name: l.name, lat: l.lat, lng: l.lng }));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${site.name} Event Date Checker`,
          url: `${site.url}/tools/event-date`,
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description,
          provider: { "@type": "Organization", name: site.name, url: site.url },
          areaServed: { "@type": "City", name: "Chicago" },
        }}
      />
      <PageHero
        breadcrumbs={[
          { name: "Tools", href: "/tools" },
          { name: "Event date checker", href: "/tools/event-date" },
        ]}
        eyebrow="Free planning tool"
        title={<>Check your event date</>}
        intro="Real weather history for your date and town, sunset and golden hour, and the holidays around it, so you know whether to plan for a tent, heaters or an earlier ceremony."
        actions={<Link href="/tools/floor-plan" className="btn-ghost">Seating layout builder</Link>}
        media={<Figure {...scenes.blushGarden} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />
      <Section eyebrow="Your date" title="Weather, sun and holidays">
        <EventDateTool places={places} initialDate={date} initialPlace={place} />
      </Section>
      <Section tone="sand" eyebrow="Questions" title="Event date FAQ">
        <FaqList faqs={faqs} />
      </Section>
    </>
  );
}
