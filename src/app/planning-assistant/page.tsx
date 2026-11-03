import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlanningAssistant } from "@/components/assistant/PlanningAssistant";
import { FaqList, Figure, JsonLd, PageHero, Section, type Faq } from "@/components/ui";
import { aiMode, assistantEnabled } from "@/lib/assistant";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";

// Off (404) until NEXT_PUBLIC_PLANNING_ASSISTANT=on.
export const dynamic = "force-dynamic";

const title = "Event Planning Assistant: Your Rental Plan in a Minute";
const description = `Tell the ${site.name} planning assistant your event type, guest count, setting and budget, and get a priced rental list, setup ideas, add-ons and answers from our Chicago planning guides.`;

export const metadata: Metadata = { title, description, alternates: { canonical: "/planning-assistant" }, openGraph: { title, description, url: "/planning-assistant" } };

const faqs: Faq[] = [
  { q: "Where do the prices come from?", a: "From the same catalog as our quote builder: local Chicago-area rental companies' published rates plus our booking fee. Delivery and tax are added on the quote, and the rental company confirms the final price." },
  { q: "Is this AI?", a: "The plan is worked out by the same rules our planners use, and answers come straight from our own published guides with a link to each source. When AI wording is switched on, it only rewrites those facts; it can't add prices or promises." },
  { q: "Do I have to book anything?", a: "No. The assistant is free. When you're ready, Build this quote fills in the quote builder for you, and nothing is reserved until you approve a proposal." },
];

export default function PlanningAssistantPage() {
  if (!assistantEnabled()) notFound();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: `${site.name} Planning Assistant`,
          url: `${site.url}/planning-assistant`,
          applicationCategory: "LifestyleApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description,
          provider: { "@type": "Organization", name: site.name, url: site.url },
        }}
      />
      <PageHero
        breadcrumbs={[{ name: "Planning assistant", href: "/planning-assistant" }]}
        eyebrow="Free planning assistant"
        title={<>Plan your event in a minute</>}
        intro="Four quick answers and you get a priced rental list, setup ideas for your space, add-ons worth considering and the guides that matter, ready to turn into a quote."
        media={<Figure {...scenes.threeLooks} ratio="4/3" priority sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />
      <Section>
        <PlanningAssistant aiWording={aiMode() === "gemini"} />
      </Section>
      <Section tone="sand" eyebrow="Questions" title="About the assistant">
        <FaqList faqs={faqs} />
      </Section>
    </>
  );
}
