import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// sendEmail: retries temporary Resend failures, stops on permanent ones, and passes the idempotency key.
vi.mock("@react-email/render", () => ({ render: async () => "<p>html</p>" }));

beforeEach(() => {
  vi.resetModules();
  process.env.RESEND_API_KEY = "re_test";
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

const mail = { to: "owner@example.com", subject: "Hi", text: "Body", idempotencyKey: "lead-alert/abc" };

describe("sendEmail", () => {
  it("does nothing without a Resend key", async () => {
    delete process.env.RESEND_API_KEY;
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    const { sendEmail } = await import("@/lib/notify");
    expect(await sendEmail(mail)).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("retries a Resend outage with the same idempotency key", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockResolvedValueOnce(new Response("down", { status: 503 })).mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetch);
    const { sendEmail } = await import("@/lib/notify");
    const p = sendEmail(mail);
    await vi.runAllTimersAsync();
    expect(await p).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
    for (const [, init] of fetch.mock.calls) expect(init.headers["Idempotency-Key"]).toBe("lead-alert/abc");
  });

  it("stops at once on a permanent error such as an unverified domain", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("domain not verified", { status: 403 }));
    vi.stubGlobal("fetch", fetch);
    const { sendEmail } = await import("@/lib/notify");
    expect(await sendEmail(mail)).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("gives up after three network failures", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fetch);
    const { sendEmail } = await import("@/lib/notify");
    const p = sendEmail(mail);
    await vi.runAllTimersAsync();
    expect(await p).toBe(false);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
});
