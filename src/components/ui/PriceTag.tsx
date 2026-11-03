// Displays a customer-facing price (already marked up). Never pass vendor cost here.
export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function PriceTag({
  amount,
  unit = "each",
  from = false,
  compareAt,
  size = "md",
  className = "",
}: {
  amount: number;
  unit?: string;
  from?: boolean;
  compareAt?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const big = { sm: "text-base", md: "text-xl", lg: "text-3xl sm:text-4xl" }[size];
  return (
    <p className={`flex flex-wrap items-baseline gap-x-1.5 ${className}`}>
      {from && <span className="text-sm text-muted">from</span>}
      <span className={`font-semibold tabular-nums text-wine ${big}`}>{formatPrice(amount)}</span>
      {compareAt && compareAt > amount && (
        <s className="text-sm text-muted tabular-nums">{formatPrice(compareAt)}</s>
      )}
      {unit && <span className="text-sm text-muted">/ {unit}</span>}
    </p>
  );
}
