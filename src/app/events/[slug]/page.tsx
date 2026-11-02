import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChairArt } from "@/components/ChairArt";
import { Reveal } from "@/components/Reveal";
import { Breadcrumbs } from "@/components/geo/Breadcrumbs";
import { CallButton, CallCta } from "@/components/geo/CallCta";
import { Emphasis } from "@/components/geo/Emphasis";
import { FaqList } from "@/components/geo/FaqList";
import { JsonLd } from "@/components/geo/JsonLd";
import { RecommendedChairs } from "@/components/geo/RecommendedChairs";
import { getChair } from "@/data/chairs";
import { eventPath, eventTypes, getEventType, locationPath, locations } from "@/data/geo";
import { getPosts } from "@/lib/blog";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return eventTypes.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata(props: PageProps<"/events/[slug]">): Promise<Metadata> {
  const ev = getEventType((await props.params).slug);
  if (!ev) return {};
  const path = eventPath(ev);
  return {
    title: ev.metaTitle,
    description: ev.metaDescription,
    alternates: { canonical: path },
    openGraph: { title: `${ev.metaTitle} | ${site.name}`, description: ev.metaDescription, url: path },
  };
}

export default async function EventPage(props: PageProps<"/events/[slug]">) {
  const ev = getEventType((await props.params).slug);
  if (!ev) notFound();

  const heroChairs = ev.recommendedChairs.flatMap((r) => {
    const c = getChair(r.slug);
    return c ? [c] : [];
  });
  const posts = (await getPosts()).filter((p) => ev.relatedPosts.includes(p.slug)).slice(0, 3);
  const areas = locations.filter((l) => l.popularEvents.includes(ev.slug));
  const otherAreas = locations.filter((l) => !areas.includes(l));
  const others = eventTypes.filter((e) => e.slug !== ev.slug);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: ev.name,
          serviceType: `${ev.shortName} chair rental`,
          description: ev.metaDescription,
          url: `${site.url}${eventPath(ev)}`,
          provider: { "@type": "LocalBusiness", name: site.name, url: site.url, email: site.email },
          areaServed: [
            { "@type": "City", name: "Chicago, IL" },
            ...locations.filter((l) => l.kind === "suburb").map((l) => ({ "@type": "City", name: `${l.name}, IL` })),
          ],
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: `How to plan seating for ${ev.shortName.toLowerCase()}`,
          step: ev.checklist.map((s, i) => ({ "@type": "HowToStep", position: i + 1, text: s })),
        }}
      />
      <div className="container-x pt-14">
        <Breadcrumbs
          items={[
            { href: "/events", label: "Events" },
            { href: eventPath(ev), label: ev.shortName },
          ]}
        />

        <section className="mt-10 grid items-center gap-14 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="animate-rise">
            <p className="eyebrow">Chicago &amp; suburbs · {ev.shortName}</p>
            <h1 className="headline mt-6 text-5xl leading-[0.98] sm:text-7xl">
              <Emphasis text={ev.headline} />
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted">{ev.intro}</p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <CallButton />
              <Link href="/quote" className="link-line">
                Request a quote
              </Link>
            </div>
          </div>
          {/* Chair trio collage */}
          <div className="animate-rise relative grid grid-cols-2 gap-4 [animation-delay:200ms]">
            {heroChairs[0] && (
              <ChairArt chair={heroChairs[0]} priority className="row-span-2 aspect-[3/5] h-full" />
            )}
            {heroChairs.slice(1, 3).map((c) => (
              <ChairArt key={c.slug} chair={c} className="aspect-square" />
            ))}
            <span className="absolute -bottom-4 left-6 bg-bg px-3 font-serif text-sm text-gold italic">
              {heroChairs.map((c) => c.name.split(" ")[0]).join(" · ")}
            </span>
          </div>
        </section>

        {/* Seating math */}
        <section className="mt-28">
          <p className="eyebrow">Seating math</p>
          <dl className="mt-8 grid border-t border-gold/40 sm:grid-cols-2 lg:grid-cols-4">
            {ev.seatingMath.map((m, i) => (
              <Reveal key={m.label} delay={i * 90} className="border-b border-line py-8 sm:px-6 sm:first:pl-0 lg:not-last:border-r">
                <dt className="text-[11px] tracking-[0.2em] text-muted uppercase">{m.label}</dt>
                <dd className="headline mt-3 text-2xl leading-snug text-ink">{m.value}</dd>
              </Reveal>
            ))}
          </dl>
        </section>

        {/* Pain points */}
        <section className="mt-32">
          <p className="eyebrow">What usually goes wrong</p>
          <h2 className="headline mt-6 max-w-3xl text-5xl leading-[1.02] sm:text-6xl">
            The seating <em className="text-gold">headaches</em>, solved
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {ev.painPoints.map((p, i) => (
              <Reveal key={p.problem} delay={(i % 2) * 120}>
                <article className="h-full border border-line bg-surface p-8">
                  <p className="text-[11px] tracking-[0.2em] text-muted uppercase">The problem</p>
                  <h3 className="mt-3 font-serif text-2xl leading-snug">{p.problem}</h3>
                  <p className="mt-6 border-t border-gold/40 pt-5 text-[11px] tracking-[0.2em] text-gold uppercase">
                    How we help
                  </p>
                  <p className="mt-2 leading-7 text-muted">{p.solution}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <RecommendedChairs
          picks={ev.recommendedChairs}
          eyebrow="Our picks"
          heading={
            <>
              Chairs we&apos;d choose for <em className="text-gold">{ev.shortName.toLowerCase()}</em>
            </>
          }
        />

        <section className="mt-32 grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-20">
          <div>
            <p className="eyebrow">Planning notes</p>
            <div className="prose-post mt-8">
              {ev.story.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          <div className="md:pt-14">
            <h2 className="headline text-3xl">Your seating checklist</h2>
            <ol className="relative mt-6 border-l border-gold/40 pl-8">
              {ev.checklist.map((s, i) => (
                <li key={s} className="relative pb-6 last:pb-0">
                  <span className="absolute top-0.5 -left-[2.65rem] grid h-5 w-5 place-items-center rounded-full border border-gold bg-bg text-[10px] text-gold">
                    {i + 1}
                  </span>
                  <p className="leading-7">{s}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>

      {/* Areas */}
      <section className="paper mt-32">
        <div className="container-x py-24">
          <p className="eyebrow">Where we deliver</p>
          <h2 className="headline mt-6 text-5xl leading-[1.02]">
            {ev.shortName} across <em className="text-gold">Chicagoland</em>
          </h2>
          <ul className="mt-10 flex flex-wrap gap-3">
            {[...areas, ...otherAreas].map((l) => (
              <li key={l.slug}>
                <Link
                  href={locationPath(l)}
                  className={`chip transition-colors hover:border-gold hover:text-ink ${areas.includes(l) ? "border-gold/70 text-ink" : ""}`}
                >
                  {l.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container-x">
        {posts.length > 0 && (
          <section className="mt-32">
            <p className="eyebrow">From the journal</p>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {posts.map((p) => (
                <li key={p.slug}>
                  <Link href={`/blog/${p.slug}`} className="block h-full border border-line p-6 transition-colors hover:border-gold">
                    <h3 className="font-serif text-2xl leading-snug">{p.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">{p.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <FaqList
          faqs={ev.faqs}
          title={
            <>
              {ev.shortName} seating <em className="text-gold">questions</em>
            </>
          }
        />
      </div>

      <CallCta
        heading={
          <>
            Let&apos;s talk <em className="text-gold">{ev.shortName.toLowerCase()}</em> seating
          </>
        }
      />

      <section className="container-x mt-24">
        <p className="eyebrow">More occasions</p>
        <ul className="mt-6 flex flex-wrap gap-3">
          {others.map((e) => (
            <li key={e.slug}>
              <Link href={eventPath(e)} className="chip transition-colors hover:border-gold hover:text-ink">
                {e.shortName}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
