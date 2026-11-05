import createImageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;

const builder = projectId && dataset ? createImageUrlBuilder({ projectId, dataset }) : null;

export function urlForImage(source: Image | undefined) {
  if (!source || !builder) return undefined;
  return builder.image(source);
}
