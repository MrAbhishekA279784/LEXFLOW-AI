import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../db/client';
import { AuthenticationError, AuthorizationError } from '../utils/errors';
import { AuthenticatedUser } from '../types/backendTypes';
import { verifyJwtToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin if not already initialized
if (getApps().length === 0) {
  try {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    if (projectId && projectId !== 'mock-project-id') {
      initializeApp({ projectId });
    }
  } catch (e) {
    logger.warn('Firebase Admin init warning', { error: String(e) });
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Hardened canonical authentication middleware
 * Strictly validates Authorization Bearer tokens via cryptographic JWT, Firebase, or Supabase.
 * Rejects unauthenticated requests with HTTP 401.
 * Never accepts client-provided identity or falls back to guest user.
 */
export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // In test environment without auth header, reject with 401
    logger.warn('Authentication rejected: Missing Authorization header', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    return next(new AuthenticationError('Authentication required. Missing Authorization header.'));
  }

  if (!authHeader.startsWith('Bearer ')) {
    logger.warn('Authentication rejected: Malformed Authorization scheme', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    return next(new AuthenticationError('Invalid Authorization header format. Expected "Bearer <token>".'));
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    logger.warn('Authentication rejected: Empty Bearer token', {
      path: req.path,
      method: req.method,
      ip: req.ip,
    });
    return next(new AuthenticationError('Authentication required. Missing Bearer token.'));
  }

  // 1. Try cryptographic JWT verification first (local HMAC-SHA256 tokens)
  try {
    const verified = verifyJwtToken(token);
    req.user = verified;
    return next();
  } catch (jwtErr) {
    // If token has 3 parts and failed signature/exp verification with an AuthenticationError,
    // remember if it was an expired token error
    if (jwtErr instanceof AuthenticationError && jwtErr.message.includes('expired')) {
      logger.warn('Authentication rejected: Expired token', {
        path: req.path,
        method: req.method,
      });
      return next(jwtErr);
    }
  }

  // 2. Try Firebase Admin if available
  if (getApps().length > 0) {
    try {
      const decodedToken = await getAuth().verifyIdToken(token);
      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email || '',
        name: decodedToken.name,
        role: (decodedToken.role as string) || 'authenticated',
      };
      return next();
    } catch {
      // Firebase verification failed; continue to Supabase
    }
  }

  // 3. Try Supabase Auth if available
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        req.user = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.display_name || data.user.user_metadata?.name,
          role: data.user.role || 'authenticated',
        };
        return next();
      }
    } catch {
      // Supabase verification failed
    }
  }

  // All verification attempts failed
  logger.warn('Authentication rejected: Invalid authentication token', {
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  return next(new AuthenticationError('Invalid or expired authentication token.'));
}

export const requireAuth = authMiddleware;

/**
 * Hardened resource ownership enforcement middleware
 * Strictly verifies req.user.id === entityOwnerId.
 * No hardcoded bypasses or guest user allowances.
 */
export function requireOwnership(getOwnerIdFromEntity: (req: Request) => Promise<string | null | undefined>) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AuthenticationError('Authentication required.'));
      }

      const entityOwnerId = await getOwnerIdFromEntity(req);
      if (!entityOwnerId) {
        // Entity not found; let downstream controller return 404
        return next();
      }

      if (req.user.id !== entityOwnerId) {
        logger.warn('Authorization rejected: Resource ownership mismatch', {
          userId: req.user.id,
          entityOwnerId,
          path: req.path,
          method: req.method,
        });
        return next(new AuthorizationError('You do not have permission to access this resource.'));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

