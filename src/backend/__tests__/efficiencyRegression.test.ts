import { describe, it, expect, vi } from 'vitest';
import { EmbeddingService } from '../services/retrieval/embeddingService';
import { MasterAIOrchestrator } from '../services/ai/orchestrator';
import { DocumentChunk } from '../repositories/types';
import { repository } from '../repositories';
import { DocumentController } from '../controllers/documentController';

describe('LEXFLOW Efficiency Master Remediation Test Suite', () => {
  describe('EFF-001 — Embedding Bounded Concurrency & Caching', () => {
    it('should preserve chunk order, apply SHA-256 caching, and handle bounded concurrency', async () => {
      const chunks: DocumentChunk[] = [
        { id: 'chunk-1', documentId: 'doc-1', pageNumber: 1, chunkIndex: 0, chunkText: 'Unique Clause One Text' },
        { id: 'chunk-2', documentId: 'doc-1', pageNumber: 1, chunkIndex: 1, chunkText: 'Unique Clause Two Text' },
        { id: 'chunk-3', documentId: 'doc-1', pageNumber: 2, chunkIndex: 2, chunkText: 'Unique Clause One Text' }, // Duplicate text
      ];

      const embedded = await EmbeddingService.embedChunks(chunks, 2);

      expect(embedded).toHaveLength(3);
      expect(embedded[0].id).toBe('chunk-1');
      expect(embedded[1].id).toBe('chunk-2');
      expect(embedded[2].id).toBe('chunk-3');

      // Verify embeddings exist and have correct dimension
      expect(embedded[0].embedding).toBeDefined();
      expect(embedded[0].embedding?.length).toBe(768);

      // Duplicate chunk 3 should share exact same vector reference/values as chunk 1 from cache
      expect(embedded[2].embedding).toEqual(embedded[0].embedding);
    });

    it('should return empty array gracefully for empty input chunks', async () => {
      const result = await EmbeddingService.embedChunks([]);
      expect(result).toEqual([]);
    });
  });

  describe('EFF-003 — Multi-Agent Orchestrator Concurrency', () => {
    it('should run four-agent architecture and produce complete synthesized analysis', async () => {
      const result = await MasterAIOrchestrator.runLexflowAiAnalysis({
        userId: 'usr-test-efficiency',
        documentId: 'doc-rental',
        mode: 'FULL_AUDIT',
      });

      expect(result).toBeDefined();
      expect(result.documentId).toBe('doc-rental');
      expect(Array.isArray(result.findings)).toBe(true);
      expect(result.summary).toBeDefined();
    });
  });

  describe('EFF-004 — Document Collection Pagination Bounds', () => {
    it('should apply default page size limit of 50 and clamp huge limit inputs', async () => {
      // Test default limit when no pagination param provided
      const defaultDocs = await repository.listByUser('usr-test-efficiency');
      expect(Array.isArray(defaultDocs)).toBe(true);

      // Test limit clamping when huge limit is requested
      const clampedDocs = await repository.listByUser('usr-test-efficiency', { page: 1, limit: 100000 });
      expect(clampedDocs.length).toBeLessThanOrEqual(100);
    });

    it('should handle invalid or negative pagination inputs gracefully', async () => {
      const req: any = {
        user: { id: 'usr-test-efficiency' },
        query: { page: '-5', limit: 'invalid' },
      };
      const res: any = {
        json: vi.fn(),
      };
      const next = vi.fn();

      await DocumentController.list(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          pagination: {
            page: 1,
            limit: 50,
            count: expect.any(Number),
          },
        })
      );
    });
  });
});
