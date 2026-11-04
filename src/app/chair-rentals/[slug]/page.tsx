import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChairArt } from "@/components/ChairArt";
import { DecoFrame } from "@/components/DecoFrame";
import { Reveal } from "@/components/Reveal";
import { AreaMap } from "@/components/geo/AreaMap";
import { Breadcrumbs } from "@/components/geo/Breadcrumbs";
import { CallButton, CallCta } from "@/components/geo/CallCta";
import { Emphasis } from "@/components/geo/Emphasis";
import { FaqList } from "@/components/geo/FaqList";
import { JsonLd } from "@/components/geo/JsonLd";
import { RecommendedChairs } from "@/components/geo/RecommendedChairs";
import { chairs, getChair } from "@/data/chairs";
import {
  countyOf,
  eventPath,
  getEventType,
  getLocation,
  homeBase,
  locationPath,
  locations,
  milesFrom,
  placesInCounty,
} from "@/data/geo";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return locations.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata(props: PageProps<"/chair-rentals/[slug]">): Promise<Metadata> {
  const loc = getLocation((await props.params).slug);
  if (!loc) return {};
  const path = locationPath(loc);
  return seo({
    title: loc.metaTitle,
    description: loc.metaDescription,
    alternates: { canonical: path },
    openGraph: { title: `${loc.metaTitle} | ${site.name}`, description: loc.metaDescription, url: path },
    other: { "geo.region": "US-IL", "geo.placename": loc.name, "geo.position": `${loc.lat};${loc.lng}`, ICBM: `${loc.lat}, ${loc.lng}` },
  });
}

const numerals = ["I", "II", "III", "IV", "V", "VI"];

export default async function LocationPage(props: PageProps<"/chair-rentals/[slug]">) {
  const loc = getLocation((await props.params).slug);
  if (!loc) notFound();

  const miles = milesFrom(homeBase, loc);
  const events = loc.popularEvents.flatMap((s) => {
    const e = getEventType(s);
    return e ? [e] : [];
  });
  const nearby = loc.nearby.flatMap((s) => {
    const l = getLocation(s);
    return l ? [l] : [];
  });
  const countyName = countyOf(loc);
  const countyPage = loc.kind !== "county" ? locations.find((l) => l.kind === "county" && l.name === countyName) : undefined;
  const crumbs = [{ href: "/chair-rentals", label: "Areas we serve" }];
  if (countyPage) crumbs.push({ href: locationPath(countyPage), label: countyPage.name });
  if (loc.kind === "neighborhood") crumbs.push({ href: "/chair-rentals/chicago", label: "Chicago" });
  crumbs.push({ href: locationPath(loc), label: loc.name });

  // County pages list every town we cover inside them; town pages link a few more in the same county.
  const inCounty = loc.kind === "county" ? placesInCounty(loc).sort((a, b) => a.name.localeCompare(b.name)) : [];
  const sameCounty =
    loc.kind !== "county" && countyName
      ? locations
          .filter((l) => l.kind !== "county" && l.slug !== loc.slug && countyOf(l) === countyName && !loc.nearby.includes(l.slug))
          .sort((a, b) => milesFrom(loc, a) - milesFrom(loc, b))
          .slice(0, 8)
      : [];

  const place = loc.kind === "neighborhood" ? `${loc.name}, Chicago` : `${loc.name}, IL`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Event chair rentals in ${place}`,
          serviceType: "Event chair rental, delivery and setup",
          description: loc.metaDescription,
          url: `${site.url}${locationPath(loc)}`,
          provider: { "@id": `${site.url}/#business` },
          areaServed: {
            "@type": loc.kind === "neighborhood" ? "Place" : loc.kind === "county" ? "AdministrativeArea" : "City",
            name: place,
            geo: { "@type": "GeoCoordinates", latitude: loc.lat, longitude: loc.lng },
            ...(loc.zips.length ? { postalCode: loc.zips.join(", ") } : {}),
          },
          offers: loc.recommendedChairs.flatMap((r) => {
            const c = getChair(r.slug);
            return c ? [{ "@type": "Offer", name: `${c.name} rental`, description: `Estimated ${c.estPrice} per chair` }] : [];
          }),
        }}
      />
      <div className="container-x pt-14">
        <Breadcrumbs items={crumbs} />

        {/* Hero */}
        <section className="mt-10 grid items-center gap-14 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div className="animate-rise">
            <p className="eyebrow">
              {loc.region} · Chair rentals
            </p>
            <h1 className="display-1 mt-6">
              <Emphasis text={loc.headline} />
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-muted">{loc.intro}</p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link href="/quote?from=local-page" className="btn-primary">
                Get a free quote
              </Link>
              <CallButton label="Or book a free call" className="link-line" />
            </div>
            <dl className="mt-12 grid grid-cols-3 border-y border-line text-center">
              {[
                [loc.slug === "st-charles" ? "Home" : `~${miles} mi`, "from our base"],
                [String(chairs.length), "chair styles"],
                ["Full", "delivery & setup"],
              ].map(([v, k]) => (
                <div key={k} className="border-line py-5 not-last:border-r">
                  <dt className="sr-only">{k}</dt>
                  <dd>
                    <span className="headline block text-3xl text-gold">{v}</span>
                    <span className="mt-1 block text-xs tracking-[0.2em] text-muted uppercase">{k}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="animate-rise [animation-delay:200ms]">
            <DecoFrame label={loc.kind === "city" ? "Chicagoland" : loc.name}>
              <AreaMap active={loc} />
            </DecoFrame>
            {loc.zips.length > 0 && (
              <p className="mt-4 text-center text-xs tracking-[0.2em] text-muted uppercase">
                Serving ZIP {loc.zips.join(" · ")}
              </p>
            )}
          </div>
        </section>

        <RecommendedChairs
          picks={loc.recommendedChairs}
          eyebrow={`Chosen for ${loc.name}`}
          heading={
            <>
              Three chairs that suit <em className="text-gold">{loc.name}</em>
            </>
          }
        />

        {/* Story + settings */}
        <section className="mt-32 grid gap-14 md:grid-cols-[1.4fr_1fr] md:gap-20">
          <div>
            <p className="eyebrow">Celebrating in {loc.name}</p>
            <div className="prose-post mt-8">
              {loc.story.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
          </div>
          <div className="md:pt-14">
            <h2 className="display-2">Where people celebrate</h2>
            <ul className="mt-6 border-t border-gold/40">
              {loc.settings.map((s, i) => (
                <li key={s.name} className="grid grid-cols-[2.5rem_1fr] border-b border-line py-5">
                  <span className="font-heading font-semibold text-lg text-gold">{numerals[i]}.</span>
                  <div>
                    <h3 className="font-heading font-semibold text-xl">{s.name}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{s.note}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Logistics on marble */}
      <section className="paper mt-32">
        <div className="container-x grid gap-14 py-24 md:grid-cols-[1fr_1.4fr] md:gap-20">
          <div>
            <p className="eyebrow">Delivery notes</p>
            <h2 className="display-2 mt-6">
              Know before we <em className="text-gold">arrive</em>
            </h2>
            <p className="mt-6 leading-7 text-muted">
              Every {loc.name} venue is a little different. These are the things we ask about on a planning call so
              chairs are placed and ready before your first guest walks in.
            </p>
          </div>
          <ol className="grid gap-6 sm:grid-cols-2">
            {loc.logistics.map((t, i) => (
              <Reveal key={t.slice(0, 24)} delay={i * 90}>
                <li className="h-full border border-line bg-surface p-6">
                  <span className="font-heading font-semibold text-3xl text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-3 leading-7">{t}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <div className="container-x">
        {events.length > 0 && (
          <section className="mt-32">
            <p className="eyebrow">Popular in {loc.name}</p>
            <h2 className="display-2 mt-6">
              Seating for every <em className="text-gold">occasion</em>
            </h2>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {events.map((e) => {
                const chair = getChair(e.recommendedChairs[0]?.slug ?? "");
                return (
                  <Link key={e.slug} href={eventPath(e)} className="group relative block overflow-hidden border border-line">
                    {chair && (
                      <ChairArt chair={chair} className="aspect-[4/3] transition-transform duration-[1.2s] group-hover:scale-[1.05]" />
                    )}
                    <div className="p-5">
                      <h3 className="display-3">{e.shortName}</h3>
                      <p className="mt-1 text-xs tracking-[0.2em] text-gold uppercase">
                        {e.shortName} in {loc.name} →
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <FaqList
          faqs={loc.faqs}
          title={
            <>
              Renting chairs in <em className="text-gold">{loc.name}</em>
            </>
          }
        />
      </div>

      <CallCta
        place={loc.name}
        heading={
          <>
            Planning something in <em className="text-gold">{loc.name}</em>?
          </>
        }
      />

      {inCounty.length > 0 && (
        <section className="container-x mt-24">
          <p className="eyebrow">Towns we cover in {loc.name}</p>
          <h2 className="display-2 mt-4">
            {inCounty.length} local guides in <em className="text-gold">{loc.name}</em>
          </h2>
          <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
            {inCounty.map((n) => (
              <li key={n.slug}>
                <Link href={locationPath(n)} className="link-line text-sm">
                  {n.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {nearby.length > 0 && (
        <section className="container-x mt-24">
          <p className="eyebrow">Nearby</p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {nearby.map((n) => (
              <li key={n.slug}>
                <Link href={locationPath(n)} className="chip transition-colors hover:border-gold hover:text-ink">
                  Chair rentals in {n.name}
                </Link>
              </li>
            ))}
            {sameCounty.map((n) => (
              <li key={n.slug}>
                <Link href={locationPath(n)} className="chip transition-colors hover:border-gold hover:text-ink">
                  {n.name}
                </Link>
              </li>
            ))}
            {countyPage && (
              <li>
                <Link href={locationPath(countyPage)} className="chip transition-colors hover:border-gold hover:text-ink">
                  All of {countyPage.name}
                </Link>
              </li>
            )}
            <li>
              <Link href="/chair-rentals" className="chip border-gold/60 text-gold hover:text-ink">
                All areas
              </Link>
            </li>
          </ul>
        </section>
      )}
    </>
  );
}
