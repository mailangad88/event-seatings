import { roomsFamily } from "@/lib/guide-content";
import { guideHub } from "@/lib/guide-route";

const h = guideHub(roomsFamily, "Find your room's dimensions below to see how many guests it seats at round tables, in ceremony rows, classroom style and at a standing cocktail reception. Each page includes a to-scale layout.".replace(/'/g,"'"));
export const metadata = h.metadata;
export default h.Page;
