import { describe, it, expect } from 'vitest';
import express from 'express';
import { apiV1Router } from '../routes';
import { errorHandler } from '../middleware/errorHandler';

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/v1', apiV1Router);
  app.use(errorHandler);
  return app;
}

describe('API Integration Endpoints (/api/v1)', () => {
  it('should list documents with 200 OK', async () => {
    const app = createTestApp();
    
    const req = { 
      method: 'GET', 
      url: '/api/v1/documents', 
      headers: {},
      socket: { remoteAddress: '127.0.0.1' }
    } as any;

    let statusCode = 200;
    let jsonResult: any = null;

    const res: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        jsonResult = data;
        return this;
      },
      setHeader() { return this; }
    };

    await new Promise<void>((resolve) => {
      (app as any).handle(req, res, () => resolve());
      setTimeout(resolve, 50);
    });

    expect(statusCode).toBe(200);
    expect(jsonResult.success).toBe(true);
    expect(Array.isArray(jsonResult.data)).toBe(true);
    expect(jsonResult.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should run a scenario on the rental document through the API', async () => {
    const app = createTestApp();

    const req = {
      method: 'POST',
      url: '/api/v1/documents/doc-rental/scenarios',
      headers: { 'content-type': 'application/json' },
      socket: { remoteAddress: '127.0.0.1' },
      body: {
        prompt: 'Agar main 3 mahine rent nahi du aur phir ghar chhod du toh kya hoga?',
        actorRole: 'tenant'
      }
    } as any;

    let statusCode = 200;
    let jsonResult: any = null;

    const res: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        jsonResult = data;
        return this;
      },
      setHeader() { return this; }
    };

    await new Promise<void>((resolve) => {
      (app as any).handle(req, res, () => resolve());
      setTimeout(resolve, 150);
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

    const req = {
      method: 'POST',
      url: '/api/v1/documents/doc-rental/lawyer-kit',
      headers: { 'content-type': 'application/json' },
      socket: { remoteAddress: '127.0.0.1' },
      body: {}
    } as any;

    let statusCode = 200;
    let jsonResult: any = null;

    const res: any = {
      status(code: number) {
        statusCode = code;
        return this;
      },
      json(data: any) {
        jsonResult = data;
        return this;
      },
      setHeader() { return this; }
    };

    await new Promise<void>((resolve) => {
      (app as any).handle(req, res, () => resolve());
      setTimeout(resolve, 150);
    });

    expect([200, 201]).toContain(statusCode);
    expect(jsonResult.success).toBe(true);
    expect(jsonResult.data.documentName).toBeDefined();
    expect(jsonResult.data.questionsForLegalProfessional.length).toBeGreaterThanOrEqual(2);
    expect(jsonResult.data.evidenceSummary.length).toBeGreaterThanOrEqual(1);
    expect(jsonResult.data.contractualProtections.length).toBeGreaterThanOrEqual(1);
  });
});
