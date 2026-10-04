"use client";

import { chairTint, StudioBackdrop } from "@/components/studio";
import type { Chair } from "@/data/chairs";
import dynamic from "next/dynamic";

const ChairScene = dynamic(() => import("./ChairScene").then((m) => m.ChairScene), { ssr: false });

// A fixed-size, non-interactive view used to render still images of each chair.
export function RenderStill({ chair, finish }: { chair: Chair; finish: number }) {
  const color = chair.finishes[finish]?.hex ?? chair.finishes[0].hex;
  return (
    <div id="shot" style={{ width: 1000, height: 1250 }}>
      <StudioBackdrop tint={chairTint(chair.slug)} floor={null} style={{ width: 1000, height: 1250 }}>
        <div style={{ width: "100%", height: "100%" }}>
          <ChairScene silhouette={chair.silhouette} color={color} autoRotate={false} interactive={false} signalReady />
        </div>
      </StudioBackdrop>
    </div>
  );
}
