import Link from "@/components/Link";

// First-booking offer shown on the Google Ads landing pages (Nov 2026 launch). This only shows the
// offer copy — the discount itself is applied in the quote builder, wired separately. Only orders
// over $1,000 in rentals qualify (src/lib/offers.ts).
export function LaunchOffer({ from, className = "" }: { from: string; className?: string }) {
  return (
    <p className={`mt-5 text-sm leading-6 text-ink ${className}`}>
      <span className="chip border-gold/60 text-gold">New here?</span>{" "}
      Take <strong>$50 off orders over $1,000</strong> on your first booking —{" "}
      <Link href={`/quote?from=${from}&offer=first50`} className="link">
        just ask for it on your quote
      </Link>
      .
    </p>
  );
}
