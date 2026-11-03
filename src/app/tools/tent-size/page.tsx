import Link from "next/link";
import { TentSizeTool } from "@/components/tools/TentSizeTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";
import { toolPrices } from "@/lib/tools/prices";

const slug = "tent-size";
const title = "Tent Size Calculator: What Size Tent for Your Guests?";
const description = "Free tent size calculator for weddings, graduation parties and backyard events. Get the square feet you need for seating, dance floor, bar, buffet and band, matched to standard frame and pole tent sizes.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "What size tent do I need for 100 guests?", a: "For a seated dinner at round tables, 100 guests need about 1,200 sq ft for tables alone. Add a dance floor, bar, buffet and DJ and the total comes to about 2,000 sq ft, which fits a 40' x 60' tent. Use the calculator to see your exact mix." },
  { q: "How many square feet per guest under a tent?", a: "This calculator uses about 12 sq ft per guest for round-table dinners, 10 for long banquet tables, 8 for a mostly standing cocktail party and 7 for ceremony rows. These are common planning figures and include aisles between tables." },
  { q: "Why does the tool suggest a bigger tent than the tightest fit?", a: "The comfortable size leaves at least 15% extra for walkways, service paths and tent poles. The tightest fit is shown too if space or budget is tight." },
  { q: "Frame tent or pole tent?", a: "A frame tent has no centre poles and can go on grass, concrete or a deck. A pole tent needs stakes in the ground and has poles inside, but it has the classic peaked look. Ask your rental company what your surface allows." },
  { q: "Do I need sidewalls?", a: "For Chicago weather in spring or fall, it is smart to have sidewalls ready, even if they stay rolled up. Our rain plan checklist helps you decide when to make the call." },
  { q: "Do I need a permit for a tent?", a: "Some towns and parks need permits for large tents. Rules vary by town and tent size, so check with your village or city and your rental company early." },
];

export default function Page() {
  const prices = toolPrices(["frame-tent-20x20", "frame-tent-20x40", "frame-tent-30x60", "pole-tent-40x60"]);
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>What size <em className="text-gold">tent</em> do you need?</>}
      intro="Tell us your guests, layout and what else goes under cover. We add up the square feet and match it to standard tent sizes."
      answer="Multiply guests by square feet per person (about 12 for a round-table dinner, 10 for long tables, 8 for cocktails), then add space for a dance floor, bar, buffet and band. Pick a tent with about 15% more area for walkways. 100 seated guests with dancing, a bar and a buffet need about a 40' x 60'."
      steps={[
        { title: "Guests and layout", text: "Seated dinner, ceremony rows or cocktails.", icon: "users" },
        { title: "Add what goes under cover", text: "Dance floor, bar, buffet, band, lounge.", icon: "tent" },
        { title: "See the fit", text: "Comfortable and tightest standard sizes.", icon: "ruler" },
        { title: "Price the tent", text: "Rough cost, then a real quote.", icon: "quote" },
      ]}
      method={
        <>
          <p>Seating space is guests times square feet per guest for your layout. Extras add a fixed area: about 100 sq ft per bar and 120 per buffet line (one for every 75 guests), 150 for a DJ or band, 80 for a head table, 100 for cake, gift and guest book tables, and 150 for lounge furniture.</p>
          <p>The dance floor uses 9 sq ft (one 3&apos; x 3&apos; panel) for each guest dancing at once, the same as our <Link href="/tools/dance-floor">dance floor calculator</Link>. Tent sizes come from the usual frame and pole tent sizes, from 10&apos; x 10&apos; to 60&apos; x 120&apos;. Rental companies don&apos;t all stock every size.</p>
          <p>Next, plan a backup with the <Link href="/tools/rain-plan">rain plan checklist</Link> and light it with the <Link href="/tools/lighting">string light calculator</Link>.</p>
        </>
      }
      faqs={faqs}
    >
      <TentSizeTool prices={prices} />
    </ToolShell>
  );
}
