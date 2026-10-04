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
      <span className="eyebrow">🪑 the collection</span>
      <h1 className="mt-4 display text-5xl leading-[0.95] sm:text-7xl">chairs beyond <span className="font-italic font-normal normal-case tracking-normal">chiavari</span></h1>
      <p className="mt-4 max-w-2xl text-muted">
        Filter by vibe or by where you&apos;ll use it. Tap ♡ want on the ones you love. Your votes decide which
        chairs make our {site.launch.seasonLabel} drop.
      </p>
      <div className="mt-10">
        <ChairBrowser initialStyle={initialStyle} />
      </div>
    </div>
  );
}
