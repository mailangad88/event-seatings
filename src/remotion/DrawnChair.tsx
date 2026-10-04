import { useLayoutEffect, useRef } from "react";
import { ChairDrawing } from "@/components/chair-drawings";
import type { Silhouette } from "@/data/chairs";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

// Draws a chair stroke by stroke. `draw` goes 0 -> 1 as the outline is traced,
// `fillAmount` goes 0 -> 1 as the color fills in afterwards.
export function DrawnChair({
  silhouette,
  fill,
  draw,
  fillAmount,
  style,
}: {
  silhouette: Silhouette;
  fill: string;
  draw: number;
  fillAmount: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const parts = Array.from(svg.querySelectorAll<SVGGeometryElement>("path, circle, ellipse, rect"));
    parts.forEach((el, i) => {
      // Stagger: each part starts a little after the previous one.
      const start = (i / parts.length) * 0.6;
      const local = clamp((draw - start) / 0.4);
      el.setAttribute("pathLength", "1");
      el.style.strokeDasharray = "1";
      el.style.strokeDashoffset = String(1 - local);
      const original = el.dataset.fo ?? el.getAttribute("fill-opacity") ?? (el.getAttribute("fill") === "none" ? "0" : "1");
      el.dataset.fo = original;
      el.style.fillOpacity = String(Number(original) * fillAmount);
    });
  }, [draw, fillAmount, silhouette]);

  return <ChairDrawing svgRef={ref} silhouette={silhouette} fill={fill} style={style} strokeWidth={2.2} />;
}
