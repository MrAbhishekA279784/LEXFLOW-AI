import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors';
import { CONSTANTS } from '../config/constants';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const standardLimiterStore = new Map<string, RateLimitRecord>();
const expensiveLimiterStore = new Map<string, RateLimitRecord>();
const authLimiterStore = new Map<string, RateLimitRecord>();

// Periodic store cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  [standardLimiterStore, expensiveLimiterStore, authLimiterStore].forEach((store) => {
    for (const [key, record] of store.entries()) {
      if (now > record.resetTime) {
        store.delete(key);
      }
    }
  });
}, 60_000);

export function getClientIp(req: Request): string {
  const xForwardedFor = req.headers['x-forwarded-for'];
  let rawIp = '127.0.0.1';
  if (typeof xForwardedFor === 'string') {
    rawIp = xForwardedFor.split(',')[0].trim();
  } else if (Array.isArray(xForwardedFor)) {
    rawIp = xForwardedFor[0].trim();
  } else if (req.socket?.remoteAddress) {
    rawIp = req.socket.remoteAddress;
  }
  return rawIp.replace(/^::ffff:/, '');
}

export function createRateLimiter(maxRequests: number, windowMs: number, store: Map<string, RateLimitRecord>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = getClientIp(req);
    const key = req.user?.id ? `user:${req.user.id}` : `ip:${clientIp}`;
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetTime) {
      const resetTime = now + windowMs;
      store.set(key, { count: 1, resetTime });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
      return next();
    }

    const remaining = Math.max(0, maxRequests - record.count - 1);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    if (record.count >= maxRequests) {
      const waitSeconds = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', waitSeconds);
      return next(new RateLimitError(`Rate limit exceeded. Please try again in ${waitSeconds} seconds.`));
    }

    record.count++;
    next();
  };
}

export const standardRateLimiter = createRateLimiter(
  CONSTANTS.RATE_LIMIT_STANDARD_MAX,
  CONSTANTS.RATE_LIMIT_WINDOW_MS,
  standardLimiterStore
);

export const expensiveRateLimiter = createRateLimiter(
  CONSTANTS.RATE_LIMIT_EXPENSIVE_MAX,
  CONSTANTS.RATE_LIMIT_WINDOW_MS,
  expensiveLimiterStore
);

export const authRateLimiter = createRateLimiter(
  15, // 15 attempts per 15 mins window for auth/session endpoints
  CONSTANTS.RATE_LIMIT_WINDOW_MS,
  authLimiterStore
);

