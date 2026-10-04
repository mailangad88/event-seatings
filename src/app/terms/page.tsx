import type { Metadata } from "next";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `Terms for using the ${site.name} website.`,
};

export default function TermsPage() {
  return (
    <div className="container-x max-w-3xl py-20">
      <p className="eyebrow">Legal</p>
      <h1 className="headline mt-6 text-5xl sm:text-6xl">Terms of use</h1>
      <p className="mt-4 text-sm text-muted">Last updated October 2026</p>
      <div className="prose-post mt-10">
        <h2>Quote requests are not bookings</h2>
        <p>
          Submitting a quote request does not reserve chairs, hold a date or create a contract. A booking exists only
          once we send you a written proposal and you confirm it. We&apos;re preparing our {site.launch.seasonLabel},
          so availability and pricing are confirmed in your personal quote.
        </p>
        <h2>Estimated pricing</h2>
        <p>
          Prices on this site are estimates. Your quote sets the final price, including delivery, setup and pickup
          fees for your venue.
        </p>
        <h2>Product images</h2>
        <p>
          Illustrations and images show the style of each chair. Finishes, dimensions and details may vary slightly
          from what is shown.
        </p>
        <h2>Content</h2>
        <p>
          Articles on this site are general planning ideas, not professional advice. Please check requirements with
          your venue.
        </p>
        <h2>Contact</h2>
        <p>
          Questions? <a href={`mailto:${site.email}`}>{site.email}</a>
        </p>
      </div>
    </div>
  );
}
