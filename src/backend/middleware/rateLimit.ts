import { Request, Response, NextFunction } from 'express';
import { RateLimitError } from '../utils/errors';
import { CONSTANTS } from '../config/constants';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const standardLimiterStore = new Map<string, RateLimitRecord>();
const expensiveLimiterStore = new Map<string, RateLimitRecord>();

export function createRateLimiter(isExpensive = false) {
  const maxRequests = isExpensive 
    ? CONSTANTS.RATE_LIMIT_EXPENSIVE_MAX 
    : CONSTANTS.RATE_LIMIT_STANDARD_MAX;
  const windowMs = CONSTANTS.RATE_LIMIT_WINDOW_MS;
  const store = isExpensive ? expensiveLimiterStore : standardLimiterStore;

  return (req: Request, _res: Response, next: NextFunction) => {
    const clientIp = (req.headers && (req.headers['x-forwarded-for'] as string)) || (req.socket && req.socket.remoteAddress) || '127.0.0.1';
    const key = (req.user?.id || clientIp || 'unknown-client').toString();
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      const waitSeconds = Math.ceil((record.resetTime - now) / 1000);
      return next(new RateLimitError(`Rate limit exceeded. Please try again in ${waitSeconds} seconds.`));
    }

    record.count++;
    next();
  };
}

export const standardRateLimiter = createRateLimiter(false);
export const expensiveRateLimiter = createRateLimiter(true);
