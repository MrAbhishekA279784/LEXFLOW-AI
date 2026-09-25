import { Router, Request, Response } from 'express';
import { signJwtToken, verifyJwtToken } from '../utils/jwt';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getSupabaseClient } from '../db/client';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';

export const authRoutes = Router();

async function extractVerifiedUserFromRequest(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7).trim();
  if (!token) return null;

  // 1. Try local JWT verification
  try {
    const verified = verifyJwtToken(token);
    if (verified) return verified;
  } catch {}

  // 2. Try Firebase Admin verification
  if (getApps().length > 0) {
    try {
      const decoded = await getAuth().verifyIdToken(token);
      return {
        id: decoded.uid,
        email: decoded.email || '',
        name: decoded.name || 'Firebase User',
        role: (decoded.role as string) || 'authenticated',
      };
    } catch {}
  }

  // 3. Try Supabase Auth verification
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user) {
        return {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.display_name || data.user.user_metadata?.name || 'Supabase User',
          role: data.user.role || 'authenticated',
        };
      }
    } catch {}
  }

  return null;
}

/**
 * GET /api/v1/auth/session
 * Returns or creates a session for a verified identity.
 * In production, unauthenticated requests are strictly rejected.
 */
authRoutes.get('/session', async (req: Request, res: Response, next) => {
  try {
    const verifiedUser = await extractVerifiedUserFromRequest(req);

    if (verifiedUser) {
      const token = signJwtToken(verifiedUser);
      return res.json({
        success: true,
        data: {
          token,
          user: verifiedUser,
        },
      });
    }

    // Unauthenticated fallback
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Session endpoint rejected in production: No valid primary credentials', {
        ip: req.ip,
      });
      return next(new AuthenticationError('Credential verification required. Production session minting without primary auth is prohibited.'));
    }

    // Development/Test fallback
    const devUser = {
      id: 'usr-default-ahamed',
      email: 'ahamed@gmail.com',
      name: 'Ahamed Khan',
      role: 'authenticated',
    };
    const token = signJwtToken(devUser);
    return res.json({
      success: true,
      data: {
        token,
        user: devUser,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/session
 * Mints session JWT for verified identities only.
 * Production rejects untrusted client-supplied identity parameters in req.body.
 */
authRoutes.post('/session', async (req: Request, res: Response, next) => {
  try {
    const verifiedUser = await extractVerifiedUserFromRequest(req);

    if (verifiedUser) {
      const token = signJwtToken(verifiedUser);
      return res.json({
        success: true,
        data: {
          token,
          user: verifiedUser,
        },
      });
    }

    if (process.env.NODE_ENV === 'production') {
      logger.warn('Unverified session creation rejected in production', {
        ip: req.ip,
        body: req.body,
      });
      return next(new AuthenticationError('Cannot mint production session without verified primary authentication credentials.'));
    }

    // Non-production development helper
    const { id, email, name } = req.body || {};
    const devUser = {
      id: id || 'usr-default-ahamed',
      email: email || 'ahamed@gmail.com',
      name: name || 'Ahamed Khan',
      role: 'authenticated',
    };
    const token = signJwtToken(devUser);

    return res.json({
      success: true,
      data: {
        token,
        user: devUser,
      },
    });
  } catch (err) {
    next(err);
  }
});

