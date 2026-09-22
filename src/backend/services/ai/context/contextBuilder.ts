/**
 * LEXFLOW Context Builder & Relevance Engine
 * Assembles a compact, ranked, token-budgeted AnalysisContext without resending entire PDFs.
 */

import crypto from 'crypto';
import { ClauseItem } from '../../../types';
import { LegalAuthority, LegalGraph } from '../../types/backendTypes';
import { AI_CONFIG, estimateTokens } from './tokenBudget';
import { UserAIPreferences, getUserAIContext } from './personalizationContext';
import { memoryStore } from '../../repositories/memoryStore';
import { logger } from '../../utils/logger';

export interface CompactClause {
  id: string;
  section: string;
  title: string;
  summary: string;
  fullText: string;
  pageNumber: number;
  riskLevel: string;
}

export interface CompactLegalAuthority {
  id: string;
  actOrCourt: string;
  sectionOrArticle: string;
  title: string;
  summary: string;
  relevanceScore: number;
}

export interface CompactGraphNode {
  id: string;
  label: string;
  type: string;
  clauseRef?: string;
}

export interface CompactGraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface AnalysisContext {
  documentId: string;
  userId: string;
  scenarioId?: string;
  contextHash: string;
  relevantClauseIds: string[];
  legalAuthorityIds: string[];
  graphNodeIds: string[];
  evidenceIds: string[];
  personalizationProfile: UserAIPreferences;
  
  // Compact content for agent consumption
  clauses: CompactClause[];
  legalAuthorities: CompactLegalAuthority[];
  graphNodes: CompactGraphNode[];
  graphEdges: CompactGraphEdge[];
  scenarioPrompt?: string;
}

export class ContextBuilder {
  /**
   * Generates a deterministic SHA256 hash of the relevant analysis inputs
   */
  static generateContextHash(params: {
    documentId: string;
    scenarioId?: string;
    clauseIds: string[];
    authorityIds: string[];
    mode: string;
  }): string {
    const raw = `${params.documentId}:${params.scenarioId || 'none'}:${params.mode}:${params.clauseIds.sort().join(',')}:${params.authorityIds.sort().join(',')}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Builds the compact shared AnalysisContext with token budgeting and relevance ranking
   */
  static async retrieveRelevantContext(params: {
    documentId: string;
    userId: string;
    scenarioId?: string;
    mode: 'FULL_AUDIT' | 'TARGETED_ANALYSIS' | 'SCENARIO_STRESS_TEST' | 'COMPLIANCE_AUDIT';
    targetClauseIds?: string[];
    scenarioPrompt?: string;
  }): Promise<AnalysisContext> {
    const { documentId, userId, scenarioId, mode, targetClauseIds, scenarioPrompt } = params;

    // 1. Fetch user personalization preferences
    const personalizationProfile = await getUserAIContext(userId);

    // 2. Load clauses from repository
    const allClauses = await memoryStore.listByDocument(documentId);
    
    // 3. Rank clauses by relevance to query/scenario/audit
    let selectedClauses = [...allClauses];

    if (targetClauseIds && targetClauseIds.length > 0) {
      selectedClauses = allClauses.filter(c => targetClauseIds.includes(c.id) || targetClauseIds.includes(c.section));
    } else if (scenarioPrompt) {
      const q = scenarioPrompt.toLowerCase();
      selectedClauses.sort((a, b) => {
        const aScore = this.scoreClauseRelevance(a, q);
        const bScore = this.scoreClauseRelevance(b, q);
        return bScore - aScore;
      });
    } else {
      // Default: prioritize clauses with penalties, termination, risks, lock-in, forfeiture
      selectedClauses.sort((a, b) => {
        const aScore = this.scoreClauseRisk(a);
        const bScore = this.scoreClauseRisk(b);
        return bScore - aScore;
      });
    }

    // Enforce token budget on clauses
    const budget = AI_CONFIG.AGENT_CONTEXT_MAX_TOKENS;
    let accumulatedTokens = 0;
    const budgetedClauses: CompactClause[] = [];

    for (const c of selectedClauses) {
      const clauseTokens = estimateTokens(c.fullText) + 20;
      if (budgetedClauses.length >= 2 && accumulatedTokens + clauseTokens > budget) {
        break;
      }
      budgetedClauses.push({
        id: c.id,
        section: c.section,
        title: c.title,
        summary: c.summary,
        fullText: c.fullText,
        pageNumber: c.pageNumber,
        riskLevel: c.riskLevel || 'low',
      });
      accumulatedTokens += clauseTokens;
    }

    // 4. Retrieve and rank authoritative legal sources
    const allSources = await memoryStore.listAuthoritative();
    const budgetedAuthorities: CompactLegalAuthority[] = allSources.slice(0, 5).map((s, idx) => ({
      id: s.id,
      actOrCourt: s.actOrCourt,
      sectionOrArticle: s.sectionOrArticle,
      title: s.title,
      summary: s.contentSummary,
      relevanceScore: 1 - idx * 0.1,
    }));

    // 5. Load graph nodes and edges
    const graphData = await memoryStore.findGraphByDocument(documentId);
    const compactNodes: CompactGraphNode[] = (graphData?.nodes || []).slice(0, 15).map(n => ({
      id: n.id,
      label: n.label,
      type: n.type,
      clauseRef: n.clauseRef,
    }));
    const compactEdges: CompactGraphEdge[] = (graphData?.edges || []).slice(0, 20).map(e => ({
      source: e.source,
      target: e.target,
      relationship: e.relationship,
    }));

    // 6. Compute context hash
    const relevantClauseIds = budgetedClauses.map(c => c.id);
    const legalAuthorityIds = budgetedAuthorities.map(a => a.id);
    const graphNodeIds = compactNodes.map(n => n.id);
    const evidenceIds: string[] = [];

    const contextHash = this.generateContextHash({
      documentId,
      scenarioId,
      clauseIds: relevantClauseIds,
      authorityIds: legalAuthorityIds,
      mode,
    });

    return {
      documentId,
      userId,
      scenarioId,
      contextHash,
      relevantClauseIds,
      legalAuthorityIds,
      graphNodeIds,
      evidenceIds,
      personalizationProfile,
      clauses: budgetedClauses,
      legalAuthorities: budgetedAuthorities,
      graphNodes: compactNodes,
      graphEdges: compactEdges,
      scenarioPrompt,
    };
  }

  private static scoreClauseRelevance(clause: ClauseItem, query: string): number {
    let score = 0;
    const text = `${clause.title} ${clause.summary} ${clause.fullText}`.toLowerCase();
    const terms = query.split(/\s+/).filter(t => t.length > 2);
    for (const term of terms) {
      if (text.includes(term)) score += 5;
    }
    score += this.scoreClauseRisk(clause);
    return score;
  }

  private static scoreClauseRisk(clause: ClauseItem): number {
    let score = 0;
    const text = `${clause.title} ${clause.summary} ${clause.fullText}`.toLowerCase();
    if (clause.riskLevel === 'critical') score += 15;
    if (clause.riskLevel === 'high') score += 10;
    if (clause.riskLevel === 'medium') score += 5;

    if (text.includes('penalty') || text.includes('per day')) score += 8;
    if (text.includes('forfeit') || text.includes('liquidated')) score += 8;
    if (text.includes('termination') || text.includes('lock-in')) score += 7;
    if (text.includes('indemnity') || text.includes('breach')) score += 6;
    if (text.includes('cure') || text.includes('notice')) score += 4;
    return score;
  }
}
