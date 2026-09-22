import { z } from 'zod';
import { 
  ExtractedPartySchema, 
  ExtractedObligationSchema, 
  ExtractedRightSchema, 
  ExtractedPaymentSchema, 
  ExtractedDeadlineSchema, 
  ExtractedPenaltySchema, 
  ExtractedConditionSchema, 
  ExtractedTerminationSchema 
} from './legalModelSchema';

/**
 * 1. Document Extraction Result Schema
 */
export const DocumentExtractionResultSchema = z.object({
  documentId: z.string().min(1),
  parties: z.array(ExtractedPartySchema).default([]),
  obligations: z.array(ExtractedObligationSchema).default([]),
  rights: z.array(ExtractedRightSchema).default([]),
  deadlines: z.array(ExtractedDeadlineSchema).default([]),
  conditions: z.array(ExtractedConditionSchema).default([]),
  payments: z.array(ExtractedPaymentSchema).default([]),
  penalties: z.array(ExtractedPenaltySchema).default([]),
  termination: z.array(ExtractedTerminationSchema).default([]),
  events: z.array(z.string()).default([]),
  dependencies: z.array(
    z.object({
      fromEntityId: z.string(),
      toEntityId: z.string(),
      type: z.string(),
    })
  ).default([]),
  conflicts: z.array(
    z.object({
      clauseAId: z.string(),
      clauseBId: z.string(),
      description: z.string(),
    })
  ).default([]),
});

/**
 * 2. Scenario Parse Result Schema
 */
export const ScenarioParseResultSchema = z.object({
  rawPrompt: z.string(),
  actor: z.string().default('tenant'),
  events: z.array(
    z.object({
      type: z.enum([
        'miss_payment',
        'vacate_property',
        'break_notice',
        'damage_property',
        'sublet',
        'refuse_escalation',
        'custom'
      ]),
      durationMonths: z.number().int().nonnegative().optional(),
      amount: z.number().nonnegative().optional(),
      description: z.string().optional(),
    })
  ).min(1),
  intent: z.enum(['understand_consequences', 'financial_exposure', 'defense_options', 'dispute_resolution']).default('understand_consequences'),
  isClear: z.boolean().default(true),
  clarificationOptions: z.array(z.string()).optional(),
  assumptions: z.array(z.string()).optional(),
  uncertainties: z.array(z.string()).optional(),
});

/**
 * 3. Legal Reasoning Result Schema
 */
export const LegalReasoningResultSchema = z.object({
  documentSays: z.string(),
  lawSays: z.string(),
  lexflowAnalysis: z.string(),
  keyPoints: z.array(z.string()),
  applicableAuthorities: z.array(
    z.object({
      title: z.string(),
      actOrCourt: z.string(),
      sectionOrArticle: z.string(),
      summary: z.string(),
      officialSourceUrl: z.string().optional(),
    })
  ),
  suggestedNextSteps: z.array(z.string()),
  disclaimer: z.string(),
});

/**
 * 4. Risk Finding & Adversarial Review Schemas
 */
export const RiskFindingResultSchema = z.object({
  id: z.string(),
  title: z.string(),
  level: z.enum(['low', 'moderate', 'medium', 'high', 'critical']),
  perspective: z.enum(['adversarial', 'protection']),
  clauseRef: z.string(),
  description: z.string(),
  recommendation: z.string(),
  potentialImpact: z.string(),
  evidence: z.array(
    z.object({
      type: z.enum(['document', 'legal_authority', 'judgment']),
      clauseId: z.string().optional(),
      section: z.string().optional(),
      page: z.number().optional(),
      exactExcerpt: z.string().optional(),
    })
  ).default([]),
});

export const AdversarialReviewResultSchema = z.object({
  documentId: z.string(),
  opposingRisks: z.array(RiskFindingResultSchema),
  protections: z.array(RiskFindingResultSchema),
  synthesis: z.object({
    highPriority: z.array(RiskFindingResultSchema),
    mediumPriority: z.array(RiskFindingResultSchema),
    protectionHighlights: z.array(RiskFindingResultSchema),
  }),
});

export const ProtectionReviewResultSchema = z.object({
  documentId: z.string(),
  protections: z.array(RiskFindingResultSchema),
  statutoryDefenses: z.array(z.string()),
  tacticalNegotiationTips: z.array(z.string()),
});

/**
 * 5. Conflict Result Schema
 */
export const ConflictResultSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  clauseAId: z.string(),
  clauseBId: z.string(),
  clauseARef: z.string(),
  clauseBRef: z.string(),
  interactionDescription: z.string(),
  impactLevel: z.enum(['low', 'medium', 'high', 'critical']),
  resolutionRecommendation: z.string(),
});

/**
 * 6. Evidence Result Schema
 */
export const EvidenceResultSchema = z.object({
  type: z.enum(['document', 'legal_authority', 'judgment']),
  documentId: z.string().optional(),
  clauseId: z.string().optional(),
  section: z.string().optional(),
  page: z.number().optional(),
  exactExcerpt: z.string().optional(),
  act: z.string().optional(),
  statuteSection: z.string().optional(),
  sourceUrl: z.string().optional(),
  court: z.string().optional(),
  citation: z.string().optional(),
  retrievalTimestamp: z.string().optional(),
});

/**
 * 7. Assistant Result Schema
 */
export const AssistantResultSchema = z.object({
  reply: z.string(),
  clauseRef: z.object({
    section: z.string(),
    page: z.number(),
    text: z.string(),
  }).optional(),
  authorities: z.array(
    z.object({
      title: z.string(),
      sectionOrArticle: z.string(),
      summary: z.string(),
    })
  ).optional(),
  suggestedPrompts: z.array(z.string()),
  disclaimer: z.string(),
});

/**
 * 8. Comparison Result Schema
 */
export const ComparisonDiffItemSchema = z.object({
  id: z.string(),
  category: z.string(),
  clauseName: z.string(),
  status: z.enum(['added', 'removed', 'modified', 'unchanged']),
  changeType: z.enum(['more_restrictive', 'more_protective', 'neutral']),
  docAValue: z.string(),
  docBValue: z.string(),
  docAPage: z.number().optional(),
  docBPage: z.number().optional(),
  docAClauseId: z.string().optional(),
  docBClauseId: z.string().optional(),
  impactSummary: z.string(),
  statutoryConsideration: z.string().optional(),
});

export const ComparisonResultSchema = z.object({
  docAName: z.string(),
  docBName: z.string(),
  summary: z.string(),
  riskDelta: z.object({
    increasedRisks: z.array(z.string()),
    decreasedRisks: z.array(z.string()),
    overallRiskScoreDiff: z.string(),
  }),
  protectionDelta: z.object({
    addedProtections: z.array(z.string()),
    removedProtections: z.array(z.string()),
  }),
  diffs: z.array(ComparisonDiffItemSchema),
  recommendation: z.string(),
});

/**
 * 9. Lawyer Prep-Kit Result Schema
 */
export const LawyerKitResultSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  documentName: z.string(),
  generatedAt: z.string(),
  parties: z.array(ExtractedPartySchema),
  keyObligations: z.array(ExtractedObligationSchema),
  importantDeadlines: z.array(ExtractedDeadlineSchema),
  potentialRisks: z.array(RiskFindingResultSchema),
  contractualProtections: z.array(z.string()),
  scenarioTested: z.string().optional(),
  potentialFinancialExposure: z.string(),
  potentialConflicts: z.array(ConflictResultSchema),
  questionsForLegalProfessional: z.array(z.string()).min(2),
  evidenceSummary: z.array(EvidenceResultSchema),
  authoritativeLegalSources: z.array(z.any()),
  disclaimer: z.string(),
});
