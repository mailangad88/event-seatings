import { seasonsFamily } from "@/lib/guide-content";
import { guideHub } from "@/lib/guide-route";

const h = guideHub(seasonsFamily, "Chicago weather changes what works for an event. Summer brings heat and storms, spring and fall temperatures can swing widely in one day, and winter limits outdoor plans. Each month's guide covers outdoor event odds, the right chairs, tent and heater needs, delivery timing and how far ahead to book rentals.");
export const metadata = h.metadata;
export default h.Page;
