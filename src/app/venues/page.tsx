import type { Metadata } from "next";
import Link from "@/components/Link";
import { Figure, HubFaqs, Icon, PageHero, Section, type Faq } from "@/components/ui";
import { venueKindLabel, venuePath, venues, type VenueKind } from "@/data/venues";
import { sceneFor } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: `Chicago Venue Guides: What to Rent for Your Space`,
  description:
    "Booking a hall, museum, taproom or fieldhouse in Chicago that doesn't come with tables and chairs? See what each kind of venue usually needs and get one quote for all of it.",
  alternates: { canonical: "/venues" },
});

const kindOrder: VenueKind[] = [
  "banquet-hall",
  "vfw-legion",
  "fieldhouse-cultural-center",
  "museum-institution",
  "garden-conservatory",
  "barn",
  "brewery-distillery",
];

const kindIcon: Record<VenueKind, "home" | "shield" | "pin" | "camera" | "spark" | "sun" | "chafer"> = {
  "banquet-hall": "home",
  "vfw-legion": "shield",
  "fieldhouse-cultural-center": "pin",
  "museum-institution": "camera",
  "garden-conservatory": "spark",
  barn: "sun",
  "brewery-distillery": "chafer",
};

const faqs: Faq[] = [
  {
    q: "Are you affiliated with these venues?",
    a: "No. We don't partner with, represent or get paid by any venue on this list. These are public venues around Chicago that rent out space, and the pages here are about what you'd typically need to rent if your event is held there.",
  },
  {
    q: "Why does a nice venue need outside rentals at all?",
    a: "Plenty of Chicago venues rent out the room or the land, not the furniture. Church and community halls, museum event spaces, park district buildings, barns and breweries usually expect you to bring in your own chairs, tables and linens, or to hire a company that does.",
  },
  {
    q: "Will you handle the venue's rules for me?",
    a: "Send us your venue's load-in window, door or elevator sizes and any delivery rules you already have, and we plan around them. Always confirm those rules with the venue directly first, since we don't manage the venue itself.",
  },
  {
    q: "What if my venue isn't listed here?",
    a: "Start a quote and tell us the venue, guest count and date. We price the same way for any Chicago-area venue, listed here or not.",
  },
];

export default function VenuesHubPage() {
  const scene = sceneFor("venues-hub");
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Venues", href: "/venues" }]}
        eyebrow="Venue guides"
        title={<>Know what your <em className="text-gold">venue</em> needs before you book rentals</>}
        intro="Some Chicago venues come with their own tables and chairs. A lot don't. These guides cover popular halls, museums, fieldhouses, barns and taprooms around the city and what people usually rent to use them."
        actions={
          <>
            <Link href="/quote?from=venues-hub" className="btn-primary">
              Start a quote <Icon name="arrow" size={16} />
            </Link>
            <Link href="/venues-and-planners" className="link-line">Work at a venue? Send us your clients</Link>
          </>
        }
        media={<Figure src={scene.src} alt={scene.alt} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section eyebrow="Not a partnership" title="What this page is - and isn't" tone="sand">
        <p className="lede max-w-3xl">
          We are not affiliated with, endorsed by or paid by any venue listed below. These are independent guides built from
          public information about each place, written to answer one question: if your event is here, what will you likely
          need to rent? Always confirm a venue&apos;s own rules, hours and access with the venue itself.
        </p>
      </Section>

      {kindOrder.map((kind) => {
        const list = venues.filter((v) => v.kind === kind);
        if (!list.length) return null;
        return (
          <Section key={kind} eyebrow={venueKindLabel[kind]} title={venueKindLabel[kind] + "s around Chicago"}>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((v) => (
                <li key={v.slug}>
                  <Link href={venuePath(v)} className="card card-hover flex h-full flex-col gap-3 p-5">
                    <Icon name={kindIcon[kind]} size={22} className="text-gold" />
                    <span className="display-3">{v.name}</span>
                    <span className="text-sm text-muted">{v.neighborhoodOrCity}</span>
                    <span className="mt-auto inline-flex items-center gap-1 text-sm text-accent">
                      See what it needs <Icon name="arrow" size={14} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
        );
      })}

      <Section tone="sand" eyebrow="Any venue" title="Not seeing your venue?">
        <p className="lede max-w-2xl">
          We price the same way for any venue in {site.marketLong}: chairs, tables, linens and everything else at the prices on
          our site, with delivery and setup planned around your load-in. <Link href="/quote?from=venues-hub-any" className="link">Start a quote</Link>{" "}
          or see <Link href="/venues-and-planners" className="link">how we work with venues and planners</Link>.
        </p>
      </Section>

      <HubFaqs faqs={faqs} title="Questions about booking rentals for a venue" />
    </>
  );
}
