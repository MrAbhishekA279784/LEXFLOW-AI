/**
 * Compliance Reviewer Agent Schemas
 * Role: Structured legal/regulatory compliance audit satisfying PS #5.
 * Evaluates regulatory issues, potentially non-compliant provisions, missing disclosures, statutory conflicts.
 * Uses controlled statuses: COMPLIANT, POTENTIAL_NON_COMPLIANCE, REQUIRES_REVIEW, INSUFFICIENT_EVIDENCE, NOT_APPLICABLE.
 */

import { z } from 'zod';

export const ComplianceStatusSchema = z.enum([
  'COMPLIANT',
  'POTENTIAL_NON_COMPLIANCE',
  'REQUIRES_REVIEW',
  'INSUFFICIENT_EVIDENCE',
  'NOT_APPLICABLE',
]);

export const ComplianceReviewerFindingSchema = z.object({
  findingId: z.string(),
  title: z.string(),
  status: ComplianceStatusSchema.default('POTENTIAL_NON_COMPLIANCE'),
  category: z.enum([
    'contractual_obligation',
    'compliance_risk',
    'penalty_exposure',
    'termination_exposure',
    'ambiguity',
    'unfavorable_provision',
    'missing_protection',
    'legal_conflict',
    'statutory_conflict',
    'missing_disclosure'
  ]),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  claim: z.string(),
  reasoning: z.string(),
  jurisdiction: z.string().default('India (Central / Karnataka / Bengaluru)'),
  statutoryBasis: z.string().optional(),
  applicabilityConditions: z.array(z.string()).default([]),
  exceptionsConsidered: z.array(z.string()).default([]),
  affectedClauseRefs: z.array(z.string()),
  clauseIds: z.array(z.string()).default([]),
  legalAuthorityIds: z.array(z.string()).default([]),
  evidenceIds: z.array(z.string()).default([]),
  proposedMitigation: z.string().optional(),
  confidence: z.number().min(0).max(1).default(0.85),
  graphNodeRefs: z.array(z.string()).optional(),
  scenarioStressTestPrompt: z.string().optional()
});

export const ComplianceReviewerOutputSchema = z.object({
  agent: z.literal('compliance_reviewer').optional().default('compliance_reviewer'),
  findings: z.array(ComplianceReviewerFindingSchema),
  evidence: z.array(z.object({
    id: z.string(),
    type: z.string().default('legal_authority'),
    clauseId: z.string().optional(),
    sectionRef: z.string().optional(),
    pageNumber: z.number().optional(),
    excerpt: z.string(),
    actOrCourt: z.string().optional(),
    statuteSection: z.string().optional(),
    citation: z.string().optional(),
  })).default([]),
  uncertainties: z.array(z.string()).default([]),
  status: z.enum(['completed', 'insufficient_evidence', 'failed']).default('completed'),
});

export type ComplianceStatus = z.infer<typeof ComplianceStatusSchema>;
export type ComplianceReviewerFinding = z.infer<typeof ComplianceReviewerFindingSchema>;
export type ComplianceReviewerOutput = z.infer<typeof ComplianceReviewerOutputSchema>;
