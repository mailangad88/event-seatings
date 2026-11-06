import { createClient, type SanityClient } from "next-sanity";
import { apiVersion } from "../env";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

/** Set once both env vars are present. Blog/content code falls back to its existing source until then. */
export const sanityConfigured = Boolean(projectId && dataset);

let cached: SanityClient | null = null;

/** The read client, or null when Sanity isn't configured yet (no env vars set). */
export function getSanityClient(): SanityClient | null {
  if (!sanityConfigured) return null;
  cached ??= createClient({
    projectId: projectId!,
    dataset: dataset!,
    apiVersion,
    useCdn: true,
    perspective: "published",
    // Only needed if the dataset is private; public datasets read fine without a token.
    token: process.env.SANITY_API_READ_TOKEN || undefined,
  });
  return cached;
}
