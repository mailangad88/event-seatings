import type { Metadata } from "next";
import Link from "@/components/Link";
import { Figure, HubFaqs, Icon, JsonLd, PageHero, QuoteCta, Section, type IconName } from "@/components/ui";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

const title = "Event Rental Glossary: Terms on Every Rental Quote";
const description =
  "Plain-English definitions of the terms on event rental quotes and contracts: damage waiver, drop length, load-in, Chiavari, highboy, frame tent and more.";

export const metadata: Metadata = seo({ title, description, alternates: { canonical: "/glossary" } });

type Term = { term: string; def: string; link?: { href: string; label: string } };
type Group = { id: string; label: string; icon: IconName; terms: Term[] };

// Terms people meet on rental quotes, contracts and product pages, each linked to where they can act on it.
const groups: Group[] = [
  {
    id: "quotes",
    label: "Quotes, fees and contracts",
    icon: "quote",
    terms: [
      { term: "Damage waiver", def: "A fee, usually a percentage of the rental total, that covers accidental damage beyond normal wear. It usually excludes loss and theft. Some houses make it mandatory.", link: { href: "/solutions/compare-event-rental-quotes", label: "Compare quotes line by line" } },
      { term: "Deposit", def: "The part of the rental paid upfront to hold your items for a date. Check how much is refundable and until when." },
      { term: "Order minimum", def: "The smallest order a rental company will deliver, often set by full-service houses to cover a truck and crew.", link: { href: "/solutions/rental-minimum-order-too-high", label: "Options when the minimum is too high" } },
      { term: "Booking fee", def: `What ${site.name} charges to coordinate your order: a flat $295 per event ($495 over 200 guests), shown on every proposal. Item prices carry no markup.`, link: { href: "/booking-promise", label: "How payments work" } },
      { term: "Itemized quote", def: "A quote that lists every item, quantity and fee separately, so it can be compared with another quote.", link: { href: "/quote", label: "Build an itemized quote" } },
      { term: "Certificate of insurance (COI)", def: "Proof of a vendor's liability insurance. Many Chicago venues require one from every vendor before load-in." },
      { term: "Rental period", def: "How long the price covers: one day, a weekend, or a fixed number of hours with overtime charged after." },
    ],
  },
  {
    id: "delivery",
    label: "Delivery and setup",
    icon: "truck",
    terms: [
      { term: "Delivery window", def: "The time range when the truck will arrive. Narrow, early, late-night and weekend windows usually cost more.", link: { href: "/solutions/event-rental-delivery-pickup-times", label: "Delivery and pickup times" } },
      { term: "Load-in / load-out", def: "The venue's allowed times for vendors to bring items in and take them out. Get these before you ask for quotes." },
      { term: "Setup", def: "Placing rentals where they go. Ask whether it means placed in your layout or dropped stacked near the door." },
      { term: "Breakdown", def: "Collecting, stacking and loading rentals after the event, before pickup." },
      { term: "Long carry", def: "Extra distance between the truck and the room, which some companies charge for along with stairs." },
      { term: "Drop-off rental", def: "Items delivered and picked up without setup. Common for party rentals and backyard events." },
    ],
  },
  {
    id: "chairs",
    label: "Chairs",
    icon: "chair",
    terms: [
      { term: "Chiavari chair", def: "A light, stackable ballroom chair with thin spindles, usually rented with a seat cushion. The classic wedding reception chair.", link: { href: "/rentals/chairs", label: "Chair rentals" } },
      { term: "Cross-back chair", def: "A wooden chair with an X-shaped back, popular for rustic, barn and garden weddings.", link: { href: "/chairs/cross-back", label: "Cross-back chair" } },
      { term: "Ghost chair", def: "A clear acrylic chair, often in a Louis shape, that keeps a room looking open.", link: { href: "/chairs/ghost", label: "Ghost chair" } },
      { term: "Resin folding chair", def: "A sturdier, more finished folding chair than basic plastic, common for ceremonies." },
      { term: "Seat pad", def: "The cushion tied to a Chiavari or cross-back chair. Color is usually chosen with the linens." },
    ],
  },
  {
    id: "tables",
    label: "Tables and linens",
    icon: "table",
    terms: [
      { term: "60-inch round", def: "The standard banquet round. Seats 8 comfortably, 10 snugly.", link: { href: "/tools/rental-calculator", label: "Rental calculator" } },
      { term: "Banquet table", def: "A long rectangular table (often 6 or 8 feet) used for buffets, head tables and family-style rows." },
      { term: "Highboy", def: "A tall cocktail table for standing guests, usually 30 inches across. Plan about one per 10 guests during cocktail hour." },
      { term: "Drop length", def: "How far a tablecloth hangs from the table edge. Floor-length means it touches the floor; lap-length hangs about 15 inches." },
      { term: "Spandex cover", def: "A fitted stretch cover, mostly for highboys, that hugs the table shape." },
      { term: "Runner", def: "A narrow cloth along the center of a table, on top of the main linen.", link: { href: "/rentals/linens", label: "Linen rentals" } },
    ],
  },
  {
    id: "tableware",
    label: "Tableware",
    icon: "plate",
    terms: [
      { term: "Charger", def: "A large decorative plate under the dinner plate. It is removed or left as the courses change.", link: { href: "/rentals/dinnerware", label: "Dinnerware rentals" } },
      { term: "Place setting", def: "Everything at one seat: plates, flatware, glasses and napkin." },
      { term: "Chafing dish", def: "A buffet warmer that keeps food hot over fuel or electric heat." },
    ],
  },
  {
    id: "tents",
    label: "Tents and structures",
    icon: "tent",
    terms: [
      { term: "Frame tent", def: "A tent held up by a metal frame with no center poles, so the inside is open. Can go on hard surfaces with weights.", link: { href: "/rentals/tents", label: "Tent rentals" } },
      { term: "Pole tent", def: "A tent held up by center poles and staked into grass. Usually cheaper and taller than a frame tent of the same size." },
      { term: "Sidewalls", def: "Panels hung from the tent edge to block wind and rain. Clear or solid." },
      { term: "Dance floor", def: "Interlocking panels laid on grass or carpet. Sized by guests dancing at once, not total guests.", link: { href: "/rentals/dance-floors-staging", label: "Dance floors" } },
    ],
  },
];

const all = groups.flatMap((g) => g.terms);

export default function Page() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: "Event rental glossary",
          url: `${site.url}/glossary`,
          hasDefinedTerm: all.map((t) => ({ "@type": "DefinedTerm", name: t.term, description: t.def, url: `${site.url}/glossary#${slug(t.term)}` })),
        }}
      />
      <PageHero
        breadcrumbs={[{ name: "Glossary", href: "/glossary" }]}
        eyebrow="Event rentals, explained"
        title="Event rental glossary"
        intro={`${all.length} terms you will meet on event rental quotes, contracts and product pages, in plain English: from damage waivers and flip fees to frame tents, chargers and 120-inch rounds. Each definition links to the page where you can price that item or read more before you book.`}
        media={<Figure {...scenes.chairDetail} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />
      <nav aria-label="Glossary sections" className="container-x -mt-4 mb-4 flex flex-wrap gap-2">
        {groups.map((g) => (
          <a key={g.id} href={`#${g.id}`} className="chip">{g.label}</a>
        ))}
      </nav>
      {groups.map((g, i) => (
        <Section key={g.id} id={g.id} tone={i % 2 ? "default" : "sand"} title={<span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-gold-soft text-gold"><Icon name={g.icon} size={20} /></span>{g.label}</span>}>
          <dl className="grid gap-x-10 gap-y-6 md:grid-cols-2">
            {g.terms.map((t) => (
              <div key={t.term} id={slug(t.term)} className="scroll-mt-28">
                <dt className="font-heading font-semibold text-xl">{t.term}</dt>
                <dd className="mt-1 text-sm leading-7 text-muted">
                  {t.def}
                  {t.link && (
                    <>
                      {" "}
                      <Link href={t.link.href} className="link whitespace-nowrap">{t.link.label}</Link>
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </Section>
      ))}
      <HubFaqs
        title="Rental terms people ask about"
        faqs={[
          { q: "What is a damage waiver on an event rental?", a: "A fee, usually about 10% of the rental total, that covers accidental damage such as a chipped plate or a torn linen. It does not cover loss, theft or misuse, and most rental companies add it to every order." },
          { q: "What is a flip fee?", a: "A labor charge to move chairs or tables from the ceremony layout to the reception layout during cocktail hour. It usually costs less than renting a second set of chairs." },
          { q: "What does 'rented in dozens' mean?", a: "Some items, such as plates, flatware and napkins, are only rented in packs of 12, so quantities round up to the next dozen on your quote." },
        ]}
      />
      <QuoteCta source="glossary" />
    </>
  );
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
