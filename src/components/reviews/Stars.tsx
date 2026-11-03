// Read-only star rating. The label carries the number for screen readers and crawlers.
export function Stars({ rating, size = 18, className = "" }: { rating: number; size?: number; className?: string }) {
  const full = Math.round(rating * 2) / 2;
  return (
    <span className={`inline-flex items-center gap-0.5 text-gold ${className}`} role="img" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = full >= i ? 1 : full >= i - 0.5 ? 0.5 : 0;
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
            <defs>
              <linearGradient id={`star-${i}-${fill}`}>
                <stop offset={`${fill * 100}%`} stopColor="currentColor" />
                <stop offset={`${fill * 100}%`} stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"
              fill={`url(#star-${i}-${fill})`}
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </span>
  );
}
