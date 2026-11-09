"use client";

// Client-side loader for public/search-index.json (generated at build time by
// scripts/build-search-index.ts). Shared by the header/phone-menu search field and the /search
// page, so the index and MiniSearch instance are only ever built once per visit.
import type MiniSearch from "minisearch";

export type Entry = { url: string; title: string; text: string; type: string };
export type Hit = Entry & { score: number };

let indexPromise: Promise<{ search: MiniSearch<Entry>; byId: Map<string, Entry> }> | null = null;

function loadIndex() {
  indexPromise ??= Promise.all([import("minisearch"), fetch("/search-index.json").then((r) => r.json() as Promise<Entry[]>)]).then(
    ([{ default: MiniSearch }, entries]) => {
      const byId = new Map(entries.map((e, i) => [String(i), e]));
      const search = new MiniSearch<Entry>({
        idField: "id",
        fields: ["title", "text"],
        storeFields: [],
        searchOptions: { boost: { title: 3 }, prefix: true, fuzzy: 0.2, combineWith: "OR" },
      });
      search.addAll(entries.map((e, i) => ({ ...e, id: String(i) })));
      return { search, byId };
    },
  );
  return indexPromise;
}

export async function searchSite(query: string, limit = 30): Promise<Hit[]> {
  const { search, byId } = await loadIndex();
  return search.search(query).slice(0, limit).map((r) => ({ ...byId.get(String(r.id))!, score: r.score }));
}
