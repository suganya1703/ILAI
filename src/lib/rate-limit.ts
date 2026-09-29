/**
 * In-memory Rate Limiting and Brute-Force Lockout Protection
 */

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

type LockoutRecord = {
  attempts: number;
  lockedUntil: number | null;
  lastAttemptAt: number;
};

// Global stores across requests
const rateLimitMap = new Map<string, RateLimitRecord>();
const loginLockoutMap = new Map<string, LockoutRecord>();

// Periodic cleanup to avoid memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpired() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetAt) rateLimitMap.delete(k);
  }

  for (const [k, v] of loginLockoutMap.entries()) {
    if (v.lockedUntil && now > v.lockedUntil && now - v.lastAttemptAt > 60 * 60 * 1000) {
      loginLockoutMap.delete(k);
    }
  }
}

/**
 * Extract real client IP address safely from request headers
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    // First IP in comma-separated chain is the client IP
    const clientIp = forwarded.split(",")[0].trim();
    if (clientIp) return clientIp;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

/**
 * Sliding window rate limit per key (e.g. `checkout:${ip}`)
 */
export function rateLimit({
  ip,
  key,
  limit = 10,
  windowMs = 60 * 1000,
}: {
  ip?: string;
  key?: string;
  limit?: number;
  windowMs?: number;
}): { success: boolean; remaining: number } {
  cleanupExpired();

  const effectiveKey = key || ip || "global";
  const now = Date.now();
  const record = rateLimitMap.get(effectiveKey);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(effectiveKey, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}

// ============================================================================
// Admin Login Brute-Force Lockout Protection
// 5 failed attempts = 15 minute lockout for that IP
// ============================================================================
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export function checkLoginLockout(ip: string): {
  isLocked: boolean;
  remainingMinutes?: number;
} {
  cleanupExpired();
  const record = loginLockoutMap.get(ip);
  if (!record) return { isLocked: false };

  const now = Date.now();

  // Currently locked
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingMs = record.lockedUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return { isLocked: true, remainingMinutes };
  }

  // Lockout expired, reset attempts
  if (record.lockedUntil && now >= record.lockedUntil) {
    loginLockoutMap.delete(ip);
    return { isLocked: false };
  }

  return { isLocked: false };
}

export function recordFailedLogin(ip: string): {
  isLocked: boolean;
  remainingAttempts: number;
  remainingMinutes?: number;
} {
  cleanupExpired();
  const now = Date.now();
  let record = loginLockoutMap.get(ip);

  // If previous attempts were more than 1 hour ago, reset count
  if (record && now - record.lastAttemptAt > 60 * 60 * 1000) {
    record = undefined;
  }

  if (!record) {
    record = {
      attempts: 1,
      lockedUntil: null,
      lastAttemptAt: now,
    };
    loginLockoutMap.set(ip, record);
    return { isLocked: false, remainingAttempts: MAX_LOGIN_ATTEMPTS - 1 };
  }

  record.attempts += 1;
  record.lastAttemptAt = now;

  if (record.attempts >= MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION_MS;
    return {
      isLocked: true,
      remainingAttempts: 0,
      remainingMinutes: 15,
    };
  }

  return {
    isLocked: false,
    remainingAttempts: MAX_LOGIN_ATTEMPTS - record.attempts,
  };
}

export function recordSuccessfulLogin(ip: string): void {
  loginLockoutMap.delete(ip);
}
