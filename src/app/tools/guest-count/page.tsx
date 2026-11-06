import Link from "@/components/Link";
import { GuestCountTool } from "@/components/tools/GuestCountTool";
import { ToolShell, toolMetadata } from "@/components/tools/ToolShell";

const slug = "guest-count";
const title = "Guest Count Estimator for Weddings and Parties";
const description = "Enter invited guests by group and your expected yes rate to get a likely headcount, a range, and how many chairs to order.";

export const metadata = toolMetadata(slug, title, description);

const faqs = [
  { q: "How do I estimate how many guests will come?", a: "Split your list into groups that behave differently, such as local guests, out-of-town guests, plus-ones and courtesy invites. Give each group your own expected yes rate, multiply, and add the groups up. That gives a more honest number than one rate for everyone." },
  { q: "Where do the starting percentages come from?", a: "They are placeholders so the tool shows a result straight away. They are not survey data. You know your crowd better than any average does, so change each rate to what you expect." },
  { q: "Should I order chairs for the expected number or the high number?", a: "Order for the high end of the range plus anyone who needs a seat but isn't a guest, like vendors who eat with you. Then send your rental company the real RSVP count by their final-count deadline." },
  { q: "Do vendors need chairs and meals?", a: "Often, yes. Photographers, videographers, DJs and planners who work through dinner usually need a seat and a meal. Check each contract and add them to the vendor field." },
  { q: "When will I know my real guest count?", a: "After your RSVP deadline. Many hosts set it about three weeks before the event so there is time to chase late replies before final numbers are due." },
];

export default function Page() {
  return (
    <ToolShell
      slug={slug}
      description={description}
      title={<>How many guests will <em className="text-gold">actually</em> come?</>}
      intro="Split your invite list into groups, set how many you expect to say yes, and get a headcount you can order chairs and food against."
      answer="To estimate attendance, split invited guests into groups (local, out-of-town, plus-ones, long shots), multiply each group by the share you expect to accept, and add them up. Order chairs for the high end of the range, plus vendors who need a seat and a few spares for late replies."
      steps={[
        { title: "Enter invited guests", text: "Put each person in the group that fits them best.", icon: "users" },
        { title: "Set the yes rate", text: "Your own guess for each group. Change the placeholders.", icon: "check" },
        { title: "Add vendors and spares", text: "Seats for vendors and a few extra chairs.", icon: "chair" },
        { title: "Order and share", text: "Copy the link or price the chairs.", icon: "quote" },
      ]}
      method={
        <>
          <p>Expected guests are each group&apos;s invited number times your yes rate, added together. The range moves every group&apos;s rate 10 points down and 10 points up, which shows how much your count could swing.</p>
          <p>Chairs to order are the high estimate plus vendor seats, plus your spare percentage, rounded up. Once you have your count, the <Link href="/tools/tables-and-chairs">tables and chairs calculator</Link> turns it into a table plan and the <Link href="/tools/budget-splitter">budget splitter</Link> shows your cost per guest.</p>
        </>
      }
      faqs={faqs}
    >
      <GuestCountTool />
    </ToolShell>
  );
}
