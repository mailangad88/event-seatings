import type { Metadata } from "next";
import { BuyerHub } from "@/components/buyer/BuyerHub";

export const metadata: Metadata = {
  title: "Event Rental Problems Solved: Quotes, Minimums, Timing",
  description: "Straight answers for the problems that slow down Chicago event rentals: slow quotes, order minimums, last-minute orders, delivery windows and quantities.",
  alternates: { canonical: "/solutions" },
};

export default function Page() {
  return (
    <BuyerHub
      kind="solutions"
      title="Rental problems solved"
      intro="Quotes that take days, minimums you can't reach, a party this weekend. Each page gives the short answer first, then what to do."
      faqs={[
        { q: "What slows down event rental quotes?", a: "Missing details: date, venue rules, guest count and a full item list. Send the same complete list to every company and quotes come back faster and comparable." },
        { q: "Can I rent everything for an event from one place?", a: "Few single companies carry every category. Our quote builder puts chairs, tables, linens, tableware, tents and more from several Chicago rental houses on one list." },
      ]}
    />
  );
}
