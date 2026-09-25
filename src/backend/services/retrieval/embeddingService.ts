/**
 * LEXFLOW Centralized Embedding Service
 * Generates 768-dimensional normalized embedding vectors for document chunks and legal sources.
 * Supports live Gemini embedding API (@google/genai) and deterministic 768-d fallback vector hashing for test/offline environments.
 */

import crypto from 'crypto';
import { GoogleGenAI } from '@google/genai';
import { logger } from '../../utils/logger';
import { DocumentChunk } from '../../repositories/types';

export class EmbeddingService {
  private static readonly EMBEDDING_DIMENSION = 768;
  private static readonly EMBEDDING_MODEL = 'text-embedding-004';
  private static cache: Map<string, number[]> = new Map();

  /**
   * Calculates cosine similarity between two vector arrays of identical length
   */
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length !== vecB.length || vecA.length === 0) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Generates a single 768-dimensional embedding vector for text string.
   */
  static async embedText(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      return this.generateDeterministicVector('');
    }

    const hashKey = crypto.createHash('sha256').update(text).digest('hex');
    if (this.cache.has(hashKey)) {
      return this.cache.get(hashKey)!;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim().length > 0) {
      try {
        const client = new GoogleGenAI({ apiKey });
        const response = await client.models.embedContent({
          model: this.EMBEDDING_MODEL,
          contents: text,
        });

        const res: any = response;
        const values = res?.embedding?.values || res?.embeddings?.[0]?.values;
        if (values && Array.isArray(values) && values.length === this.EMBEDDING_DIMENSION) {
          this.cache.set(hashKey, values);
          return values;
        }
      } catch (err) {
        logger.warn('[EmbeddingService] Gemini embedContent call failed, applying deterministic fallback vector', err);
      }
    }

    // Fallback deterministic 768-d vector
    const fallbackVector = this.generateDeterministicVector(text);
    this.cache.set(hashKey, fallbackVector);
    return fallbackVector;
  }

  /**
   * Generates 768-d embeddings for an array of document chunks in batch with bounded concurrency and caching.
   */
  static async embedChunks(chunks: DocumentChunk[], concurrencyLimit = 5): Promise<DocumentChunk[]> {
    if (!chunks || chunks.length === 0) return [];

    const results: DocumentChunk[] = new Array(chunks.length);
    const uncachedTasks: { index: number; chunk: DocumentChunk }[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const text = chunk.chunkText || '';
      const hashKey = crypto.createHash('sha256').update(text).digest('hex');
      if (this.cache.has(hashKey)) {
        results[i] = {
          ...chunk,
          embedding: this.cache.get(hashKey)!,
        };
      } else {
        uncachedTasks.push({ index: i, chunk });
      }
    }

    if (uncachedTasks.length > 0) {
      const limit = Math.max(1, Math.min(concurrencyLimit, 10));
      for (let i = 0; i < uncachedTasks.length; i += limit) {
        const batch = uncachedTasks.slice(i, i + limit);
        await Promise.all(
          batch.map(async (task) => {
            const vec = await this.embedText(task.chunk.chunkText);
            results[task.index] = {
              ...task.chunk,
              embedding: vec,
            };
          })
        );
      }
    }

    return results;
  }

  /**
   * Generates a deterministic, normalized 768-dimensional vector from string content for offline/test environments.
   */
  static generateDeterministicVector(text: string): number[] {
    const vector = new Array(this.EMBEDDING_DIMENSION).fill(0);
    const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (cleaned.length === 0) {
      vector[0] = 1;
      return vector;
    }

    // Seed pseudo-random generator with text hash
    let hash = 0;
    for (let i = 0; i < cleaned.length; i++) {
      hash = ((hash << 5) - hash) + cleaned.charCodeAt(i);
      hash |= 0;
    }

    // Populate 768 dimension features from character trigrams and term hash
    for (let i = 0; i < this.EMBEDDING_DIMENSION; i++) {
      const seed = Math.sin(hash + i * 13.37) * 10000;
      vector[i] = seed - Math.floor(seed) - 0.5;
    }

    // Term n-gram boost for legal keywords
    const keywords = ['rent', 'deposit', 'notice', 'terminate', 'penalty', 'forfeit', 'cure', 'breach', 'lease', 'tenant', 'landlord', 'lock-in', '106', '74', '108'];
    keywords.forEach((kw, kwIdx) => {
      if (cleaned.includes(kw)) {
        for (let dim = kwIdx * 25; dim < (kwIdx + 1) * 25 && dim < this.EMBEDDING_DIMENSION; dim++) {
          vector[dim] += 2.5;
        }
      }
    });

    // L2 Normalize vector
    let norm = 0;
    for (let i = 0; i < vector.length; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm);

    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }
}
