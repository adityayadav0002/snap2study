type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const requests = new Map<string, RateLimitEntry>();

const LIMIT = 10;
const WINDOW_MS = 10 * 60 * 1000;

export function checkRateLimit(identifier: string) {
  const now = Date.now();

  const existing = requests.get(identifier);

  if (!existing || now >= existing.resetAt) {
    requests.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      allowed: true,
      remaining: LIMIT - 1,
      resetAt: now + WINDOW_MS,
    };
  }

  if (existing.count >= LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    remaining: LIMIT - existing.count,
    resetAt: existing.resetAt,
  };
}