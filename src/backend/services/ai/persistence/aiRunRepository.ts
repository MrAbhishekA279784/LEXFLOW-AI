import { v4 as uuidv4 } from 'uuid';
import { getSupabaseClient } from '../../../db/client';
import { memoryStore } from '../../../repositories/memoryStore';
import { FullDebateRecord } from '../debate/debateSchemas';
import { SynthesizedAnalysisResult } from '../synthesis/synthesisEngine';
import { logger } from '../../../utils/logger';

export interface AIRunRecord {
  id: string;
  userId: string;
  documentId: string;
  scenarioId?: string;
  agentType: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  model: string;
  promptVersion: string;
  inputTokenCount: number;
  outputTokenCount: number;
  latencyMs: number;
  createdAt: string;
  completedAt?: string;
  errorCode?: string;
}

// In-memory persistent cache for analysis runs
const analysisResultsCache = new Map<string, SynthesizedAnalysisResult>();
const debatesCache = new Map<string, FullDebateRecord>();
const aiRunsCache = new Map<string, AIRunRecord>();

export class AIRunRepository {
  /**
   * Persists master AI Analysis run and its synthesized findings
   */
  static async saveAnalysisResult(
    analysisId: string, 
    result: SynthesizedAnalysisResult
  ): Promise<void> {
    analysisResultsCache.set(analysisId, result);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('analysis_results').upsert({
          id: analysisId,
          document_id: result.documentId,
          user_id: result.userId,
          executive_summary: result.executiveSummary,
          personalized_explanation: result.personalizedExplanation,
          findings: result.findings,
          summary_metrics: result.summary,
          human_review_recommended: result.humanReviewRecommended,
          created_at: result.synthesizedAt,
        }, { onConflict: 'id' });
      } catch (err) {
        logger.warn(`Failed to persist analysis_result ${analysisId} to Supabase: ${String(err)}`);
      }
    }
  }

  /**
   * Retrieves an analysis result by documentId and userId
   */
  static async getAnalysisResult(
    documentId: string, 
    userId: string
  ): Promise<SynthesizedAnalysisResult | null> {
    // Check in-memory cache first
    for (const res of analysisResultsCache.values()) {
      if (res.documentId === documentId && res.userId === userId) {
        return res;
      }
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('analysis_results')
          .select('*')
          .eq('document_id', documentId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
          const res: SynthesizedAnalysisResult = {
            documentId: data.document_id,
            userId: data.user_id,
            executiveSummary: data.executive_summary,
            personalizedExplanation: data.personalized_explanation,
            findings: data.findings || [],
            summary: data.summary_metrics || {
              totalFindings: 0,
              highPriorityCount: 0,
              mediumPriorityCount: 0,
              protectionCount: 0,
              complianceConcernCount: 0,
              disputedCount: 0,
              humanReviewCount: 0,
              confirmedCount: 0,
            },
            debates: [],
            humanReviewRecommended: Boolean(data.human_review_recommended),
            synthesizedAt: data.created_at,
          };
          analysisResultsCache.set(data.id, res);
          return res;
        }
      } catch (err) {
        logger.warn(`Failed to fetch analysis_result from Supabase: ${String(err)}`);
      }
    }

    return null;
  }

  /**
   * Persists a multi-agent debate record
   */
  static async saveDebate(debate: FullDebateRecord): Promise<void> {
    debatesCache.set(debate.id, debate);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('debate_rounds').upsert({
          id: debate.id,
          document_id: debate.documentId,
          user_id: debate.userId,
          pair_type: debate.pairType,
          status: debate.status,
          rounds: debate.rounds,
          total_rounds: debate.totalRounds,
          summary: debate.summary,
          disputed_finding_ids: debate.disputedFindingIds,
          resolved_finding_ids: debate.resolvedFindingIds,
          created_at: debate.createdAt,
          completed_at: debate.completedAt,
        }, { onConflict: 'id' });
      } catch (err) {
        logger.warn(`Failed to persist debate ${debate.id} to Supabase: ${String(err)}`);
      }
    }
  }

  /**
   * Retrieves debates for a document
   */
  static async getDebatesForDocument(
    documentId: string, 
    userId: string
  ): Promise<FullDebateRecord[]> {
    const matched: FullDebateRecord[] = [];
    for (const d of debatesCache.values()) {
      if (d.documentId === documentId && d.userId === userId) {
        matched.push(d);
      }
    }

    if (matched.length > 0) return matched;

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('debate_rounds')
          .select('*')
          .eq('document_id', documentId)
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (data && !error) {
          return data.map(d => ({
            id: d.id,
            documentId: d.document_id,
            userId: d.user_id,
            pairType: d.pair_type,
            status: d.status,
            rounds: d.rounds || [],
            totalRounds: d.total_rounds || 0,
            summary: d.summary || '',
            disputedFindingIds: d.disputed_finding_ids || [],
            resolvedFindingIds: d.resolved_finding_ids || [],
            createdAt: d.created_at,
            completedAt: d.completed_at,
          }));
        }
      } catch (err) {
        logger.warn(`Failed to fetch debates from Supabase: ${String(err)}`);
      }
    }

    return matched;
  }

  /**
   * Tracks telemetry for an AI run
   */
  static async recordAIRun(run: AIRunRecord): Promise<void> {
    aiRunsCache.set(run.id, run);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('ai_runs').insert({
          id: run.id,
          user_id: run.userId,
          document_id: run.documentId,
          scenario_id: run.scenarioId || null,
          agent_type: run.agentType,
          status: run.status,
          model: run.model,
          prompt_version: run.promptVersion,
          input_token_count: run.inputTokenCount,
          output_token_count: run.outputTokenCount,
          latency_ms: run.latencyMs,
          created_at: run.createdAt,
          completed_at: run.completedAt || null,
          error_code: run.errorCode || null,
        });
      } catch (err) {
        logger.warn(`Failed to record ai_run in Supabase: ${String(err)}`);
      }
    }
  }
}
