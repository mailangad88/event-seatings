import "server-only";
import { getSanityClient } from "./client";

type SanityFaqDoc = { question: string; answer: string; group?: string; order?: number };

const QUERY = /* groq */ `*[_type == "faq"] | order(group asc, order asc){ question, answer, group, order }`;

/**
 * FAQs added in Sanity Studio, grouped the same way the /faq page's existing hardcoded
 * groups are, so new questions can be added there without a code change.
 */
export async function getSanityFaqGroups(): Promise<{ id: string; title: string; faqs: { q: string; a: string }[] }[]> {
  const client = getSanityClient();
  if (!client) return [];
  const docs = await client.fetch<SanityFaqDoc[]>(QUERY).catch(() => []);
  const byGroup = new Map<string, { q: string; a: string }[]>();
  for (const d of docs) {
    const title = d.group?.trim() || "More questions";
    const list = byGroup.get(title) ?? [];
    list.push({ q: d.question, a: d.answer });
    byGroup.set(title, list);
  }
  return [...byGroup.entries()].map(([title, faqs]) => ({
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    title,
    faqs,
  }));
}
