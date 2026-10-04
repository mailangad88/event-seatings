import type { Metadata } from "next";
import { QuoteForm } from "@/components/QuoteForm";
import { getChair } from "@/data/chairs";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: `Request a quote for wedding and event chair rentals in ${site.city} and Chicago's western suburbs.`,
};

export default async function QuotePage(props: PageProps<"/quote">) {
  const { chairs } = await props.searchParams;
  const initial = (typeof chairs === "string" ? chairs.split(",") : []).filter((s) => getChair(s));

  return (
    <div className="container-x max-w-5xl py-20">
      <p className="eyebrow">{site.launch.seasonLabel}</p>
      <h1 className="headline mt-6 text-6xl leading-[0.95] sm:text-8xl">
        Begin your <em className="text-gold">enquiry</em>
      </h1>
      <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
        A few details about your celebration and the pieces you love. It takes about two minutes, and we&apos;ll
        prepare a personal proposal.
      </p>
      <div className="mt-20">
        <QuoteForm initialChairs={initial} />
      </div>
    </div>
  );
}
