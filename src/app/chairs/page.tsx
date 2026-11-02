import type { Metadata } from "next";
import Link from "next/link";
import { ChairBrowser } from "@/components/ChairBrowser";
import { Figure, Icon, PageHero, QuoteCta } from "@/components/ui";
import { allStyles, type Style } from "@/data/chairs";
import { scenes } from "@/lib/scenes";

export const metadata: Metadata = {
  title: "Chair Styles for Rent in Chicago: Chiavari Alternatives for Every Event",
  description: `Browse cross-back, ghost, rattan, bentwood, velvet and more event and wedding chair styles for rent in Chicago and the suburbs, delivered and set up.`,
  alternates: { canonical: "/chairs" },
};

export default async function ChairsPage(props: PageProps<"/chairs">) {
  const { style } = await props.searchParams;
  const initialStyle = allStyles.includes(style as Style) ? (style as Style) : null;

  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "Chair styles", href: "/chairs" }]}
        eyebrow="Chair style guide"
        title={<>Find your chair, <em className="text-gold">beyond</em> Chiavari</>}
        intro="Explore 13 chair styles in 3D by aesthetic and occasion, save the ones you love, then see live prices in the rentals catalog."
        actions={
          <>
            <Link href="/rentals/chairs" className="btn-primary">
              See chair prices <Icon name="arrow" size={16} />
            </Link>
            <Link href="/quiz" className="btn-ghost">Take the style quiz</Link>
          </>
        }
        media={<Figure {...scenes.chairDetail} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 45vw" />}
      />
      <div className="container-x section-y">
        <ChairBrowser initialStyle={initialStyle} />
      </div>
      <QuoteCta source="chairs" title="Found your chair? Price the whole table." />
    </>
  );
}
