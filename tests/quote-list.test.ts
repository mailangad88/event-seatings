import { describe, expect, it } from "vitest";
import { listLink } from "@/lib/quote-list";

describe("quote list link", () => {
  it("rebuilds the list with items and guest count", () => {
    const url = listLink({ items: { "round-60": { qty: 13, auto: true }, "gold-chiavari": { qty: 100, auto: false } }, guests: 100 }, "https://beyondchiavari.com");
    expect(url).toBe("https://beyondchiavari.com/quote?items=round-60%2Cgold-chiavari&browse=1&guests=100");
  });
  it("leaves out guests when unknown", () => {
    expect(listLink({ items: { a: { qty: 1, auto: true } } }, "")).toBe("/quote?items=a&browse=1");
  });
});
