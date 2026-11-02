// The Seating Readiness Score: 15 statements across 5 areas.
// Each answer scores 0 (not yet), 1 (partly) or 2 (done). The overall score is out of 100.
// To change a statement, edit it here. Keep 3 statements per area so the share link stays valid.

export type ReadinessArea = {
  key: "guests" | "venue" | "layout" | "style" | "season";
  name: string;
  image: string;
  imageAlt: string;
  statements: [string, string, string];
  // Shown when this area is the weakest.
  fix: string;
};

export const answerOptions = [
  { label: "Not yet", value: 0 },
  { label: "Partly", value: 1 },
  { label: "Done", value: 2 },
] as const;

export const readinessAreas: ReadinessArea[] = [
  {
    key: "guests",
    name: "Guest count",
    image: "/chairs/render/garden-folding.jpg",
    imageAlt: "Garden folding event chair, a simple seat that represents counting chairs per guest",
    statements: [
      "I have a final or near-final guest count.",
      "I know how many vendors (photographer, DJ, planner) will sit down to eat.",
      "I've added a small buffer for late RSVPs and surprise plus-ones.",
    ],
    fix: "Turn your guest list into an exact chair and table count, with a buffer, before you request pricing.",
  },
  {
    key: "venue",
    name: "Venue and logistics",
    image: "/chairs/render/louis-medallion.jpg",
    imageAlt: "Louis medallion ballroom chair, representing venue and load-in planning",
    statements: [
      "I know my venue's load-in times and access (stairs, elevators, loading dock).",
      "I know whether my venue includes chairs, and what those chairs look like.",
      "I know my venue's rules for outside rentals (insurance, setup and pickup windows).",
    ],
    fix: "Get your venue's load-in times, access and outside-rental rules in writing, so delivery and setup go smoothly.",
  },
  {
    key: "layout",
    name: "Layout and flow",
    image: "/chairs/render/cross-back.jpg",
    imageAlt: "Cross-back vineyard chair, representing ceremony and reception layout planning",
    statements: [
      "I know whether the ceremony and reception share a space, and whether chairs need to flip.",
      "I've chosen table shapes and sizes (60-inch rounds, 72-inch rounds or banquet tables).",
      "I've planned the head table or sweetheart table.",
    ],
    fix: "Sketch the ceremony, cocktail hour and reception in order, and decide whether chairs flip between them.",
  },
  {
    key: "style",
    name: "Chair style",
    image: "/chairs/render/ghost.jpg",
    imageAlt: "Clear ghost chair, representing choosing a chair style for the event",
    statements: [
      "I've picked a chair style, or narrowed it to two.",
      "I know my color palette and the chair finish that goes with it.",
      "I've decided on cushions, sashes or other chair decor.",
    ],
    fix: "Narrow your look to one or two chair styles and a finish that fits your palette.",
  },
  {
    key: "season",
    name: "Season and backup plan",
    image: "/chairs/render/rattan-garden.jpg",
    imageAlt: "Rattan garden chair outdoors, representing Chicago weather and backup planning",
    statements: [
      "I have a plan for Chicago weather (rain, wind, heat or cold) if any part is outdoors.",
      "I know how far ahead chairs book up for my season.",
      "I have a backup for extra or damaged chairs on the day.",
    ],
    fix: "Plan for Chicago weather and lock in your rental date early, with a few spare chairs on the day.",
  },
];

export const statementCount = readinessAreas.length * 3;

export type Band = { min: number; name: string; summary: string };

// Lowest first. A score falls in the last band whose `min` it meets.
export const bands: Band[] = [
  { min: 0, name: "Just starting", summary: "Most of the seating decisions are still open. That is normal this early, and a short call can map them out in order." },
  { min: 40, name: "Taking shape", summary: "The big picture is there. A few open decisions could still change your chair count or style." },
  { min: 70, name: "Nearly set", summary: "You are close. Settle your weakest area and you are ready to request exact pricing." },
  { min: 90, name: "Ready to book", summary: "Your seating plan is ready. Request pricing or book a call to reserve your date." },
];

export function bandFor(score: number): Band {
  return [...bands].reverse().find((b) => score >= b.min) ?? bands[0];
}
