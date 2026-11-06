import Image from "next/image";
import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { AreaMap } from "@/components/geo/AreaMap";
import { Breadcrumbs, FaqList, Figure, IconCards, JsonLd, LinkCards, PriceDisclaimer, QuoteCta, Section } from "@/components/ui";
import { LaunchOffer } from "@/components/LaunchOffer";
import { iconFor } from "@/lib/icon-for";
import { catalogItems, categories, customerPrice, formatPrice } from "@/data/catalog";
import { getEventType, getLocation, locationPath, eventPath } from "@/data/geo";
import { LOCAL_RENTALS_UPDATED, areaRentalsPath, localAreas, localCategories, localCategoryPath, settingKind, costPath } from "@/data/local-rentals";
import { render } from "@/lib/scenes";
import { seo } from "@/lib/seo";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return localAreas.map((l) => ({ area: l.slug }));
}

type Props = { params: Promise<{ area: string }> };

const fromPrice = (id: string) => Math.min(...catalogItems.filter((i) => i.categoryId === id).map(customerPrice));
const count = (id: string) => catalogItems.filter((i) => i.categoryId === id).length;

// What each kind of setting usually needs, so the area hub can say what to rent for its own venues.
const kitFor: Record<ReturnType<typeof settingKind>, string> = {
  backyard: "a tent or canopy, tables and chairs, linens, string lights and, after dark in spring or fall, patio heaters",
  park: "tables, chairs and a canopy if the permit allows, plus a generator or battery lighting where there is no power",
  barn: "farm tables, wood chairs, string lights and a dance floor, since barn boards and gravel are rarely level",
  hall: "linens, upgraded chairs and uplighting, which change a plain hall more than anything else",
  venue: "only what the venue does not include: often chairs, linens, chargers, lounge pieces or a dance floor",
  rooftop: "light folding furniture, wind-rated heaters and weighted umbrellas, since stakes and heavy pieces are rarely allowed",
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const loc = getLocation((await props.params).area);
  if (!loc) return {};
  const place = loc.kind === "neighborhood" ? `${loc.name}, Chicago` : `${loc.name}, IL`;
  const path = areaRentalsPath(loc.slug);
  const title = `Party & Event Rentals in ${place}: Tents, Tables, Linens`;
  const description = `Party rentals in ${place}: tents, tables, chairs, linens, dance floors, bounce houses and more, with prices up front and one free quote for delivery and setup.`;
  return seo({
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: path, images: [{ url: render("hero-celebrations").src, alt: render("hero-celebrations").alt }] },
    other: { "geo.region": "US-IL", "geo.placename": loc.name, "geo.position": `${loc.lat};${loc.lng}`, ICBM: `${loc.lat}, ${loc.lng}` },
  });
}

export default async function AreaRentalsPage(props: Props) {
  const loc = getLocation((await props.params).area);
  if (!loc) notFound();
  const place = loc.kind === "neighborhood" ? `${loc.name}, Chicago` : `${loc.name}, IL`;
  const path = areaRentalsPath(loc.slug);
  const scene = render("hero-celebrations");
  const total = catalogItems.length;
  const events = loc.popularEvents.flatMap((s) => getEventType(s) ?? []);
  const nearby = loc.nearby.flatMap((s) => localAreas.find((l) => l.slug === s) ?? []);
  const kinds = [...new Set(loc.settings.map((s) => settingKind(s.name)))];

  const answer = `${site.name} rents party and event equipment in ${place}: tents, tables, chairs, linens, dinnerware, dance floors, lighting, heaters, bounce houses and more, ${total.toLocaleString()} items in all. Prices are shown up front, and one free itemized quote covers delivery, setup and pickup in ${loc.name}.`;

  const faqs = [
    {
      q: `Where can I rent party equipment in ${loc.name}?`,
      a: `Build a quote on ${site.name} with everything you need, from tents and tables to linens and bounce houses. We confirm availability for your date in ${place}, then send one itemized proposal with delivery and setup included.`,
    },
    {
      q: `How much do party rentals cost in ${loc.name}?`,
      a: `It depends on the items. Tables start at ${formatPrice(fromPrice("tables"))}, linens at ${formatPrice(fromPrice("linens"))} and tents at ${formatPrice(fromPrice("tents"))} per item through ${site.name}. Delivery, usually $150 to $400 per order, setup, a damage waiver and tax are added on the quote.`,
    },
    {
      q: `Can I get tents, tables and chairs on one order in ${loc.name}?`,
      a: `Yes. Add every category to one quote and we coordinate the partners, so you get one proposal, one delivery window and one contact for your ${loc.name} event.`,
    },
    ...loc.faqs.filter((f) => !/chair/i.test(f.q)).slice(0, 2),
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: `Party and event rentals in ${place}`,
          serviceType: "Party and event rental, delivery and setup",
          description: answer,
          url: `${site.url}${path}`,
          provider: { "@type": "LocalBusiness", "@id": `${site.url}/#business`, name: site.name, url: site.url },
          areaServed: { "@type": loc.kind === "neighborhood" ? "Place" : "City", name: place, geo: { "@type": "GeoCoordinates", latitude: loc.lat, longitude: loc.lng } },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: `Rentals in ${loc.name}`,
            itemListElement: categories.map((c) => ({
              "@type": "OfferCatalog",
              name: c.name,
              url: `${site.url}/rentals/${c.id}`,
            })),
          },
          image: { "@type": "ImageObject", contentUrl: `${site.url}${scene.src}`, caption: scene.alt },
          dateModified: LOCAL_RENTALS_UPDATED,
        }}
      />
      <header className="tone-sand border-b border-line">
        <div className="container-x pt-8 pb-14 md:pt-10 md:pb-20">
          <Breadcrumbs className="mb-8 md:mb-12" items={[{ name: "Party rentals by area", href: "/party-rentals" }, { name: loc.name, href: path }]} />
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div>
              <p className="eyebrow">{loc.region} · Party rentals</p>
              <h1 className="display-1 mt-4">
                Party rentals in <em className="text-gold">{loc.name}</em>
              </h1>
              <p className="lede mt-6 max-w-2xl" data-answer>{answer}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/quote?from=area-${loc.slug}`} className="btn-primary">Build my quote</Link>
                <Link href={locationPath(loc)} className="btn-ghost">Chairs in {loc.name}</Link>
              </div>
              <LaunchOffer from={`area-${loc.slug}`} />
            </div>
            <Figure caption={`${loc.name} on our Chicagoland delivery map${loc.zips.length ? `, ZIP ${loc.zips.slice(0, 5).join(", ")}` : ""}.`}>
              <AreaMap active={loc} />
            </Figure>
          </div>
        </div>
      </header>

      <Section eyebrow={`Rent in ${loc.name}`} title="Choose what you need">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {localCategories.map((c) => {
            const s = render(c.scene);
            return (
              <li key={c.slug} className="card card-hover group relative overflow-hidden">
                <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
                  <Image src={s.src} alt={`${s.alt} (${c.label.toLowerCase()} in ${loc.name})`} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <h2 className="display-3">
                    <Link href={localCategoryPath(loc.slug, c)} className="after:absolute after:inset-0">{c.label}</Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    {count(c.id)} options from {formatPrice(fromPrice(c.id))}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-8 text-sm text-muted">
          Also available: {categories.filter((c) => !localCategories.some((l) => l.id === c.id)).map((c, i, a) => (
            <span key={c.id}>
              <Link href={`/rentals/${c.id}`} className="link-line">{c.name.toLowerCase()}</Link>
              {i < a.length - 1 ? ", " : "."}
            </span>
          ))}
        </p>
        <PriceDisclaimer className="mt-6" />
      </Section>

      <Section tone="sand" eyebrow={`Celebrating in ${loc.name}`} title={`What ${loc.name} venues usually need`}>
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="leading-7 text-muted">{loc.story[0]}</p>
            <IconCards
              className="mt-6"
              columns={1}
              items={kinds.map((k) => {
                const list = loc.settings.filter((s) => settingKind(s.name) === k);
                return { title: list.map((s) => s.name).join(" and "), text: <>Plan {kitFor[k]}.</> };
              })}
            />
          </div>
          <Figure src={scene.src} alt={`${scene.alt}, the kind of setup we arrange in ${loc.name}`} caption={scene.caption} ratio="4/5" sizes="(max-width: 1024px) 100vw, 35vw" />
        </div>
      </Section>

      {events.length > 0 && (
        <Section eyebrow={`Popular in ${loc.name}`} title="Plan by occasion">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {events.map((e) => (
              <li key={e.slug} className="card p-5">
                <h3 className="font-heading font-semibold text-xl">
                  <Link href={eventPath(e)} className="link-line">{e.shortName}</Link>
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-muted">{e.intro}</p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section tone="sand" eyebrow="Costs" title="What rentals cost">
        <LinkCards
          compact
          items={localCategories.map((c) => ({ href: costPath(c.id), label: `How much ${c.label.toLowerCase()} cost`, icon: iconFor(c.label, "wallet") }))}
        />
      </Section>

      <Section eyebrow="FAQ" title={`Party rentals in ${loc.name}: questions`}>
        <div className="mx-auto max-w-3xl">
          <FaqList faqs={faqs} />
        </div>
      </Section>

      {nearby.length > 0 && (
        <Section tone="sand" title="Nearby areas">
          <ul className="flex flex-wrap gap-2">
            {nearby.map((n) => (
              <li key={n.slug}>
                <Link href={areaRentalsPath(n.slug)} className="chip transition-colors hover:border-gold hover:text-gold">Party rentals in {n.name}</Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <QuoteCta source={`area-${loc.slug}`} title={<>Everything for your {loc.name} event, one quote</>} />
    </>
  );
}
