import type { Metadata } from "next";
import Link from "@/components/Link";
import { CallForm } from "@/components/CallForm";
import { Figure } from "@/components/ui";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: `Book a Free Event Planning Call | Event Rentals in ${site.market}`,
  description: `Book a free ${site.callLength} call with ${site.name}. Get rental recommendations, quantities and an honest estimate for your wedding, corporate event or party in Chicago and the suburbs.`,
  alternates: { canonical: "/book" },
});

const agenda: [string, string][] = [
  ["Your room", "Venue, layout and guest count, so we can recommend the right chairs, tables and linens and how many you actually need."],
  ["Your look", "Styles that suit your palette and season, from ceremony chairs to tablescapes, lighting and tents."],
  ["Your budget", "An honest estimate for everything on your list, with delivery, setup and pickup itemized. No surprises later."],
];

const faqs: [string, string][] = [
  ["Is the call really free?", "Yes. There's no cost and no obligation. Most calls take about fifteen minutes."],
  ["Do I need to know my guest count?", "No. A rough range is plenty. We'll help you plan for late RSVPs and vendor seating."],
  ["Can my planner join?", "Of course. Planners, venue coordinators and family are all welcome on the call."],
];

export default async function BookPage(props: PageProps<"/book">) {
  const { from } = await props.searchParams;
  const source = typeof from === "string" && /^[a-z0-9-]{1,80}$/.test(from) ? `book-page:${from}` : "book-page";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  };

  return (
    <div className="container-x py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="grid gap-14 md:grid-cols-[1.1fr_1fr] md:items-end">
        <div>
          <p className="eyebrow">Free {site.callLength} planning call</p>
          <h1 className="display-1 mt-6">
            Let&apos;s plan your <em className="text-gold">event</em>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
            Planning a wedding, corporate event or party in Chicago or the suburbs? In {site.callLength.replace("-", " ")}s
            we&apos;ll recommend rentals for your venue, tell you how much you need, and give you an honest estimate.
          </p>
        </div>
        <Figure {...scenes.blushGarden} ratio="4/3" priority sizes="(max-width: 768px) 100vw, 45vw" />
      </div>

      <ol className="mt-16 grid gap-5 md:grid-cols-3">
        {agenda.map(([t, d], i) => (
          <li key={t} className="well p-6">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-surface font-heading font-semibold text-xl text-gold shadow-soft">{i + 1}</span>
            <h2 className="mt-4 text-lg font-medium">{t}</h2>
            <p className="mt-3 leading-7 text-muted">{d}</p>
          </li>
        ))}
      </ol>


      <section className="mt-24 grid gap-14 md:grid-cols-[1.6fr_1fr]">
        <div className="card p-6 sm:p-10">
          {site.bookingUrl ? (
            <>
              <h2 className="display-2">Pick a time</h2>
              <p className="mt-3 text-muted">Choose any open slot. You&apos;ll get a calendar invite right away.</p>
              <iframe
                src={site.bookingUrl}
                title={`Book a call with ${site.name}`}
                className="mt-8 h-[720px] w-full border-0 bg-white"
                loading="lazy"
              />
              <p className="mt-4 text-sm text-muted">
                Calendar not loading?{" "}
                <a href={site.bookingUrl} className="underline decoration-gold underline-offset-4" target="_blank" rel="noopener">
                  Open it in a new tab
                </a>
                .
              </p>
            </>
          ) : (
            <>
              <h2 className="display-2">Request your call</h2>
              <p className="mt-3 mb-10 text-muted">Tell us when suits you and we&apos;ll call within one business day.</p>
              <CallForm source={source} />
            </>
          )}
        </div>
        <aside>
          <p className="eyebrow">Good to know</p>
          <dl className="mt-6 border-t border-line">
            {faqs.map(([q, a]) => (
              <div key={q} className="border-b border-line py-5">
                <dt className="font-medium">{q}</dt>
                <dd className="mt-2 leading-7 text-muted">{a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-8 text-sm leading-7 text-muted">
            Prefer writing? <Link href="/quote" className="underline decoration-gold underline-offset-4">Request a written quote</Link>{" "}
            or email <a href={`mailto:${site.email}`} className="underline decoration-gold underline-offset-4">{site.email}</a>.
          </p>
        </aside>
      </section>
    </div>
  );
}
