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
      intro="Fair comparisons of the ways to book event rentals in Chicago: through a marketplace or direct, a party store or a full-service rental house, renting or buying. Each one shows prices, effort and risk side by side, and says plainly when booking through us is not the best choice."
      faqs={[
        { q: "Is booking through Beyond Chiavari more expensive?", a: "Item prices are the same as booking direct, because we add no markup. You pay our flat fee on top: $295, or $495 over 200 guests, and only after every rental company confirms. In return you get one list across companies, one coordinator and our Booking Promise." },
        { q: "Do you name the rental companies you work with?", a: "Yes, once you approve your proposal. They are established Chicago-area rental companies (we ask each for proof of insurance), and their rental agreement covers delivery, setup and pickup." },
        { q: "Which option is cheapest?", a: "Booking the same items directly from one rental company is cheapest by our flat fee. If one company covers your whole order, we'll tell you to call them direct. A party store is often cheapest for basic folding chairs and tables you can pick up yourself. Buying only pays off if you host often and can store the items." },
      ]}
    />
  );
}
