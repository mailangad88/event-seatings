import { layoutsFamily } from "@/lib/guide-content";
import { guideHub } from "@/lib/guide-route";

const h = guideHub(layoutsFamily, "Pick your event type and guest count to see a to-scale floor plan, the exact number of chairs and tables, the room size you need and an estimated chair rental cost. Every page is computed for that exact headcount.");
export const metadata = h.metadata;
export default h.Page;
