import type { Metadata } from "next";
import { SiteSearch } from "@/components/search/SiteSearch";
import { Icon } from "@/components/ui";

export const metadata: Metadata = {
  title: "Search",
  description: "Search rentals, guides, areas and FAQs on the Beyond Chiavari site.",
  robots: { index: false, follow: true },
};

export default async function SearchPage(props: PageProps<"/search">) {
  const { q } = await props.searchParams;
  const initialQuery = typeof q === "string" ? q : "";

  return (
    <div className="container-x py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold-soft text-gold">
            <Icon name="search" size={22} />
          </span>
          <h1 className="display-2">Search</h1>
        </div>
        <p className="mt-3 text-muted">Find rentals, chairs, guides, local pages and FAQs across the site.</p>
        <div className="mt-8">
          <SiteSearch initialQuery={initialQuery} />
        </div>
      </div>
    </div>
  );
}
