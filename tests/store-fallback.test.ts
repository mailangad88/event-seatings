import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Lead } from "@/lib/store";

// The store's fallback order: Supabase (with retries) -> private Blob backup -> error.
// Supabase and Blob are replaced with in-memory fakes.

const backup = new Map<string, Lead>();
vi.mock("@/lib/lead-backup", () => ({
  backupConfigured: () => Boolean(process.env.BLOB_READ_WRITE_TOKEN),
  backupPutLead: async (l: Lead) => void backup.set(l.id, structuredClone(l)),
  backupGetLead: async (id: string) => backup.get(id),
  backupDeleteLead: async (id: string) => void backup.delete(id),
  backupListLeads: async () => [...backup.values()].sort((a, b) => b.created_at.localeCompare(a.created_at)),
}));

type Row = Record<string, unknown>;
const db = { rows: new Map<string, Row>(), down: false, calls: 0 };
const unavailable = { message: "TypeError: fetch failed", code: "" };

// Just enough of the supabase-js query builder for store.ts's lead functions.
function table() {
  let filters: [string, unknown][] = [];
  let pending: { op: "update"; changes: Row } | null = null;
  const run = () => {
    const rows = [...db.rows.values()].filter((r) => filters.every(([k, v]) => r[k] === v));
    if (pending) for (const r of rows) Object.assign(r, pending.changes);
    return rows;
  };
  const builder = {
    insert: async (row: Row) => {
      db.calls++;
      if (db.down) return { error: unavailable };
      if (db.rows.has(row.id as string)) return { error: { code: "23505", message: "duplicate key value" } };
      db.rows.set(row.id as string, { ...row });
      return { error: null };
    },
    upsert: async (row: Row) => {
      db.calls++;
      if (db.down) return { error: unavailable };
      if (!db.rows.has(row.id as string)) db.rows.set(row.id as string, { ...row });
      return { error: null };
    },
    update: (changes: Row) => ((pending = { op: "update", changes }), builder),
    select: () => builder,
    eq: (k: string, v: unknown) => ((filters = [...filters, [k, v]]), builder),
    gte: () => builder,
    order: () => builder,
    range: async () => (db.down ? { data: null, error: unavailable } : { data: run(), error: null }),
    maybeSingle: async () => (db.down ? { data: null, error: unavailable } : { data: run()[0] ?? null, error: null }),
    then: (resolve: (v: unknown) => void) => resolve(db.down ? { data: null, error: unavailable } : { data: run(), error: null }),
  };
  return builder;
}
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({ from: () => table() }) }));

const newLead = { kind: "quote" as const, email: "a@example.com", event_date: "2027-01-01" };
const ID = "44444444-4444-4444-8444-444444444444";

beforeEach(() => {
  vi.resetModules();
  backup.clear();
  db.rows.clear();
  db.down = false;
  db.calls = 0;
  process.env.SUPABASE_URL = "https://db.example";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "key";
  process.env.BLOB_READ_WRITE_TOKEN = "blob";
});

describe("saveNewLead", () => {
  it("saves to the database when it is up", async () => {
    const { saveNewLead } = await import("@/lib/store");
    const r = await saveNewLead(newLead, { id: ID });
    expect(r).toMatchObject({ duplicate: false, storedIn: "database" });
    expect(db.rows.has(ID)).toBe(true);
  });

  it("reports a repeat of the same submission as a duplicate", async () => {
    const { saveNewLead } = await import("@/lib/store");
    await saveNewLead(newLead, { id: ID });
    const again = await saveNewLead(newLead, { id: ID });
    expect(again.duplicate).toBe(true);
    expect(db.rows.size).toBe(1);
  });

  it("retries the database, then saves to the backup when it stays down", async () => {
    db.down = true;
    const { saveNewLead, listLeads } = await import("@/lib/store");
    const r = await saveNewLead(newLead, { id: ID });
    expect(r.storedIn).toBe("backup");
    expect(db.calls).toBe(3);
    expect(backup.has(ID)).toBe(true);
    // A second send of the same form while the database is still down is still one lead.
    expect((await saveNewLead(newLead, { id: ID })).duplicate).toBe(true);
    // Once the database is back, /admin shows the backup lead alongside database leads.
    db.down = false;
    expect((await listLeads()).map((l) => l.id)).toContain(ID);
  }, 15_000);

  it("throws when the database is down and there is no backup", async () => {
    db.down = true;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const { saveNewLead } = await import("@/lib/store");
    await expect(saveNewLead(newLead)).rejects.toBeTruthy();
  }, 15_000);

  it("uses the backup as the lead store when there is no database", async () => {
    delete process.env.SUPABASE_URL;
    const { saveNewLead, listLeads, getLead, updateLead, optOutEmail } = await import("@/lib/store");
    await saveNewLead(newLead, { id: ID });
    expect((await listLeads()).map((l) => l.id)).toEqual([ID]);
    await updateLead(ID, { status: "contacted" }, [{ type: "note", text: "Called" }]);
    const lead = await getLead(ID);
    expect(lead?.status).toBe("contacted");
    expect(lead?.activity?.at(-1)?.text).toBe("Called");
    expect(await optOutEmail("A@example.com")).toBe(1);
    expect(backup.get(ID)?.opted_out_at).toBeTruthy();
  });

  it("ignores ids that aren't uuids", async () => {
    const { saveNewLead } = await import("@/lib/store");
    const r = await saveNewLead(newLead, { id: "../../etc/passwd" });
    expect(r.lead.id).toMatch(/^[0-9a-f-]{36}$/);
  });
});

describe("updateLead on a lead that is only in the backup", () => {
  it("moves it into the database with the change", async () => {
    db.down = true;
    const { saveNewLead, updateLead } = await import("@/lib/store");
    await saveNewLead(newLead, { id: ID });
    db.down = false;
    await updateLead(ID, { status: "contacted" });
    expect(db.rows.get(ID)?.status).toBe("contacted");
    expect(backup.has(ID)).toBe(false);
  }, 15_000);
});
