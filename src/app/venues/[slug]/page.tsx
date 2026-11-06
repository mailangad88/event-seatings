import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/Link";
import { Figure, HubFaqs, Icon, PageHero, QuoteCta, Section, type Faq } from "@/components/ui";
import { formatPrice } from "@/components/ui/PriceTag";
import { deliveryNoteFor, getVenueGuide, venueKindLabel, venuePath, venues } from "@/data/venues";
import { getPackage } from "@/lib/packages";
import { PAYMENT_SCHEDULE } from "@/lib/catalog-types";
import { sceneFor } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return venues.map((v) => ({ slug: v.slug }));
}

export async function generateMetadata(props: PageProps<"/venues/[slug]">): Promise<Metadata> {
  const v = getVenueGuide((await props.params).slug);
  if (!v) return {};
  return seo({
    title: `Chair & Table Rentals for ${v.name} | ${site.market}`,
    description: `Planning an event at ${v.name} in ${v.neighborhoodOrCity}? See what to rent, delivery notes and ready-made packages with prices, all on one quote.`,
    alternates: { canonical: venuePath(v) },
  });
}

export default async function VenuePage(props: PageProps<"/venues/[slug]">) {
  const v = getVenueGuide((await props.params).slug);
  if (!v) notFound();

  const scene = sceneFor(v.slug);
  const packages = v.packageIds.map((id) => getPackage(id)).filter((p): p is NonNullable<typeof p> => !!p);
  const others = venues.filter((o) => o.kind === v.kind && o.slug !== v.slug).slice(0, 6);

  const faqs: Faq[] = [
    {
      q: `Does ${v.name} have its own tables and chairs?`,
      a: `We're not affiliated with ${v.name} and can't speak for the venue, but ${venueKindLabel[v.kind].toLowerCase()}s like this typically rent out the space itself, not furniture. Ask the venue directly what's included before you order rentals.`,
    },
    {
      q: "How do you price rentals for an event here?",
      a: "You see our own price for every chair, table and linen on the site, plus delivery, setup, a damage waiver and tax on one written quote. There's no separate booking fee, and we never charge a vendor markup you don't see.",
    },
    {
      q: "How does payment work?",
      a: `You book with ${PAYMENT_SCHEDULE.firstShare * 100}% down (refundable within 72 hours), then the rest in stages as your date gets closer. Full details are on the proposal we send you.`,
    },
    {
      q: "Can you work around the venue's delivery rules?",
      a: "Yes. Tell us your load-in window, door or elevator access and any rules the venue has given you, and we plan delivery and pickup around them.",
    },
  ];

  return (
    <>
      <PageHero
        breadcrumbs={[
          { name: "Venues", href: "/venues" },
          { name: v.name, href: venuePath(v) },
        ]}
        eyebrow={`${venueKindLabel[v.kind]} · ${v.neighborhoodOrCity}`}
        title={<>Rentals for an event at <em className="text-gold">{v.name}</em></>}
        intro={`${v.whyFit} This guide covers what to rent for a ${venueKindLabel[v.kind].toLowerCase()} like this, sized for ${v.capacityNote}, what it typically costs, and what to ask the venue about delivery and setup.`}
        actions={
          <>
            <Link href={`/quote?from=venue-${v.slug}`} className="btn-primary">
              Get a free quote <Icon name="arrow" size={16} />
            </Link>
            <Link href="/book?from=venue-page" className="link-line">Or talk it through first</Link>
          </>
        }
        media={<Figure src={scene.src} alt={scene.alt} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section tone="sand" eyebrow="No partnership" title="About this page">
        <p className="lede max-w-3xl">
          We are not affiliated with, endorsed by or paid by {v.name}. This page is an independent guide built from public
          information, meant to help you plan rentals if you book an event there. Confirm the venue&apos;s own rules, capacity
          and included furniture directly with {v.name} - not with us.
        </p>
      </Section>

      <Section eyebrow="What to plan for" title="What this kind of venue usually needs">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {v.needs.map((n) => (
            <li key={n} className="card flex items-center gap-3 p-5">
              <Icon name="check" size={18} className="text-gold" />
              <span className="font-medium">{n}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-10 grid gap-6 border-t border-gold/40 pt-8 sm:grid-cols-2">
          <div>
            <dt className="eyebrow">Typical capacity</dt>
            <dd className="mt-2 leading-7 text-muted">{v.capacityNote}. Confirm the current number with the venue - capacities change with layout and local rules.</dd>
          </div>
          <div>
            <dt className="eyebrow">Delivery &amp; setup</dt>
            <dd className="mt-2 leading-7 text-muted">{deliveryNoteFor(v)}</dd>
          </div>
        </dl>
        {v.specificNote && (
          <p className="mt-6 max-w-3xl border-t border-line pt-6 text-sm leading-7 text-muted">{v.specificNote}</p>
        )}
      </Section>

      {packages.length > 0 && (
        <Section tone="sand" eyebrow="Starting point" title="Ready-made packages sized for a space like this">
          <ul className="grid gap-6 md:grid-cols-2">
            {packages.map((p) => (
              <li key={p.id} className="card p-6">
                <p className="eyebrow">{p.settingName} · {p.guests} guests</p>
                <h3 className="display-3 mt-3">{p.name}</h3>
                <p className="mt-3 leading-7 text-muted">{p.blurb}</p>
                <p className="mt-5 text-2xl font-semibold text-ink">{formatPrice(p.allIn)} <span className="text-sm font-normal text-muted">all-in est.</span></p>
                <p className="text-sm text-muted">{formatPrice(p.perGuest)} per guest · {p.itemCount} items</p>
                <Link href={p.href} className="btn-ghost mt-5 inline-flex">
                  Start from this package <Icon name="arrow" size={14} />
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            Prices reprice to your exact guest count on the quote page. See every package on{" "}
            <Link href="/packages" className="link">/packages</Link> or browse <Link href="/rentals" className="link">every rental and its price</Link>.
          </p>
        </Section>
      )}

      <HubFaqs faqs={faqs} title={`Questions about renting for an event at ${v.name}`} />

      <QuoteCta title={`Get a quote for your event at ${v.name}`} source={`venue-${v.slug}`} />

      {others.length > 0 && (
        <section className="container-x section-y">
          <p className="eyebrow">More {venueKindLabel[v.kind].toLowerCase()}s</p>
          <ul className="mt-6 flex flex-wrap gap-3">
            {others.map((o) => (
              <li key={o.slug}>
                <Link href={venuePath(o)} className="chip transition-colors hover:border-gold hover:text-ink">
                  {o.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/venues" className="chip border-gold/60 text-gold hover:text-ink">
                All venue guides →
              </Link>
            </li>
          </ul>
        </section>
      )}
    </>
  );
}
