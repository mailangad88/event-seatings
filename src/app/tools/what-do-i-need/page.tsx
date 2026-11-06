import Link from "@/components/Link";
import { NeedsTool } from "@/components/tools/NeedsTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";
import { featuredPrices } from "@/lib/tools/prices";

const slug = "what-do-i-need";
const title = "Event Rental Checklist: What Do I Still Need?";
const description = "Pick your event, guests and setting to see everything an event like yours uses, mark what you already have, and get a priced list of what's left to rent.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "What rentals do I need for an event?", a: "It depends on the venue. A banquet hall may include tables and chairs; a backyard or park needs nearly everything: seating, tables, linens, tableware, glassware, a tent, lighting and sometimes restrooms and power. This checklist starts from your event, guest count and setting." },
  { q: "Where does the list come from?", a: "The same recommendation logic as our step-by-step planner. Every line says why it's there, so you can decide if you need it." },
  { q: "What does 'Venue provides' mean?", a: "Many venues include some rentals, like tables and chairs. Ask your venue for its inventory list and mark anything they supply." },
  { q: "Is my list saved?", a: "Your ticks are saved in this browser. The event, guests and setting are in the page link, so you can share or bookmark it." },
  { q: "Can I get a quote for what's left?", a: "Yes. 'Price these rentals' opens the quote builder with your remaining items already picked." },
];

export default function Page() {
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>What do you <em className="text-gold">still</em> need to rent?</>}
      intro="See everything an event like yours usually uses. Mark what you already have or what the venue provides, and you're left with a priced list of what to rent."
      answer="Start with your event type, guest count and setting. List seating, tables, linens, tableware, glassware and setting-specific needs like a tent, lighting or heaters. Cross off what you own and what your venue includes. What's left is your rental list, which you can price and send for a quote in one step."
      steps={[
        { title: "Describe the event", text: "Type, guests, where and style.", icon: "spark" },
        { title: "Review the list", text: "Every line says why it's there.", icon: "check" },
        { title: "Mark what's sorted", text: "Have it, or the venue provides it.", icon: "minus" },
        { title: "Price what's left", text: "One tap to a quote.", icon: "quote" },
      ]}
      method={
        <>
          <p>The list uses the recommendation rules from our <Link href="/quote">event planner</Link>: one chair per guest, tables by guest count, linens and tableware by style, and setting-specific items such as a tent and lighting for backyards. Quantities scale with your guest count.</p>
          <p>Prices are our catalog prices for each item, items only. If you used the planner on this device, the checklist starts from your answers there. For space questions, try the <Link href="/tools/venue-capacity">venue capacity calculator</Link>.</p>
        </>
      }
      faqs={faqs}
    >
      <NeedsTool prices={featuredPrices()} />
    </ToolShell>
  );
}
