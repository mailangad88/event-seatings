import Link from "@/components/Link";
import { SilentAuctionTool } from "@/components/tools/SilentAuctionTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";

const slug = "silent-auction-calculator";
const title = "Silent Auction Calculator: Items & Tables";
const description = "Enter your guest count to get a range of auction items to source, how many 6 ft display tables you need and how many checkout tables to staff.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "How many silent auction items do I need?", a: "A common target is about one item for every two to three guests. A 150-guest event usually needs 50 to 75 items, so plan for a range rather than one exact number since donations vary." },
  { q: "What are the rules for a silent auction?", a: "Post opening bids, bid increments and the exact closing time at each table, and close sections in groups rather than all at once. Check with your village or state about raffle and gaming rules if you add a raffle alongside the auction." },
  { q: "How many tables do I need for a silent auction?", a: "Plan about one 6 ft display table for every five to eight items, plus at least one checkout table for every 150 guests so winners don't queue at the end of the night." },
  { q: "How do I set up a silent auction table?", a: "Give each item its own card with a title, description, value and starting bid, leave four to five feet in front of the table for guests to stop and write a bid, and use a small riser or easel so items aren't flat on the tablecloth." },
  { q: "Should I use paper bid sheets or mobile bidding?", a: "Paper is simple and works without devices or Wi-Fi. Mobile bidding adds outbid alerts and card payment but needs reliable connectivity. Many events offer both and let guests choose." },
];

export default function Page() {
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>Plan your <em className="text-gold">silent auction</em></>}
      intro="Enter your guest count to see how many items to source, how many display tables to set up and how many checkout tables to staff."
      answer="Plan about one auction item for every two to three guests, one 6 ft display table for every five to eight items, and at least one staffed checkout table per 150 guests. Adjust the ratios below for your own items and crowd."
      steps={[
        { title: "Enter your guest count", text: "The number you expect to attend the event.", icon: "users" },
        { title: "Adjust the ratios", text: "Items per guest and items per table, if your event differs.", icon: "spark" },
        { title: "See your numbers", text: "A range of items, display tables and checkout tables.", icon: "check" },
        { title: "Price the tables", text: "Send the numbers to a free quote for linens and risers.", icon: "arrow" },
      ]}
      method={
        <>
          <p>The item range comes from a common fundraising rule of thumb: about one item for every two to three guests, shown here as a low and high estimate so you have room for donations that fall through. Display tables divide the midpoint of that range by how many items comfortably fit on one 6 ft table, which depends on item size. Checkout tables are one for every 150 guests, rounded up, so a 400-guest gala gets at least three.</p>
          <p>These are starting points, not guarantees. See the full <Link href="/blog/silent-auction-planning-guide">silent auction planning guide</Link> for sourcing items, choosing a bidding format and planning the room, and the <Link href="/blog/event-sponsorship-packages-guide">event sponsorship packages guide</Link> if you&apos;re also lining up sponsors for the same event.</p>
        </>
      }
      faqs={faqs}
    >
      <SilentAuctionTool />
    </ToolShell>
  );
}
