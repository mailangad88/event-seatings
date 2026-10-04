// Endless scrolling ticker. The list is rendered twice so the loop is seamless.
export function Marquee({
  items,
  className = "bg-ink text-white",
}: {
  items: string[];
  className?: string;
}) {
  const row = (hidden?: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {items.map((t, i) => (
        <span key={i} className="flex items-center gap-6 px-3 font-serif text-lg font-extrabold whitespace-nowrap lowercase sm:text-xl">
          {t}
          <span className="text-accent">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden border-y-2 border-ink py-3 ${className}`}>
      <div className="flex w-max animate-marquee">
        {row()}
        {row(true)}
      </div>
    </div>
  );
}
