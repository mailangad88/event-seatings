import { afterEach, describe, expect, it, vi } from "vitest";
import { FIRST_BOOKING_DISCOUNT, firstBookingDiscountApplied, firstBookingOfferEnabled, withFirstBookingDiscount } from "@/lib/offers";

describe("first-booking offer", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("is on by default and knocks the flat discount off an amount, never below $0", () => {
    expect(firstBookingOfferEnabled()).toBe(true);
    expect(withFirstBookingDiscount(200)).toBe(200 - FIRST_BOOKING_DISCOUNT);
    expect(withFirstBookingDiscount(20)).toBe(0);
    expect(withFirstBookingDiscount(0)).toBe(0);
  });

  it("reports how much of the discount actually applied", () => {
    expect(firstBookingDiscountApplied(200)).toBe(FIRST_BOOKING_DISCOUNT);
    expect(firstBookingDiscountApplied(20)).toBe(20);
    expect(firstBookingDiscountApplied(0)).toBe(0);
  });

  it("turns off instantly with NEXT_PUBLIC_FIRST_BOOKING_OFFER=off", () => {
    vi.stubEnv("NEXT_PUBLIC_FIRST_BOOKING_OFFER", "off");
    expect(firstBookingOfferEnabled()).toBe(false);
    expect(withFirstBookingDiscount(200)).toBe(200);
    expect(firstBookingDiscountApplied(200)).toBe(0);
  });
});
