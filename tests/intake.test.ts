import { describe, expect, it } from "vitest";
import { buildOutreach, changedAnswers, intakeProgress, keyFields, parseIntakeForm, prefillIntake, splitAnswers, vendorDetails } from "@/lib/intake";
import { detailsToken, leadFromDetailsToken } from "@/lib/details-link";

const form = (entries: [string, string][]) => {
  const fd = new FormData();
  for (const [k, v] of entries) fd.append(k, v);
  return fd;
};

describe("prefillIntake", () => {
  it("uses lead columns, saved answers and guesses from the form, in that order", () => {
    const pre = prefillIntake({
      name: "Maria Lopez",
      event_date: "2027-06-12T00:00:00",
      guest_count: 140,
      message: "Planner: Wedding, 140 guests, Backyard or home, Signature package.",
      items: [{ id: "a", name: "Chair", category: "Chairs", unit: "each", qty: 140, unit_price: 3, line_total: 420, vendor_id: "v", vendor_price: 3 }],
      intake: { answers: { budget: "$2,500 to $5,000", indoor_outdoor: "Both" }, saved_at: "2026-11-04T00:00:00Z" },
    });
    expect(pre.name).toEqual({ value: "Maria Lopez", from: "lead" });
    expect(pre.event_date.value).toBe("2027-06-12");
    expect(pre.guest_count.value).toBe("140");
    expect(pre.budget.from).toBe("call");
    // A saved call answer beats the planner guess.
    expect(pre.indoor_outdoor).toEqual({ value: "Both", from: "call" });
    expect(pre.venue_type).toEqual({ value: "Backyard or home", from: "form" });
    expect(pre.items_needed).toEqual({ value: ["Chairs"], from: "form" });
  });

  it("lists the must-have answers still missing", () => {
    const p = intakeProgress({ name: "Sam", email: "sam@example.com", phone: "3125550100" });
    expect(p.total).toBe(keyFields.length);
    expect(p.answered).toBe(3);
    expect(p.missing.map((f) => f.id)).toContain("event_date");
  });
});

describe("parseIntakeForm", () => {
  it("keeps good answers and drops ones that don't fit", () => {
    const a = parseIntakeForm(
      form([
        ["f_name", "  Maria  "],
        ["f_email", "Maria@Example.com"],
        ["f_event_date", "2027-02-31"],
        ["f_start_time", "17:30"],
        ["f_guest_count", "1,200"],
        ["f_budget", "A million dollars"],
        ["f_items_needed", "Chairs"],
        ["f_items_needed", "Spaceship"],
        ["f_items_needed", "Chairs"],
      ]),
    );
    expect(a.name).toBe("Maria");
    expect(a.email).toBe("maria@example.com");
    expect(a.event_date).toBe("");
    expect(a.start_time).toBe("17:30");
    expect(a.guest_count).toBe("1200");
    expect(a.budget).toBe("");
    expect(a.items_needed).toEqual(["Chairs"]);
  });

  it("splits lead columns from the rest", () => {
    const { core, extra } = splitAnswers(parseIntakeForm(form([["f_guest_count", "90"], ["f_city", "Oak Park"], ["f_colors", "Navy"]])));
    expect(core.guest_count).toBe(90);
    expect(core.city).toBe("Oak Park");
    expect(core.venue).toBe("");
    expect(extra).toEqual({ colors: "Navy" });
  });
});

describe("changedAnswers", () => {
  it("counts a confirmed guess as new and skips answers that didn't change", () => {
    const before = prefillIntake({ name: "Sam", message: "Planner: Party, 40 guests, Park or public space, Simple package." });
    const after = parseIntakeForm(form([["f_name", "Sam"], ["f_venue_type", "Park or public space"], ["f_colors", "Red"]]));
    expect([...changedAnswers(before, after)].sort()).toEqual(["colors", "venue_type"]);
  });
});

describe("buildOutreach", () => {
  const lead = {
    name: "Maria Lopez",
    event_type: "Graduation party",
    event_date: "2027-06-12",
    guest_count: 120,
    city: "Naperville",
    message: "Planner: Graduation party, 120 guests, Backyard or home, Simple package.",
    items: [{ id: "a", name: "Chair", category: "Chairs", unit: "each", qty: 120, unit_price: 3, line_total: 360, vendor_id: "v", vendor_price: 3 }],
  };

  it("greets them by name, names their event and asks only what's missing", () => {
    const o = buildOutreach(lead, { link: "https://example.com/event-details/x", from: "Angad" });
    expect(o.opener).toContain("Hi Maria");
    expect(o.opener).toContain("graduation party on Saturday, June 12");
    expect(o.email).toContain("https://example.com/event-details/x");
    const ids = o.asks.map((f) => f.id);
    expect(ids).toContain("email");
    expect(ids).not.toContain("event_date");
    expect(ids).not.toContain("venue_type");
    expect(ids).not.toContain("next_step");
  });

  it("vendor details leave out the street address and on-site contact", () => {
    const lines = vendorDetails({ ...lead, intake: { answers: { address: "1 Main St", onsite_contact: "Bob 555", dropoff_window: "Friday 3pm" }, saved_at: "" } });
    expect(lines.join("\n")).toContain("Earliest drop-off: Friday 3pm");
    expect(lines.join("\n")).not.toContain("1 Main St");
    expect(lines.join("\n")).not.toContain("Bob");
  });
});

describe("details link", () => {
  it("accepts its own token and refuses a changed one", () => {
    const t = detailsToken("abc")!;
    expect(leadFromDetailsToken(t)).toBe("abc");
    expect(leadFromDetailsToken(t.replace("abc", "abd"))).toBeUndefined();
    expect(leadFromDetailsToken("abc.nope")).toBeUndefined();
  });
});
