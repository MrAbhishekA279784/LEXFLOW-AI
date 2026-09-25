import crypto from 'crypto';
import { AuthenticatedUser } from '../types/backendTypes';
import { AuthenticationError } from './errors';

const JWT_SECRET = process.env.JWT_SECRET || process.env.AUTH_JWT_SECRET || 'lexflow-production-security-hmac-jwt-secret-key-32chars!';

interface JwtHeader {
  alg: string;
  typ: string;
}

interface JwtPayload {
  sub?: string;
  id?: string;
  uid?: string;
  email?: string;
  name?: string;
  role?: string;
  exp?: number;
  iat?: number;
  [key: string]: any;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Creates a cryptographically signed HMAC-SHA256 JWT
 */
export function createToken(
  user: { id: string; email?: string; role?: string; name?: string },
  expiresInSeconds: number = 3600,
  secret: string = JWT_SECRET
): string {
  const header: JwtHeader = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload: JwtPayload = {
    sub: user.id,
    id: user.id,
    email: user.email || 'user@lexflow.internal',
    name: user.name || 'Lexflow User',
    role: user.role || 'authenticated',
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${data}.${signature}`;
}

export const signJwtToken = createToken;

/**
 * Creates an expired token for security testing
 */
export function createExpiredToken(
  user: { id: string; email?: string; role?: string; name?: string },
  secret: string = JWT_SECRET
): string {
  return createToken(user, -3600, secret);
}

/**
 * Cryptographically verifies an HMAC-SHA256 JWT
 */
export function verifyJwtToken(token: string, secret: string = JWT_SECRET): AuthenticatedUser {
  if (!token || typeof token !== 'string') {
    throw new AuthenticationError('Invalid authentication token format.');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new AuthenticationError('Malformed authentication token.');
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  // 1. Verify header
  let header: JwtHeader;
  try {
    header = JSON.parse(base64UrlDecode(encodedHeader));
  } catch {
    throw new AuthenticationError('Malformed token header.');
  }

  if (header.alg !== 'HS256') {
    throw new AuthenticationError('Unsupported token algorithm.');
  }

  // 2. Verify signature using constant-time comparison
  const data = `${encodedHeader}.${encodedPayload}`;
  const expectedSigBuffer = crypto.createHmac('sha256', secret).update(data).digest();
  
  let signatureBuffer: Buffer;
  try {
    let base64Sig = signature.replace(/-/g, '+').replace(/_/g, '/');
    while (base64Sig.length % 4) base64Sig += '=';
    signatureBuffer = Buffer.from(base64Sig, 'base64');
  } catch {
    throw new AuthenticationError('Invalid token signature format.');
  }

  if (
    signatureBuffer.length !== expectedSigBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSigBuffer)
  ) {
    throw new AuthenticationError('Invalid authentication token signature.');
  }

  // 3. Verify payload claims & expiration
  let payload: JwtPayload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload));
  } catch {
    throw new AuthenticationError('Malformed token payload.');
  }

  const userId = payload.sub || payload.id || payload.uid;
  if (!userId || typeof userId !== 'string' || userId.trim() === '') {
    throw new AuthenticationError('Token payload is missing subject claim.');
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && payload.exp < now) {
    throw new AuthenticationError('Authentication token has expired.');
  }

  return {
    id: userId.trim(),
    email: payload.email || '',
    name: payload.name,
    role: payload.role || 'authenticated',
  };
}
