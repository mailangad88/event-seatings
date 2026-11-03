import { celebrationIdeas } from "./ideas-celebrations";
import { partyIdeas } from "./ideas-parties";
import { getPartyType, partyTypes } from "./party-types";
import type { PartyIdea, PlannerIdea } from "./types";

export * from "./types";
export { getPartyType, partyTypes };

export const ideas: PartyIdea[] = [...celebrationIdeas, ...partyIdeas];

export const PARTY_IDEAS_UPDATED = "2026-11-03";

export const getIdea = (slug?: string) => ideas.find((i) => i.slug === slug);
export const ideasFor = (typeSlug: string) => ideas.filter((i) => i.type === typeSlug);
export const ideaPath = (i: PartyIdea) => `/party-ideas/${i.type}/${i.slug}`;
export const typePath = (slug: string) => `/party-ideas/${slug}`;

/** Ideas for a planner occasion (src/lib/event-plan.ts ids), in party-type order. */
export const ideasForPlannerEvent = (eventId: string) =>
  partyTypes.filter((t) => t.planner === eventId).flatMap((t) => ideasFor(t.slug));

export function plannerIdeas(): PlannerIdea[] {
  return ideas.map((i) => {
    const t = getPartyType(i.type)!;
    return {
      slug: i.slug,
      name: i.name,
      tagline: i.tagline,
      events: [t.planner],
      image: `/rentals/scenes/${i.scene}.webp`,
      alt: i.sceneAlt,
      href: ideaPath(i),
      lines: i.rentals,
      activities: i.activities.map((a) => `${a.name}: ${a.text}`),
      props: i.props,
      setup: i.setup,
    };
  });
}


