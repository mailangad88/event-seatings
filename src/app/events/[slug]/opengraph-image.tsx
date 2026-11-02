import { ogCard, ogSize } from "@/components/geo/ogCard";
import { eventTypes, getEventType } from "@/data/geo";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "Event chair rentals";

export function generateStaticParams() {
  return eventTypes.map((e) => ({ slug: e.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const ev = getEventType((await params).slug);
  return ogCard({
    eyebrow: "Chicago & suburbs · Chair rentals",
    title: ev?.headline ?? "Event chair rentals",
    footer: ev?.shortName ?? "",
  });
}
