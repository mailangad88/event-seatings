import type { Metadata } from "next";
import Link from "next/link";
import { ChairArt } from "@/components/ChairArt";
import { Reveal } from "@/components/Reveal";
import { Breadcrumbs } from "@/components/geo/Breadcrumbs";
import { CallButton, CallCta } from "@/components/geo/CallCta";
import { getChair } from "@/data/chairs";
import { eventPath, eventTypes } from "@/data/geo";

export const metadata: Metadata = {
  title: "Event Rentals for Every Occasion in Chicago",
  description:
    "Chairs, tables, linens, tents and more for weddings, quinceañeras, corporate events, graduations, galas and showers across Chicago and the suburbs, with prices upfront, delivery and setup.",
  alternates: { canonical: "/events" },
};

export default function EventsPage() {
  return (
    <>
      <div className="container-x pt-14">
        <Breadcrumbs items={[{ href: "/events", label: "Events" }]} />
        <section className="mt-10 max-w-4xl animate-rise">
          <p className="eyebrow">Every occasion</p>
          <h1 className="headline mt-6 text-5xl leading-[0.98] sm:text-7xl">
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
                  <h2 className="mt-5 font-serif text-3xl font-light">
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
      <CallCta heading={<>Whatever you&apos;re celebrating, let&apos;s seat it <em className="text-gold">well</em></>} />
    </>
  );
}
