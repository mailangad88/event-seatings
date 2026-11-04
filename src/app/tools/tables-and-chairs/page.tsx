import Link from "@/components/Link";
import { TablesChairsTool } from "@/components/tools/TablesChairsTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";
import { toolPrices } from "@/lib/tools/prices";

const slug = "tables-and-chairs";
const title = "Tables and Chairs Calculator for Events and Weddings";
const description = "Free calculator: how many round or banquet tables and chairs you need for your guest count, plus cocktail highboys, ceremony chairs, buffet, bar, cake and gift tables, with rough Chicago rental prices.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "How many people fit at a 60 inch round table?", a: "Eight people sit comfortably at a 60\" round, and ten is the most it takes. A 72\" round seats ten comfortably and up to twelve." },
  { q: "How many people fit at an 8 foot banquet table?", a: "Eight people, four on each long side, and up to ten if you seat one person at each end. A 6' banquet seats six, or eight with the ends." },
  { q: "How many cocktail tables do I need?", a: "It depends on how relaxed you want it to feel. This calculator starts at one highboy for every eight guests, and you can change it. Fewer guests per table gives people more places to set a drink." },
  { q: "Do I need separate chairs for the ceremony?", a: "Only if the ceremony and reception happen at the same time in different spaces, or there's no time to move chairs between them. If the crew can flip the room, the same chairs can do both." },
  { q: "Why add spare chairs?", a: "Spares cover a late RSVP, an extra vendor or a damaged chair. A few percent is usually enough." },
  { q: "Are the prices final?", a: "No. They are rough item prices from our catalog, which uses local rental companies' published rates plus our booking fee. Delivery, setup and fees are extra, and the rental company confirms the final price for your date." },
];

export default function Page() {
  const prices = toolPrices(["round-60", "round-72", "banquet-6ft", "banquet-8ft", "cocktail-highboy", "white-folding", "gold-chiavari"]);
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>How many <em className="text-gold">tables and chairs</em> do you need?</>}
      intro="Pick your table size and the extras you want. You get a full table order, a chair count and a rough rental price."
      answer="Divide your guest count by the seats per table and round up: 120 guests at 60-inch rounds seating eight need 15 tables. Then add tables for the head table, gifts, cake, DJ, buffet and bar, highboys for cocktail hour, and chairs for every guest plus a few spares."
      steps={[
        { title: "Enter your guests", text: "Use your high estimate.", icon: "users" },
        { title: "Choose tables", text: "Rounds or banquets, and how many per table.", icon: "table" },
        { title: "Add the extras", text: "Head, gift, cake, DJ, buffet, bar and highboys.", icon: "plus" },
        { title: "Price it", text: "See rough costs and send the list to a quote.", icon: "quote" },
      ]}
      method={
        <>
          <p>Guest tables are guests divided by guests per table, rounded up. Seats per table use the usual capacities: 60&quot; round 8 (up to 10), 72&quot; round 10 (up to 12), 6&apos; banquet 6 (up to 8) and 8&apos; banquet 8 (up to 10).</p>
          <p>Each extra table uses one table, except buffets and bars. They get two tables per line and one line for every 75 guests, so the queue keeps moving. These are starting points: switch extras off if your caterer brings their own tables.</p>
          <p>Not sure of your guest count yet? Start with the <Link href="/tools/guest-count">guest count estimator</Link>. Then check the room with the <Link href="/tools/venue-capacity">venue capacity calculator</Link> and size the cloths with the <Link href="/tools/linens">tablecloth calculator</Link>.</p>
        </>
      }
      faqs={faqs}
    >
      <TablesChairsTool prices={prices} />
    </ToolShell>
  );
}
