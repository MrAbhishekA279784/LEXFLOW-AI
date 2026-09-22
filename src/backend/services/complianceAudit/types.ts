import { EvidenceItem, LegalAuthority } from '../../types/backendTypes';

export type ComplianceFindingCategory =
  | 'contractual_obligation'
  | 'compliance_risk'
  | 'penalty_exposure'
  | 'termination_exposure'
  | 'ambiguity'
  | 'unfavorable_provision'
  | 'missing_protection'
  | 'legal_conflict';

export type ComplianceFindingSeverity = 'critical' | 'high' | 'medium' | 'low';

export type ConsensusStatus =
  | 'CONFIRMED'
  | 'PARTIALLY_SUPPORTED'
  | 'DISPUTED'
  | 'INSUFFICIENT_EVIDENCE';

export type AuditJobStatus =
  | 'queued'
  | 'processing'
  | 'reviewer_running'
  | 'skeptic_running'
  | 'debating'
  | 'verifying_evidence'
  | 'synthesizing'
  | 'completed'
  | 'failed';

export interface DebateExchange {
  round: number;
  reviewerArgument: string;
  skepticCounterArgument: string;
  unresolvedQuestion?: string;
}

export interface ComplianceFinding {
  findingId: string;
  category: ComplianceFindingCategory;
  severity: ComplianceFindingSeverity;
  title: string;
  claim: string;
  reasoning: string;
  affectedClauseRefs: string[];
  proposedMitigation?: string;
  evidence: EvidenceItem[];
  legalAuthorities: LegalAuthority[];
  graphNodeRefs?: string[];
  consensusStatus: ConsensusStatus;
  humanReviewRecommended: boolean;
  humanReviewReason?: string;
  lexflowSynthesis: string;
  reviewerPosition: {
    argument: string;
    confidence: number;
    proposedMitigation?: string;
  };
  skepticChallenge: {
    challenge: string;
    counterEvidence: EvidenceItem[];
    alternativeInterpretation: string;
    missingInformation: string[];
    confidence: number;
  };
  debateRounds: DebateExchange[];
  scenarioStressTestPrompt?: string;
  // Aliases for frontend rendering
  id?: string;
  synthesis?: string;
  confidenceScore?: number;
  reviewerClaim?: string;
  reviewerReasoning?: string;
  skepticAlternativeInterpretation?: string;
  skepticMissingInformation?: string[];
  statutoryAuthorities?: LegalAuthority[];
  clauseReference?: {
    section: string;
    title: string;
    excerpt: string;
    pageNumber?: number;
  };
}

export interface DebateRoundRecord {
  roundNumber: number;
  focusIssue: string;
  reviewerStatement: string;
  skepticChallenge: string;
  resolution: string;
  status: ConsensusStatus;
}

export interface ComplianceAuditSummary {
  totalFindings: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  protectionCount: number;
  disputedCount: number;
  humanReviewCount: number;
  // Aliases for convenience across frontend & backend
  criticalFindings?: number;
  highFindings?: number;
  disputedFindings?: number;
  humanReviewRecommendedCount?: number;
  confirmedFindings?: number;
}

export interface ComplianceAuditRecord {
  id: string;
  documentId: string;
  documentName: string;
  userId: string;
  status: AuditJobStatus;
  currentStep: string;
  progressPercentage: number;
  startedAt: string;
  completedAt?: string;
  summaryMetrics: ComplianceAuditSummary;
  summary?: ComplianceAuditSummary;
  findings: ComplianceFinding[];
  debateLog: DebateRoundRecord[];
  applicableAuthorities: LegalAuthority[];
  overallExecutiveSummary: string;
  errorMessage?: string;
}
