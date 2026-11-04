import { mkdtempSync } from "fs";
import os from "os";
import path from "path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

// /api/leads links the visitor id; /api/activity then keeps that visitor's events, and ignores unknown ids.
vi.mock("next/server", () => ({ after: () => undefined }));
vi.mock("@/lib/crm", () => ({ syncToCrm: async () => undefined }));
vi.mock("@/lib/notify", () => ({ notifyOwner: async () => false, sendConfirmation: async () => undefined, sendDownloadEmail: async () => undefined }));

const cwd = process.cwd();
let leads: typeof import("@/app/api/leads/route");
let activity: typeof import("@/app/api/activity/route");
let store: typeof import("@/lib/store");

beforeAll(async () => {
  delete process.env.SUPABASE_URL;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.BLOB_STORE_ID;
  process.chdir(mkdtempSync(path.join(os.tmpdir(), "activity-route-")));
  [leads, activity, store] = await Promise.all([import("@/app/api/leads/route"), import("@/app/api/activity/route"), import("@/lib/store")]);
});
afterAll(() => process.chdir(cwd));

const req = (url: string, body: unknown) =>
  new Request(`http://localhost${url}`, { method: "POST", headers: { "content-type": "application/json", "x-forwarded-for": "10.1.1.1" }, body: JSON.stringify(body) });
const events = [{ t: "page", at: new Date().toISOString(), path: "/rentals/chairs/chiavari-gold", title: "Gold chiavari chair" }];

describe("visitor activity", () => {
  it("is kept only for visitors who sent a form", async () => {
    await activity.POST(req("/api/activity", { visitor: "stranger-123", events }));
    expect(await store.getVisitorActivity("stranger-123")).toEqual([]);

    const res = await leads.POST(req("/api/leads", { kind: "waitlist", email: "known@example.com", visitor_id: "known-visitor-1", form_ms: 20_000 }));
    expect(res.status).toBe(200);
    const [lead] = await store.listLeadsByEmail("known@example.com");
    expect(lead.visitor_id).toBe("known-visitor-1");

    expect((await activity.POST(req("/api/activity", { visitor: "known-visitor-1", events }))).status).toBe(204);
    expect(await store.getVisitorActivity("known-visitor-1")).toMatchObject([{ t: "page", path: "/rentals/chairs/chiavari-gold" }]);
  });
});
