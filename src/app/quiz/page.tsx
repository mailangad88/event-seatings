import type { Metadata } from "next";
import { CallCta } from "@/components/CallCta";
import { ChairStrip } from "@/components/ChairStrip";
import { Quiz } from "@/components/Quiz";
import { Breadcrumbs, FaqList, Section, StepFlow, type Faq } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wedding & Event Chair Style Quiz for Chicago Venues",
  description: `Answer four quick questions about your Chicago-area venue, season and style, and ${site.name} matches you with the three event chairs that fit best, with prices.`,
  alternates: { canonical: "/quiz" },
};

const faqs: Faq[] = [
  {
    q: "How does the chair style quiz work?",
    a: "You answer four questions about your venue, season, colours and the feel you want. Each answer scores eight aesthetics (rustic, boho, modern, glam, classic, garden, minimalist and cultural), and we show the three chairs that score highest for you.",
  },
  {
    q: "Is the quiz free, and do I need to give my email?",
    a: "It is free and your results show right away. Email is optional, only if you want your picks sent to you.",
  },
  {
    q: "Does it account for Chicago venues and weather?",
    a: `Yes. Venue type and season are two of the four questions, so a November loft in the West Loop and a June barn in the Fox Valley get different picks. We deliver across ${site.marketLong}.`,
  },
  {
    q: "What do I do with my results?",
    a: `Price the chairs in one click, keep building a full rental quote, or book a free ${site.callLength} call and we will check the picks against your floor plan and guest count.`,
  },
];

export default function QuizPage() {
  return (
    <>
      <div className="container-x pt-8 pb-16 md:pb-24">
        <Breadcrumbs items={[{ name: "Style quiz", href: "/quiz" }]} />
        <div className="mx-auto mt-10 mb-16 max-w-2xl text-center">
          <p className="eyebrow justify-center">The chair style quiz</p>
          <h1 className="display-1 mt-4">
            Find your <em className="text-gold">chair</em> in four questions
          </h1>
          <p className="lede mt-5">
            Tell us about your venue, season and style, and we will match you with three event chairs that fit. It
            takes about a minute and works for weddings, parties and corporate events across Chicago and the suburbs.
          </p>
          <ChairStrip className="mt-10" slugs={["rattan-garden", "louis-medallion", "wishbone", "infinity"]} />
        </div>
        <Quiz />
      </div>

      <Section tone="sand" eyebrow="How it works" title="From four answers to three chairs">
        <StepFlow
          caption="How the chair style quiz works: answer four questions, we score eight aesthetics, you get three chair matches, then price them or book a call."
          steps={[
            { icon: "pin", title: "Your venue & season", text: "Barn, ballroom, loft, garden or tent, and when." },
            { icon: "spark", title: "Your style", text: "Colours and the feel you want guests to notice." },
            { icon: "chair", title: "Three matches", text: "The chairs that score highest for your answers." },
            { icon: "quote", title: "Price or talk", text: "One-click quote or a free planning call." },
          ]}
        />
      </Section>

      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="display-2 mt-3">About the quiz</h2>
          </div>
          <FaqList faqs={faqs} />
        </div>
      </Section>

      <div className="-mb-32">
        <CallCta source="style-quiz" title={<>Want a second <em className="text-gold">opinion</em> on your picks?</>} />
      </div>
    </>
  );
}
