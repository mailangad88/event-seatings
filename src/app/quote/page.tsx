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
    <div className="container-x max-w-4xl py-14">
      <p className="eyebrow">{site.launch.seasonLabel}</p>
      <h1 className="mt-2 font-serif text-5xl sm:text-6xl">Request a quote</h1>
      <p className="mt-4 max-w-2xl text-muted">
        Takes about two minutes. Tell us your date and the chairs you love, and we&apos;ll put together a personalized
        quote.
      </p>
      <div className="mt-12">
        <QuoteForm initialChairs={initial} />
      </div>
    </div>
  );
}
