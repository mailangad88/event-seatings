import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

let local: MemoryStorage;

beforeEach(() => {
  vi.useFakeTimers();
  local = new MemoryStorage();
  vi.stubGlobal("window", { sessionStorage: new MemoryStorage(), localStorage: local });
  vi.resetModules();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const ok = () => new Response(JSON.stringify({ ok: true }), { status: 200 });

describe("submissionIdFor", () => {
  it("reuses the id for the same details and ignores page history", async () => {
    const { submissionIdFor } = await import("@/lib/lead-client");
    const a = submissionIdFor({ email: "a@b.com", kind: "quote", journey: { pages: [1] } });
    const b = submissionIdFor({ kind: "quote", email: "a@b.com", journey: { pages: [1, 2] } });
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("gives new details a new id", async () => {
    const { submissionIdFor } = await import("@/lib/lead-client");
    expect(submissionIdFor({ email: "a@b.com" })).not.toBe(submissionIdFor({ email: "c@d.com" }));
  });

  it("starts a new id after an hour", async () => {
    const { submissionIdFor } = await import("@/lib/lead-client");
    const a = submissionIdFor({ email: "a@b.com" }, 0);
    expect(submissionIdFor({ email: "a@b.com" }, 2 * 3600_000)).not.toBe(a);
  });
});

describe("postLead", () => {
  it("sends the id as a header and in the body", async () => {
    const fetch = vi.fn().mockResolvedValue(ok());
    vi.stubGlobal("fetch", fetch);
    const { postLead } = await import("@/lib/lead-client");
    const res = await postLead({ email: "a@b.com", kind: "chat" });
    expect(res.ok).toBe(true);
    const [, init] = fetch.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(init.headers["Idempotency-Key"]).toBe(body.submission_id);
    expect(typeof body.form_ms).toBe("number");
  });

  it("retries server errors, then succeeds", async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response("", { status: 502 })).mockResolvedValue(ok());
    vi.stubGlobal("fetch", fetch);
    const { postLead } = await import("@/lib/lead-client");
    const p = postLead({ email: "a@b.com", kind: "chat" });
    await vi.runAllTimersAsync();
    expect((await p).ok).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(local.getItem("lead-outbox")).toBe("[]");
  });

  it("does not retry a form the server turned down", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: "bad email" }), { status: 400 }));
    vi.stubGlobal("fetch", fetch);
    const { postLead } = await import("@/lib/lead-client");
    expect((await postLead({ email: "nope", kind: "chat" })).status).toBe(400);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("keeps the form on the device when offline, and sends it later with the same id", async () => {
    const offline = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    vi.stubGlobal("fetch", offline);
    const { postLead, flushLeadOutbox } = await import("@/lib/lead-client");
    const p = postLead({ email: "a@b.com", kind: "quote" });
    await vi.runAllTimersAsync();
    const res = await p;
    expect(res.status).toBe(503);
    expect(offline).toHaveBeenCalledTimes(3);
    const queued = JSON.parse(local.getItem("lead-outbox")!);
    expect(queued).toHaveLength(1);

    const online = vi.fn().mockResolvedValue(ok());
    vi.stubGlobal("fetch", online);
    await flushLeadOutbox();
    expect(online).toHaveBeenCalledTimes(1);
    expect(JSON.parse(online.mock.calls[0][1].body).submission_id).toBe(queued[0].id);
    expect(JSON.parse(local.getItem("lead-outbox")!)).toHaveLength(0);
  });
});
