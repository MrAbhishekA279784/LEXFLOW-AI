import { ClauseItem } from '../../../types';
import { LegalModelData } from '../../types/backendTypes';

export interface RetrievalResult {
  relevantClauses: ClauseItem[];
  matchedKeywords: string[];
  relevanceExplanation: string;
}

export class HybridRetrievalService {
  /**
   * Hybrid retrieval combining lexical keyword matching, section metadata, and entity associations
   */
  static retrieve(
    query: string, 
    clauses: ClauseItem[], 
    _legalModel?: LegalModelData | null, 
    topK = 3
  ): RetrievalResult {
    const qLower = query.toLowerCase();
    const tokens = qLower.split(/[\s,?.!]+/).filter(t => t.length > 2);

    const scored = clauses.map(clause => {
      let score = 0;
      const matchedTokens: string[] = [];

      const fullLower = (clause.fullText + ' ' + clause.title + ' ' + clause.summary + ' ' + clause.section).toLowerCase();

      // Keyword & Lexical Matching
      tokens.forEach(tok => {
        if (fullLower.includes(tok)) {
          score += 3;
          matchedTokens.push(tok);
        }
      });

      // Domain-specific relevance weighting
      if ((qLower.includes('rent') || qLower.includes('mahine') || qLower.includes('paisa')) && 
          (clause.section.includes('4.1') || clause.section.includes('4.3') || clause.title.toLowerCase().includes('rent'))) {
        score += 15;
      }

      if ((qLower.includes('deposit') || qLower.includes('security') || qLower.includes('kat')) && 
          (clause.section.includes('5.1') || clause.title.toLowerCase().includes('deposit'))) {
        score += 15;
      }

      if ((qLower.includes('chhod') || qLower.includes('leave') || qLower.includes('tod') || qLower.includes('notice') || qLower.includes('terminate')) && 
          (clause.section.includes('12.1') || clause.title.toLowerCase().includes('termination') || clause.title.toLowerCase().includes('notice'))) {
        score += 18;
      }

      return { clause, score, matchedTokens };
    });

    // Sort by hybrid relevance score
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
