"use client";

import { IDEAS_KEY, type SavedIdea } from "@/lib/my-events";

// Browser-storage idea board shared by every Save button and the My Events board.
const listeners = new Set<() => void>();
export const subscribeIdeas = (l: () => void) => {
  listeners.add(l);
  window.addEventListener("storage", l);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", l);
  };
};
export const readIdeasRaw = () => {
  try {
    return localStorage.getItem(IDEAS_KEY) ?? "[]";
  } catch {
    return "[]";
  }
};
export const parseIdeas = (raw: string): SavedIdea[] => {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((i) => i && typeof i.src === "string") : [];
  } catch {
    return [];
  }
};
export function writeIdeas(list: SavedIdea[]) {
  try {
    localStorage.setItem(IDEAS_KEY, JSON.stringify(list.slice(0, 200)));
  } catch {}
  listeners.forEach((l) => l());
}
