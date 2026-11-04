import { afterEach, describe, expect, it, vi } from "vitest";
import { addDays } from "@/lib/admin-view";
import { dayLoad } from "@/lib/capacity";
import { COMMISSION_RATE, statements } from "@/lib/commissions";
import { allTasks, mailto, tasksFor } from "@/lib/event-tasks";
import type { VendorPartner } from "@/lib/store";
import { makeLead } from "../helpers";

describe("admin-view addDays", () => {
  it("adds calendar days without timezone drift", () => {
    expect(addDays("2026-03-07", 1)).toBe("2026-03-08");
    expect(addDays("2026-03-08", 1)).toBe("2026-03-09");
    expect(addDays("2026-11-01", -1)).toBe("2026-10-31");
  });
});

describe("dayLoad", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is open with nothing booked and splits confirmed from pending", () => {
    const r = dayLoad([makeLead({ status: "new" }), makeLead({ status: "lost" })]);
    expect(r.level).toBe("open");
    expect(r.confirmed).toHaveLength(0);
    expect(r.pending).toHaveLength(1);
  });

  it("counts paid and vendor-confirmed events and fills by events or guests", () => {
    const booked = (g: number) => makeLead({ status: "booked", guest_count: g });
    expect(dayLoad([booked(10), booked(10)]).level).toBe("open"); // 2/4 events
    expect(dayLoad([booked(10), booked(10), makeLead({ fee_status: "paid" })]).level).toBe("limited"); // 3/4
    expect(dayLoad([booked(10), booked(10), booked(10), booked(10)]).level).toBe("full");
    const big = dayLoad([booked(600)]);
    expect(big.guests).toBe(600);
    expect(big.level).toBe("full");
  });

  it("reads limits from the environment and ignores bad values", () => {
    vi.stubEnv("EVENTS_PER_DAY", "10");
    expect(dayLoad([makeLead({ status: "booked" })]).share).toBeCloseTo(0.1);
    vi.stubEnv("EVENTS_PER_DAY", "zero");
    expect(dayLoad([makeLead({ status: "booked" })]).share).toBeCloseTo(0.25);
  });
});

describe("event tasks", () => {
  const today = "2026-11-04";
  const none = new Map<string, VendorPartner>();

  it("gives no tasks for partners, lost leads and old events", () => {
    expect(tasksFor(makeLead({ kind: "partner" }), none, today)).toEqual([]);
    expect(tasksFor(makeLead({ status: "lost" }), none, today)).toEqual([]);
    expect(tasksFor(makeLead({ status: "booked", event_date: "2026-10-01" }), none, today)).toEqual([]);
  });

  it("nudges an unpaid proposal two days after it was sent", () => {
    const t = tasksFor(makeLead({ status: "quote_sent", proposal_token: "x", proposal_created_at: "2026-11-01T10:00:00Z", phone: "312" }), none, today);
    expect(t.map((x) => x.key)).toContain("proposal-check-in");
    expect(t.find((x) => x.key === "proposal-check-in")?.due).toBe("2026-11-03");
  });

  it("builds the full run-up for a booked event with a date", () => {
    const lead = makeLead({ fee_status: "paid", fee_paid_at: "2026-11-01T00:00:00Z", event_date: "2026-12-12", name: "Priya Shah", event_type: "Wedding" });
    const t = tasksFor(lead, none, today);
    const keys = t.map((x) => x.key);
    expect(keys).toEqual(expect.arrayContaining(["assign-vendor", "t-14-email", "t-7-call", "t-3-vendor", "t-1-email", "t0-check", "t+1-thanks", "t+2-vendor"]));
    // Rental partner confirmation tasks only appear once a partner is assigned to (part of) the order.
    expect(keys.some((k) => k.startsWith("vendor-confirm"))).toBe(false);
    expect(t.find((x) => x.key === "t-7-call")?.due).toBe("2026-12-05");
    expect(t.find((x) => x.key === "t+1-thanks")?.due).toBe("2026-12-13");
    expect(t.find((x) => x.key === "t-14-email")?.email?.body.startsWith("Hi Priya,")).toBe(true);
  });

  it("skips tasks already ticked off", () => {
    const lead = makeLead({ status: "booked", assigned_vendor: "x", event_date: "2026-12-12", tasks_done: { "t-7-call": "2026-11-02" } });
    const keys = tasksFor(lead, none, today).map((t) => t.key);
    expect(keys).not.toContain("t-7-call");
    expect(keys).not.toContain("vendor-confirm");
    expect(keys).not.toContain("assign-vendor");
  });

  it("sorts all tasks by due date", () => {
    const leads = [
      makeLead({ id: "a", status: "booked", assigned_vendor: "x", event_date: "2027-01-10" }),
      makeLead({ id: "b", status: "booked", assigned_vendor: "x", event_date: "2026-12-01" }),
    ];
    const dues = allTasks(leads, [], today).map((t) => t.due);
    expect([...dues].sort()).toEqual(dues);
  });

  it("encodes mailto drafts", () => {
    expect(mailto({ to: "a@b.co", subject: "Hi & bye", body: "Line 1\nLine 2" })).toBe("mailto:a@b.co?subject=Hi%20%26%20bye&body=Line%201%0ALine%202");
  });
});

describe("commission statements", () => {
  const signed: VendorPartner = {
    vendor_id: "v1",
    status: "signed",
    activity: [{ at: "2026-01-01T00:00:00.000Z", type: "status", text: "Referral deal signed" }],
  };

  it("charges nothing on the first booked orders after signing, then the rate, grouped by event month", () => {
    const leads = [
      makeLead({ id: "before", assigned_vendor: "v1", status: "booked", created_at: "2025-12-01T00:00:00.000Z", event_date: "2026-06-05", quote_cost: 500 }),
      makeLead({ id: "free1", assigned_vendor: "v1", status: "booked", created_at: "2026-02-01T00:00:00.000Z", event_date: "2026-06-10", quote_cost: 1000 }),
      makeLead({ id: "free2", assigned_vendor: "v1", status: "booked", created_at: "2026-03-01T00:00:00.000Z", event_date: "2026-07-01", quote_cost: 700 }),
      makeLead({ id: "paid", assigned_vendor: "v1", status: "booked", created_at: "2026-05-01T00:00:00.000Z", event_date: "2026-06-20", quote_cost: 2000 }),
      makeLead({ id: "paid2", assigned_vendor: "v1", status: "booked", created_at: "2026-05-02T00:00:00.000Z", event_date: "2026-07-02", quote_cost: 333.33 }),
      makeLead({ id: "unbooked", assigned_vendor: "v1", status: "new", event_date: "2026-06-01", quote_cost: 9999 }),
    ];
    const s = statements(leads, [signed]);
    expect(s.map((x) => x.month)).toEqual(["2026-07", "2026-06"]);
    const june = s.find((x) => x.month === "2026-06")!;
    expect(june.orders.map((o) => [o.lead.id, o.free])).toEqual([["before", true], ["free1", true], ["paid", false]]);
    expect(june.rentals).toBe(3500);
    expect(june.commission).toBe(2000 * COMMISSION_RATE);
    const july = s.find((x) => x.month === "2026-07")!;
    expect(july.orders.map((o) => o.free)).toEqual([true, false]);
    expect(july.commission).toBe(Math.round(333.33 * COMMISSION_RATE * 100) / 100);
  });

  it("counts the free orders from the first booking when no deal date is logged", () => {
    const leads = [
      makeLead({ id: "a", assigned_vendor: "v2", status: "booked", created_at: "2026-01-01T00:00:00.000Z", event_date: "2026-03-01", quote_cost: 100 }),
      makeLead({ id: "b", assigned_vendor: "v2", status: "booked", created_at: "2026-02-01T00:00:00.000Z", event_date: "2026-03-02", quote_cost: 100 }),
      makeLead({ id: "c", assigned_vendor: "v2", status: "booked", created_at: "2026-06-01T00:00:00.000Z", event_date: "2026-03-03", quote_cost: 100 }),
    ];
    const [st] = statements(leads, []);
    expect(st.orders.map((o) => o.free)).toEqual([true, true, false]);
    expect(st.commission).toBe(100 * COMMISSION_RATE);
  });
});
