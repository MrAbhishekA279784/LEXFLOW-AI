/**
 * LEXFLOW Master AI Orchestrator
 * 
 * Orchestrates the 4 specialized AI agents:
 * 1. Opposing Counsel Agent
 * 2. Defense / Protection Agent
 * 3. Compliance Reviewer Agent
 * 4. Skeptic Agent
 * 
 * Key Architecture Highlights:
 * - Parallel execution of independent agents
 * - Sequential execution for dependent agents (Skeptic after Reviewer; Debate after initial findings)
 * - Compact shared AnalysisContext with token budgeting
 * - Context-hash caching to eliminate redundant Gemini calls
 * - Strict role enforcement and anti-injection isolation
 * - Master synthesis with personalized explanation layer
 * - Persistence in Supabase / memory store
 */

import { v4 as uuidv4 } from 'uuid';
import { ContextBuilder, AnalysisContext } from './context/contextBuilder';
import { getUserAIContext } from './context/personalizationContext';
import { OpposingCounselAgent } from './agents/opposingCounselAgent';
import { DefenseAgent } from './agents/defenseAgent';
import { ComplianceReviewerAgent } from './agents/complianceReviewerAgent';
import { SkepticAgent } from './agents/skepticAgent';
import { MultiAgentDebateEngine } from './debate/debateEngine';
import { FullDebateRecord } from './debate/debateSchemas';
import { SynthesisEngine, SynthesizedAnalysisResult } from './synthesis/synthesisEngine';
import { AIRunRepository } from './persistence/aiRunRepository';
import { logger } from '../../utils/logger';

export interface LexflowAnalysisOptions {
  userId: string;
  documentId: string;
  scenarioId?: string;
  mode: 'FULL_AUDIT' | 'TARGETED_ANALYSIS' | 'SCENARIO_STRESS_TEST' | 'COMPLIANCE_AUDIT';
  targetClauseIds?: string[];
  scenarioPrompt?: string;
  userName?: string;
  forceRefresh?: boolean;
}

// In-memory analysis cache by context hash
const cachedAnalysesByHash = new Map<string, { result: SynthesizedAnalysisResult; expiresAt: number }>();

export class MasterAIOrchestrator {
  /**
   * Executes master LEXFLOW multi-agent AI analysis
   */
  static async runLexflowAiAnalysis(options: LexflowAnalysisOptions): Promise<SynthesizedAnalysisResult> {
    const {
      userId,
      documentId,
      scenarioId,
      mode,
      targetClauseIds,
      scenarioPrompt,
      userName,
      forceRefresh = false,
    } = options;

    const overallStartTime = Date.now();
    const analysisId = `analysis-${uuidv4().substring(0, 8)}`;
    logger.info(`[MasterAIOrchestrator] Starting ${mode} analysis (ID: ${analysisId}) for doc ${documentId}`);

    // STEP 1: Build compact shared context with token budgeting & ranking
    const context: AnalysisContext = await ContextBuilder.retrieveRelevantContext({
      documentId,
      userId,
      scenarioId,
      mode,
      targetClauseIds,
      scenarioPrompt,
    });

    // STEP 2: Check context-hash caching to prevent unnecessary API calls
    if (!forceRefresh && cachedAnalysesByHash.has(context.contextHash)) {
      const cached = cachedAnalysesByHash.get(context.contextHash)!;
      if (Date.now() < cached.expiresAt) {
        logger.info(`[MasterAIOrchestrator] Cache hit for context hash ${context.contextHash}. Reusing analysis.`);
        return cached.result;
      }
    }

    // STEP 3: Execute Agents based on mode
    let opposingResult: any = { agent: 'opposing_counsel', findings: [], evidence: [], status: 'completed' };
    let defenseResult: any = { agent: 'defense_protection', protections: [], counterpoints: [], evidence: [], status: 'completed' };
    let reviewerResult: any = { agent: 'compliance_reviewer', findings: [], evidence: [], status: 'completed' };
    let skepticResult: any = { agent: 'skeptic', challenges: [], overallVerificationSummary: '', status: 'completed' };
    const debates: FullDebateRecord[] = [];

    if (mode === 'FULL_AUDIT' || mode === 'SCENARIO_STRESS_TEST') {
      // Parallel execution: Opposing Counsel, Compliance Reviewer, and preliminary Defense
      const [opposing, reviewer] = await Promise.all([
        OpposingCounselAgent.runOpposingCounsel(context, { scenarioPrompt }),
        ComplianceReviewerAgent.runComplianceReviewer(context),
      ]);
      opposingResult = opposing;
      reviewerResult = reviewer;

      // Execute Defense Agent and Skeptic Agent in parallel since their respective prerequisites are ready
      const [defense, skeptic] = await Promise.all([
        DefenseAgent.runDefenseAgent(context, opposingResult.findings, { scenarioPrompt }),
        SkepticAgent.runSkepticAgent(context, reviewerResult.findings),
      ]);
      defenseResult = defense;
      skepticResult = skeptic;

      // STEP 4: Run controlled 2-pair debate protocols
      const riskDebate = MultiAgentDebateEngine.runContractRiskDebate({
        documentId,
        userId,
        opposingFindings: opposingResult.findings,
        protections: defenseResult.protections,
        counterpoints: defenseResult.counterpoints,
      });

      const complianceDebate = MultiAgentDebateEngine.runComplianceAuditDebate({
        documentId,
        userId,
        reviewerFindings: reviewerResult.findings,
        skepticChallenges: skepticResult.challenges,
      });

      debates.push(riskDebate, complianceDebate);
      await Promise.all([
        AIRunRepository.saveDebate(riskDebate),
        AIRunRepository.saveDebate(complianceDebate),
      ]);
    } else if (mode === 'COMPLIANCE_AUDIT') {
      // Compliance Reviewer followed by Skeptic
      reviewerResult = await ComplianceReviewerAgent.runComplianceReviewer(context);
      skepticResult = await SkepticAgent.runSkepticAgent(context, reviewerResult.findings);

      const complianceDebate = MultiAgentDebateEngine.runComplianceAuditDebate({
        documentId,
        userId,
        reviewerFindings: reviewerResult.findings,
        skepticChallenges: skepticResult.challenges,
      });
      debates.push(complianceDebate);
      await AIRunRepository.saveDebate(complianceDebate);
    } else if (mode === 'TARGETED_ANALYSIS') {
      // Targeted clause risk & defense inspection
      opposingResult = await OpposingCounselAgent.runOpposingCounsel(context);
      defenseResult = await DefenseAgent.runDefenseAgent(context, opposingResult.findings);
    }

    // STEP 5: Master Synthesis & Personalized Explanation Layer
    const synthesisResult: SynthesizedAnalysisResult = SynthesisEngine.synthesizeAnalysis({
      documentId,
      userId,
      userName,
      opposingFindings: opposingResult.findings,
      protections: defenseResult.protections,
      reviewerFindings: reviewerResult.findings,
      skepticChallenges: skepticResult.challenges,
      debates,
      personalization: context.personalizationProfile,
    });

    // STEP 6: Persistence & Telemetry Recording
    const totalLatency = Date.now() - overallStartTime;
    await Promise.all([
      AIRunRepository.saveAnalysisResult(analysisId, synthesisResult),
      AIRunRepository.recordAIRun({
        id: analysisId,
        userId,
        documentId,
        scenarioId,
        agentType: 'master_orchestrator',
        status: 'completed',
        model: 'gemini-3.8-flash',
        promptVersion: '5.0-production',
        inputTokenCount: 1850,
        outputTokenCount: 1200,
        latencyMs: totalLatency,
        createdAt: new Date(overallStartTime).toISOString(),
        completedAt: new Date().toISOString(),
      }),
    ]);

    // Cache the result for 15 minutes
    cachedAnalysesByHash.set(context.contextHash, {
      result: synthesisResult,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    logger.info(`[MasterAIOrchestrator] Completed ${mode} analysis in ${totalLatency}ms. Synthesized ${synthesisResult.findings.length} findings.`);
    return synthesisResult;
  }
}

export const runLexflowAiAnalysis = MasterAIOrchestrator.runLexflowAiAnalysis;
