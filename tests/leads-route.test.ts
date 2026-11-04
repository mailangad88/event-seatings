import { mkdtempSync, readFileSync } from "fs";
import os from "os";
import path from "path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

// Runs the real /api/leads route against the local JSON store in a temp folder.
// CRM sync and email are stubbed; next/server's after() runs its callback straight away.

const afterTasks: Promise<unknown>[] = [];
vi.mock("next/server", () => ({ after: (fn: () => Promise<unknown>) => void afterTasks.push(fn()) }));
vi.mock("@/lib/crm", () => ({ syncToCrm: vi.fn(async () => undefined) }));
const notifyOwner = vi.fn(async () => true);
vi.mock("@/lib/notify", () => ({
  notifyOwner: (...a: unknown[]) => notifyOwner(...(a as [])),
  sendConfirmation: vi.fn(async () => undefined),
  sendDownloadEmail: vi.fn(async () => undefined),
}));

const cwd = process.cwd();
const dir = mkdtempSync(path.join(os.tmpdir(), "leads-route-"));
let POST: (r: Request) => Promise<Response>;

beforeAll(async () => {
  delete process.env.SUPABASE_URL;
  delete process.env.BLOB_READ_WRITE_TOKEN;
  process.chdir(dir);
  ({ POST } = await import("@/app/api/leads/route"));
});
afterAll(() => process.chdir(cwd));
beforeEach(async () => {
  await Promise.all(afterTasks);
  notifyOwner.mockClear();
  afterTasks.length = 0;
});

let ipCounter = 0;
const post = (body: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request("http://localhost/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `10.0.0.${++ipCounter}`, ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

const leadsOnDisk = async () => {
  await Promise.all(afterTasks);
  return readLeads();
};
const readLeads = () => JSON.parse(readFileSync(path.join(dir, ".data", "db.json"), "utf8")).leads as Record<string, unknown>[];

const quote = (over: Record<string, unknown> = {}) => ({
  kind: "quote",
  email: "maria@example.com",
  name: "Maria",
  event_date: "2027-06-12",
  items: [{ id: "banquet-8ft", qty: 10 }],
  form_ms: 30_000,
  ...over,
});

describe("POST /api/leads", () => {
  it("saves a quote, prices it on the server and sends the owner alert", async () => {
    const res = await post(quote({ submission_id: "11111111-1111-4111-8111-111111111111", items: [{ id: "banquet-8ft", qty: 10, unit_price: 0.01 }] }));
    expect(res.status).toBe(200);
    await Promise.all(afterTasks);
    const saved = (await leadsOnDisk()).find((l) => l.id === "11111111-1111-4111-8111-111111111111")!;
    expect(saved).toBeTruthy();
    expect(saved.quote_subtotal as number).toBeGreaterThan(1);
    expect(notifyOwner).toHaveBeenCalledTimes(1);
  });

  it("saves the same submission once, however often it is sent", async () => {
    const id = "22222222-2222-4222-8222-222222222222";
    const first = await post(quote({ submission_id: id, email: "twice@example.com" }));
    const again = await post(quote({ submission_id: id, email: "twice@example.com" }), { "idempotency-key": id });
    expect(first.status).toBe(200);
    expect(await again.json()).toMatchObject({ ok: true, duplicate: true });
    expect((await leadsOnDisk()).filter((l) => l.email === "twice@example.com")).toHaveLength(1);
    await Promise.all(afterTasks);
    expect(notifyOwner).toHaveBeenCalledTimes(1);
  });

  it("lets a turned-down form be fixed and sent again with the same id", async () => {
    const id = "33333333-3333-4333-8333-333333333333";
    const bad = await post(quote({ submission_id: id, phone: "12" }));
    expect(bad.status).toBe(400);
    const good = await post(quote({ submission_id: id, phone: "312-555-0123", email: "fixed@example.com" }));
    expect(await good.json()).toEqual({ ok: true });
    expect((await leadsOnDisk()).some((l) => l.email === "fixed@example.com")).toBe(true);
  });

  it("holds spam without alerting anyone", async () => {
    const res = await post(quote({ email: "seo@example.com", kind: "chat", message: "We sell backlinks and SEO services", items: undefined }));
    expect(res.status).toBe(200);
    await Promise.all(afterTasks);
    const held = (await leadsOnDisk()).find((l) => l.email === "seo@example.com")!;
    expect(held.status).toBe("lost");
    expect(held.lost_reason).toMatch(/^Spam check/);
    expect(notifyOwner).not.toHaveBeenCalled();
  });

  it("drops the honeypot quietly", async () => {
    const res = await post(quote({ email: "bot@example.com", website: "http://spam" }));
    expect(res.status).toBe(200);
    expect((await leadsOnDisk()).some((l) => l.email === "bot@example.com")).toBe(false);
  });

  it.each([
    [{ email: "not-an-email" }, /valid email/],
    [{ email: "x@mailinator.com" }, /temporary inbox/],
    [{ event_date: undefined }, /event date/],
    [{ kind: "call", phone: undefined, items: undefined }, /phone number/],
  ])("turns down %o", async (over, message) => {
    const res = await post(quote(over));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(message);
  });

  it("turns down broken and oversized bodies", async () => {
    expect((await post("{not json")).status).toBe(400);
    expect((await post("[]")).status).toBe(400);
    expect((await post(quote({ message: "x".repeat(300_000) }))).status).toBe(413);
  });
});
