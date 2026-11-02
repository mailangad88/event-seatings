import { ogCard, ogSize } from "@/components/geo/ogCard";
import { getLocation, locations } from "@/data/geo";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Event chair rentals";

export function generateStaticParams() {
  return locations.map((l) => ({ slug: l.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const loc = getLocation((await params).slug);
  return ogCard({
    eyebrow: `${loc?.region ?? "Chicagoland"} · Chair rentals`,
    title: loc?.headline ?? "Event chair rentals",
    footer: "Delivery · Setup · Pickup",
  });
}
