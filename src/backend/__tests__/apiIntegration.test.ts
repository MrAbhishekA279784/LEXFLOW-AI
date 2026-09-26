import { describe, it, expect } from 'vitest';
import express from 'express';
import { apiV1Router } from '../routes';
import { errorHandler } from '../middleware/errorHandler';
import { signJwtToken } from '../utils/jwt';

const TEST_TOKEN = signJwtToken({ id: 'test-user-001', email: 'test@example.com' });
const AUTH_HEADER = { authorization: `Bearer ${TEST_TOKEN}` };

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', apiV1Router);
  app.use(errorHandler);
  return app;
}

async function dispatchApi(app: express.Application, reqOptions: {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
}) {
  let statusCode = 200;
  let jsonResult: any = null;

  const req: any = {
    method: reqOptions.method,
    url: reqOptions.url,
    headers: { ...AUTH_HEADER, ...(reqOptions.headers || {}) },
    socket: { remoteAddress: '127.0.0.1' },
    ip: '127.0.0.1',
    body: reqOptions.body || {}
  };

  const res: any = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    setHeader() { return this; }
  };

  await new Promise<void>((resolve) => {
    let resolved = false;
    const done = () => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    };

    res.json = (data: any) => {
      jsonResult = data;
      done();
      return res;
    };
    res.end = () => {
      done();
    };

    (app as any).handle(req, res, (err: any) => {
      if (err) {
        errorHandler(err, req, res, (() => {}) as any);
      }
      done();
    });
    setTimeout(done, 2500);
  });

  return { statusCode, jsonResult };
}

describe('API Integration Endpoints (/api/v1)', () => {
  it('should list documents with 200 OK', async () => {
    const app = createTestApp();
    const { statusCode, jsonResult } = await dispatchApi(app, {
      method: 'GET',
      url: '/api/v1/documents'
    });

    expect(statusCode).toBe(200);
    expect(jsonResult.success).toBe(true);
    expect(Array.isArray(jsonResult.data)).toBe(true);
    expect(jsonResult.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should run a scenario on the rental document through the API', async () => {
    const app = createTestApp();
    const { statusCode, jsonResult } = await dispatchApi(app, {
      method: 'POST',
      url: '/api/v1/documents/doc-rental/scenarios',
      body: {
        prompt: 'Agar main 3 mahine rent nahi du aur phir ghar chhod du toh kya hoga?',
        actorRole: 'tenant'
      }
    });

    expect(statusCode).toBe(200);
    expect(jsonResult.success).toBe(true);
    expect(jsonResult.data.status).toBe('completed');
    expect(jsonResult.data.totalFinancialImpact).toContain('₹');
    expect(jsonResult.data.documentSays).toBeDefined();
    expect(jsonResult.data.lawSays).toBeDefined();
    expect(jsonResult.data.lexflowAnalysis).toBeDefined();
  });

  it('should generate a comprehensive lawyer prep-kit through the API', async () => {
    const app = createTestApp();
    const { statusCode, jsonResult } = await dispatchApi(app, {
      method: 'POST',
      url: '/api/v1/documents/doc-rental/lawyer-kit',
      body: {}
    });

    expect([200, 201]).toContain(statusCode);
    expect(jsonResult.success).toBe(true);
    expect(jsonResult.data.documentName).toBeDefined();
    expect(jsonResult.data.questionsForLegalProfessional.length).toBeGreaterThanOrEqual(2);
    expect(jsonResult.data.evidenceSummary.length).toBeGreaterThanOrEqual(1);
    expect(jsonResult.data.contractualProtections.length).toBeGreaterThanOrEqual(1);
  });
});
