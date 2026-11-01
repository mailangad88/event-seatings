import { seasonsFamily } from "@/lib/guide-content";
import { guideHub } from "@/lib/guide-route";

const h = guideHub(seasonsFamily, 'Chicago weather changes what works. See what each month means for outdoor events, chair choice, delivery and booking.'.replace(/'/g,"'"));
export const metadata = h.metadata;
export default h.Page;
