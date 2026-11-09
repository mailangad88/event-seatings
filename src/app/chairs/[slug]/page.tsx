import type { Metadata } from "next";
import Link from "@/components/Link";
import { notFound } from "next/navigation";
import { CallCta } from "@/components/CallCta";
import { ChairViewer } from "@/components/ChairViewer";
import { ChairCard } from "@/components/ChairCard";
import { VoteButton } from "@/components/VoteProvider";
import { FaqList, type Faq } from "@/components/ui";
import { chairAlt, chairImage, chairs, getChair } from "@/data/chairs";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export function generateStaticParams() {
  return chairs.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/chairs/[slug]">): Promise<Metadata> {
  const chair = getChair((await props.params).slug);
  if (!chair) return {};
  return seo({
    title: `${chair.name} Rental in ${site.market}`,
    alternates: { canonical: `/chairs/${chair.slug}` },
    ...(chairImage(chair) && {
      openGraph: { images: [{ url: chairImage(chair)!, alt: chairAlt(chair) }] },
    }),
    description: `${chair.tagline}. Rent the ${chair.name} for weddings, corporate events and parties in Chicago and the suburbs. Delivery and setup included.`,
  });
}

export default async function ChairPage(props: PageProps<"/chairs/[slug]">) {
  const chair = getChair((await props.params).slug);
  if (!chair) notFound();

  const related = chairs
    .filter((c) => c.slug !== chair.slug && c.styles.some((s) => chair.styles.includes(s)))
    .slice(0, 3);

  const image = chairImage(chair);
  const pageUrl = `${site.url}/chairs/${chair.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${chair.name} Rental`,
      description: chair.description,
      url: pageUrl,
      ...(image && {
        image: { "@type": "ImageObject", url: `${site.url}${image}`, caption: chairAlt(chair), description: chairAlt(chair) },
      }),
      category: "Event chair rental",
      brand: { "@type": "Brand", name: site.name },
      color: chair.finishes.map((f) => f.name).join(", "),
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/PreOrder",
        businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
        areaServed: site.serviceArea.map((name) => ({ "@type": "City", name })),
        seller: { "@id": `${site.url}/#business` },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: site.url },
        { "@type": "ListItem", position: 2, name: "Chair styles", item: `${site.url}/chairs` },
        { "@type": "ListItem", position: 3, name: chair.name, item: pageUrl },
      ],
    },
  ];

  const facts: [string, string][] = [
    ["Best for", chair.uses.join(", ")],
    ["Styles", chair.styles.join(", ")],
    ["Cushion", chair.cushion],
    ["Stackable", chair.stackable ? "Yes" : "No"],
    ["Outdoor friendly", chair.outdoorFriendly ? "Yes" : "Indoor / tented recommended"],
    ["Pairs with", chair.pairsWith],
  ];

  const faqs: Faq[] = [
    {
      q: `How much does it cost to rent a ${chair.name} in Chicago?`,
      a: `It depends on quantity and your date, so we price it in a free quote. Delivery, setup and teardown are itemized separately, and per-chair rates usually drop for larger orders.`,
    },
    {
      q: `What events is the ${chair.name} best for?`,
      a: `It works best for ${chair.uses.join(", ").toLowerCase()}, and suits ${chair.styles.join(", ").toLowerCase()} styles. It pairs well with ${chair.pairsWith.charAt(0).toLowerCase()}${chair.pairsWith.slice(1)}.`,
    },
    {
      q: `Can the ${chair.name} be used outdoors?`,
      a: chair.outdoorFriendly
        ? "Yes. It handles lawns, patios and tents well. On soft grass, ask us about floor boards or a level setup area."
        : "We recommend it indoors or under a tent with flooring, because rain and soft ground can damage the finish.",
    },
    {
      q: "Does it come with a cushion?",
      a:
        chair.cushion === "Included"
          ? "Yes, a seat cushion is included in the rental price."
          : chair.cushion === "Optional"
            ? "Cushions are optional. Add them to your quote in the colour you want."
            : "No cushion is needed; the seat is designed to be used as is.",
    },
    {
      q: "How many should I order?",
      a: "Plan one per seated guest, plus 3 to 5 percent extra for vendors and late RSVPs. If your ceremony and reception are in different spaces with no flip time, you may need a second set.",
    },
  ];

  return (
    <>
    <div className="container-x py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-gold">Home</Link>
        <span className="mx-2 text-line" aria-hidden>/</span>
        <Link href="/chairs" className="hover:text-gold">Chair styles</Link>
        <span className="mx-2 text-line" aria-hidden>/</span>
        {chair.name}
      </nav>

      <div className="mt-10 grid gap-12 md:grid-cols-[1.1fr_1fr] md:gap-20">
        <div className="md:sticky md:top-32 md:self-start">
          <ChairViewer chair={chair} />
        </div>
        <div className="md:py-6">
          <p className="font-heading font-semibold text-lg text-gold">
            No. {String(chairs.indexOf(chair) + 1).padStart(2, "0")} · {chair.styles.join(" · ")}
          </p>
          <h1 className="display-1 mt-4">{chair.name}</h1>
          <p className="mt-5 font-heading text-2xl leading-snug font-medium text-muted">{chair.tagline}</p>

          <p className="mt-8 leading-8" data-answer>
            {chair.description} In {site.market} the {chair.name}
            {chair.stackable ? " stacks for quick setup" : " does not stack"} and is {chair.outdoorFriendly ? "fine outdoors" : "best indoors or under a tent"}. It suits{" "}
            {chair.uses.slice(0, 3).join(", ").toLowerCase()}.
          </p>

          <div className="well mt-10 flex items-baseline gap-3 px-5 py-4">
            <span className="text-xs tracking-[0.2em] text-muted uppercase">Price</span>
            <span className="headline text-xl">Get your price in a free quote</span>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href={`/quote?chairs=${chair.slug}`} className="btn-primary">
              Request a quote
            </Link>
            <Link href={`/book?from=chair-${chair.slug}`} className="btn-ghost">
              Book a free call
            </Link>
            <VoteButton slug={chair.slug} size="lg" />
          </div>
          <p className="mt-4 text-sm text-muted">
            Final pricing is confirmed in your personal quote. Save pieces to compare them later.
          </p>

          <dl className="mt-12 border-t border-line text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[150px_1fr] gap-4 border-b border-line py-4">
                <dt className="font-medium text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="mt-24 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow">Styling</p>
          <h2 className="display-2 mt-3">Finishes, delivery and care</h2>
        </div>
        <div className="space-y-5 leading-8">
          <p>
            The {chair.name} comes in {chair.finishes.map((f) => f.name.toLowerCase()).join(", ")}
            {chair.finishes.length > 1 ? ", so you can match it to your linens rather than build the room around the chair" : ""}.
            It pairs well with {chair.pairsWith.charAt(0).toLowerCase()}
            {chair.pairsWith.slice(1)}, and suits {chair.styles.join(", ").toLowerCase()} rooms best.
          </p>
          <p>
            Chairs arrive stacked on dollies and are counted against your order sheet before our crew leaves, so you are not the one checking boxes on the day.
            {chair.stackable
              ? " Because it stacks, we can turn a ceremony into a reception in minutes if you are flipping the same room."
              : " It does not stack, so flipping a room from ceremony to reception needs a few extra minutes, or a second set of chairs if you cannot spare the time."}{" "}
            {chair.outdoorFriendly
              ? "It handles grass, patios and tents well; on soft lawn, ask us about floor boards so the legs don't sink."
              : "Keep it indoors or under a tent with proper flooring — rain and damp ground can warp the finish or stain the seat."}
          </p>
          <p>We pick every chair back up after your event, so there is nothing for you to clean, fold or store.</p>
          <p>
            A damage waiver on your quote covers normal wear, a scuffed leg or a wine spill on the seat, so a small mishap during the event does not turn into a bill afterward.
            If you are mixing the {chair.name} with another style on the day, tell us the split when you book and we will deliver both counted and ready for your layout.
          </p>
        </div>
      </section>

      <section className="mt-24 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <p className="eyebrow">Questions</p>
          <h2 className="display-2 mt-3">About the {chair.name}</h2>
          <p className="lede mt-4">Price, fit and planning answers for Chicago-area events.</p>
        </div>
        <FaqList faqs={faqs} />
      </section>

      {related.length > 0 && (
        <section className="mt-24">
          <p className="eyebrow">Also consider</p>
          <h2 className="display-2 mt-3">
            Pieces in a <em>similar</em> spirit
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <ChairCard key={c.slug} chair={c} index={chairs.indexOf(c)} />
            ))}
          </div>
        </section>
      )}
    </div>
    <div className="mt-32 -mb-32">
      <CallCta title={<>Is the {chair.name} <em className="text-gold">right</em> for your room?</>} source={`chair-${chair.slug}`} />
    </div>
    </>
  );
}
