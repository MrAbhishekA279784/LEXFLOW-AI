import { v4 as uuidv4 } from 'uuid';
import { repository } from '../../repositories';
import { LegalKnowledgeEngine } from '../legalKnowledge/legalKnowledgeEngine';
import { GraphEngine } from '../graph/graphEngine';
import { ReviewerAgent } from './reviewerAgent';
import { SkepticAgent } from './skepticAgent';
import { DebateEngine } from './debateEngine';
import { ConsensusEngine } from './consensusEngine';
import { AuditEvidenceService } from './auditEvidenceService';
import { 
  ComplianceAuditRecord, 
  ComplianceFinding, 
  AuditJobStatus, 
  DebateRoundRecord 
} from './types';
import { logger } from '../../utils/logger';

export class ComplianceAuditService {
  /**
   * Initializes and executes an asynchronous compliance audit job
   */
  static async startAudit(documentId: string, userId: string): Promise<ComplianceAuditRecord> {
    const doc = await repository.findById(documentId, userId);
    const docName = doc?.name || 'Rental Agreement.pdf';

    const auditId = `audit-${uuidv4().substring(0, 8)}`;
    const initialRecord: ComplianceAuditRecord = {
      id: auditId,
      documentId,
      documentName: docName,
      userId,
      status: 'queued',
      currentStep: 'Audit job queued. Initializing legal model and applicable authorities.',
      progressPercentage: 10,
      startedAt: new Date().toISOString(),
      summaryMetrics: {
        totalFindings: 0,
        highPriorityCount: 0,
        mediumPriorityCount: 0,
        protectionCount: 0,
        disputedCount: 0,
        humanReviewCount: 0,
        criticalFindings: 0,
        highFindings: 0,
        disputedFindings: 0,
        humanReviewRecommendedCount: 0,
        confirmedFindings: 0
      },
      summary: {
        totalFindings: 0,
        highPriorityCount: 0,
        mediumPriorityCount: 0,
        protectionCount: 0,
        disputedCount: 0,
        humanReviewCount: 0,
        criticalFindings: 0,
        highFindings: 0,
        disputedFindings: 0,
        humanReviewRecommendedCount: 0,
        confirmedFindings: 0
      },
      findings: [],
      debateLog: [],
      applicableAuthorities: [],
      overallExecutiveSummary: 'Initializing multi-agent compliance review...',
    };

    // Save initial state to repository
    await repository.saveComplianceAudit(initialRecord);

    // Launch background asynchronous execution pipeline
    this.runAuditPipeline(initialRecord).catch(err => {
      logger.error(`Compliance audit pipeline failed for audit ${auditId}:`, err);
      repository.updateComplianceAudit(auditId, {
        status: 'failed',
        currentStep: 'Audit pipeline encountered an unexpected error.',
        errorMessage: err?.message || 'Processing error'
      });
    });

    return initialRecord;
  }

  /**
   * Asynchronous pipeline execution tracking real backend stages
   */
  private static async runAuditPipeline(record: ComplianceAuditRecord): Promise<void> {
    const { id: auditId, documentId, documentName, userId } = record;

    try {
      // STEP 1: Gather Grounded Context (Model, Clauses, Law, Graph)
      await repository.updateComplianceAudit(auditId, {
        status: 'processing',
        currentStep: 'Retrieving extracted clauses, legal model, and applicable Indian statutes...',
        progressPercentage: 20
      });

      const [clauses, legalModel, authoritativeSources] = await Promise.all([
        repository.listByDocument(documentId),
        repository.findModelByDocument(documentId),
        repository.listAuthoritative()
      ]);

      // Detect legal issues and retrieve relevant Indian statutory sources
      const issues = LegalKnowledgeEngine.extractLegalIssues(
        `${documentName} tenancy rent penalty notice deposit termination`
      );
      const applicableAuthorities = await LegalKnowledgeEngine.retrieveApplicableLaw(issues);

      // Build or retrieve graph
      let graph = await repository.findGraphByDocument(documentId);
      if (!graph && legalModel) {
        graph = GraphEngine.buildGraph(legalModel);
      }

      // STEP 2: Reviewer Agent Execution
      await repository.updateComplianceAudit(auditId, {
        status: 'reviewer_running',
        currentStep: '⚖ Reviewer Agent examining contractual obligations, penalty exposure, and compliance...',
        progressPercentage: 40,
        applicableAuthorities
      });

      const reviewerOutput = await ReviewerAgent.auditDocument({
        documentId,
        documentName,
        legalModel,
        clauses,
        authorities: applicableAuthorities,
        graph
      });

      // STEP 3: Skeptic Agent Execution
      await repository.updateComplianceAudit(auditId, {
        status: 'skeptic_running',
        currentStep: '🔍 Skeptic Agent challenging claims, checking exceptions, and testing counter-evidence...',
        progressPercentage: 60
      });

      const skepticOutput = await SkepticAgent.challengeFindings({
        findings: reviewerOutput.findings,
        clauses,
        authorities: applicableAuthorities
      });

      // STEP 4: Bounded Debate Execution (Max 3 Rounds)
      await repository.updateComplianceAudit(auditId, {
        status: 'debating',
        currentStep: '⚖ vs 🔍 Bounded structured debate in progress across contested legal findings...',
        progressPercentage: 75
      });

      const { findingDebates } = await DebateEngine.conductDebate({
        findings: reviewerOutput.findings,
        challenges: skepticOutput.challenges
      });

      // STEP 5: Evidence Verification & Consensus Synthesis
      await repository.updateComplianceAudit(auditId, {
        status: 'verifying_evidence',
        currentStep: 'Correlating verifiable clauses, statutory sections, and legal precedents...',
        progressPercentage: 88
      });

      const finalizedFindings: ComplianceFinding[] = [];
      const debateLog: DebateRoundRecord[] = [];

      for (const finding of reviewerOutput.findings) {
        const challenge = skepticOutput.challenges.find(c => c.findingId === finding.findingId);
        const debateExchanges = findingDebates.get(finding.findingId) || [];

        // Evaluate consensus
        const consensus = ConsensusEngine.evaluateFinding({
          finding,
          challenge,
          debateExchanges
        });

        // Correlate Evidence
        const matchedClauses = AuditEvidenceService.matchClauses(finding.affectedClauseRefs, clauses);
        const clauseEvidence = AuditEvidenceService.buildClauseEvidence(matchedClauses);
        const relevantAuthorities = AuditEvidenceService.correlateAuthorities(
          finding.category,
          finding.title,
          finding.reasoning,
          applicableAuthorities
        );
        const statutoryEvidence = AuditEvidenceService.buildLegalEvidence(relevantAuthorities);

        // Map counter-evidence if skeptic identified alternative clauses
        const counterClauses = AuditEvidenceService.matchClauses(challenge?.counterClauseRefs || [], clauses);
        const counterEvidence = AuditEvidenceService.buildClauseEvidence(counterClauses);

        // Record finding
        finalizedFindings.push({
          findingId: finding.findingId,
          category: finding.category,
          severity: finding.severity,
          title: finding.title,
          claim: finding.claim,
          reasoning: finding.reasoning,
          affectedClauseRefs: finding.affectedClauseRefs,
          evidence: [...clauseEvidence, ...statutoryEvidence],
          legalAuthorities: relevantAuthorities,
          graphNodeRefs: finding.graphNodeRefs || [],
          consensusStatus: consensus.status,
          humanReviewRecommended: consensus.humanReviewRecommended,
          humanReviewReason: consensus.humanReviewReason,
          lexflowSynthesis: consensus.lexflowSynthesis,
          reviewerPosition: {
            argument: `${finding.claim} Legal basis: ${finding.reasoning}`,
            confidence: finding.confidence,
            proposedMitigation: finding.proposedMitigation
          },
          skepticChallenge: {
            challenge: challenge?.challenge || 'No material counter-evidence located in agreement.',
            counterEvidence,
            alternativeInterpretation: challenge?.alternativeInterpretation || 'Strict enforcement according to freedom of contract.',
            missingInformation: challenge?.missingInformation || [],
            confidence: challenge?.confidence || 0.8
          },
          debateRounds: debateExchanges,
          scenarioStressTestPrompt: finding.scenarioStressTestPrompt
        });

        // Record debate log entry
        debateLog.push({
          roundNumber: debateExchanges.length,
          focusIssue: finding.title,
          reviewerStatement: debateExchanges[0]?.reviewerArgument || finding.claim,
          skepticChallenge: debateExchanges[0]?.skepticCounterArgument || challenge?.challenge || '',
          resolution: consensus.lexflowSynthesis,
          status: consensus.status
        });
      }

      // STEP 6: Compute Metrics and Final Synthesis
      const highPriorityCount = finalizedFindings.filter(f => f.severity === 'critical' || f.severity === 'high').length;
      const mediumPriorityCount = finalizedFindings.filter(f => f.severity === 'medium').length;
      const protectionCount = finalizedFindings.filter(f => f.category === 'missing_protection' || f.consensusStatus === 'CONFIRMED').length;
      const disputedCount = finalizedFindings.filter(f => f.consensusStatus === 'DISPUTED').length;
      const humanReviewCount = finalizedFindings.filter(f => f.humanReviewRecommended).length;

      const summaryMetrics = {
        totalFindings: finalizedFindings.length,
        highPriorityCount,
        mediumPriorityCount,
        protectionCount,
        disputedCount,
        humanReviewCount,
        criticalFindings: finalizedFindings.filter(f => f.severity === 'critical').length,
        highFindings: finalizedFindings.filter(f => f.severity === 'high').length,
        disputedFindings: disputedCount,
        humanReviewRecommendedCount: humanReviewCount,
        confirmedFindings: finalizedFindings.filter(f => f.consensusStatus === 'CONFIRMED').length
      };

      const overallExecutiveSummary = ConsensusEngine.generateExecutiveSummary(summaryMetrics);

      // STEP 7: Mark Completed
      await repository.updateComplianceAudit(auditId, {
        status: 'completed',
        currentStep: 'Compliance audit synthesis completed. Report ready for review.',
        progressPercentage: 100,
        completedAt: new Date().toISOString(),
        findings: finalizedFindings,
        debateLog,
        applicableAuthorities,
        summaryMetrics,
        summary: summaryMetrics,
        overallExecutiveSummary
      });

      logger.info(`Compliance audit ${auditId} completed successfully with ${finalizedFindings.length} findings.`);
    } catch (err: any) {
      logger.error(`Compliance audit pipeline failed for audit ${auditId}:`, err);
      await repository.updateComplianceAudit(auditId, {
        status: 'failed',
        currentStep: 'Audit pipeline encountered an error during execution.',
        progressPercentage: 100,
        errorMessage: err?.message || 'Processing error'
      });
    }
  }

  /**
   * Retrieves an audit by ID with security check
   */
  static async getAuditById(auditId: string, userId?: string): Promise<ComplianceAuditRecord | null> {
    return repository.findComplianceAuditById(auditId, userId);
  }

  /**
   * Lists audits for a given document with security check
   */
  static async listAuditsByDocument(documentId: string, userId?: string): Promise<ComplianceAuditRecord[]> {
    return repository.listComplianceAuditsByDocument(documentId, userId);
  }
}
