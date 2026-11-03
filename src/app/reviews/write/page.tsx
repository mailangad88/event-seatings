import type { Metadata } from "next";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { Figure, PageHero, Section } from "@/components/ui";
import { leadFromToken } from "@/lib/reviews";
import { scenes } from "@/lib/scenes";
import { site } from "@/lib/site";
import { getLead } from "@/lib/store";

export const metadata: Metadata = {
  title: "Write a Review",
  description: `Tell other Chicago planners how your event rentals went. Reviews of ${site.name} are published as written after a quick check.`,
  alternates: { canonical: "/reviews/write" },
  robots: { index: false, follow: true },
};

export default async function WriteReviewPage(props: PageProps<"/reviews/write">) {
  const sp = await props.searchParams;
  const token = typeof sp.t === "string" ? sp.t : undefined;
  const leadId = leadFromToken(token);
  const lead = leadId ? await getLead(leadId).catch(() => undefined) : undefined;

  return (
    <>
      <PageHero
        breadcrumbs={[
          { name: "Reviews", href: "/reviews" },
          { name: "Write a review", href: "/reviews/write" },
        ]}
        eyebrow="Your review"
        title={lead?.name ? <>How did it go, {lead.name.split(" ")[0]}?</> : <>How did your event go?</>}
        intro="Two minutes, honest and in your own words. We publish real reviews only, good or bad, and reply to every one."
        media={<Figure {...scenes.blushGarden} ratio="4/3" sizes="(max-width: 1024px) 100vw, 40vw" className="mx-auto max-w-md" />}
      />
      <Section>
        <div className="mx-auto max-w-3xl">
          <ReviewForm token={lead ? token : undefined} defaultName={lead?.name} />
        </div>
      </Section>
    </>
  );
}
