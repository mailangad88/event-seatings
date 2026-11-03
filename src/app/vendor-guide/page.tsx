import type { Metadata } from "next";
import Link from "next/link";
import { FaqList, Figure, Icon, JsonLd, PageHero, Section, type Faq } from "@/components/ui";
import { occasions, roles } from "@/data/vendor-guide";
import { site } from "@/lib/site";

const title = "Event Vendor Guide: Who to Hire and When to Book Them";
const description = `Which vendors you need for a wedding, quinceañera, corporate event or backyard party in Chicago, when to book each one, what to ask them, and where their job overlaps with rentals. A free guide from ${site.name}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/vendor-guide" },
  openGraph: { title, description, url: "/vendor-guide", images: [{ url: "/rentals/scenes/wedding-reception.webp", alt: "Wedding reception with round tables, gold chairs and candlelight" }] },
};

const faqs: Faq[] = [
  { q: "Which event vendor should I book first?", a: "The venue, because its date, capacity and rules shape everything else. Next come the vendors who only do one event per day and book up early: caterer, photographer and (for weddings) the DJ or band. Rentals, tents and decor follow once you know the guest count and layout." },
  { q: "Does my caterer provide plates and glasses?", a: "Some do and some don't, and many charge separately. Ask for the caterer's equipment list in writing, then rent only what's missing. Common gaps are chargers, specialty glassware, linens and a prep tent for outdoor events." },
  { q: "Do I need a permit for a tent or a park event in Chicago?", a: "Often, yes. Chicago Park District special event permits and many suburban tent permits need to be filed 30 or more days ahead, and you or your tent company must call JULIE (811 in Illinois) before stakes go in. Check with your town or park district early." },
  { q: "How far ahead should I book event rentals?", a: "About 3-6 months for weddings and large parties, 4-8 weeks for smaller events, and earlier for tents and specialty chairs on May-October Saturdays and December Fridays." },
  { q: `Does ${site.name} recommend specific vendors?`, a: `This guide is generic on purpose. For rentals, ${site.name} books established Chicago-area rental companies for you through one quote. For other vendors, use the questions on this page to compare the ones you're considering.` },
];

export default function VendorGuidePage() {
  const timeline = [...roles].sort((a, b) => b.monthsOut - a.monthsOut);
  const maxM = 12;
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How to build your event vendor team",
          description,
          step: timeline.map((r, i) => ({ "@type": "HowToStep", position: i + 1, name: `Book the ${r.name.toLowerCase()}`, text: `${r.book} ${r.does}`, url: `${site.url}/vendor-guide#${r.id}` })),
        }}
      />
      <PageHero
        breadcrumbs={[{ name: "Vendor guide", href: "/vendor-guide" }]}
        eyebrow="Free planning guide"
        title="Who to hire for your event, and when."
        intro="Every vendor your event might need, in the order to book them, with the questions to ask and where each one overlaps with rentals so nothing gets missed or booked twice."
        actions={<><a href="#by-event" className="btn-primary">Find my vendor list</a><Link href="/my-events" className="btn-ghost">Track it in My Events</Link></>}
        media={<Figure src="/rentals/scenes/wedding-reception.webp" alt="Wedding reception with round tables, gold Chiavari chairs and candlelight" ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 45vw" caption="A big event can mean a dozen vendors arriving on one day." />}
      />

      <Section eyebrow="The booking timeline" title="Book in this order" intro="Typical months before the event to reserve each vendor for a peak-season date. Smaller and off-peak events can move faster.">
        <figure className="card overflow-x-auto p-6">
          <svg viewBox="0 0 900 470" role="img" aria-labelledby="vt-title vt-desc" className="w-full min-w-[640px]">
            <title id="vt-title">When to book each event vendor</title>
            <desc id="vt-desc">{timeline.map((r) => `${r.name}: about ${r.monthsOut} months before`).join(". ")}</desc>
            {[12, 9, 6, 3, 0].map((m) => {
              const x = 230 + ((maxM - m) / maxM) * 640;
              return (
                <g key={m}>
                  <line x1={x} y1={10} x2={x} y2={440} stroke="var(--line)" strokeDasharray="3 4" />
                  <text x={x} y={462} textAnchor="middle" fontSize="13" fill="var(--muted)">{m === 0 ? "Event" : `${m} mo`}</text>
                </g>
              );
            })}
            {timeline.map((r, i) => {
              const y = 22 + i * 30;
              const x = 230 + ((maxM - Math.min(r.monthsOut, maxM)) / maxM) * 640;
              return (
                <g key={r.id}>
                  <text x={220} y={y + 5} textAnchor="end" fontSize="14" fill="var(--ink)">{r.name.replace(/ or .*/, "")}</text>
                  <line x1={x} y1={y} x2={870} y2={y} stroke="var(--gold)" strokeOpacity="0.35" strokeWidth="8" strokeLinecap="round" />
                  <circle cx={x} cy={y} r="7" fill="var(--gold)" />
                </g>
              );
            })}
          </svg>
          <figcaption className="mt-3 text-sm text-muted">Dots show when to book; bars run to the event day.</figcaption>
        </figure>
      </Section>

      <Section id="by-event" tone="sand" eyebrow="By event" title="Your vendor list">
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <caption className="sr-only">Which vendors each kind of event needs: essential or often hired</caption>
            <thead className="border-b border-line">
              <tr>
                <th className="p-3 font-medium">Event</th>
                <th className="p-3 font-medium">Essential</th>
                <th className="p-3 font-medium text-muted">Often added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {occasions.map((o) => (
                <tr key={o.id} className="align-top">
                  <th className="p-3 font-heading text-lg font-medium">{o.name}</th>
                  <td className="p-3">
                    <ul className="flex flex-wrap gap-1.5">
                      {o.essential.map((id) => <li key={id}><a href={`#${id}`} className="chip chip-active">{roles.find((r) => r.id === id)!.name}</a></li>)}
                    </ul>
                  </td>
                  <td className="p-3">
                    <ul className="flex flex-wrap gap-1.5">
                      {o.often.map((id) => <li key={id}><a href={`#${id}`} className="chip">{roles.find((r) => r.id === id)!.name}</a></li>)}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section eyebrow="Every vendor" title="What they do, what to ask">
        <ul className="grid gap-5 md:grid-cols-2">
          {roles.map((r) => (
            <li key={r.id} id={r.id} className="card scroll-mt-24 p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-gold"><Icon name={r.icon} size={22} /></span>
                <h2 className="display-3">{r.name}</h2>
              </div>
              <p className="mt-3 leading-7 text-muted">{r.does}</p>
              <p className="mt-3 text-sm"><strong className="font-medium">When to book:</strong> {r.book}</p>
              <h3 className="mt-4 text-sm font-medium">Ask them</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                {r.ask.map((q) => <li key={q}>{q}</li>)}
              </ul>
              {r.overlap && <p className="well mt-4 p-3 text-sm leading-6"><strong className="font-medium">Rentals overlap:</strong> {r.overlap}</p>}
              {r.link && <Link href={r.link.href} className="link mt-3 inline-block text-sm">{r.link.label}</Link>}
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand" eyebrow="Questions" title="About hiring event vendors">
        <FaqList faqs={faqs} />
        <p className="mt-8 text-center text-sm text-muted">
          Keep going: <Link href="/my-events" className="link">My Events checklist</Link> · <Link href="/tools/event-weather" className="link">sunset and weather for your date</Link> · <Link href="/quote?from=vendor-guide" className="link">free rental quote</Link>
        </p>
      </Section>
    </>
  );
}
