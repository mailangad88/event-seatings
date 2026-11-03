// Party ideas: the shared shapes and helpers. Content lives in ./party-types.ts and ./ideas-*.ts.
// Every rental line is a featured catalog id (src/data/catalog-products.ts), so the planner and quote builder
// can price it. Props, crafts and activities that are not rentals are plain text: we never invent rentals or prices.

export type IdeaLine = {
  id: string; // featured catalog id
  ratio?: number; // per guest
  qty?: number; // fixed quantity
  min?: number; // floor when using ratio
  why: string;
};

export type Activity = { name: string; text: string; rentals?: string[] };

export type SetupIdea = {
  title: string;
  where: "Backyard" | "Indoors" | "Tent or lawn" | "Park" | "Any space";
  text: string;
  rentals: string[]; // catalog ids shown as "rent this setup"
};

export type PartyType = {
  slug: string;
  name: string; // "Birthday parties"
  single: string; // "birthday party"
  planner: string; // planner event id in src/lib/event-plan.ts
  scene: string; // event scene slug in public/rentals/scenes
  sceneAlt: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  setups: SetupIdea[];
  activities: Activity[];
  faqs: { q: string; a: string }[];
};

export type PartyIdea = {
  slug: string;
  type: string; // PartyType slug
  name: string;
  tagline: string;
  summary: string; // answer-first paragraph
  scene: string;
  sceneAlt: string;
  palette: { name: string; hex: string }[];
  decor: string[];
  setup: { backyard: string; indoors: string };
  activities: Activity[];
  props: string[]; // DIY or bought, not rentals
  rentals: IdeaLine[];
  faqs: { q: string; a: string }[];
};

/** The slim shape the planner needs in the browser (no long content). */
export type PlannerIdea = {
  slug: string;
  name: string;
  tagline: string;
  events: string[];
  image: string;
  alt: string;
  href: string;
  lines: IdeaLine[];
  activities: string[];
  props: string[];
  setup: { backyard: string; indoors: string };
};

export const per = (id: string, ratio: number, why: string, min = 1): IdeaLine => ({ id, ratio, min, why });
export const fixed = (id: string, qty: number, why: string): IdeaLine => ({ id, qty, why });

/** Quantity for an idea line at this guest count. */
export function ideaQty(l: IdeaLine, guests: number) {
  if (l.qty) return l.qty;
  return Math.max(l.min ?? 1, Math.ceil(Math.max(1, guests) * (l.ratio ?? 0) - 1e-9));
}
