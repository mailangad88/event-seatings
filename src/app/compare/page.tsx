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
        { q: "When should I book through Beyond Chiavari instead?", a: "When you need more than one or two items, or items from more than one store. You get one order, one delivery window and one person to call if anything is wrong, instead of tracking several pickups and drop-offs yourself." },
        { q: "Can I mix and match: book some items with you, some elsewhere?", a: "Yes. Some hosts book specialty chairs or tents through us and pick up basics like folding chairs themselves. Tell us what you're sourcing elsewhere so your proposal only covers what you actually need from us." },
        { q: "How do I know which comparison applies to my event?", a: "Start with your guest count and venue: a single item from one nearby store usually favors calling direct, several categories across venues favors one combined order, and repeat use in your own space is the only time buying usually wins. Each comparison below walks through the numbers for its own decision." },
        { q: "Do these comparisons apply outside Chicago too?", a: "The logic holds anywhere, though the specific prices and minimums quoted are from our Chicago-area research. Use the same questions with a local rental house if you're planning an event elsewhere." },
      ]}
    />
  );
}
