// Shared shapes for the local landing pages (/chicago/... and /events/...).
// Content lives in the sibling files; pages are generated from it.

export type ChairSlug =
  | "cross-back"
  | "ghost"
  | "rattan-garden"
  | "bentwood"
  | "wishbone"
  | "velvet-dining"
  | "infinity"
  | "cane-back"
  | "windsor"
  | "louis-medallion"
  | "shell"
  | "garden-folding"
  | "royal-throne";

export type Faq = { q: string; a: string };

export type Location = {
  slug: string; // url segment, e.g. "lincoln-park"
  name: string; // "Lincoln Park"
  kind: "city" | "neighborhood" | "suburb";
  region: string; // "North Side" or "DuPage County"
  lat: number;
  lng: number;
  zips: string[];
  metaTitle: string; // <= 60 chars, no brand name (added by template)
  metaDescription: string; // 140-158 chars
  headline: string; // H1; wrap ONE emphasised word/phrase in *asterisks*
  intro: string; // 2-3 sentence answer-first summary (what we rent, where, how to start)
  story: string[]; // 3 paragraphs of genuinely local copy
  settings: { name: string; note: string }[]; // 4 kinds of local event settings
  logistics: string[]; // 4 delivery/setup tips specific to the area
  recommendedChairs: { slug: ChairSlug; why: string }[]; // exactly 3
  popularEvents: string[]; // 3-4 event slugs from events.ts
  faqs: Faq[]; // 5 local questions
  nearby: string[]; // 3-5 other location slugs
};

export type EventType = {
  slug: string; // "weddings"
  name: string; // "Wedding Chair Rentals"
  shortName: string; // "Weddings"
  metaTitle: string;
  metaDescription: string;
  headline: string; // with one *emphasis*
  intro: string;
  story: string[]; // 3 paragraphs
  painPoints: { problem: string; solution: string }[]; // 4
  seatingMath: { label: string; value: string }[]; // 4 quick planning numbers
  checklist: string[]; // 6 planning steps
  recommendedChairs: { slug: ChairSlug; why: string }[]; // exactly 3
  faqs: Faq[]; // 6
  relatedPosts: string[]; // blog slugs from content/blog
};
