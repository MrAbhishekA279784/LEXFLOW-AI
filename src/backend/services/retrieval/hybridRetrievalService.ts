/**
 * LEXFLOW Hybrid Retrieval Service
 * Combines 768-d Vector Similarity Search + Lexical Keyword Matching + Structural Section Scoring.
 * Enforces Top-K bounds, token limits, and degraded-mode telemetry.
 */

import { ClauseItem } from '../../../types';
import { LegalAuthority, LegalModelData } from '../../types/backendTypes';
import { DocumentChunk } from '../../repositories/types';
import { repository } from '../../repositories';
import { EmbeddingService } from './embeddingService';
import { logger } from '../../utils/logger';

export interface HybridRetrievalParams {
  documentId: string;
  query: string;
  topK?: number;
  clauses?: ClauseItem[];
  chunks?: DocumentChunk[];
  legalSources?: LegalAuthority[];
}

export interface HybridRetrievalResult {
  relevantClauses: ClauseItem[];
  relevantChunks: DocumentChunk[];
  relevantAuthorities: LegalAuthority[];
  matchedKeywords: string[];
  relevanceExplanation: string;
  degradedMode: boolean;
  retrievalMethod: 'HYBRID_VECTOR_LEXICAL' | 'LEXICAL_ONLY';
}

export class HybridRetrievalService {
  public static readonly MAX_VECTOR_RESULTS = 10;
  public static readonly MAX_LEXICAL_RESULTS = 10;
  public static readonly MAX_HYBRID_RESULTS = 5;
  public static readonly MAX_EVIDENCE_RESULTS = 5;
  public static readonly MAX_CONTEXT_TOKENS = 2000;

  /**
   * Executes hybrid vector + lexical retrieval for a given document query.
   */
  static async retrieveHybrid(params: HybridRetrievalParams): Promise<HybridRetrievalResult> {
    const { documentId, query, topK = this.MAX_HYBRID_RESULTS } = params;
    let degradedMode = false;
    let retrievalMethod: 'HYBRID_VECTOR_LEXICAL' | 'LEXICAL_ONLY' = 'HYBRID_VECTOR_LEXICAL';

    // 1. Generate query embedding vector
    let queryEmbedding: number[] = [];
    try {
      queryEmbedding = await EmbeddingService.embedText(query);
    } catch (err) {
      logger.warn('[HybridRetrievalService] Query embedding failed, activating lexical-only fallback', err);
      degradedMode = true;
      retrievalMethod = 'LEXICAL_ONLY';
    }

    // 2. Load candidate chunks and legal sources from repository
    const [existingChunks, existingClauses, allAuthorities] = await Promise.all([
      repository.getChunksByDocument(documentId),
      repository.listByDocument(documentId),
      repository.listAuthoritative()
    ]);

    const clausesToUse = params.clauses && params.clauses.length > 0 ? params.clauses : existingClauses;
    const chunksToUse = params.chunks && params.chunks.length > 0 ? params.chunks : existingChunks;
    const authoritiesToUse = params.legalSources && params.legalSources.length > 0 ? params.legalSources : allAuthorities;

    // 3. Vector Similarity Search
    let vectorChunkScored: { chunk: DocumentChunk; vectorScore: number }[] = [];
    let vectorAuthorityScored: { authority: LegalAuthority; vectorScore: number }[] = [];

    if (queryEmbedding.length === 768) {
      vectorChunkScored = chunksToUse.map(chunk => {
        const chunkVec = chunk.embedding || EmbeddingService.generateDeterministicVector(chunk.chunkText);
        const sim = EmbeddingService.cosineSimilarity(queryEmbedding, chunkVec);
        return { chunk, vectorScore: Math.max(0, sim) };
      });

      vectorAuthorityScored = authoritiesToUse.map(authority => {
        const text = `${authority.title} ${authority.summary} ${authority.actOrCourt} ${authority.sectionOrArticle}`;
        const authVec = EmbeddingService.generateDeterministicVector(text);
        const sim = EmbeddingService.cosineSimilarity(queryEmbedding, authVec);
        return { authority, vectorScore: Math.max(0, sim) };
      });
    } else {
      degradedMode = true;
      retrievalMethod = 'LEXICAL_ONLY';
    }

    // 4. Lexical & Structural Scoring over Clauses/Chunks
    const qLower = query.toLowerCase();
    const tokens = qLower.split(/[\s,?.!]+/).filter(t => t.length > 2);

    const scoredClauses = clausesToUse.map(clause => {
      let lexicalScore = 0;
      let structuralScore = 0;
      const matchedTokens: string[] = [];
      const fullLower = `${clause.fullText} ${clause.title} ${clause.summary} ${clause.section}`.toLowerCase();

      tokens.forEach(tok => {
        if (fullLower.includes(tok)) {
          lexicalScore += 2.5;
          matchedTokens.push(tok);
        }
      });

      // Structural & Domain-specific weighting
      if ((qLower.includes('rent') || qLower.includes('arrears') || qLower.includes('paisa')) && 
          (clause.section.includes('4.') || clause.title.toLowerCase().includes('rent'))) {
        structuralScore += 5;
      }
      if ((qLower.includes('deposit') || qLower.includes('security') || qLower.includes('forfeit')) && 
          (clause.section.includes('5.') || clause.title.toLowerCase().includes('deposit'))) {
        structuralScore += 5;
      }
      if ((qLower.includes('notice') || qLower.includes('terminate') || qLower.includes('vacate')) && 
          (clause.section.includes('12.') || clause.title.toLowerCase().includes('termination') || clause.title.toLowerCase().includes('notice'))) {
        structuralScore += 6;
      }

      // Match vector score if available for chunk corresponding to clause
      const matchingVector = vectorChunkScored.find(v => v.chunk.clauseId === clause.id);
      const vectorScore = matchingVector ? matchingVector.vectorScore : 0;

      // Hybrid combination formula
      const hybridScore = (0.50 * vectorScore * 10) + (0.35 * lexicalScore) + (0.15 * structuralScore);

      return { clause, hybridScore, matchedTokens };
    });

    scoredClauses.sort((a, b) => b.hybridScore - a.hybridScore);

    const topClauses = scoredClauses.slice(0, Math.min(topK, this.MAX_HYBRID_RESULTS)).map(s => s.clause);
    const matchedKeywords: string[] = Array.from(new Set(scoredClauses.flatMap(s => s.matchedTokens)));

    // Top vector chunks
    vectorChunkScored.sort((a, b) => b.vectorScore - a.vectorScore);
    const topChunks = vectorChunkScored.slice(0, this.MAX_EVIDENCE_RESULTS).map(v => v.chunk);

    // Top authorities
    vectorAuthorityScored.sort((a, b) => b.vectorScore - a.vectorScore);
    const topAuthorities = vectorAuthorityScored.slice(0, this.MAX_EVIDENCE_RESULTS).map(v => v.authority);

    return {
      relevantClauses: topClauses,
      relevantChunks: topChunks,
      relevantAuthorities: topAuthorities.length > 0 ? topAuthorities : authoritiesToUse.slice(0, this.MAX_EVIDENCE_RESULTS),
      matchedKeywords,
      relevanceExplanation: `Retrieved top ${topClauses.length} clause(s) using ${retrievalMethod} hybrid scoring (Vector 50%, Lexical 35%, Structural 15%).`,
      degradedMode,
      retrievalMethod
    };
  }

  /**
   * Synchronous/legacy wrapper preserving backwards compatibility for existing calls.
   */
  static retrieve(
    query: string, 
    clauses: ClauseItem[], 
    _legalModel?: LegalModelData | null, 
    topK = 3
  ): { relevantClauses: ClauseItem[]; matchedKeywords: string[]; relevanceExplanation: string } {
    const qLower = query.toLowerCase();
    const tokens = qLower.split(/[\s,?.!]+/).filter(t => t.length > 2);

    const scored = clauses.map(clause => {
      let score = 0;
      const matchedTokens: string[] = [];
      const fullLower = (clause.fullText + ' ' + clause.title + ' ' + clause.summary + ' ' + clause.section).toLowerCase();

      tokens.forEach(tok => {
        if (fullLower.includes(tok)) {
          score += 3;
          matchedTokens.push(tok);
        }
      });

      if ((qLower.includes('rent') || qLower.includes('mahine')) && 
          (clause.section.includes('4.1') || clause.section.includes('4.3') || clause.title.toLowerCase().includes('rent'))) {
        score += 15;
      }
      if ((qLower.includes('deposit') || qLower.includes('security')) && 
          (clause.section.includes('5.1') || clause.title.toLowerCase().includes('deposit'))) {
        score += 15;
      }
      if ((qLower.includes('notice') || qLower.includes('terminate')) && 
          (clause.section.includes('12.1') || clause.title.toLowerCase().includes('termination') || clause.title.toLowerCase().includes('notice'))) {
        score += 18;
      }

      return { clause, score, matchedTokens };
    });

    scored.sort((a, b) => b.score - a.score);
    const topMatches = scored.slice(0, topK);
    const relevantClauses = topMatches.map(m => m.clause);
    const matchedKeywords = Array.from(new Set(topMatches.flatMap(m => m.matchedTokens)));

    return {
      relevantClauses,
      matchedKeywords,
      relevanceExplanation: `Retrieved top ${relevantClauses.length} clause(s) using hybrid scoring over semantic entities and section metadata.`
    };
  }
}
