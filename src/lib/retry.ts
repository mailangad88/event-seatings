// Small retry helper for calls to outside services (database, email, backup store).
// Waits base, 3x base, 9x base... between tries. Only retries when `shouldRetry` says the failure is temporary.

export type RetryOptions = {
  attempts?: number;
  baseMs?: number;
  shouldRetry?: (error: unknown) => boolean;
  sleep?: (ms: number) => Promise<void>;
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function withRetry<T>(fn: (attempt: number) => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { attempts = 3, baseMs = 250, shouldRetry = () => true, sleep = wait } = opts;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn(attempt);
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !shouldRetry(error)) break;
      await sleep(baseMs * 3 ** (attempt - 1));
    }
  }
  throw lastError;
}

// True for failures that are worth another try: network errors, timeouts, rate limits and 5xx answers.
// Database rule errors (bad column, duplicate key, wrong type) are not temporary and are not retried.
export function isTransient(error: unknown): boolean {
  if (!error || typeof error !== "object") return true;
  const e = error as { status?: number; code?: string; message?: string; name?: string };
  if (typeof e.status === "number") return e.status === 408 || e.status === 429 || e.status >= 500;
  if (e.code && /^(23|22|42|PGRST2)/.test(e.code)) return false;
  return /fetch failed|network|timeout|timed out|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|socket|503|502|504|abort/i.test(
    `${e.name ?? ""} ${e.message ?? ""} ${e.code ?? ""}`,
  ) || !e.code;
}
