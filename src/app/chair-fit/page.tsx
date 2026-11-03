import { fitFamily } from "@/lib/guide-content";
import { guideHub } from "@/lib/guide-route";

const h = guideHub(fitFamily, "The best chair for an event depends on the style, how long guests sit, the weather and how fast the room must be set. Each guide checks one chair against one Chicago event type on style, use, weather, setup and comfort, then shows the rental cost at common guest counts.");
export const metadata = h.metadata;
export default h.Page;
