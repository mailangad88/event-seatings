// Read directly from process.env (no throwing at import time): this module is imported by
// src/sanity/lib/client.ts, which every page using blog posts or FAQs pulls in, so it must stay
// safe to evaluate even when Sanity hasn't been configured yet.
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-01-01";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
