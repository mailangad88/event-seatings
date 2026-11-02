import { compareFamily } from "@/lib/guide-content";
import { guideRoute } from "@/lib/guide-route";

const r = guideRoute(compareFamily);
export const generateStaticParams = r.generateStaticParams;
export const generateMetadata = r.generateMetadata;
export default r.Page;
