import { getSupabaseClient } from '../../db/client';
import { memoryStore } from '../memoryStore';
import { IScenarioRepository } from '../types';
import { ScenarioSimulationResult, EvidenceItem, LegalAuthority, FinancialBreakdownItem } from '../../types/backendTypes';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseScenarioRepository implements IScenarioRepository {
  private static hasLoggedFallbackNotice = false;

  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV !== 'production' || !!process.env.VITEST;
  }

  private async handleFallback<T>(operation: string, err: unknown, memoryFallback: () => Promise<T>): Promise<T> {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (this.isTestEnvironment()) {
      if (!SupabaseScenarioRepository.hasLoggedFallbackNotice) {
        SupabaseScenarioRepository.hasLoggedFallbackNotice = true;
        logger.info(`Supabase not configured; operating with in-memory persistence store.`);
      }
      return memoryFallback();
    }
    logger.error(`Database error in ${operation}`, { error: errorMsg });
    throw new DatabaseError(`Database operation failed during ${operation}: ${errorMsg}`);
  }

  async saveScenario(scenario: ScenarioSimulationResult, userId?: string): Promise<ScenarioSimulationResult> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('save scenario', 'Supabase client not initialized', () => memoryStore.saveScenario({ ...scenario, userId: userId || scenario.userId || 'usr-default' }));

    try {
      const scenarioId = scenario.id || uuidv4();
      const row = {
        id: scenarioId,
        document_id: scenario.documentId,
        user_id: userId || scenario.userId || 'usr-default',
        input_prompt: scenario.inputPrompt,
        normalized_interpretation: scenario.normalizedInterpretation,
        title: scenario.title,
        document_says: scenario.documentSays,
        law_says: scenario.lawSays,
        lexflow_analysis: scenario.lexflowAnalysis,
        total_financial_impact: scenario.totalFinancialImpact,
        financial_breakdown: scenario.financialBreakdown || [],
        key_points: scenario.keyPoints || [],
        relevant_clauses: scenario.relevantClauses || [],
        applicable_law: scenario.applicableLaw || [],
        timeline: scenario.timeline || [],
        risks: scenario.risks || [],
        protections: scenario.protections || [],
        conflicts: scenario.conflicts || [],
        evidence: scenario.evidence || [],
        suggested_next_steps: scenario.suggestedNextSteps || [],
        disclaimer: scenario.disclaimer || '',
        target_node_ids: scenario.targetNodeIds || [],
        status: scenario.status || 'completed',
      };

      const { data, error } = await supabase.from('scenarios').upsert(row).select().single();
      if (error || !data) throw error || new Error('Failed to save scenario');

      const savedResult: ScenarioSimulationResult = {
        ...scenario,
        id: data.id,
      };
      await memoryStore.saveScenario({ ...savedResult, userId: userId || scenario.userId || 'usr-default' }).catch(() => {});
      return savedResult;
    } catch (err) {
      return this.handleFallback('save scenario', err, () => memoryStore.saveScenario({ ...scenario, userId: userId || scenario.userId || 'usr-default' }));
    }
  }

  async getScenarioById(id: string, userId?: string): Promise<ScenarioSimulationResult | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('get scenario by id', 'Supabase client not initialized', () => memoryStore.findScenarioById(id, userId));

    try {
      let query = supabase.from('scenarios').select('*').eq('id', id);
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query.single();
      if (error || !data) {
        return memoryStore.findScenarioById(id, userId);
      }

      return {
        id: data.id,
        documentId: data.document_id,
        userId: data.user_id,
        inputPrompt: data.input_prompt,
        normalizedInterpretation: data.normalized_interpretation,
        title: data.title,
        documentSays: data.document_says,
        lawSays: data.law_says,
        lexflowAnalysis: data.lexflow_analysis,
        totalFinancialImpact: data.total_financial_impact,
        totalFinancialImpactMinor: 0,
        financialBreakdown: (data.financial_breakdown as FinancialBreakdownItem[]) || [],
        keyPoints: (data.key_points as string[]) || [],
        relevantClauses: (data.relevant_clauses as Array<{ clauseId: string; section: string; title: string; excerpt: string; page: number }>) || [],
        applicableLaw: (data.applicable_law as LegalAuthority[]) || [],
        timeline: (data.timeline as Array<{ step: number; time: string; event: string; status: 'past' | 'trigger' | 'consequence'; clauseRef?: string }>) || [],
        risks: (data.risks as Array<{ title: string; description: string; level: 'low' | 'medium' | 'high' | 'critical' }>) || [],
        protections: (data.protections as Array<{ title: string; description: string }>) || [],
        conflicts: (data.conflicts as Array<{ clauseA: string; clauseB: string; description: string }>) || [],
        evidence: (data.evidence as EvidenceItem[]) || [],
        suggestedNextSteps: (data.suggested_next_steps as string[]) || [],
        disclaimer: data.disclaimer || '',
        targetNodeIds: (data.target_node_ids as string[]) || [],
        status: data.status,
      };
    } catch (err) {
      return this.handleFallback('get scenario by id', err, () => memoryStore.findScenarioById(id, userId));
    }
  }

  async getScenariosByDocument(documentId: string, userId?: string): Promise<ScenarioSimulationResult[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('get scenarios by document', 'Supabase client not initialized', () => memoryStore.listScenariosByDocument(documentId, userId));

    try {
      let query = supabase.from('scenarios').select('*').eq('document_id', documentId).order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return memoryStore.listScenariosByDocument(documentId, userId);
      }

      return data.map((d) => ({
        id: d.id,
        documentId: d.document_id,
        userId: d.user_id,
        inputPrompt: d.input_prompt,
        normalizedInterpretation: d.normalized_interpretation,
        title: d.title,
        documentSays: d.document_says,
        lawSays: d.law_says,
        lexflowAnalysis: d.lexflow_analysis,
        totalFinancialImpact: d.total_financial_impact,
        totalFinancialImpactMinor: 0,
        financialBreakdown: (d.financial_breakdown as FinancialBreakdownItem[]) || [],
        keyPoints: (d.key_points as string[]) || [],
        relevantClauses: (d.relevant_clauses as Array<{ clauseId: string; section: string; title: string; excerpt: string; page: number }>) || [],
        applicableLaw: (d.applicable_law as LegalAuthority[]) || [],
        timeline: (d.timeline as Array<{ step: number; time: string; event: string; status: 'past' | 'trigger' | 'consequence'; clauseRef?: string }>) || [],
        risks: (d.risks as Array<{ title: string; description: string; level: 'low' | 'medium' | 'high' | 'critical' }>) || [],
        protections: (d.protections as Array<{ title: string; description: string }>) || [],
        conflicts: (d.conflicts as Array<{ clauseA: string; clauseB: string; description: string }>) || [],
        evidence: (d.evidence as EvidenceItem[]) || [],
        suggestedNextSteps: (d.suggested_next_steps as string[]) || [],
        disclaimer: d.disclaimer || '',
        targetNodeIds: (d.target_node_ids as string[]) || [],
        status: d.status,
      }));
    } catch (err) {
      return this.handleFallback('get scenarios by document', err, () => memoryStore.listScenariosByDocument(documentId, userId));
    }
  }
}
