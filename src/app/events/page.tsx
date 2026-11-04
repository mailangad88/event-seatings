import type { Metadata } from "next";
import Link from "@/components/Link";
import { ChairArt } from "@/components/ChairArt";
import { Reveal } from "@/components/Reveal";
import { Breadcrumbs } from "@/components/geo/Breadcrumbs";
import { CallButton, CallCta } from "@/components/geo/CallCta";
import { getChair } from "@/data/chairs";
import { eventPath, eventTypes } from "@/data/geo";
import { HubFaqs } from "@/components/ui";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Event Rentals for Every Occasion in Chicago",
  description:
    "Chairs, tables, linens, tents and more for weddings, quinceañeras, corporate events, graduations, galas and showers across Chicago and the suburbs, with prices upfront, delivery and setup.",
  alternates: { canonical: "/events" },
});

export default function EventsPage() {
  return (
    <>
      <div className="container-x pt-14">
        <Breadcrumbs items={[{ href: "/events", label: "Events" }]} />
        <section className="mt-10 max-w-4xl animate-rise">
          <p className="eyebrow">Every occasion</p>
          <h1 className="display-1 mt-6">
            The right chair for <em className="text-gold">every</em> celebration
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-8 text-muted">
            Weddings and quinceañeras, boardroom offsites and backyard graduations: each one asks something different
            of its seating. Pick your occasion for chair counts, planning checklists and the styles we&apos;d choose.
          </p>
          <div className="mt-10">
            <CallButton />
          </div>
        </section>
        <div className="mt-20 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((e, i) => {
            const chair = getChair(e.recommendedChairs[0]?.slug ?? "");
            return (
              <Reveal key={e.slug} delay={(i % 3) * 110}>
                <article className="group relative">
                  {chair && (
                    <ChairArt chair={chair} className="aspect-[4/3] transition-transform duration-[1.2s] group-hover:scale-[1.04]" />
                  )}
                  <h2 className="display-2 mt-5">
                    <Link href={eventPath(e)} className="after:absolute after:inset-0">
                      {e.shortName}
                    </Link>
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{e.intro}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
      <HubFaqs
        faqs={[
          { q: "What rentals do I need for an event in Chicago?", a: "Most events need seating, tables and linens; sit-down meals add dinnerware, flatware and glassware; outdoor events often add a tent, lighting, heaters and a dance floor. Each event page lists the usual quantities for that occasion." },
          { q: "How many chairs do I need per guest?", a: "One chair per seated guest plus 3 to 5% spares. If the ceremony and reception run in different spaces at the same time, you need two sets, or a flip fee to move one set during cocktail hour." },
          { q: "Can I get everything on one quote?", a: "Yes. Pick chairs, tables, linens, tableware, tents and extras in the quote builder and send one request. We confirm each item with partner rental companies and send one itemized proposal." },
          { q: "How much do event rentals cost for 100 guests?", a: "It depends on the style. A basic setup of folding chairs, banquet tables and linens can start around a few hundred dollars plus delivery, while Chiavari chairs, specialty linens and full tableware for 100 guests usually run into the low thousands. The quote builder shows a live total." },
        ]}
        title="Planning rentals for your event"
      />
      <CallCta heading={<>Whatever you&apos;re celebrating, let&apos;s seat it <em className="text-gold">well</em></>} />
    </>
  );
}
