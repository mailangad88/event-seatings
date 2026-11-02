import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CallCta } from "@/components/CallCta";
import { ProcessFlow } from "@/components/ProcessFlow";
import { Figure, Icon, PageHero, Section } from "@/components/ui";
import { render, scenes } from "@/lib/scenes";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us: Chicago's Event Rental Marketplace",
  description: `${site.name} is a locally owned Chicago-area event rental marketplace. One quote for chairs, tables, linens, dinnerware, tents and more, coordinated with trusted local rental houses.`,
  alternates: { canonical: "/about" },
};

const values = [
  { icon: "quote", title: "Transparent prices", text: "Every item shows its price. Your quote totals as you go, with delivery and setup itemized." },
  { icon: "users", title: "Trusted vendors", text: "We work with established rental houses and match each item to the vendor that does it best." },
  { icon: "chat", title: "One point of contact", text: "From the first question to pickup, you deal with one team, not five." },
  { icon: "pin", title: "Locally owned", text: `Based in ${site.city}, serving the whole Chicago area from the Loop to the Fox Valley.` },
] as const;

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
          <blockquote className="font-serif text-3xl leading-snug italic sm:text-4xl">
            &ldquo;Hosts spend months on florals and lighting, then lose weekends chasing rental quotes. We wanted
            that part to take minutes.&rdquo;
          </blockquote>
          <div className="prose-post">
            <p>
              {site.name} started with chairs: we noticed nearly every reception in Chicago used the same one. The more
              we talked to couples and planners, the clearer it became that the real problem was bigger. Getting
              chairs, tables, linens and dishes for one event meant juggling several vendors, formats and delivery
              windows.
            </p>
            <p>
              So we built a marketplace. You browse everything an event needs, see prices up front and send one quote
              request. We confirm availability with trusted local rental houses, coordinate delivery and pickup, and
              stay your single point of contact.
            </p>
            <h2>Where we deliver</h2>
            <p>{site.serviceArea.join(", ")} and surrounding suburbs. Not sure we reach your venue? Just ask.</p>
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

      <Section eyebrow="How it works" title="From first idea to last dance">
        <ProcessFlow />
        <div className="relative mt-14 aspect-[16/7] overflow-hidden rounded-2xl">
          <Image src={render("garden-ceremony").src} alt={render("garden-ceremony").alt} fill sizes="100vw" className="object-cover" />
        </div>
      </Section>

      <div className="-mb-32">
        <CallCta source="about" />
      </div>
    </>
  );
}
