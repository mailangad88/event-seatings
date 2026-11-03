import { tablesFamily } from "@/lib/guide-content";
import { guideHub } from "@/lib/guide-route";

const h = guideHub(tablesFamily, "A 60-inch round table seats 8 to 10 guests, a 72-inch round 10 to 12, and an 8-foot banquet table 8 to 10. These guides show how many chairs fit at each common table, how much floor each needs and how many tables your guest count requires.");
export const metadata = h.metadata;
export default h.Page;
