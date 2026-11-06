import type { Metadata } from "next";
import Link from "@/components/Link";
import { EventWeather } from "@/components/tools/EventWeather";
import { FaqList, Figure, JsonLd, PageHero, Section, type Faq } from "@/components/ui";
import { CLIMATE_SOURCE, firstFallFreeze, lastSpringFreeze, lightTimes, monthNames, monthSlugs, normalHighF } from "@/lib/chicago-climate";
import { routeExists } from "@/lib/routes";
import { site } from "@/lib/site";

export const revalidate = 86400;

const title = "Chicago Event Weather and Sunset Planner";
const description = "Enter your event date and times to see the normal high, sunset, golden light and when it gets dark in Chicago, with what to rent for it.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/tools/event-weather" },
  openGraph: { title, description, url: "/tools/event-weather", images: [{ url: "/rentals/styled/tent-reception-dusk.webp", alt: "Frame tent reception lit at dusk" }] },
};

export default function EventWeatherPage() {
  const now = new Date();
  const year = now.getMonth() >= 10 ? now.getFullYear() + 1 : now.getFullYear();
  const rows = monthNames.map((name, i) => {
    const l = lightTimes(`${year}-${String(i + 1).padStart(2, "0")}-15`);
    return { name, slug: monthSlugs[i], high: Math.round(normalHighF[i]), sunset: l.sunset, dark: l.dark, daylight: l.daylight };
  });
  const sat = new Date(now);
  sat.setDate(now.getDate() + ((6 - now.getDay() + 7) % 7 || 7));
  const defaultDate = sat.toISOString().slice(0, 10);
  const june = rows[5];
  const dec = rows[11];
  const sep = rows[8];

  const faqs: Faq[] = [
    { q: "What time is sunset in Chicago in June?", a: `Around ${june.sunset} in mid-June, and it is dark by about ${june.dark}. The latest sunsets of the year come in late June, at about 8:30 PM.` },
    { q: "What time does it get dark in Chicago in December?", a: `Sunset is around ${dec.sunset} in mid-December and it is dark by about ${dec.dark}, so almost every December evening event happens after dark. Plan lighting for the entrance, parking and any outdoor area.` },
    { q: "What is golden hour, and when should I plan photos?", a: `Photographers call the hour before sunset golden hour because the light is soft and warm. In mid-September that is about an hour before ${sep.sunset}. Use the planner above for your exact date.` },
    { q: "When is it too cold for an outdoor event in Chicago?", a: `Normal highs at O'Hare are below 50°F from November through March. The median last spring freeze is ${lastSpringFreeze} and the median first fall freeze is ${firstFallFreeze}, so outdoor events outside that window need heaters and sidewalls or an indoor backup.` },
    { q: "Where do these numbers come from?", a: `Normal highs are the ${CLIMATE_SOURCE}. Sunrise, sunset and darkness (end of civil twilight) are calculated with NOAA's solar equations for downtown Chicago, and are usually within a minute or two of published tables. Normals are averages, so always check the 10-day forecast.` },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${site.name} Chicago Event Weather and Sunset Planner`,
          url: `${site.url}/tools/event-weather`,
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
          { name: "Event weather & sunset", href: "/tools/event-weather" },
        ]}
        eyebrow="Free planning tool"
        title="When does the light go, and what will you need?"
        intro="Enter your date and event times. See the normal high, sunset, golden light and when it gets dark in Chicago, and what to plan for lights, heat, shade and rain."
        media={<Figure src="/rentals/styled/tent-reception-dusk.webp" alt="Frame tent reception glowing with string lights at dusk" ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 45vw" caption="At dusk the lighting plan takes over from the sun." />}
      />

      <Section>
        <EventWeather defaultDate={defaultDate} />
      </Section>

      <Section tone="sand" eyebrow="Month by month" title={`Chicago sunset and darkness, ${year}`} intro="Times for the 15th of each month (Central Time, daylight saving where it applies).">
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Normal high, sunset, darkness and daylight in Chicago on the 15th of each month</caption>
            <thead className="border-b border-line text-muted">
              <tr><th className="p-3 font-medium">Month</th><th className="p-3 font-medium">Normal high</th><th className="p-3 font-medium">Sunset</th><th className="p-3 font-medium">Dark by</th><th className="p-3 font-medium">Daylight</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.name}>
                  <th className="p-3 font-medium"><Link href={`/chicago-event-seasons/${r.slug}`} className="link">{r.name}</Link></th>
                  <td className="p-3">{r.high}°F</td>
                  <td className="p-3">{r.sunset}</td>
                  <td className="p-3">{r.dark}</td>
                  <td className="p-3">{r.daylight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">Normal highs: {CLIMATE_SOURCE}. Sun times calculated for downtown Chicago.</p>
      </Section>

      <Section eyebrow="Questions" title="Chicago event weather">
        <FaqList faqs={faqs} />
        <p className="mt-8 text-center text-sm text-muted">
          Next: {routeExists("/tools/event-date") && <><Link href="/tools/event-date" className="link">forecast and weather history for your date</Link> · </>}<Link href="/my-events" className="link">save your date in My Events</Link> · <Link href="/ideas" className="link">ideas for this month</Link> · <Link href="/tools" className="link">all free tools</Link>
        </p>
      </Section>
    </>
  );
}
