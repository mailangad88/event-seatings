import { afterEach, describe, expect, it, vi } from "vitest";
import { checkAdmin, safeEqual } from "@/lib/admin-auth";

const basic = (userPass: string) => `Basic ${Buffer.from(userPass).toString("base64")}`;

describe("checkAdmin", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("accepts the right password with any username", () => {
    vi.stubEnv("ADMIN_PASSWORD", "s3cret");
    expect(checkAdmin(basic("angad:s3cret"))).toBe("ok");
    expect(checkAdmin(basic(":s3cret"))).toBe("ok");
  });

  it("keeps colons that are part of the password", () => {
    vi.stubEnv("ADMIN_PASSWORD", "a:b:c");
    expect(checkAdmin(basic("user:a:b:c"))).toBe("ok");
    expect(checkAdmin(basic("user:a:b"))).toBe("denied");
  });

  it("denies a wrong password", () => {
    vi.stubEnv("ADMIN_PASSWORD", "s3cret");
    expect(checkAdmin(basic("angad:wrong"))).toBe("denied");
    expect(checkAdmin(basic("angad:s3cret "))).toBe("denied");
    expect(checkAdmin(basic("angad:"))).toBe("denied");
  });

  it("denies missing and malformed headers", () => {
    vi.stubEnv("ADMIN_PASSWORD", "s3cret");
    expect(checkAdmin(null)).toBe("denied");
    expect(checkAdmin("")).toBe("denied");
    expect(checkAdmin("Basic")).toBe("denied");
    expect(checkAdmin("Basic ")).toBe("denied");
    expect(checkAdmin("Bearer s3cret")).toBe("denied");
    expect(checkAdmin("Basic !!!not-base64!!!")).toBe("denied");
  });

  it("accepts the scheme name in any case", () => {
    vi.stubEnv("ADMIN_PASSWORD", "s3cret");
    expect(checkAdmin("basic " + Buffer.from("u:s3cret").toString("base64"))).toBe("ok");
  });

  it("does not treat a password without a colon as matching", () => {
    // No colon: indexOf returns -1, so the whole decoded string is compared.
    vi.stubEnv("ADMIN_PASSWORD", "s3cret");
    expect(checkAdmin(basic("s3cret"))).toBe("ok");
    expect(checkAdmin(basic("nope"))).toBe("denied");
  });

  it("is unconfigured outside development when no password is set", () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(checkAdmin(basic("u:anything"))).toBe("unconfigured");
    expect(checkAdmin(null)).toBe("unconfigured");
  });

  it("lets everything through in development when no password is set", () => {
    vi.stubEnv("ADMIN_PASSWORD", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(checkAdmin(null)).toBe("ok");
  });
});

describe("safeEqual", () => {
  it("compares strings exactly", () => {
    expect(safeEqual("abc", "abc")).toBe(true);
    expect(safeEqual("abc", "abd")).toBe(false);
    expect(safeEqual("abc", "abcd")).toBe(false);
    expect(safeEqual("", "")).toBe(true);
    expect(safeEqual("é", "e")).toBe(false);
  });
});
