import { fitFamily } from "@/lib/guide-content";
import { guideHub } from "@/lib/guide-route";

const h = guideHub(fitFamily, 'Each guide checks one chair against one event type on style, use, weather, setup and comfort, and shows the cost at common guest counts.'.replace(/'/g,"'"));
export const metadata = h.metadata;
export default h.Page;
