// Kept apart from nav.ts so client components (the phone menu) can use it without pulling in the catalog.
export type MenuTone = "gold" | "wine" | "blue" | "green";

/** Icon tile colours per menu (colour = meaning: wine for booking, blue for info, green for free tools). */
export const toneTile: Record<MenuTone, string> = {
  gold: "bg-gold-soft text-gold",
  wine: "bg-wine-soft text-wine",
  blue: "bg-blue-soft text-blue",
  green: "bg-green-soft text-green",
};
