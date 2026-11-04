import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Lead } from "@/lib/store";

// The daily recovery job: moves backup leads into the database and sends alerts that never went out.

const backup = new Map<string, Lead>();
const imported: Lead[] = [];
const recent: Lead[] = [];
const logs: { id: string; text: string }[] = [];
const notifyOwner = vi.fn(async (l: Lead) => l.email !== "fails@example.com");

vi.mock("@/lib/lead-backup", () => ({
  backupConfigured: () => true,
  backupListLeads: async () => [...backup.values()],
  backupDeleteLead: async (id: string) => void backup.delete(id),
}));
vi.mock("@/lib/notify", () => ({ notifyOwner: (l: Lead) => notifyOwner(l) }));
vi.mock("@/lib/store", () => ({
  databaseConfigured: () => Boolean(process.env.SUPABASE_URL),
  importLead: async (l: Lead) => void imported.push(l),
  listLeadsSince: async () => recent,
  updateLead: async (id: string, _p: unknown, log: { text: string }[]) => void logs.push({ id, text: log[0].text }),
}));

const ago = (min: number) => new Date(Date.now() - min * 60_000).toISOString();
const lead = (id: string, over: Partial<Lead> = {}): Lead => ({ id, kind: "quote", email: `${id}@example.com`, created_at: ago(60), ...over });
const call = (path = "/api/cron/lead-recovery", auth = "Bearer s3cret") =>
  import("@/app/api/cron/lead-recovery/route").then(({ GET }) => GET(new Request(`http://x${path}`, { headers: { authorization: auth } })));

beforeEach(() => {
  backup.clear();
  imported.length = recent.length = logs.length = 0;
  notifyOwner.mockClear();
  process.env.CRON_SECRET = "s3cret";
  process.env.SUPABASE_URL = "https://db";
  process.env.RESEND_API_KEY = "re";
  process.env.NOTIFY_EMAIL = "owner@example.com";
});

describe("GET /api/cron/lead-recovery", () => {
  it("needs the cron secret", async () => {
    expect((await call(undefined, "Bearer wrong")).status).toBe(401);
  });

  it("moves backup leads into the database", async () => {
    backup.set("a", lead("a"));
    backup.set("b", lead("b"));
    const report = await (await call()).json();
    expect(report).toMatchObject({ moved: 2, waitingInBackup: 0 });
    expect(imported.map((l) => l.id).sort()).toEqual(["a", "b"]);
    expect(backup.size).toBe(0);
  });

  it("leaves backup leads alone when there is no database yet", async () => {
    delete process.env.SUPABASE_URL;
    backup.set("a", lead("a"));
    const report = await (await call()).json();
    expect(report).toMatchObject({ moved: 0, waitingInBackup: 1 });
    expect(backup.size).toBe(1);
  });

  it("sends missed alerts, skipping spam, already-alerted and brand-new leads", async () => {
    recent.push(
      lead("missed"),
      lead("done", { activity: [{ at: ago(50), type: "email", text: "Lead alert emailed to you" }] }),
      lead("spam", { lost_reason: "Spam check: backlinks" }),
      lead("new", { created_at: ago(2) }),
      lead("fails", { email: "fails@example.com" }),
    );
    const report = await (await call()).json();
    expect(notifyOwner.mock.calls.map(([l]) => l.id)).toEqual(["missed", "fails"]);
    expect(report).toMatchObject({ alertsDue: 2, alertsSent: 1, alertsFailed: 1 });
    expect(logs).toEqual([{ id: "missed", text: expect.stringMatching(/^Lead alert emailed/) }]);
  });

  it("changes nothing on a dry run", async () => {
    backup.set("a", lead("a"));
    recent.push(lead("missed"));
    const report = await (await call("/api/cron/lead-recovery?dry=1")).json();
    expect(report).toMatchObject({ dry: true, moved: 0, waitingInBackup: 1, alertsDue: 1, alertsSent: 0 });
    expect(notifyOwner).not.toHaveBeenCalled();
    expect(backup.size).toBe(1);
  });
});
