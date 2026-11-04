import { describe, expect, it, vi } from "vitest";
import { isTransient, withRetry } from "@/lib/retry";

const noSleep = { sleep: async () => {} };

describe("withRetry", () => {
  it("returns the first success", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("fetch failed")).mockResolvedValue("ok");
    await expect(withRetry(fn, noSleep)).resolves.toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("gives up after the set number of tries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fetch failed"));
    await expect(withRetry(fn, { ...noSleep, attempts: 3 })).rejects.toThrow("fetch failed");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("does not retry errors that won't fix themselves", async () => {
    const fn = vi.fn().mockRejectedValue({ code: "23505", message: "duplicate key" });
    await expect(withRetry(fn, { ...noSleep, shouldRetry: isTransient })).rejects.toMatchObject({ code: "23505" });
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("waits longer each time", async () => {
    const waits: number[] = [];
    const fn = vi.fn().mockRejectedValue(new Error("timeout"));
    await withRetry(fn, { attempts: 3, baseMs: 100, sleep: async (ms) => void waits.push(ms) }).catch(() => {});
    expect(waits).toEqual([100, 300]);
  });
});

describe("isTransient", () => {
  it.each([
    [{ status: 503 }, true],
    [{ status: 429 }, true],
    [{ status: 400 }, false],
    [{ code: "23505", message: "duplicate key value" }, false],
    [{ code: "PGRST204", message: "column not found" }, false],
    [new TypeError("fetch failed"), true],
    [{ code: "ECONNRESET", message: "socket hang up" }, true],
  ])("%o -> %s", (error, expected) => {
    expect(isTransient(error)).toBe(expected);
  });
});
