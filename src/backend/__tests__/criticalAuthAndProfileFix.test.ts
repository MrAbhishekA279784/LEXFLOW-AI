import { describe, it, expect } from 'vitest';
import express from 'express';
import { apiV1Router } from '../routes';
import { errorHandler } from '../middleware/errorHandler';
import { signJwtToken } from '../utils/jwt';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', apiV1Router);
  app.use(errorHandler);
  return app;
}

async function dispatchRequest(app: express.Application, reqOptions: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}) {
  let statusCode = 200;
  let jsonResult: any = null;

  const normalizedHeaders: Record<string, string> = {};
  if (reqOptions.headers) {
    for (const [k, v] of Object.entries(reqOptions.headers)) {
      normalizedHeaders[k.toLowerCase()] = v;
    }
  }

  const req: any = {
    method: reqOptions.method,
    url: reqOptions.url,
    headers: normalizedHeaders,
    body: reqOptions.body || {},
    socket: { remoteAddress: '127.0.0.1' },
    ip: '127.0.0.1',
  };

  const res: any = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(data: any) {
      jsonResult = data;
      return this;
    },
    setHeader() { return this; },
    get() { return null; }
  };

  await new Promise<void>((resolve) => {
    let resolved = false;
    const done = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };
    const origJson = res.json;
    res.json = (data: any) => {
      origJson.call(res, data);
      done();
      return res;
    };
    (app as any).handle(req, res, (err: any) => {
      if (err) {
        errorHandler(err, req, res, (() => {}) as any);
      }
      done();
    });
  });

  return { statusCode, jsonResult };
}

describe('CRITICAL FIX 1: Fail-Closed Authentication & Session Security', () => {
  const app = createTestApp();

  it('unauthenticated GET /api/v1/auth/session MUST be rejected with HTTP 401 (No demo user fallback)', async () => {
    const { statusCode, jsonResult } = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/auth/session'
    });

    expect(statusCode).toBe(401);
    expect(jsonResult.success).toBe(false);
    expect(jsonResult.error.message).toContain('Authentication required');
    expect(jsonResult).not.toHaveProperty('data.user.name', 'Ahamed Khan');
  });

  it('unauthenticated POST /api/v1/auth/session MUST be rejected with HTTP 401', async () => {
    const { statusCode, jsonResult } = await dispatchRequest(app, {
      method: 'POST',
      url: '/api/v1/auth/session',
      body: { name: 'Untrusted Client' }
    });

    expect(statusCode).toBe(401);
    expect(jsonResult.success).toBe(false);
  });

  it('authenticated GET /api/v1/auth/session with valid token returns user session', async () => {
    const token = signJwtToken({ id: 'user-alice-123', email: 'alice@example.com', name: 'Alice Smith' });
    const { statusCode, jsonResult } = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/auth/session',
      headers: { authorization: `Bearer ${token}` }
    });

    expect(statusCode).toBe(200);
    expect(jsonResult.success).toBe(true);
    expect(jsonResult.data.user.id).toBe('user-alice-123');
    expect(jsonResult.data.user.email).toBe('alice@example.com');
  });

  it('unauthenticated GET /api/v1/documents MUST return HTTP 401 Unauthorized', async () => {
    const { statusCode, jsonResult } = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/documents'
    });

    expect(statusCode).toBe(401);
    expect(jsonResult.success).toBe(false);
  });

  it('invalid Bearer token MUST be rejected with 401', async () => {
    const { statusCode, jsonResult } = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/documents',
      headers: { authorization: 'Bearer invalid.garbage.token' }
    });

    expect(statusCode).toBe(401);
    expect(jsonResult.success).toBe(false);
  });
});

describe('CRITICAL FIX 3: Profile Name Updating & Persistence API', () => {
  const app = createTestApp();

  it('unauthenticated PATCH /api/v1/auth/profile MUST return HTTP 401', async () => {
    const { statusCode, jsonResult } = await dispatchRequest(app, {
      method: 'PATCH',
      url: '/api/v1/auth/profile',
      body: { name: 'Hacker Name' }
    });

    expect(statusCode).toBe(401);
    expect(jsonResult.success).toBe(false);
  });

  it('authenticated PATCH /api/v1/auth/profile updates profile name and returns new session token', async () => {
    const initialToken = signJwtToken({ id: 'usr-bob-789', email: 'bob@example.com', name: 'Bob Initial' });

    const { statusCode, jsonResult } = await dispatchRequest(app, {
      method: 'PATCH',
      url: '/api/v1/auth/profile',
      headers: { authorization: `Bearer ${initialToken}` },
      body: { name: 'Bob Updated Supreme', avatarUrl: 'https://example.com/avatar.jpg' }
    });

    expect(statusCode).toBe(200);
    expect(jsonResult.success).toBe(true);
    expect(jsonResult.data.user.name).toBe('Bob Updated Supreme');
    expect(jsonResult.data.token).toBeDefined();

    // Verify session GET with returned token reflects updated profile name
    const sessionRes = await dispatchRequest(app, {
      method: 'GET',
      url: '/api/v1/auth/session',
      headers: { authorization: `Bearer ${jsonResult.data.token}` }
    });

    expect(sessionRes.statusCode).toBe(200);
    expect(sessionRes.jsonResult.data.user.name).toBe('Bob Updated Supreme');
  });
});
