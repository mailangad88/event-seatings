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



const words = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

/** Pads a short direct answer (under 40 words) with what the page covers, so answer engines get a full answer. */
export function fullAnswer(text: string, extra: string): string {
  return words(text) >= 40 ? text : `${text} ${extra}`;
}

/** Adds general party-rental questions so every party ideas page has at least 4 FAQs. */
export function withPartyFaqs(faqs: { q: string; a: string }[], single: string): { q: string; a: string }[] {
  const general = [
    {
      q: `Can I rent everything for a ${single} in one order?`,
      a: "Yes. Pick the rentals from this page or the planner and send one free quote. We book them with Chicago-area rental partners and list delivery, setup, a damage waiver and sales tax line by line before you pay anything.",
    },
    {
      q: `How far ahead should I book rentals for a ${single}?`,
      a: "For Saturdays from May to October, book 3 to 6 months ahead, because the most popular items sell out first. Weekday and winter events can often be booked 2 to 4 weeks out.",
    },
    {
      q: "Do the rental prices include delivery?",
      a: "No. Prices are per item for one event day: the partner rate plus our 10% fee. Delivery and pickup, setup, a damage waiver and sales tax are added on the same itemized quote.",
    },
  ];
  const have = new Set(faqs.map((f) => f.q));
  const out = [...faqs];
  for (const g of general) if (out.length < 4 && !have.has(g.q)) out.push(g);
  return out;
}
