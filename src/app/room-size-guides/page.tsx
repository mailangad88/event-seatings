import { roomsFamily } from "@/lib/guide-content";
import { guideHub } from "@/lib/guide-route";

const h = guideHub(roomsFamily, "A room seats about one guest per 10 to 12 square feet at round tables and one per 6 to 8 square feet in ceremony rows. Find your room's dimensions below to see how many guests it seats banquet, ceremony, classroom and cocktail style, with a to-scale layout for each.");
export const metadata = h.metadata;
export default h.Page;
