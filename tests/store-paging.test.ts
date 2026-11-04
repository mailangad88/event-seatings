import { describe, expect, it, vi } from "vitest";

// listLeads reads 1,000 rows at a time; past the first page it fetches the rest in parallel using the total
// count. The fake table holds 2,500 leads and records which ranges were asked for.

vi.mock("@/lib/lead-backup", () => ({
  backupConfigured: () => false,
  backupListLeads: async () => [],
}));

const rows = Array.from({ length: 2500 }, (_, i) => ({
  id: `00000000-0000-4000-8000-${String(i).padStart(12, "0")}`,
  kind: "quote",
  email: `l${i}@example.com`,
  created_at: new Date(Date.UTC(2026, 0, 1) + i * 60_000).toISOString(),
}));
const asked: [number, number][] = [];
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => {
      let withCount = false;
      const b = {
        select: (_c: string, opts?: { count?: string }) => ((withCount = !!opts?.count), b),
        order: () => b,
        range: async (from: number, to: number) => {
          asked.push([from, to]);
          const sorted = [...rows].reverse();
          return { data: sorted.slice(from, to + 1), error: null, count: withCount ? rows.length : null };
        },
      };
      return b;
    },
  }),
}));

describe("listLeads paging", () => {
  it("loads every row past the 1,000-row page limit, newest first", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "key");
    const { listLeads } = await import("@/lib/store");
    const leads = await listLeads();
    expect(leads).toHaveLength(2500);
    expect(new Set(leads.map((l) => l.id)).size).toBe(2500);
    expect(leads[0].created_at > leads[2499].created_at).toBe(true);
    expect(asked).toEqual([[0, 999], [1000, 1999], [2000, 2999]]);
  });
});
