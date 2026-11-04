import { describe, expect, it } from "vitest";
import { chairImageSrc } from "@/data/chair-images";
import { chairRenderSlug, rentalImage } from "@/data/rental-images";

// src/data/chair-images.ts is a hand-kept copy so browser code doesn't load the full image list. Keep it in step.
describe("chair image map", () => {
  it("matches the image list", () => {
    const expected: Record<string, string> = {};
    for (const [chair, slug] of Object.entries(chairRenderSlug)) {
      const src = rentalImage(slug)?.src;
      if (src) expected[chair] = src;
    }
    // On a mismatch, paste the "expected" object into src/data/chair-images.ts.
    expect(chairImageSrc).toEqual(expected);
  });
});
