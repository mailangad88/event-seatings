import type { Metadata } from "next";
import { ChairBrowser } from "@/components/ChairBrowser";
import { allStyles, type Style } from "@/data/chairs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Chair Rentals in Chicago: Chiavari Alternatives for Every Event",
  description: `Browse cross-back, ghost, rattan, bentwood, velvet and more event and wedding chairs for rent in Chicago and the suburbs, delivered and set up.`,
  alternates: { canonical: "/chairs" },
};

export default async function ChairsPage(props: PageProps<"/chairs">) {
  const { style } = await props.searchParams;
  const initialStyle = allStyles.includes(style as Style) ? (style as Style) : null;

  return (
    <div className="container-x py-20">
      <p className="eyebrow">The collection</p>
      <h1 className="headline mt-6 text-6xl leading-[0.95] sm:text-7xl">
        Beyond <em className="text-gold">Chiavari</em>
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
        Browse by aesthetic or occasion, and save the pieces you love. Your selections help decide which chairs join
        our {site.launch.seasonLabel}.
      </p>
      <div className="mt-14">
        <ChairBrowser initialStyle={initialStyle} />
      </div>
    </div>
  );
}
