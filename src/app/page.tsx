import Image from "next/image";
import Link from "next/link";
import { ChairArt } from "@/components/ChairArt";
import { Reveal } from "@/components/Reveal";
import { ExampleChip } from "@/components/rentals/StockPhoto";
import { CategoryTile, FaqList, Icon, QuoteCta, Section, StepFlow, TrustBar, type Faq } from "@/components/ui";
import { getChair } from "@/data/chairs";
import { formatDate, getPosts } from "@/lib/blog";
import { rentalCategories } from "@/lib/nav";
import { catalogItems } from "@/data/catalog";
import { categoryScene, render, scenes } from "@/lib/scenes";
import { site } from "@/lib/site";

export const revalidate = 3600;

const looks = [
  {
    id: "blush-garden",
    name: "Blush Garden",
    scene: scenes.blushLongTable,
    for: "Garden weddings, showers, spring brunches",
    items: ["Rose-gold bamboo chairs", "Blush banquet linen", "Gold-rim chargers", "Taper candles & low florals"],
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    scene: scenes.midnightLongTable,
    for: "Evening receptions, galas, sangeet nights",
    items: ["Gold bamboo chairs", "Charcoal linen", "Gold chargers & flatware", "String-light backdrop"],
  },
  {
    id: "gilded-ivory",
    name: "Gilded Ivory",
    scene: scenes.gildedIvory,
    for: "Ballrooms, anniversaries, corporate dinners",
    items: ["Gold Chiavari-style chairs", "Ivory linen & napkins", "Gold chargers", "White floral centerpieces"],
  },
];

const events = [
  ["Weddings", "wedding", "heart"],
  ["Corporate events", "corporate", "users"],
  ["Birthdays & milestones", "birthday", "spark"],
  ["Quinceañeras", "quinceanera", "star"],
  ["Indian weddings & sangeets", "indian-wedding", "light"],
  ["Showers & brunches", "shower", "glass"],
  ["Graduations", "graduation", "calendar"],
  ["Galas & fundraisers", "gala", "candle"],
] as const;

const faqs: Faq[] = [
  {
    q: `What can I rent through ${site.name}?`,
    a: "Everything a party needs: chairs, tables, linens and napkins, dinnerware, glassware, flatware, tents, lighting, lounge furniture, bars and backdrops, dance floors, decor and catering equipment. Pick it all in one quote.",
  },
  {
    q: "How does pricing work?",
    a: "Every item shows its rental price per piece or per set, and your quote totals as you pick. Prices include our coordination, so there is no separate planning fee. Delivery, setup and any venue fees are itemized before you confirm.",
  },
  {
    q: "Who delivers the rentals?",
    a: `We work with established rental houses across ${site.marketLong}. You get one quote and one point of contact; we book and coordinate the vendors, delivery windows and pickup for you.`,
  },
  {
    q: "Do I pay anything to get a quote?",
    a: "No. Quotes are free and there is no obligation. Nothing is reserved or charged until you approve the final quote.",
  },
  {
    q: "How far ahead should I book?",
    a: "For Saturdays from May to October, 3 to 6 months ahead is safest, especially for popular chairs and tents. Weekday and winter events can often be booked a few weeks out.",
  },
  {
    q: "Which areas do you serve?",
    a: `Chicago and the suburbs, including ${site.serviceArea.slice(1).join(", ")}. Ask about venues farther out.`,
  },
];

export default async function Home() {
  const posts = (await getPosts()).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container-x grid items-center gap-12 pt-10 pb-16 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24">
          <div className="animate-rise">
            <p className="eyebrow">
              <Icon name="pin" size={14} /> Chicago&apos;s event rental marketplace
            </p>
            <h1 className="headline mt-5 text-[2.9rem] leading-[1.02] sm:text-6xl lg:text-[4.6rem]">
              Everything for your event. <em className="text-gold">One</em> simple quote.
            </h1>
            <p className="lede mt-6 max-w-xl">
              Chairs, tables, linens, dinnerware, tents and lighting from {site.market}&apos;s trusted rental houses. Pick
              what you need, see prices instantly, and we coordinate every vendor for you.
            </p>
            <div className="cta-row mt-8">
              <Link href="/quote?from=home-hero" className="btn-primary btn-lg">
                Build your quote <Icon name="arrow" size={18} />
              </Link>
              <Link href="/rentals" className="btn-ghost btn-lg">Browse rentals</Link>
            </div>
            <div className="mt-8">
              <p className="text-sm text-muted">Popular right now</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {rentalCategories.slice(0, 7).map((c) => (
                  <li key={c.id}>
                    <Link href={`/rentals/${c.id}`} className="chip transition-colors hover:border-ink hover:text-ink">
                      <Icon name={c.icon} size={14} className="text-gold" /> {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Collage of 3D tablescape renders */}
          <div className="animate-rise relative [animation-delay:150ms]">
            <div className="grid grid-cols-[1.25fr_1fr] gap-3 sm:gap-4">
              <div className="media row-span-2 aspect-[9/14] shadow-lift">
                <Image src={scenes.blushGarden.src} alt={scenes.blushGarden.alt} fill priority sizes="(max-width: 1024px) 55vw, 30vw" className="object-cover" />
                {scenes.blushGarden.ai && <ExampleChip label="AI-generated example" className="bottom-auto top-2" />}
              </div>
              <div className="media aspect-square shadow-soft">
                <Image src={render("hero-chairs").src} alt={render("hero-chairs").alt} fill sizes="(max-width: 1024px) 45vw, 22vw" className="object-cover" />
              </div>
              <div className="media aspect-square shadow-soft">
                <Image src={render("tent-reception-dusk").src} alt={render("tent-reception-dusk").alt} fill sizes="(max-width: 1024px) 45vw, 22vw" className="object-cover" />
              </div>
            </div>
            <div className="card absolute -bottom-5 left-4 flex items-center gap-3 px-4 py-3 sm:left-6">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gold-soft text-gold">
                <Icon name="quote" size={20} />
              </span>
              <span className="text-sm leading-5">
                <span className="block font-semibold">Live pricing</span>
                <span className="text-muted">Totals update as you pick</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-y border-line bg-surface">
        <div className="container-x py-10">
          <TrustBar />
        </div>
      </section>

      {/* Categories */}
      <Section
        eyebrow="Shop by category"
        title="Every rental, one place"
        intro="From the first chair to the last candle. Browse by category, or start a quote and add as you go."
        action={<Link href="/rentals" className="link-line">All rentals <Icon name="arrow" size={16} /></Link>}
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {rentalCategories.map((c, i) => (
            <Reveal key={c.id} delay={(i % 4) * 60}>
              <CategoryTile
                href={`/rentals/${c.id}`}
                name={c.name}
                blurb={c.blurb}
                icon={c.icon}
                image={categoryScene(c.id)}
                count={catalogItems.filter((i) => i.categoryId === c.id).length || undefined}
              />
            </Reveal>
          ))}
        </div>
      </Section>

      {/* Shop the look */}
      <Section
        tone="sand"
        eyebrow="Shop the look"
        title={<>Start from a styled <em>tablescape</em></>}
        intro="Each look is a full table: chairs, linen, dinnerware and decor. Price it as is, then swap anything you like."
      >
        <div className="grid gap-6 md:grid-cols-3">
          {looks.map((l, i) => (
            <Reveal key={l.id} delay={i * 100}>
              <article className="group card card-hover relative flex h-full flex-col overflow-hidden">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={l.scene.src} alt={l.scene.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-serif text-3xl">{l.name}</h3>
                  <p className="mt-1 text-sm text-muted">{l.for}</p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {l.items.map((it) => (
                      <li key={it} className="flex items-center gap-2">
                        <Icon name="check" size={15} className="text-gold" /> {it}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/quote?look=${l.id}`} className="btn-primary mt-6 self-start after:absolute after:inset-0 after:content-['']">
                    Price this look
                  </Link>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* How it works */}
      <Section
        eyebrow="How it works"
        title="Plan in minutes, not phone calls"
        intro="Skip calling five rental companies. Build one list, get one quote, and let us handle the rest."
        action={<Link href="/how-it-works" className="link-line">The full process <Icon name="arrow" size={16} /></Link>}
      >
        <StepFlow
          caption={`How booking event rentals with ${site.name} works: pick your rentals, see live pricing, we coordinate vendors, then everything is delivered, set up and collected.`}
          steps={[
            { icon: "search", title: "Pick your rentals", text: "Browse every category or start from a styled look." },
            { icon: "quote", title: "See live pricing", text: "Your quote totals as you add items and quantities." },
            { icon: "users", title: "We coordinate vendors", text: "We confirm availability with trusted local rental houses." },
            { icon: "truck", title: "Delivered & set up", text: "Dropped off, set, and collected after your event." },
          ]}
        />
      </Section>

      {/* Compare */}
      <section className="container-x pb-16 md:pb-24">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className="well h-full p-8">
            <p className="text-sm font-semibold text-muted uppercase">Doing it yourself</p>
            <ul className="mt-5 space-y-3">
              {[
                "Call or email 4 to 6 rental companies",
                "Compare quotes in different formats",
                "Chase availability for each item",
                "Juggle several delivery windows",
                "Multiple deposits and contracts",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-muted">
                  <Icon name="close" size={18} className="mt-1 shrink-0 text-rose" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100} className="tone-dark h-full rounded-2xl bg-espresso p-8">
            <p className="text-sm font-semibold text-gold uppercase">With {site.name}</p>
            <ul className="mt-5 space-y-3">
              {[
                "One catalog with every category",
                "Live prices, one itemized quote",
                "We confirm availability for you",
                "Coordinated delivery and pickup",
                "One point of contact start to finish",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <Icon name="check" size={18} className="mt-1 shrink-0 text-gold" /> {t}
                </li>
              ))}
            </ul>
            <Link href="/quote?from=home-compare" className="btn-accent mt-8">Start my quote</Link>
          </Reveal>
        </div>
      </section>

      {/* Events */}
      <Section tone="white" eyebrow="For every occasion" title="What are you planning?" center>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {events.map(([label, id, icon]) => (
            <li key={id}>
              <Link href={`/quote?event=${id}`} className="group card card-hover flex h-full flex-col items-start gap-3 p-5">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-soft text-gold">
                  <Icon name={icon} size={20} />
                </span>
                <span className="font-medium">{label}</span>
                <span className="mt-auto inline-flex items-center gap-1 text-sm text-gold">
                  Start a quote <Icon name="arrow" size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Service area */}
      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Where we deliver</p>
            <h2 className="display-2 mt-3">{site.market} and every suburb around it</h2>
            <p className="lede mt-4">
              Lofts in the West Loop, estates on the North Shore, barns in the Fox Valley. We plan around venue rules,
              loading docks and stairs so delivery day is calm.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {site.serviceArea.map((c) => (
                <li key={c} className="chip">
                  <Icon name="pin" size={13} className="text-gold" /> {c}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={100}>
            <figure>
              <div className="media aspect-[16/10]">
                <Image src={scenes.threeLooks.src} alt={scenes.threeLooks.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
              <figcaption className="mt-3 text-sm text-muted">{scenes.threeLooks.caption}</figcaption>
            </figure>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="sand">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="display-2 mt-3">Good to know</h2>
            <p className="lede mt-4">Straight answers on pricing, delivery and booking.</p>
            <Link href="/faq" className="link-line mt-6">All FAQs <Icon name="arrow" size={16} /></Link>
          </div>
          <FaqList faqs={faqs} />
        </div>
      </Section>

      {/* Journal */}
      {posts.length > 0 && (
        <Section
          eyebrow="Ideas & guides"
          title="Plan smarter"
          action={<Link href="/blog" className="link-line">All guides <Icon name="arrow" size={16} /></Link>}
        >
          <div className="grid gap-6 md:grid-cols-3">
            {posts.map((p) => {
              const chair = getChair(p.chair);
              return (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group card card-hover overflow-hidden">
                  {chair && <ChairArt chair={chair} className="aspect-[16/10]" />}
                  <div className="p-6">
                    <p className="text-xs text-muted">
                      {formatDate(p.date)} · {p.readingMinutes} min read
                    </p>
                    <h3 className="mt-2 font-serif text-2xl leading-tight transition-colors group-hover:text-gold">{p.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">{p.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      <div className="-mb-24">
        <QuoteCta source="home" />
      </div>
    </>
  );
}
