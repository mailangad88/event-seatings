import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BarTool } from "@/components/tools/BarTool";
import { BudgetSplitTool } from "@/components/tools/BudgetSplitTool";
import { DanceFloorTool } from "@/components/tools/DanceFloorTool";
import { EmbedFrame } from "@/components/tools/EmbedFrame";
import { GuestCountTool } from "@/components/tools/GuestCountTool";
import { LightingTool } from "@/components/tools/LightingTool";
import { LinensTool } from "@/components/tools/LinensTool";
import { ParkingTool } from "@/components/tools/ParkingTool";
import { TablesChairsTool } from "@/components/tools/TablesChairsTool";
import { TentSizeTool } from "@/components/tools/TentSizeTool";
import { VenueCapacityTool } from "@/components/tools/VenueCapacityTool";
import { getTool } from "@/data/tools";
import { embeddable } from "@/lib/tools/embeds";
import { toolPrices } from "@/lib/tools/prices";
import { site } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => embeddable.map((tool) => ({ tool }));

export async function generateMetadata(props: PageProps<"/embed/[tool]">): Promise<Metadata> {
  const t = getTool((await props.params).tool);
  return {
    title: t ? `${t.name} (embed)` : "Embed",
    robots: { index: false, follow: true },
    alternates: t ? { canonical: `/tools/${t.slug}` } : undefined,
  };
}

const ids = ["round-60", "round-72", "banquet-6ft", "banquet-8ft", "cocktail-highboy", "white-folding", "gold-chiavari", "frame-tent-20x20", "frame-tent-20x40", "frame-tent-30x60", "pole-tent-40x60", "round-floor-length", "round-lap-length", "banquet-floor-length", "banquet-lap-length", "spandex-highboy", "cloth-napkins", "table-runner", "string-lights", "uplight", "dance-floor", "wine-glass", "pilsner-glass", "rocks-glass", "highball-glass", "champagne-flute", "water-goblet", "portable-bar"];

export default async function EmbedPage(props: PageProps<"/embed/[tool]">) {
  const slug = (await props.params).tool;
  const t = getTool(slug);
  if (!t || !embeddable.includes(slug)) notFound();
  const prices = toolPrices(ids);
  const tools: Record<string, React.ReactNode> = {
    "guest-count": <GuestCountTool />,
    "tables-and-chairs": <TablesChairsTool prices={prices} />,
    "tent-size": <TentSizeTool prices={prices} />,
    "venue-capacity": <VenueCapacityTool />,
    linens: <LinensTool prices={prices} />,
    lighting: <LightingTool prices={prices} />,
    "dance-floor": <DanceFloorTool prices={prices} />,
    "budget-splitter": <BudgetSplitTool />,
    "bar-and-glassware": <BarTool prices={prices} />,
    parking: <ParkingTool />,
  };
  return (
    <EmbedFrame tool={slug}>
      <div className="p-4 sm:p-6">
        <h1 className="display-3 mb-5">{t.name}</h1>
        {tools[slug]}
        <p className="mt-6 border-t border-line pt-4 text-center text-xs text-muted">
          Free tool by <a href={`${site.url}/tools/${slug}`} className="link">{site.name}</a>, Chicago&apos;s event rental marketplace.
        </p>
      </div>
    </EmbedFrame>
  );
}
