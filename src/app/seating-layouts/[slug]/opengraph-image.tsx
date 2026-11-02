import { layoutsFamily } from "@/lib/guide-content";
import { guideRoute } from "@/lib/guide-route";

export const alt = "Seating layout diagram and chair count";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const generateStaticParams = guideRoute(layoutsFamily).generateStaticParams;
export default guideRoute(layoutsFamily).image;
