import { compareFamily } from "@/lib/guide-content";
import { guideHub } from "@/lib/guide-route";

const h = guideHub(compareFamily, 'Choosing between two chairs? Every pairing in our collection is compared on price, comfort, weather tolerance, stacking and best use, with a cost example for 100 chairs.'.replace(/'/g,"'"));
export const metadata = h.metadata;
export default h.Page;
