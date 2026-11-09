import { createHmac } from "crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PAYMENT_SCHEDULE, depositFor } from "@/lib/catalog-types";
import { FIRST_BOOKING_DISCOUNT, withFirstBookingDiscount } from "@/lib/offers";
import { amountDue, chargeLabel, chargeMode, checkoutPaid, newProposalToken, verifyStripeSignature } from "@/lib/payments";

describe("amountDue", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("charges the first stage on the rental subtotal, minus the first-booking offer on qualifying orders, with a floor and never more than the order", () => {
    expect(amountDue({ quote_subtotal: 4000 })).toBe(withFirstBookingDiscount(4000 * PAYMENT_SCHEDULE.firstShare, 4000));
    expect(amountDue({ quote_subtotal: 150 })).toBe(withFirstBookingDiscount(PAYMENT_SCHEDULE.min, 150));
    expect(amountDue({ quote_subtotal: 60 })).toBe(withFirstBookingDiscount(60, 60));
    expect(amountDue({ quote_subtotal: 0 })).toBe(0);
    expect(amountDue({ items: [{ id: "a", name: "A", qty: 10, unit_price: 50, line_total: 500 }] as never })).toBe(withFirstBookingDiscount(depositFor(500), 500));
    expect(chargeLabel()).toBe("Deposit");
  });

  it("applies the first-booking offer to the deposit only on orders over $1,000, never below $0, and can be switched off by env var", () => {
    expect(amountDue({ quote_subtotal: 4000 })).toBe(4000 * PAYMENT_SCHEDULE.firstShare - FIRST_BOOKING_DISCOUNT);
    expect(amountDue({ quote_subtotal: 150 })).toBe(PAYMENT_SCHEDULE.min); // order under $1,000: no offer
    expect(amountDue({ quote_subtotal: 60 })).toBe(60); // order under $1,000: no offer
    vi.stubEnv("NEXT_PUBLIC_FIRST_BOOKING_OFFER", "off");
    expect(amountDue({ quote_subtotal: 4000 })).toBe(4000 * PAYMENT_SCHEDULE.firstShare);
  });

  it("does not apply the first-booking offer to the fixed hold in hold mode", () => {
    vi.stubEnv("BOOKING_CHARGE", "hold");
    expect(chargeMode()).toBe("hold");
    expect(chargeLabel()).toMatch(/hold/i);
    expect(amountDue({ quote_subtotal: 4000 })).toBe(100);
    vi.stubEnv("BOOKING_HOLD_USD", "250.555");
    expect(amountDue({})).toBe(250.56);
    vi.stubEnv("BOOKING_HOLD_USD", "-4");
    expect(amountDue({})).toBe(100);
  });
});

describe("proposal tokens", () => {
  it("are 32 lowercase hex characters and unique", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const t = newProposalToken();
      expect(t).toMatch(/^[0-9a-f]{32}$/);
      seen.add(t);
    }
    expect(seen.size).toBe(50);
  });
});

describe("verifyStripeSignature", () => {
  const secret = "whsec_test";
  const payload = JSON.stringify({ id: "evt_1", type: "checkout.session.completed" });
  const now = 1_790_000_000_000;
  const t = Math.floor(now / 1000);
  const sig = (p = payload, ts = t, s = secret) => createHmac("sha256", s).update(`${ts}.${p}`).digest("hex");

  it("accepts a fresh, correct signature, including among several v1 values", () => {
    expect(verifyStripeSignature(payload, `t=${t},v1=${sig()}`, secret, now)).toBe(true);
    expect(verifyStripeSignature(payload, `t=${t},v1=${"0".repeat(64)},v1=${sig()}`, secret, now)).toBe(true);
  });

  it("rejects a changed body, wrong secret, missing header or old timestamp", () => {
    expect(verifyStripeSignature(payload + " ", `t=${t},v1=${sig()}`, secret, now)).toBe(false);
    expect(verifyStripeSignature(payload, `t=${t},v1=${sig(payload, t, "other")}`, secret, now)).toBe(false);
    expect(verifyStripeSignature(payload, null, secret, now)).toBe(false);
    expect(verifyStripeSignature(payload, `v1=${sig()}`, secret, now)).toBe(false);
    const old = t - 301;
    expect(verifyStripeSignature(payload, `t=${old},v1=${sig(payload, old)}`, secret, now)).toBe(false);
    expect(verifyStripeSignature(payload, `t=${t},v1=nothex`, secret, now)).toBe(false);
  });
});

describe("checkoutPaid", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("refuses without Stripe or with a malformed session id, without calling Stripe", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.stubEnv("STRIPE_SECRET_KEY", "");
    expect(await checkoutPaid("cs_test_123", "lead-1")).toBe(false);
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    expect(await checkoutPaid("../../v1/charges", "lead-1")).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("checks that the session is paid and belongs to the lead", async () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_x");
    const reply = (body: unknown) => Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementationOnce(() => reply({ metadata: { lead_id: "lead-1" }, payment_status: "paid" }));
    expect(await checkoutPaid("cs_test_123", "lead-1")).toBe(true);
    fetchSpy.mockImplementationOnce(() => reply({ metadata: { lead_id: "lead-2" }, payment_status: "paid" }));
    expect(await checkoutPaid("cs_test_123", "lead-1")).toBe(false);
    fetchSpy.mockImplementationOnce(() => reply({ metadata: { lead_id: "lead-1" }, payment_status: "unpaid" }));
    expect(await checkoutPaid("cs_test_123", "lead-1")).toBe(false);
  });
});
