import { describe, expect, it } from "vitest";
import files from "@/data/public-files.json";
import { hasPublicFile } from "@/lib/public-files";

describe("public file list", () => {
  it("knows files that exist and rejects ones that don't", () => {
    const real = (files as string[])[0];
    expect(hasPublicFile(real)).toBe(true);
    expect(hasPublicFile(real + "?v=2")).toBe(true);
    expect(hasPublicFile("/no/such/file.webp")).toBe(false);
    expect(hasPublicFile("relative.webp")).toBe(false);
    expect(hasPublicFile(undefined)).toBe(false);
  });
});
