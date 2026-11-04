import { beforeEach, describe, expect, it, vi } from "vitest";

// backupListLeads keeps parsed lead files per server instance, so /admin only downloads files that are new or
// changed since the last list. @vercel/blob is replaced with an in-memory fake that counts downloads.

const files = new Map<string, { body: string; uploadedAt: Date }>();
let gets = 0;
vi.mock("@vercel/blob", () => ({
  list: async ({ prefix }: { prefix: string }) => ({
    blobs: [...files.entries()].filter(([p]) => p.startsWith(prefix)).map(([pathname, f]) => ({ pathname, uploadedAt: f.uploadedAt })),
    hasMore: false,
  }),
  get: async (pathname: string) => {
    gets++;
    const f = files.get(pathname);
    return f ? { statusCode: 200, stream: new Response(f.body).body } : null;
  },
  put: async () => ({}),
  del: async (p: string) => void files.delete(p),
}));

const lead = (id: string, at: string, name = "A") => ({ id, kind: "quote", email: `${id}@example.com`, created_at: at, name });
const save = (l: ReturnType<typeof lead>, t: number) => files.set(`lead-store/${l.id}.json`, { body: JSON.stringify(l), uploadedAt: new Date(t) });

beforeEach(() => {
  vi.resetModules();
  files.clear();
  gets = 0;
});

describe("backupListLeads cache", () => {
  it("downloads each file once until it changes, and drops deleted files", async () => {
    const { backupListLeads } = await import("@/lib/lead-backup");
    save(lead("lead-0001", "2026-11-01T00:00:00Z"), 1);
    save(lead("lead-0002", "2026-11-02T00:00:00Z"), 1);

    expect((await backupListLeads()).map((l) => l.id)).toEqual(["lead-0002", "lead-0001"]);
    expect(gets).toBe(2);

    await backupListLeads();
    expect(gets).toBe(2); // nothing changed, nothing downloaded

    save(lead("lead-0001", "2026-11-01T00:00:00Z", "B"), 2);
    const again = await backupListLeads();
    expect(gets).toBe(3);
    expect(again.find((l) => l.id === "lead-0001")?.name).toBe("B");

    files.delete("lead-store/lead-0002.json");
    expect((await backupListLeads()).map((l) => l.id)).toEqual(["lead-0001"]);
  });

  it("hands out copies, so a caller can't change the cached lead", async () => {
    const { backupListLeads } = await import("@/lib/lead-backup");
    save(lead("lead-0003", "2026-11-01T00:00:00Z"), 1);
    (await backupListLeads())[0].name = "changed";
    expect((await backupListLeads())[0].name).toBe("A");
  });
});
