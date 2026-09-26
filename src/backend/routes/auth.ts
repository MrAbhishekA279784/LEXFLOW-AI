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
 * Returns session info for a verified identity. Rejects unauthenticated requests with 401.
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

    logger.warn('Session endpoint rejected: No valid credentials', { ip: req.ip });
    return next(new AuthenticationError('Authentication required. Missing or invalid Bearer token.'));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/session
 * Mints session JWT for verified identities only. Rejects unauthenticated requests with 401.
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

    logger.warn('Unverified session creation rejected', { ip: req.ip });
    return next(new AuthenticationError('Authentication required. Missing or invalid Bearer token.'));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/auth/profile
 * Updates authenticated user profile details (name, avatar, preferences).
 * Strictly bound to req.user.id from verified auth token.
 */
authRoutes.patch('/profile', async (req: Request, res: Response, next) => {
  try {
    const verifiedUser = await extractVerifiedUserFromRequest(req);
    if (!verifiedUser) {
      return next(new AuthenticationError('Authentication required to update profile.'));
    }

    const { name, avatarUrl, preferences } = req.body || {};
    const updatedName = name && typeof name === 'string' ? name.trim() : verifiedUser.name;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('users').upsert({
          id: verifiedUser.id,
          email: verifiedUser.email,
          display_name: updatedName,
          name: updatedName,
          avatar_url: avatarUrl || undefined,
          preferences: preferences || undefined,
          updated_at: new Date().toISOString(),
        });
      } catch (dbErr) {
        logger.warn('Database profile update warning', { error: String(dbErr) });
      }
    }

    const updatedUser = {
      ...verifiedUser,
      name: updatedName,
      avatarUrl,
      preferences,
    };

    const token = signJwtToken({
      id: verifiedUser.id,
      email: verifiedUser.email,
      name: updatedName,
      role: verifiedUser.role || 'authenticated',
    });

    return res.json({
      success: true,
      data: {
        token,
        user: updatedUser,
      },
    });
  } catch (err) {
    next(err);
  }
});

