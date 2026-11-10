import type { Metadata } from "next";
import Link from "@/components/Link";
import { ChairBrowser } from "@/components/ChairBrowser";
import { FaqList, Figure, Icon, PageHero, QuoteCta, Section, type Faq } from "@/components/ui";
import { LaunchOffer } from "@/components/LaunchOffer";
import { allStyles, type Style } from "@/data/chairs";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

const faqs: Faq[] = [
  {
    q: "What are the best alternatives to Chiavari chairs?",
    a: "Cross-back chairs for rustic and vineyard weddings, ghost chairs for modern or floral-heavy rooms, rattan for garden parties, velvet dining chairs for evening glamour and bentwood for a Parisian cafe feel. Each has its own page with photos, finishes and pricing.",
  },
  {
    q: "How much does chair rental cost in Chicago?",
    a: "Roughly $2.50 to $4 for a folding chair, $7 to $10 for Chiavari or cross-back, and $12 to $32 for specialty chairs like velvet, Louis or ghost, based on current Chicago-area market rates. Delivery, setup and teardown are added per order. Get your exact price in a free quote.",
  },
  {
    q: "Which chair style suits my venue?",
    a: `Barns and vineyards suit wood cross-back or Windsor; lofts and galleries suit ghost, shell or wishbone; ballrooms suit velvet, Louis or gold Chiavari. Our free ${site.callLength} call can match a chair to your exact venue.`,
  },
  {
    q: "Can I mix chair styles at one event?",
    a: "Yes. A popular plan is folding or garden chairs for the ceremony, a statement chair for the reception and something special for the head or sweetheart table.",
  },
  {
    q: "Do you deliver chairs across the Chicago suburbs?",
    a: `Yes, across Chicago and the suburbs including ${site.serviceArea.slice(1, 8).join(", ")} and nearby towns, with setup and pickup available.`,
  },
  {
    q: "What happens if a chair gets damaged or dirty during the event?",
    a: "A small damage waiver on your quote covers normal wear, a wine spill or a scuffed leg. We clean, repair and store every chair ourselves, so you never fold, stack or wipe one down after your event.",
  },
];

export const metadata: Metadata = seo({
  title: "Chair Styles for Rent in Chicago: Chiavari Alternatives for Every Event",
  description: `Browse cross-back, ghost, rattan, bentwood, velvet and more event and wedding chair styles for rent in Chicago and the suburbs, delivered and set up.`,
  alternates: { canonical: "/chairs" },
});

export default async function ChairsPage(props: PageProps<"/chairs">) {
  const { style } = await props.searchParams;
  const initialStyle = allStyles.includes(style as Style) ? (style as Style) : null;

  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Chair styles", href: "/chairs" }]}
        eyebrow="Chair style guide"
        title={<>Find your chair, <em className="text-gold">beyond</em> Chiavari</>}
        intro="Explore 13 event chair styles for rent in Chicago, from Chiavari alternatives like cross-back, ghost and rattan to velvet and throne chairs. Each style shows the events and venues it suits and how many fit at a table, then you can add it to one free quote."
        actions={
          <>
            <Link href="/rentals/chairs" className="btn-primary">
              Browse chairs <Icon name="arrow" size={16} />
            </Link>
            <Link href="/quiz" className="btn-ghost">Take the style quiz</Link>
          </>
        }
        media={<Figure {...scenes.chairDetail} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 45vw" />}
        meta={<LaunchOffer from="chairs" className="mt-0" />}
      />
      <div className="container-x section-y">
        <ChairBrowser initialStyle={initialStyle} />
      </div>
      <Section tone="sand">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow">Chair questions</p>
            <h2 className="display-2 mt-3">Choosing chairs in Chicago</h2>
            <p className="lede mt-4">Quick answers on styles, prices and delivery.</p>
            <p className="mt-4 text-sm text-muted">
              Chiavari is the most requested style. Read our full{" "}
              <Link href="/blog/chiavari-chair-rental-chicago" className="underline">
                Chiavari chair rental guide
              </Link>{" "}
              for finishes, pricing and what to check before you book.
            </p>
          </div>
          <FaqList faqs={faqs} />
        </div>
      </Section>
      <QuoteCta source="chairs" title="Found your chair? Price the whole table." />
    </>
  );
}
