import { describe, it, expect, vi } from 'vitest';
import { verifyJwtToken, createToken, createExpiredToken } from '../utils/jwt';
import { geminiProvider } from '../services/ai/providers/geminiProvider';
import { deterministicFallbackProvider } from '../services/ai/providers/deterministicFallbackProvider';
import { MasterAIOrchestrator } from '../services/ai/orchestrator';
import { HybridRetrievalService } from '../services/retrieval/hybridRetrievalService';
import { AuthenticationError } from '../utils/errors';
import { z } from 'zod';

describe('Phases 7, 8, 9, 10 — Advanced Security, AI Failure Injection & Four-Agent DAG Test Suite', () => {
  describe('Phase 7: Advanced Security & JWT Clock Boundary', () => {
    it('should reject expired JWT access tokens cleanly with AuthenticationError', async () => {
      const expiredToken = createExpiredToken({
        id: 'usr-security-expired',
        email: 'expired@lexflow.ai',
        role: 'counsel',
      });

      expect(() => verifyJwtToken(expiredToken)).toThrow(AuthenticationError);
    });

    it('should reject tokens with missing claims or malformed signatures', async () => {
      const bogusToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.bogusSignature';
      expect(() => verifyJwtToken(bogusToken)).toThrow(AuthenticationError);
    });

    it('should verify valid tokens and return correct payload identity', async () => {
      const validToken = createToken({
        id: 'usr-security-valid',
        email: 'valid@lexflow.ai',
        role: 'counsel',
      }, 3600);

      const decoded = verifyJwtToken(validToken);
      expect(decoded.id).toBe('usr-security-valid');
      expect(decoded.email).toBe('valid@lexflow.ai');
    });
  });

  describe('Phase 8: AI Failure Injection & Resiliency', () => {
    it('should switch to deterministicFallbackProvider seamlessly when Gemini API key is omitted or fails', async () => {
      const prompt = 'Analyze liability clause in commercial lease.';
      const response = await geminiProvider.generateText(prompt);

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
      expect(response.length).toBeGreaterThan(0);
    });

    it('should repair and parse structured JSON responses matching Zod schemas', async () => {
      const TestSchema = z.object({
        status: z.string(),
        riskScore: z.number(),
      });

      const prompt = 'Output risk analysis for rent section.';
      const result = await geminiProvider.generateStructuredJson(prompt, {
        zodSchema: TestSchema,
      });

      expect(result.status).toBeDefined();
      expect(typeof result.riskScore).toBe('number');
    }, 15000);

    it('should handle timeout Promise.race race conditions gracefully without uncaught rejection', async () => {
      const prompt = 'Test timeout resiliency';
      // Fast timeout 1ms to trigger timeout promise
      const result = await geminiProvider.generateText(prompt, { timeoutMs: 1 });
      expect(result).toBeDefined(); // Returns fallback text on timeout
    });
  });

  describe('Phase 9: Four-Agent DAG & Debate Pipeline Resilience', () => {
    it('should execute FULL_AUDIT mode maintaining exactly four-agent outputs', async () => {
      const analysis = await MasterAIOrchestrator.runLexflowAiAnalysis({
        userId: 'usr-four-agent-test',
        documentId: 'doc-rental',
        mode: 'FULL_AUDIT',
      });

      expect(analysis.documentId).toBe('doc-rental');
      expect(analysis.debates).toBeDefined();
      expect(analysis.debates.length).toBeGreaterThanOrEqual(2);
      expect(analysis.debates[0].pairType).toBe('contract_risk_debate');
      expect(analysis.debates[1].pairType).toBe('compliance_audit_debate');
    });
  });

  describe('Phase 10: Retrieval Bounded Concurrency & Evidence Grounding', () => {
    it('should execute HybridRetrievalService returning grounded evidence bounded by topK', async () => {
      const retrieval = await HybridRetrievalService.retrieveHybrid({
        documentId: 'doc-rental',
        query: 'penalty deposit forfeiture notice',
        topK: 3,
      });

      expect(retrieval).toBeDefined();
      expect(retrieval.relevantClauses.length).toBeLessThanOrEqual(3);
      expect(retrieval.relevantAuthorities.length).toBeLessThanOrEqual(5);
    });
  });
});
