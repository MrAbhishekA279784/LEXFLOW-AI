import { z } from 'zod';

export const ReviewerFindingItemSchema = z.object({
  findingId: z.string(),
  category: z.enum([
    'contractual_obligation',
    'compliance_risk',
    'penalty_exposure',
    'termination_exposure',
    'ambiguity',
    'unfavorable_provision',
    'missing_protection',
    'legal_conflict'
  ]),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  title: z.string(),
  claim: z.string(),
  reasoning: z.string(),
  affectedClauseRefs: z.array(z.string()),
  proposedMitigation: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.85),
  graphNodeRefs: z.array(z.string()).optional(),
  scenarioStressTestPrompt: z.string().optional()
});

export const ReviewerAgentOutputSchema = z.object({
  findings: z.array(ReviewerFindingItemSchema)
});

export const SkepticChallengeItemSchema = z.object({
  findingId: z.string(),
  challenge: z.string(),
  alternativeInterpretation: z.string(),
  missingInformation: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.8),
  isMateriallyDisputed: z.boolean().default(false),
  counterClauseRefs: z.array(z.string()).default([])
});

export const SkepticAgentOutputSchema = z.object({
  challenges: z.array(SkepticChallengeItemSchema)
});

export const DebateRoundItemSchema = z.object({
  findingId: z.string(),
  roundNumber: z.number(),
  reviewerRebuttal: z.string(),
  skepticFinalAssessment: z.string(),
  isResolved: z.boolean(),
  unresolvedQuestion: z.string().optional()
});

export const DebateRoundsOutputSchema = z.object({
  rounds: z.array(DebateRoundItemSchema)
});

export const ConsensusEvaluationItemSchema = z.object({
  findingId: z.string(),
  status: z.enum(['CONFIRMED', 'PARTIALLY_SUPPORTED', 'DISPUTED', 'INSUFFICIENT_EVIDENCE']),
  humanReviewRecommended: z.boolean(),
  humanReviewReason: z.string().optional(),
  lexflowSynthesis: z.string()
});

export const ConsensusEngineOutputSchema = z.object({
  evaluations: z.array(ConsensusEvaluationItemSchema),
  overallExecutiveSummary: z.string()
});
