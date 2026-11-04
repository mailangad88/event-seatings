import type { Lead } from "@/lib/store";

/** A minimal lead with overrides, for tests. */
export const makeLead = (over: Partial<Lead> = {}): Lead => ({
  id: "lead-1",
  kind: "quote",
  created_at: "2026-11-01T15:00:00.000Z",
  email: "priya@example.com",
  ...over,
});
