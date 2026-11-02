import { fitFamily } from "@/lib/guide-content";
import { guideRoute } from "@/lib/guide-route";

export const alt = "Event chair planning guide";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const generateStaticParams = guideRoute(fitFamily).generateStaticParams;
export default guideRoute(fitFamily).image;
