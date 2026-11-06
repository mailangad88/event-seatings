import Image from "next/image";
import Link from "@/components/Link";
import { sceneFor } from "@/lib/scenes";
import { site } from "@/lib/site";
import { Icon } from "./Icon";

// Sitewide conversion band: build a quote or book a call. Put one near the end of every page.
export function QuoteCta({
  title = "Get a price for your whole event",
  text = "Pick chairs, tables, linens, dinnerware and more, see live prices, and get a written quote checked for your date.",
  source,
}: {
  title?: React.ReactNode;
  text?: React.ReactNode;
  source?: string;
}) {
  const q = source ? `?from=${encodeURIComponent(source)}` : "";
  const scene = sceneFor(`cta-${source ?? "site"}`);
  return (
    <section className="container-x py-12 md:py-16">
      <div className="tone-dark relative grid overflow-hidden rounded-3xl bg-espresso md:grid-cols-[1.3fr_1fr]">
        <div className="relative z-10 p-8 sm:p-12 lg:p-16">
          <p className="eyebrow">Free quote · no obligation</p>
          <h2 className="display-2 mt-4 max-w-xl">{title}</h2>
          <p className="lede mt-5 max-w-lg">{text}</p>
          <ul className="mt-6 grid gap-2 text-sm text-ink/85 sm:grid-cols-2">
            {[
              "Live pricing as you pick",
              "Delivery & setup included in quote",
              "One person to call",
              "Reply within one business day",
              "20% deposit to reserve, refundable within 72 hours",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <Icon name="check" size={16} className="text-gold" /> {t}
              </li>
            ))}
          </ul>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={`/quote${q}`} className="btn-accent btn-lg">
              Build your quote <Icon name="arrow" size={18} />
            </Link>
            <Link href={`/book${q}`} className="btn border border-ink/25 text-ink hover:border-accent hover:bg-accent-soft hover:text-accent">
              Book a free {site.callLength} call
            </Link>
          </div>
        </div>
        <div className="relative min-h-64 md:min-h-full">
          <Image src={scene.src} alt={scene.alt} fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
          <span className="absolute inset-0 bg-gradient-to-r from-espresso via-espresso/30 to-transparent max-md:bg-gradient-to-b" aria-hidden />
        </div>
      </div>
    </section>
  );
}
