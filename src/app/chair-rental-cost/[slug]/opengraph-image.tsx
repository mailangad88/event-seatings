import { costFamily } from "@/lib/guide-content";
import { guideRoute } from "@/lib/guide-route";

export const alt = "Event chair planning guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const generateStaticParams = guideRoute(costFamily).generateStaticParams;
export default guideRoute(costFamily).image;
