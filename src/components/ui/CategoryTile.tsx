import Image from "next/image";
import Link from "next/link";
import { Icon, type IconName } from "./Icon";

// Category entry point. With an image it is a photo tile; without, an icon tile.
export function CategoryTile({
  href,
  name,
  blurb,
  count,
  image,
  icon = "spark",
  size = "md",
}: {
  href: string;
  name: string;
  blurb?: string;
  count?: number;
  image?: { src: string; alt: string };
  icon?: IconName;
  size?: "md" | "lg";
}) {
  if (image) {
    return (
      <Link
        href={href}
        className={`group media card-hover relative block ${size === "lg" ? "aspect-[4/5]" : "aspect-[4/5] sm:aspect-square"}`}
      >
        <Image src={image.src} alt={image.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden />
        <span className="absolute inset-x-0 bottom-0 p-3 text-white sm:p-5">
          <span className="block font-serif text-xl leading-tight sm:text-3xl">{name}</span>
          <span className="mt-1 flex items-center gap-1.5 text-xs text-white/85 sm:text-sm">
            {count !== undefined ? `${count} items` : blurb}
            <Icon name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
          </span>
        </span>
      </Link>
    );
  }
  return (
    <Link href={href} className="group card card-hover flex items-center gap-4 p-4">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gold-soft text-gold">
        <Icon name={icon} size={24} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{name}</span>
        {(blurb || count !== undefined) && (
          <span className="block truncate text-sm text-muted">{count !== undefined ? `${count} items` : blurb}</span>
        )}
      </span>
      <Icon name="arrow" size={18} className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-gold" />
    </Link>
  );
}
