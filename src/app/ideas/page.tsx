import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WaitlistForm } from "@/components/WaitlistForm";
import { FaqList, Icon, JsonLd, PageHero, Section, type Faq } from "@/components/ui";
import { monthIdeas, type MonthIdeas } from "@/data/ideas";
import { getPosts, type Post } from "@/lib/blog";
import { normalHighF, sunTimes } from "@/lib/chicago-climate";
import { plannerEvents } from "@/lib/event-plan";
import { rentalCategories } from "@/lib/nav";
import { site } from "@/lib/site";

// "This month" moves with the calendar, so re-render daily.
export const revalidate = 86400;

const title = "Event Ideas by Month: What to Plan and Book in Chicago Now";
const description = `Seasonal event ideas for every month in Chicago: what people are celebrating, what to rent, what to book now for later events, and planning guides. Updated each month by ${site.name}.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/ideas" },
  openGraph: { title, description, url: "/ideas", images: [{ url: "/rentals/scenes/tent-reception-dusk.webp", alt: "Frame tent reception lit at dusk" }] },
};

const faqs: Faq[] = [
  {
    q: "How far ahead should I book event rentals in Chicago?",
    a: "Book weddings and Indian weddings about 9 months ahead, quinceañeras about 6, corporate galas about 4, and birthdays, showers and graduation parties about 2 months ahead. Peak dates (May to October Saturdays and December Fridays) fill first, so add a month for those.",
  },
  {
    q: "What is the busiest time of year for event rentals in Chicago?",
    a: "May through October for outdoor events, with June, September and October Saturdays most in demand, and December for indoor holiday parties. Tents, dance floors and specialty chairs are the first items to sell out.",
  },
  {
    q: "When is it warm enough for an outdoor event in Chicago?",
    a: `Normal daily highs at O'Hare reach about ${Math.round(normalHighF[4])}°F in May and stay above 70°F through September (NWS 1991-2020 normals). The median last spring freeze is April 21 and the first fall freeze is October 19, so plan heaters and sidewalls outside that window.`,
  },
  {
    q: "How often does this page change?",
    a: "The featured month and the \"book now\" list update automatically on the first of each month. The ideas and guides behind each month are reviewed and added to through the year.",
  },
];

export default async function IdeasPage() {
  const now = new Date();
  const mi = now.getMonth();
  const current = monthIdeas[mi];
  const upcoming = [1, 2, 3].map((k) => monthIdeas[(mi + k) % 12]);
  const posts = new Map((await getPosts()).map((p) => [p.slug, p]));
  const guidesFor = (m: MonthIdeas) => [...m.moments.map((x) => x.guide), ...m.guides].filter((s): s is string => !!s && posts.has(s)).map((s) => posts.get(s)!);
  const uniq = (list: Post[]) => [...new Map(list.map((p) => [p.slug, p])).values()];

  // Book-now list: the event month that this month's booking window lines up with, per occasion.
  const bookNow = plannerEvents
    .filter((e, i, all) => all.findIndex((x) => x.name === e.name) === i)
    .map((e) => {
      const d = new Date(now.getFullYear(), mi + e.leadMonths, 1);
      return { e, month: d.toLocaleDateString("en-US", { month: "long", year: "numeric" }) };
    });
  const midMonth = `${now.getFullYear()}-${String(mi + 1).padStart(2, "0")}-15`;
  const sun = sunTimes(midMonth);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: title,
          description,
          url: `${site.url}/ideas`,
          isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
          about: { "@type": "Thing", name: "Event planning in Chicago" },
          hasPart: monthIdeas.map((m) => ({ "@type": "WebPageElement", name: `${m.name}: ${m.headline}`, url: `${site.url}/ideas#${m.slug}` })),
        }}
      />
      <PageHero
        breadcrumbs={[{ name: "Ideas", href: "/ideas" }]}
        eyebrow={`This month in Chicago · ${current.name}`}
        title={current.headline}
        intro={current.mood}
        actions={
          <>
            <Link href="/my-events" className="btn-primary">Save my event date</Link>
            <a href="#year" className="btn-ghost">See every month</a>
            <Link href="/party-ideas" className="btn-ghost">Party ideas by occasion</Link>
          </>
        }
        meta={`Mid-${current.name}: normal high ${Math.round(normalHighF[mi])}°F at O'Hare, sunset about ${sun.sunset}.`}
        media={
          <figure className="media relative aspect-[4/3]">
            <Image src={current.image} alt={current.alt} fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
          </figure>
        }
      />

      <Section eyebrow={`Celebrating in ${current.name}`} title="What people are planning right now">
        <ul className="grid gap-5 md:grid-cols-3">
          {current.moments.map((m) => {
            const g = m.guide ? posts.get(m.guide) : undefined;
            return (
              <li key={m.name} className="card flex flex-col p-6">
                <h3 className="font-serif text-2xl">{m.name}</h3>
                <p className="mt-3 flex-1 leading-7 text-muted">{m.idea}</p>
                {g && (
                  <Link href={`/blog/${g.slug}`} className="link mt-4 inline-flex items-center gap-1 text-sm">
                    {g.title} <Icon name="arrow" size={14} />
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <h3 className="mt-12 font-serif text-2xl">Rentals people book this month</h3>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {current.rent.map((id) => {
            const c = rentalCategories.find((x) => x.id === id);
            if (!c) return null;
            return (
              <li key={id}>
                <Link href={`/rentals/${id}`} className="card card-hover flex h-full items-start gap-3 p-4">
                  <Icon name={c.icon} size={24} className="shrink-0 text-gold" />
                  <span>
                    <span className="block font-medium">{c.name}</span>
                    <span className="block text-xs text-muted">{c.blurb}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Section>

      <Section tone="sand" eyebrow="Book now for later" title={`If you're reading this in ${current.name}…`} intro="Most Chicago hosts reserve rentals this far ahead. If your event falls in the month shown, this is your month to book.">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {bookNow.map(({ e, month }) => (
            <li key={e.id}>
              <Link href={`/my-events`} className="card card-hover flex h-full items-center gap-4 overflow-hidden">
                <span className="relative aspect-square w-20 shrink-0">
                  <Image src={e.image} alt={e.alt} fill sizes="80px" className="object-cover" />
                </span>
                <span className="py-3 pr-3">
                  <span className="block font-medium">{e.name}</span>
                  <span className="block text-sm text-muted">in {month}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          Save your date in <Link href="/my-events" className="link">My Events</Link> for a countdown and a checklist dated back from your event.
        </p>
      </Section>

      <Section eyebrow="Read this month" title={`${current.name} planning guides`}>
        <ul className="grid gap-x-10 gap-y-4 md:grid-cols-2">
          {uniq(guidesFor(current)).map((p) => (
            <li key={p.slug} className="border-b border-line pb-4">
              <Link href={`/blog/${p.slug}`} className="group block">
                <span className="font-serif text-xl group-hover:text-gold">{p.title}</span>
                <span className="mt-1 block text-sm text-muted line-clamp-2">{p.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section tone="sand" eyebrow="Coming up" title="The next three months">
        <ul className="grid gap-5 md:grid-cols-3">
          {upcoming.map((m) => (
            <li key={m.slug} className="card overflow-hidden">
              <a href={`#${m.slug}`} className="group block">
                <span className="relative block aspect-[16/10]">
                  <Image src={m.image} alt={m.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                </span>
                <span className="block p-5">
                  <span className="eyebrow">{m.name}</span>
                  <span className="mt-2 block font-serif text-2xl leading-tight">{m.headline}</span>
                  <span className="mt-2 block text-sm text-muted">{m.moments.map((x) => x.name).join(" · ")}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="year" eyebrow="The whole year" title="Chicago event ideas, month by month">
        <div className="space-y-6">
          {monthIdeas.map((m, i) => (
            <article key={m.slug} id={m.slug} className={`card grid scroll-mt-24 overflow-hidden md:grid-cols-[240px_1fr] ${i === mi ? "border-gold" : ""}`}>
              <div className="relative aspect-[16/9] md:aspect-auto">
                <Image src={m.image} alt={m.alt} fill sizes="(max-width: 768px) 100vw, 240px" className="object-cover" />
              </div>
              <div className="p-6">
                <p className="eyebrow">
                  {m.name} · normal high {Math.round(normalHighF[i])}°F{i === mi ? " · this month" : ""}
                </p>
                <h2 className="mt-2 font-serif text-2xl">{m.headline}</h2>
                <p className="mt-2 leading-7 text-muted">{m.mood}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {m.moments.map((x) =>
                    x.guide && posts.has(x.guide) ? (
                      <li key={x.name}><Link href={`/blog/${x.guide}`} className="chip">{x.name}</Link></li>
                    ) : (
                      <li key={x.name} className="chip">{x.name}</li>
                    ),
                  )}
                </ul>
                <p className="mt-4 text-sm">
                  <Link href={`/chicago-event-seasons/${m.slug}`} className="link">Weather and rentals in {m.name}</Link>
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="sand" center eyebrow="Monthly ideas letter" title="Get next month's ideas by email" intro={`One email a month from ${site.name}: what Chicago hosts are planning, what to book now, and new free tools. Unsubscribe any time.`}>
        <div className="mx-auto max-w-md">
          <WaitlistForm source="ideas-monthly" />
        </div>
      </Section>

      <Section eyebrow="Questions" title="Planning by season">
        <FaqList faqs={faqs} />
      </Section>
    </>
  );
}
