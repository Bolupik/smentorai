/**
 * Retry a promise-returning function with exponential backoff.
 *
 * @param fn          — the async operation to retry
 * @param maxAttempts — maximum total attempts (default 4)
 * @param baseDelayMs — base delay in ms before first retry (default 500)
 * @param onRetry     — optional callback called before each retry with (attempt, delayMs)
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 4,
  baseDelayMs = 500,
  onRetry?: (attempt: number, delayMs: number) => void
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt === maxAttempts) break;

      // Exponential backoff with ±20% jitter
      const delay = baseDelayMs * 2 ** (attempt - 1) * (0.8 + Math.random() * 0.4);
      onRetry?.(attempt, Math.round(delay));
      await new Promise((res) => setTimeout(res, delay));
    }
  }

  throw lastError;
}

/** Returns true when a thrown error looks like a transient network failure */
export function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && err.message.toLowerCase().includes("fetch")) return true;
  if (err && typeof err === "object") {
    const msg = (err as { message?: string }).message ?? "";
    return (
      msg.includes("Failed to fetch") ||
      msg.includes("NetworkError") ||
      msg.includes("network") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("ERR_NETWORK")
    );
  }
  return false;
}
