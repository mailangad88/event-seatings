import Link from "next/link";
import { BudgetSplitTool } from "@/components/tools/BudgetSplitTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";

const slug = "budget-splitter";
const title = "Event Budget Splitter: Split by Category and Between Hosts";
const description = "Free event budget splitter for weddings, parties, backyard and corporate events. Split one total across venue, food, rentals, music and more with sliders that always add to 100%, see cost per guest, and split the bill between families or co-hosts.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "How should I split my event budget?", a: "Start with your top two priorities and give them the biggest share, then fit everything else around them. The tool begins with a placeholder split for each event type so you can see the idea, then you drag the sliders to match what matters to you." },
  { q: "Are the starting percentages averages?", a: "No. They are a reasonable starting point, not survey data, and we don't claim they match what other people spend. Change them freely." },
  { q: "How much should I set aside for rentals?", a: "It depends on your venue. A venue that includes tables and chairs needs far less than a backyard or tent, where you rent nearly everything. Build a quick list in our quote builder to see real prices for your guest count." },
  { q: "How do we split costs between two families?", a: "Set the number of hosts and each one's share. The tool shows what each pays. Some families split by percentage; others each take whole categories. Either way, writing it down early avoids awkward talks later." },
  { q: "Can I save or share my budget?", a: "Yes. The page link holds your total, guests, split and host shares. Copy it to share or bookmark it." },
];

export default function Page() {
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>Split your budget, <em className="text-gold">fairly</em></>}
      intro="Enter one total and your guest count. Drag the sliders to match your priorities, see cost per guest, and split it between hosts."
      answer="Set one total budget, give the biggest shares to your top two priorities, and fit the rest around them so it adds up to 100%. Divide each category by your guest count to see cost per guest. If two families or co-hosts are paying, agree on each one's share or categories in writing early."
      steps={[
        { title: "Enter the total", text: "And how many guests.", icon: "calendar" },
        { title: "Drag the sliders", text: "Everything else rebalances to 100%.", icon: "spark" },
        { title: "Lock what's fixed", text: "Hold a quote you already have.", icon: "check" },
        { title: "Split between hosts", text: "See what each person pays.", icon: "users" },
      ]}
      method={
        <>
          <p>When you move one slider, the other unlocked lines grow or shrink in proportion to their current size, so the total stays at 100%. Locked lines don&apos;t move. Each line&apos;s dollar amount is the total × its share, and per guest is that amount ÷ guests.</p>
          <p>The starting split for each event type is our placeholder to get you going, not a statistic. For real rental prices, build a list in the <Link href="/quote">quote builder</Link> or use the <Link href="/tools/tables-and-chairs">tables and chairs calculator</Link>, then lock the rentals line at what it costs.</p>
        </>
      }
      faqs={faqs}
    >
      <BudgetSplitTool />
    </ToolShell>
  );
}
