import { costFamily } from "@/lib/guide-content";
import { guideHub } from "@/lib/guide-route";

const h = guideHub(costFamily, 'Estimated rental cost for every chair style from 25 to 200 chairs. Figures are our current estimates, with delivery and setup quoted separately.'.replace(/'/g,"'"));
export const metadata = h.metadata;
export default h.Page;
