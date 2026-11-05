import type { Metadata } from "next";
import Image from "next/image";
import Link from "@/components/Link";
import { CallCta } from "@/components/CallCta";
import { ProcessFlow } from "@/components/ProcessFlow";
import { Figure, HubFaqs, Icon, PageHero, Section } from "@/components/ui";
import { render, scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { seo } from "@/lib/seo";

export const metadata: Metadata = seo({
  title: "About Us: Chicago Event Rentals in One Order",
  description: `${site.name} is a locally owned Chicago-area event rental company. One quote for chairs, tables, linens, dinnerware, tents and more, with delivery, setup and pickup.`,
  alternates: { canonical: "/about" },
});

const values = [
  { icon: "quote", title: "Prices you can see", text: "Every item shows its price. Your quote totals as you go, with delivery and setup itemized." },
  { icon: "users", title: "Everything in one order", text: "Chairs, tables, linens, dishes and tents on one quote, with one person to call." },
  { icon: "chat", title: "One point of contact", text: "From the first question to pickup, you deal with one person instead of five companies." },
  { icon: "pin", title: "Locally owned", text: `Based in ${site.city}, serving the whole Chicago area from the Loop to the Fox Valley.` },
] as const;

const aboutFaqs = [
  {
    q: `What is ${site.name}?`,
    a: `${site.name} is a Chicago-area event rental company. You pick chairs, tables, linens, dinnerware, tents and more in one quote, and we handle delivery, setup and pickup as your single point of contact.`,
  },
  {
    q: "How do you make money?",
    a: "By the item, at the prices on our site. Your quote adds delivery, setup, damage waiver and tax, and there's no separate booking fee. A 20% deposit books your date, then the rest comes due in stages before your event. There is no charge for a quote or a planning call.",
  },
  {
    q: "Where are you based and where do you deliver?",
    a: `We are based in ${site.city} and arrange delivery across Chicago and the suburbs, from the Loop and the North Shore to DuPage County and the Fox Valley.`,
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        breadcrumbs={[{ name: "About", href: "/about" }]}
        eyebrow="About us"
        title={<>Event rentals, <em className="text-gold">without</em> the runaround</>}
        intro={`Planning a party in Chicago usually means calling a chair company, a linen company, a tent company and a dishware company, then stitching four quotes together. ${site.name} puts it all in one place.`}
        actions={<Link href="/rentals" className="btn-primary">Browse rentals</Link>}
        media={<Figure {...scenes.gildedIvory} ratio="4/5" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <blockquote className="font-heading font-semibold text-3xl leading-snug sm:text-4xl">
            Getting rental quotes from five companies takes a lot of phone calls. We wanted it to be one list and
            one quote.
          </blockquote>
          <div className="prose-post">
            <p>
              {site.name} started with chairs: we noticed nearly every reception in Chicago used the same one. The more
              we talked to couples and planners, the clearer it became that the real problem was bigger. Getting
              chairs, tables, linens and dishes for one event meant juggling several vendors, formats and delivery
              windows.
            </p>
            <p>
              So we built one site for all of it. You browse everything an event needs, see prices up front and send one quote
              request. We confirm availability, handle delivery, setup and pickup, and
              stay your single point of contact.
            </p>
            <h2>Where we deliver</h2>
            <p>
              {site.serviceArea.join(", ")} and surrounding suburbs. See every{" "}
              <Link href="/chair-rentals">area we serve</Link>, browse{" "}
              <Link href="/rentals">all rentals with prices</Link>, read{" "}
              <Link href="/how-it-works">how booking works</Link> and{" "}
              <Link href="/booking-promise">who you pay and when</Link>, or{" "}
              <Link href="/quote">start a free quote</Link>. Not sure we reach your venue? Just ask.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="sand" eyebrow="What we stand for" title="Why hosts book with us">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <li key={v.title} className="card p-6">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-gold-soft text-gold">
                <Icon name={v.icon} size={22} />
              </span>
              <h3 className="mt-4 text-lg font-medium">{v.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </Section>


      <Section eyebrow="How it works" title="From quote to pickup">
        <ProcessFlow />
        <div className="relative mt-14 aspect-[16/7] overflow-hidden rounded-2xl">
          <Image src={render("garden-ceremony").src} alt={render("garden-ceremony").alt} fill sizes="100vw" className="object-cover" />
        </div>
      </Section>

      <HubFaqs faqs={aboutFaqs} title={`About ${site.name}: common questions`} />

      <div className="-mb-32">
        <CallCta source="about" />
      </div>
    </>
  );
}
