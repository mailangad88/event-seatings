import type { Metadata } from "next";
import { BuyerHub } from "@/components/buyer/BuyerHub";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Event Rental Problems Solved: Quotes, Minimums, Timing",
  description: "Straight answers for the problems that slow down Chicago event rentals: slow quotes, order minimums, last-minute orders, delivery windows and quantities.",
  alternates: { canonical: "/solutions" },
});

export default function Page() {
  return (
    <BuyerHub
      kind="solutions"
      title="Rental problems solved"
      intro="The most common event rental problems in Chicago, solved: quotes that take days, order minimums you can't reach, a party this weekend, delivery windows that don't fit and not knowing how much to rent. Each page gives the short answer first, then exactly what to do next."
      faqs={[
        { q: "What slows down event rental quotes?", a: "Missing details: date, venue rules, guest count and a full item list. Send the same complete list to every company and quotes come back faster and comparable." },
        { q: "Can I still get rentals for an event this weekend?", a: "Often, yes, for standard items like folding chairs, banquet tables and basic linens, especially for weekday or Sunday events. Tents, dance floors and specialty chairs are harder at short notice. Send your list and date and we check partner availability the same business day." },
        { q: "Can I rent everything for an event from one place?", a: "Yes. Our quote builder puts chairs, tables, linens, tableware, tents and more on one list, with one quote and one delivery plan." },
        { q: "What if my problem isn't listed here?", a: "Send it to us anyway. Most rental problems come down to timing, quantity or fit with a venue's rules, and we can usually point you to an answer or a partner who has solved it before, even if it isn't one of the pages above." },
        { q: "Do these problems mostly come up for weddings, or other events too?", a: "Both. Order minimums and quantity questions come up as often for corporate events and birthday parties as weddings; last-minute requests and delivery timing questions show up across every event type we work with." },
      ]}
    />
  );
}
