import { tablesFamily } from "@/lib/guide-content";
import { guideHub } from "@/lib/guide-route";

const h = guideHub(tablesFamily, 'How many chairs fit at each common table, how much floor each needs and how many tables your guest count requires.'.replace(/'/g,"'"));
export const metadata = h.metadata;
export default h.Page;
