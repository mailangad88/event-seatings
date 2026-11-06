import Image from "next/image";
import Link from "@/components/Link";
import { Reveal } from "@/components/Reveal";
import { ReadyPackages } from "@/components/ReadyPackages";
import { CategoryTile, FaqList, Icon, QuoteCta, Section, StepFlow, TrustBar, type Faq } from "@/components/ui";
import { rentalCategories } from "@/lib/nav";
import { catalogItems } from "@/data/catalog";
import { categoryTile } from "@/lib/scenes";
import { site } from "@/lib/site";
import type { Metadata } from "next";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: { absolute: "Beyond Chiavari | Chicago Event Rentals: Chairs, Tables, Tents" },
  description:
    "Chicago event rentals in one quote: chairs, tables, linens, dinnerware, tents and more, with prices up front and delivery and setup.",
  alternates: { canonical: "/", languages: { "en-US": "/", "es-US": "/es", "x-default": "/" } },
});

export const revalidate = 3600;

// The categories people ask for most. The rest are one tap away on /rentals.
const topCategories = ["chairs", "tables", "linens", "dinnerware", "tents", "lighting", "dance-floors-staging", "decor"];

const faqs: Faq[] = [
  {
    q: `What can I rent through ${site.name}?`,
    a: "Everything a party needs: chairs, tables, linens and napkins, dinnerware, glassware, flatware, tents, lighting, lounge furniture, bars and backdrops, dance floors, decor and catering equipment. Pick it all in one quote.",
  },
  {
    q: "How does pricing work?",
    a: "Every item shows its rental price per piece or per set, and your quote totals as you pick. Item prices are our own prices for a one-day rental, and there's no separate booking fee. Delivery, setup, damage waiver and tax are itemized before you book, and a 20% deposit reserves your date, with the rest paid in stages before your event.",
  },
  {
    q: "Do I pay anything to get a quote?",
    a: "No. Quotes are free and there is no obligation. Nothing is reserved or charged until you approve the final quote.",
  },
  {
    q: "Which areas do you serve?",
    a: `Chicago and the suburbs, including ${site.serviceArea.slice(1).join(", ")}. Ask about venues farther out.`,
  },
];

// The hero uses our own rendered tablescape (not the styled Gemini version, which has guests in it)
// so the home page opens on an empty, just-set-up table.
const hero = {
  src: "/images/scenes/blush-garden-tablescape.webp",
  alt: `Blush garden wedding tablescape rendered by ${site.name}: rose-gold bamboo chairs with ivory cushions, a blush linen banquet table, taper candles and a low white floral runner in front of a twinkle-light drape`,
};

export default function Home() {
  return (
    <>
      {/* Hero: one message, one main button, one picture. */}
      <section className="relative overflow-hidden">
        <div className="container-x grid items-center gap-10 pt-10 pb-16 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pb-24">
          <div className="animate-rise">
            <p className="eyebrow">
              <Icon name="pin" size={14} /> Event rentals in Chicago and the suburbs
            </p>
            <h1 className="display-1 mt-5">Rent everything for your event in one quote</h1>
            <p className="lede mt-6 max-w-xl" data-answer>
              Chairs, tables, linens, dishes, tents and lighting for events across {site.market} and the suburbs, with
              every price on the site. Pick what you need and see the total as you go. We handle delivery, setup and
              pickup, and there&apos;s no separate booking fee.
            </p>
            <div className="cta-row mt-8 items-center">
              <Link href="/quote?from=home-hero" className="btn-primary btn-lg">
                Get a free quote <Icon name="arrow" size={18} />
              </Link>
              <Link href="/rentals" className="link-line">Or browse rentals</Link>
            </div>
          </div>
          <div className="animate-rise media aspect-[4/3] shadow-lift [animation-delay:150ms] lg:aspect-[4/5]">
            <Image src={hero.src} alt={hero.alt} fill priority fetchPriority="high" sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface">
        <div className="container-x py-10">
          <TrustBar />
        </div>
      </section>

      {/* Categories: the eight most asked for, the rest one tap away. */}
      <Section
        eyebrow="Shop by category"
        title="What do you need?"
        action={<Link href="/rentals" className="link-line">All {rentalCategories.length} categories <Icon name="arrow" size={16} /></Link>}
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {topCategories.flatMap((id, i) => {
            const c = rentalCategories.find((x) => x.id === id);
            if (!c) return [];
            return [
              <Reveal key={c.id} delay={(i % 4) * 60}>
                <CategoryTile
                  href={`/rentals/${c.id}`}
                  name={c.name}
                  blurb={c.blurb}
                  icon={c.icon}
                  image={categoryTile(c.id)}
                  count={catalogItems.filter((x) => x.categoryId === c.id).length || undefined}
                />
              </Reveal>,
            ];
          })}
        </div>
      </Section>

      {/* Ready-made packages */}
      <Section
        tone="sand"
        eyebrow="Short on time?"
        title="Start from a ready-made package"
        intro="Typical parties, already sized and priced with delivery, setup, waiver and tax. Start with a ready-made package and customize it to your needs."
        action={<Link href="/packages" className="link-line">All packages <Icon name="arrow" size={16} /></Link>}
      >
        <ReadyPackages ids={["backyard-birthday-50", "graduation-80", "wedding-150", "corporate-120"]} compact />
      </Section>

      {/* The offer that fits big multi-company events best, one tap away. */}
      <Section>
        <Link href="/big-celebrations" className="card group grid overflow-hidden md:grid-cols-[1fr_1.2fr]">
          <span className="relative block aspect-[4/3] md:aspect-auto">
            <Image
              src="/rentals/styled/event-indian-wedding.webp"
              alt="Carved wooden mandap draped in marigold and floral garlands over a cushioned loveseat, set up in a ballroom under a crystal chandelier"
              fill
              sizes="(max-width: 768px) 100vw, 40vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </span>
          <span className="block p-6 sm:p-10">
            <span className="eyebrow">150 to 400 guests</span>
            <span className="display-2 mt-3 block">Planning a big wedding, sangeet or quinceañera?</span>
            <span className="lede mt-4 block">
              Big celebrations need chairs, tables, linens, a tent and more. We put it all on one order, line up delivery
              times and check every delivery on the day.
            </span>
            <span className="link-line mt-6 inline-flex">
              How we handle big celebrations <Icon name="arrow" size={16} />
            </span>
          </span>
        </Link>
      </Section>

      {/* How it works */}
      <Section
        eyebrow="How it works"
        title="How booking works"
        intro="Instead of calling around, make one list and send it to us."
        action={<Link href="/how-it-works" className="link-line">More detail <Icon name="arrow" size={16} /></Link>}
      >
        <StepFlow
          caption={`How booking event rentals with ${site.name} works: pick your rentals, see prices, we confirm your date, then everything is delivered, set up and collected.`}
          steps={[
            { icon: "search", title: "Pick your rentals", text: "Browse by category or start from a package." },
            { icon: "quote", title: "See prices as you go", text: "Your quote adds up as you pick." },
            { icon: "users", title: "We confirm it", text: "We check your date and send a written quote." },
            { icon: "truck", title: "Delivered & set up", text: "Dropped off, set up and picked up after." },
          ]}
        />
      </Section>


      <QuoteCta source="home" />

      {/* FAQ */}
      <Section tone="sand">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="display-2 mt-3">Good to know</h2>
            <Link href="/faq" className="link-line mt-6">All FAQs <Icon name="arrow" size={16} /></Link>
          </div>
          <FaqList faqs={faqs} />
        </div>
      </Section>
    </>
  );
}
