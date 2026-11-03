import Image from "next/image";
import Link from "next/link";
import { RentalCard } from "@/components/rentals/parts";
import { Icon, PriceDisclaimer } from "@/components/ui";
import { customerPrice, formatPrice, getCatalogItem, type CatalogItem } from "@/data/catalog";
import { getPartyType, ideaPath, ideaQty, type Activity, type IdeaLine, type PartyIdea } from "@/data/party-ideas";
import { render, sceneFor, type Scene } from "@/lib/scenes";
import { site } from "@/lib/site";

// Shared pieces for /party-ideas pages. Every rental shown is a real catalog item at its live customer price.

export function ideaScene(slug: string, alt: string): Scene {
  try {
    const s = render(slug);
    return { ...s, alt: s.alt || alt };
  } catch {
    return sceneFor(slug);
  }
}

/** Colour palette as an SVG with a title and description, so the colours are readable by crawlers too. */
export function PaletteStrip({ name, palette }: { name: string; palette: PartyIdea["palette"] }) {
  const w = 100 / palette.length;
  const id = `pal-${name.replace(/\W+/g, "-").toLowerCase()}`;
  return (
    <figure>
      <svg viewBox="0 0 100 24" className="h-16 w-full overflow-hidden rounded-2xl" role="img" aria-labelledby={`${id}-t ${id}-d`} preserveAspectRatio="none">
        <title id={`${id}-t`}>{`${name} colour palette`}</title>
        <desc id={`${id}-d`}>{palette.map((p) => `${p.name} (${p.hex})`).join(", ")}</desc>
        {palette.map((p, i) => (
          <rect key={p.hex + i} x={i * w} y={0} width={w + 0.2} height={24} fill={p.hex} />
        ))}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
        {palette.map((p) => (
          <span key={p.name}>
            {p.name} <span className="tabular-nums">{p.hex}</span>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

export function IdeaCard({ idea }: { idea: PartyIdea }) {
  const sc = ideaScene(idea.scene, idea.sceneAlt);
  return (
    <article className="group card card-hover relative flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        <Image src={sc.src} alt={`${idea.name}: ${idea.sceneAlt}`} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
        <div className="absolute inset-x-0 bottom-0 flex h-2">
          {idea.palette.map((p) => (
            <span key={p.hex} className="flex-1" style={{ background: p.hex }} />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium tracking-wide text-muted uppercase">{getPartyType(idea.type)?.name}</p>
        <h3 className="display-3 mt-1">
          <Link href={ideaPath(idea)} className="after:absolute after:inset-0 after:content-['']">
            {idea.name}
          </Link>
        </h3>
        <p className="mt-2 text-sm leading-6 text-muted">{idea.tagline}</p>
        <p className="mt-auto pt-4 text-sm text-accent">
          See the setup, games and rentals <Icon name="arrow" size={14} className="inline" />
        </p>
      </div>
    </article>
  );
}

export function ActivityGrid({ activities }: { activities: Activity[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {activities.map((a) => {
        const items = (a.rentals ?? []).map(getCatalogItem).filter((i): i is CatalogItem => !!i);
        return (
          <li key={a.name} className="card p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-soft text-gold">
                <Icon name={items.length ? "spark" : "heart"} size={18} />
              </span>
              <h3 className="font-medium leading-snug">{a.name}</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{a.text}</p>
            {items.length > 0 ? (
              <p className="mt-3 text-xs leading-5">
                <span className="text-muted">Rent: </span>
                {items.map((i, n) => (
                  <span key={i.id}>
                    {n > 0 && ", "}
                    <Link href={`/rentals/${i.categoryId}/${i.id}`} className="text-accent underline">
                      {i.name}
                    </Link>{" "}
                    <span className="tabular-nums text-muted">({formatPrice(customerPrice(i))})</span>
                  </span>
                ))}
              </p>
            ) : (
              <p className="mt-3 text-xs text-muted">DIY: no rental needed</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** The idea's rentals priced for a sample guest count, with a total. */
export function IdeaRentals({ lines, guests = 100 }: { lines: IdeaLine[]; guests?: number }) {
  const rows = lines.flatMap((l) => {
    const item = getCatalogItem(l.id);
    return item ? [{ l, item, qty: ideaQty(l, guests) }] : [];
  });
  const total = rows.reduce((s, r) => s + customerPrice(r.item) * r.qty, 0);
  return (
    <div>
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        {rows.map(({ l, item, qty }) => (
          <div key={l.id}>
            <RentalCard item={item} />
            <p className="mt-2 text-xs leading-5 text-muted">
              <strong className="text-ink tabular-nums">× {qty.toLocaleString()}</strong> for {guests} guests. {l.why}.
            </p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-baseline justify-between gap-3 rounded-2xl border border-line bg-surface p-5">
        <p className="text-sm text-muted">These add-ons for {guests} guests, before delivery, setup and tax</p>
        <p className="font-heading font-semibold text-3xl tabular-nums">{formatPrice(total)}</p>
      </div>
      <PriceDisclaimer />
    </div>
  );
}

/** Setup cards: backyard and indoors, each with a simple floor sketch so the section isn't text only. */
export function SetupPair({ setup, name }: { setup: PartyIdea["setup"]; name: string }) {
  const cards = [
    { title: "Backyard or tented lawn", text: setup.backyard, icon: "tent" as const },
    { title: "Indoors or a rented room", text: setup.indoors, icon: "table" as const },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((c) => (
        <figure key={c.title} className="card overflow-hidden">
          <svg viewBox="0 0 200 90" className="w-full bg-surface-2" role="img" aria-label={`${name}: sketch of a ${c.title.toLowerCase()} layout`}>
            <title>{`${name} ${c.title.toLowerCase()} layout sketch`}</title>
            {c.icon === "tent" ? (
              <>
                <rect x="20" y="15" width="110" height="60" rx="4" fill="none" stroke="currentColor" strokeOpacity=".35" strokeDasharray="4 3" />
                {[0, 1, 2].map((r) => [0, 1, 2].map((k) => <circle key={`${r}${k}`} cx={42 + k * 33} cy={30 + r * 16} r="6" fill="currentColor" fillOpacity=".25" />))}
                <rect x="145" y="25" width="35" height="35" fill="currentColor" fillOpacity=".12" />
                <text x="162" y="46" fontSize="7" textAnchor="middle" fill="currentColor" fillOpacity=".6">games</text>
                <path d="M15 10 Q75 2 135 10" fill="none" stroke="currentColor" strokeOpacity=".4" strokeDasharray="1 3" />
              </>
            ) : (
              <>
                <rect x="10" y="8" width="180" height="74" rx="4" fill="none" stroke="currentColor" strokeOpacity=".35" />
                <rect x="78" y="30" width="44" height="30" fill="currentColor" fillOpacity=".12" />
                <text x="100" y="48" fontSize="7" textAnchor="middle" fill="currentColor" fillOpacity=".6">floor</text>
                {[0, 1].map((r) => [0, 1, 2, 3].map((k) => <circle key={`${r}${k}`} cx={26 + k * 16 + (k > 1 ? 104 : 0) - (k > 1 ? 32 : 0)} cy={28 + r * 30} r="6" fill="currentColor" fillOpacity=".25" />))}
                <rect x="70" y="12" width="60" height="8" fill="currentColor" fillOpacity=".3" />
              </>
            )}
          </svg>
          <div className="p-5">
            <figcaption className="font-medium">{c.title}</figcaption>
            <p className="mt-2 text-sm leading-6 text-muted">{c.text}</p>
          </div>
        </figure>
      ))}
    </div>
  );
}

export const plannerHref = (planner: string, idea?: string, from?: string) =>
  `/quote?event=${planner}${idea ? `&idea=${idea}` : ""}${from ? `&from=${from}` : ""}`;

export const ideasBrand = `${site.name} party ideas`;
