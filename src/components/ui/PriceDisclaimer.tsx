import Link from "@/components/Link";

// One honest line under every price we show: prices come from rental companies' own published
// rates, and only the rental company's confirmation makes a price final.
export const PRICE_DISCLAIMER =
  "Prices are based on local rental companies' published rates plus our booking fee. Your final quote is confirmed by the rental company for your date and venue.";

export function PriceDisclaimer({ className = "", vendorLink = false }: { className?: string; vendorLink?: boolean }) {
  return (
    <p className={`text-xs leading-5 text-muted ${className}`}>
      {PRICE_DISCLAIMER}
      {vendorLink && (
        <>
          {" "}
          Rental company?{" "}
          <Link href="/vendor-listings" className="underline underline-offset-2">
            Correct or remove your listing
          </Link>
          .
        </>
      )}
    </p>
  );
}
