import type { Metadata } from "next";
import { BuyerHub } from "@/components/buyer/BuyerHub";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "Compare Ways to Book Event Rentals in Chicago",
  description: "Honest comparisons for booking event rentals: through us or direct, party store or full-service house, rent or buy. Tables, trade-offs and a clear pick.",
  alternates: { canonical: "/compare" },
});

export default function Page() {
  return (
    <BuyerHub
      kind="compare"
      title="Compare your options"
      intro="Fair comparisons of the ways to book event rentals in Chicago: one order or several stores, a party store or a full-service rental house, renting or buying. Each one shows prices, effort and risk side by side, and says plainly when booking through us is not the best choice."
      faqs={[
        { q: "Is booking through Beyond Chiavari more expensive?", a: "Compare the totals. Every item price is on our site, and your written quote adds delivery, setup, damage waiver and tax with no separate booking fee. For a single item from one store, calling that store may cost less. For a full event you get one list, one person to call and our Booking Promise." },
        { q: "Which option is cheapest?", a: "For a single item, a local store you can pick up from is often cheapest. A party store is often cheapest for basic folding chairs and tables you can pick up yourself. Buying only pays off if you host often and can store the items." },
        { q: "When should I just call a rental store myself?", a: "If you need one simple thing, like 100 folding chairs, from a store you already trust, call them directly. One item from one place is easy to manage on your own." },
        { q: "What's the real difference between a party store and a full-service rental house?", a: "A party store rents basics by the piece, often for pickup. A full-service house carries specialty chairs, linens and china, and usually delivers and sets up. Many events use both, which is why one combined order is easier to manage." },
      ]}
    />
  );
}
