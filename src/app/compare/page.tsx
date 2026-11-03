import type { Metadata } from "next";
import { BuyerHub } from "@/components/buyer/BuyerHub";

export const metadata: Metadata = {
  title: "Compare Ways to Book Event Rentals in Chicago",
  description: "Honest comparisons for booking event rentals: through us or direct, party store or full-service house, rent or buy. Tables, trade-offs and a clear pick.",
  alternates: { canonical: "/compare" },
};

export default function Page() {
  return (
    <BuyerHub
      kind="compare"
      title="Compare your options"
      intro="Fair comparisons with the trade-offs spelled out, including when booking through us is not the best choice."
      faqs={[
        { q: "Is booking through Beyond Chiavari more expensive?", a: "By our 10% booking fee, shown on every proposal. In return you get one list across categories, one coordinator and our Booking Promise." },
        { q: "Do you name the rental companies you work with?", a: "Yes, in your proposal once you request a quote. They are insured Chicago-area rental houses, and their rental agreement covers delivery, setup and pickup." },
      ]}
    />
  );
}
