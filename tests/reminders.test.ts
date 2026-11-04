import { describe, expect, it } from "vitest";
import type { ActivityEvent } from "@/lib/activity";
import { cleanReminderSettings, defaultReminderSettings, planReminders, reminderLogText, type ReminderSettings } from "@/lib/reminders";
import type { Lead } from "@/lib/store";

const now = new Date("2026-11-10T16:00:00Z");
const hoursAgo = (h: number) => new Date(now.getTime() - h * 36e5).toISOString();
const ctx = (settings: ReminderSettings = defaultReminderSettings) => ({
  now,
  siteUrl: "https://site.test",
  settings,
  itemName: (id: string) => ({ "chiavari-gold": "Gold chiavari chair", "round-60": "60-inch round table" })[id],
});

const lead = (over: Partial<Lead> = {}): Lead => ({
  id: "lead-1",
  kind: "waitlist",
  email: "maria@example.com",
  created_at: hoursAgo(72),
  email_consent: true,
  visitor_id: "visitor-1",
  status: "new",
  ...over,
});
const plan = (leads: Lead[], events: ActivityEvent[] = [], settings?: ReminderSettings) =>
  planReminders(leads, new Map([["visitor-1", events]]), ctx(settings));

const list = (h: number, items: string[]): ActivityEvent => ({ t: "quote_list", at: hoursAgo(h), path: "/quote", items });
const view = (h: number, path = "/rentals/chairs/chiavari-gold"): ActivityEvent => ({ t: "page", at: hoursAgo(h), path, title: "Gold chiavari chair | Beyond Chiavari" });

describe("unfinished quote list", () => {
  it("reminds about a list left a day ago, linking back to it", () => {
    const p = plan([lead()], [list(30, ["chiavari-gold", "round-60"])]);
    expect(p.send).toHaveLength(1);
    expect(p.send[0].kind).toBe("unfinished_quote");
    expect(p.send[0].body.join("\n")).toContain("https://site.test/quote?items=chiavari-gold,round-60&from=reminder");
    expect(p.send[0].body.join("\n")).toContain("Gold chiavari chair, 60-inch round table");
  });

  it("waits 20 hours, and gives up after 7 days", () => {
    expect(plan([lead()], [list(5, ["round-60"])]).send).toHaveLength(0);
    expect(plan([lead()], [list(8 * 24, ["round-60"])]).send).toHaveLength(0);
  });

  it("skips a list they emptied, or one they then sent as a quote", () => {
    expect(plan([lead()], [list(40, ["round-60"]), list(30, [])]).send).toHaveLength(0);
    const sent = lead({ id: "lead-2", kind: "quote", created_at: hoursAgo(25) });
    expect(plan([lead(), sent], [list(30, ["round-60"])]).send.filter((r) => r.kind === "unfinished_quote")).toHaveLength(0);
  });

  it("needs the email tips box ticked", () => {
    expect(plan([lead({ email_consent: false })], [list(30, ["round-60"])]).send).toHaveLength(0);
  });
});

describe("item they keep looking at", () => {
  it("reminds after two views of the same item", () => {
    const p = plan([lead()], [view(50), view(30)]);
    expect(p.send[0]).toMatchObject({ kind: "viewed_item", subject: "Still thinking about the gold chiavari chair?" });
    expect(p.send[0].body.join("\n")).toContain("/quote?items=chiavari-gold&from=reminder");
  });

  it("doesn't count one view or views from the last 20 hours", () => {
    expect(plan([lead()], [view(30)]).send).toHaveLength(0);
    expect(plan([lead()], [view(10), view(5)]).send).toHaveLength(0);
  });
});

describe("event coming up", () => {
  const quote = (date: string, over: Partial<Lead> = {}) => lead({ kind: "quote", event_date: date, email_consent: false, ...over });

  it("reminds a quote request 10 to 45 days out that isn't booked", () => {
    const p = plan([quote("2026-11-30")]);
    expect(p.send[0]).toMatchObject({ kind: "event_soon", subject: "Your event is 3 weeks away" });
  });

  it("stays quiet when booked, too close or too far", () => {
    expect(plan([quote("2026-11-30", { status: "booked" })]).send).toHaveLength(0);
    expect(plan([quote("2026-11-15")]).send).toHaveLength(0);
    expect(plan([quote("2027-03-01")]).send).toHaveLength(0);
  });
});

describe("limits", () => {
  it("never emails someone who unsubscribed", () => {
    const p = plan([lead({ opted_out_at: hoursAgo(1) })], [list(30, ["round-60"])]);
    expect(p.send).toHaveLength(0);
    expect(p.skipped.unsubscribed).toBe(1);
  });

  it("sends each kind once and waits 3 days between reminders", () => {
    const first = plan([lead()], [list(30, ["round-60"])]).send[0];
    const logged = (h: number) => lead({ activity: [{ at: hoursAgo(h), type: "email", text: reminderLogText(first) }] });
    expect(plan([logged(24)], [list(30, ["round-60"]), view(50), view(30)]).skipped["reminder in the last 3 days"]).toBe(1);
    // Four days later: not the same list reminder again, but the item reminder can go.
    expect(plan([logged(96)], [list(30, ["round-60"]), view(50), view(30)]).send.map((r) => r.kind)).toEqual(["viewed_item"]);
  });

  it("respects the switches", () => {
    const off = cleanReminderSettings({ enabled: { unfinished_quote: false } });
    expect(plan([lead()], [list(30, ["round-60"])], off).send).toHaveLength(0);
  });

  it("ignores spam and vendor applications", () => {
    expect(plan([lead({ lost_reason: "Spam check: backlinks", status: "lost" })], [list(30, ["round-60"])]).send).toHaveLength(0);
    expect(plan([lead({ kind: "partner" })], [list(30, ["round-60"])]).send).toHaveLength(0);
  });
});

describe("offer", () => {
  it("adds the rentals offer only to the chosen reminders and logs it", () => {
    const settings = cleanReminderSettings({ offer: { enabled: true, percent: 5, days: 7, kinds: ["unfinished_quote"] } });
    const r = plan([lead()], [list(30, ["round-60"])], settings).send[0];
    expect(r.offer).toBe("5% off your rentals until Nov 17");
    expect(r.body.at(-1)).toMatch(/5% off your rentals/);
    expect(reminderLogText(r)).toContain("Offer: 5% off your rentals until Nov 17");
    const item = plan([lead()], [view(50), view(30)], settings).send[0];
    expect(item.offer).toBeUndefined();
  });

  it("keeps stored numbers in range", () => {
    expect(cleanReminderSettings({ offer: { percent: 500, days: -3 } }).offer).toMatchObject({ percent: 10, days: 1 });
  });
});
