import { notFound } from "next/navigation";
import { RenderStill } from "@/components/three/RenderStill";
import { getChair } from "@/data/chairs";

// Internal page used by scripts/render-chairs.mjs to produce still images.
// Only available when the server is started with ALLOW_RENDER=1.
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false } };

export default async function RenderPage(props: PageProps<"/render/[slug]">) {
  if (process.env.ALLOW_RENDER !== "1") notFound();
  const chair = getChair((await props.params).slug);
  if (!chair) notFound();
  const { finish } = await props.searchParams;
  return (
    <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 100, overflow: "auto" }}>
      <RenderStill chair={chair} finish={Number(finish) || 0} />
    </div>
  );
}
