// A fine brass keyline with corner brackets: the picture-frame detail you'd see in a grand hotel.
export function DecoFrame({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  const corner = "pointer-events-none absolute h-5 w-5 border-gold";
  return (
    <div className={`relative border border-gold/30 p-3 sm:p-4 ${className}`}>
      <span className={`${corner} -top-px -left-px border-t-2 border-l-2`} aria-hidden />
      <span className={`${corner} -top-px -right-px border-t-2 border-r-2`} aria-hidden />
      <span className={`${corner} -bottom-px -left-px border-b-2 border-l-2`} aria-hidden />
      <span className={`${corner} -right-px -bottom-px border-r-2 border-b-2`} aria-hidden />
      {children}
      {label ? (
        <span className="absolute -top-px left-1/2 -translate-x-1/2 -translate-y-1/2 bg-bg px-4 text-[10px] tracking-[0.38em] whitespace-nowrap text-gold uppercase">
          {label}
        </span>
      ) : null}
    </div>
  );
}
