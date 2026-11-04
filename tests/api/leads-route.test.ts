// Smoke tests for POST /api/leads. Storage, CRM and email are mocked, so nothing touches the network or disk.
import { beforeEach, describe, expect, it, vi } from "vitest";

const pending: Promise<unknown>[] = [];
vi.mock("next/server", () => ({
  after: (fn: () => unknown) => {
    pending.push(Promise.resolve().then(fn));
  },
}));
vi.mock("@/lib/store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/store")>()),
  saveNewLead: vi.fn(),
  updateLead: vi.fn(),
}));
vi.mock("@/lib/crm", () => ({ syncToCrm: vi.fn() }));
vi.mock("@/lib/notify", () => ({ notifyOwner: vi.fn(), sendConfirmation: vi.fn(), sendDownloadEmail: vi.fn() }));

const { POST } = await import("@/app/api/leads/route");
const store = await import("@/lib/store");
const notify = await import("@/lib/notify");
const crm = await import("@/lib/crm");
const { catalogItems } = await import("@/data/catalog");
const { priceQuote } = await import("@/lib/catalog-types");

const addLead = vi.mocked(store.saveNewLead);
let ipSeq = 0;

const post = (body: unknown, headers: Record<string, string> = {}) =>
  POST(
    new Request("https://beyondchiavari.com/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": `203.0.113.${++ipSeq}`, ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );

const savedLead = () => addLead.mock.calls[0][0];

beforeEach(() => {
  pending.length = 0;
  addLead.mockReset();
  addLead.mockImplementation(async (l) => ({
    lead: { ...l, id: "lead-test", created_at: new Date().toISOString() },
    duplicate: false,
    storedIn: "database" as const,
  }));
  vi.mocked(store.updateLead).mockReset();
  vi.mocked(store.updateLead).mockResolvedValue(undefined as never);
  vi.mocked(notify.notifyOwner).mockReset();
  vi.mocked(notify.notifyOwner).mockResolvedValue(true as never);
  vi.mocked(notify.sendConfirmation).mockReset();
  vi.mocked(notify.sendConfirmation).mockResolvedValue("Thanks" as never);
  vi.mocked(crm.syncToCrm).mockReset();
  vi.mocked(crm.syncToCrm).mockResolvedValue(undefined as never);
});

describe("POST /api/leads", () => {
  it("rejects a body that is not JSON", async () => {
    const res = await post("{not json");
    expect(res.status).toBe(400);
    expect(addLead).not.toHaveBeenCalled();
  });

  it("quietly accepts and drops honeypot submissions", async () => {
    const res = await post({ kind: "waitlist", email: "bot@example.com", website: "http://spam.test" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(addLead).not.toHaveBeenCalled();
  });

  it.each([
    [{ kind: "waitlist" }, "no email"],
    [{ kind: "waitlist", email: "not-an-email" }, "bad email"],
    [{ kind: "admin", email: "a@example.com" }, "unknown kind"],
    [{ kind: "waitlist", email: "a@mailinator.com" }, "throwaway inbox"],
    [{ kind: "chat", email: "a@example.com" }, "chat with no question"],
    [{ kind: "call", email: "a@example.com" }, "call with no phone"],
    [{ kind: "partner", email: "a@example.com", name: "A" }, "partner with no company or phone"],
    [{ kind: "quote", email: "a@example.com", event_date: "2027-06-12" }, "quote with no items"],
    [{ kind: "quote", email: "a@example.com", event_date: "2027-02-31", items: [{ id: catalogItems[0].id, qty: 1 }] }, "quote with an impossible date"],
  ] as [Record<string, unknown>, string][])("returns 400 for %j (%s)", async (body, why) => {
    const res = await post(body);
    expect(res.status, why).toBe(400);
    expect((await res.json()).error).toBeTruthy();
    expect(addLead).not.toHaveBeenCalled();
  });

  it("saves a valid lead with a score, then syncs the CRM and emails after responding", async () => {
    const res = await post({ kind: "waitlist", email: " Priya@Example.com ", name: "Priya", guest_count: "120", phone: "312-555-0100", call_consent: "yes" });
    expect(res.status).toBe(200);
    const lead = savedLead();
    expect(lead.email).toBe("Priya@Example.com");
    expect(lead.guest_count).toBe(120);
    expect(lead.status).toBe("new");
    expect(lead.lead_score).toMatch(/^[ABC]$/);
    expect(lead.call_consent).toBe(true);
    expect(lead.consent_at).toBeTruthy();
    await Promise.all(pending);
    expect(crm.syncToCrm).toHaveBeenCalledTimes(1);
    expect(notify.notifyOwner).toHaveBeenCalledTimes(1);
    expect(store.updateLead).toHaveBeenCalledWith("lead-test", {}, expect.arrayContaining([expect.objectContaining({ type: "email" })]));
  });

  it("re-prices quote items from the catalog and ignores browser prices", async () => {
    const item = catalogItems[0];
    const res = await post({
      kind: "quote",
      email: "host@example.com",
      event_date: "2027-06-12",
      items: [{ id: item.id, qty: 10, unit_price: 0.01, line_total: 0.1 }, { id: "not-a-real-item", qty: 5 }],
      quote_subtotal: 1,
    });
    expect(res.status).toBe(200);
    const lead = savedLead();
    const expected = priceQuote([{ id: item.id, qty: 10 }], catalogItems);
    expect(lead.items).toHaveLength(1);
    expect(lead.quote_subtotal).toBe(expected.subtotal);
    expect(lead.quote_cost).toBe(expected.cost);
  });

  it("caps guest counts and drops consent ticks that have no phone", async () => {
    await post({ kind: "waitlist", email: "a@example.com", guest_count: 999_999, sms_consent: "yes", call_consent: "yes" });
    const lead = savedLead();
    expect(lead.guest_count).toBe(5000);
    expect(lead.sms_consent).toBeUndefined();
    expect(lead.call_consent).toBeUndefined();
  });

  it("refuses bodies that declare more than 256 KB before reading them", async () => {
    const res = await post({ kind: "waitlist", email: "a@example.com" }, { "content-length": String(257 * 1024) });
    expect(res.status).toBe(413);
  });

  it("keeps same-site page paths and drops links to other sites", async () => {
    await post({ kind: "waitlist", email: "a@example.com", page_path: "//evil.example/x", landing_page: "/rentals/chairs?utm_source=x" });
    const lead = savedLead();
    expect(lead.page_path).toBeUndefined();
    expect(lead.landing_page).toBe("/rentals/chairs?utm_source=x");
  });

  it("rate limits one address after 8 submissions in 10 minutes", async () => {
    const ip = "198.51.100.77";
    const statuses: number[] = [];
    for (let i = 0; i < 9; i++) statuses.push((await post({ kind: "waitlist", email: `a${i}@example.com` }, { "x-forwarded-for": ip })).status);
    expect(statuses.slice(0, 8).every((s) => s === 200)).toBe(true);
    expect(statuses[8]).toBe(429);
  });
});
