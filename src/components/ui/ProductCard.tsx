import Image from "next/image";
import Link from "@/components/Link";
import { Icon, type IconName } from "./Icon";
import { PriceTag } from "./PriceTag";

export type ProductImage = { src: string; alt: string };

// Catalog card. 1:1 product image on a sand well, name, category, price.
// `action` slots an "Add to quote" button; it sits above the stretched link.
export function ProductCard({
  href,
  name,
  category,
  image,
  icon = "spark",
  price,
  unit = "each",
  from = false,
  blurb,
  badges = [],
  action,
  priority = false,
}: {
  href: string;
  name: string;
  category?: string;
  image?: ProductImage;
  /** Shown in place of a missing image. */
  icon?: IconName;
  price?: number;
  unit?: string;
  from?: boolean;
  blurb?: string;
  badges?: string[];
  action?: React.ReactNode;
  priority?: boolean;
}) {
  return (
    <article className="group card card-hover relative flex flex-col overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-surface-2">
        {image ? (
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full place-items-center text-gold/70" aria-hidden>
            <Icon name={icon} size={56} strokeWidth={1} />
          </div>
        )}
        {badges.length > 0 && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {badges.map((b) => (
              <span key={b} className="rounded-full bg-surface/95 px-2.5 py-1 text-xs font-semibold text-ink shadow-soft">
                {b}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {category && <p className="text-xs font-medium tracking-wide text-muted uppercase">{category}</p>}
        <h3 className="mt-1 text-base leading-snug font-medium sm:text-lg">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {name}
          </Link>
        </h3>
        {blurb && <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-muted">{blurb}</p>}
        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          {price !== undefined ? <PriceTag amount={price} unit={unit} from={from} size="sm" /> : <span className="text-sm text-muted">Price on request</span>}
          {action && <div className="relative z-10">{action}</div>}
        </div>
      </div>
    </article>
  );
}

// Responsive product grid: 2 up on phones, 3 on tablets, 4 on desktop.
export function ProductGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 ${className}`}>{children}</div>;
}
