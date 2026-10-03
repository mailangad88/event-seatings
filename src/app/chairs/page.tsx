import type { Metadata } from "next";
import { ChairBrowser } from "@/components/ChairBrowser";
import { allStyles, type Style } from "@/data/chairs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wedding Chair Rentals: Chiavari Alternatives",
  description: `Browse cross-back, ghost, rattan, bentwood, velvet and more wedding chairs for rent in ${site.city} and Chicago's western suburbs.`,
};

export default async function ChairsPage(props: PageProps<"/chairs">) {
  const { style } = await props.searchParams;
  const initialStyle = allStyles.includes(style as Style) ? (style as Style) : null;

  return (
    <div className="container-x py-14">
      <p className="eyebrow">The collection</p>
      <h1 className="mt-2 font-serif text-5xl sm:text-6xl">Chairs beyond Chiavari</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Filter by style or by where you&apos;ll use the chair. Tap ♡ on the ones you love. Your votes help decide
        which chairs make our {site.launch.seasonLabel} collection.
      </p>
      <div className="mt-10">
        <ChairBrowser initialStyle={initialStyle} />
      </div>
    </div>
  );
}
