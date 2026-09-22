/**
 * Opposing Counsel Agent Schemas
 * Role: Analyze document from the perspective of someone looking for provisions,
 * loopholes, ambiguities, obligations, penalties, dependencies, or consequences that could disadvantage the user.
 */

import { z } from 'zod';

export const OpposingFindingTypeSchema = z.enum([
  'unfavorable_clause',
  'hidden_obligation',
  'ambiguous_language',
  'financial_exposure',
  'termination_risk',
  'penalty_mechanism',
  'loophole',
  'adverse_interaction',
]);

export const OpposingFindingItemSchema = z.object({
  id: z.string(),
  type: OpposingFindingTypeSchema,
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  title: z.string(),
  summary: z.string(),
  reasoning: z.string(),
  clauseIds: z.array(z.string()).default([]),
  clauseRefs: z.array(z.string()).default([]),
  legalAuthorityIds: z.array(z.string()).default([]),
  evidenceIds: z.array(z.string()).default([]),
  potentialAdverseImpact: z.string(),
  counterpartyAdvantage: z.string(),
  uncertainty: z.string().optional().default('none'),
  status: z.enum(['identified', 'insufficient_evidence']).default('identified'),
});

export const OpposingCounselOutputSchema = z.object({
  agent: z.literal('opposing_counsel'),
  findings: z.array(OpposingFindingItemSchema),
  evidence: z.array(z.object({
    id: z.string(),
    type: z.string().default('document'),
    clauseId: z.string().optional(),
    sectionRef: z.string().optional(),
    pageNumber: z.number().optional(),
    excerpt: z.string(),
    citation: z.string().optional(),
  })).default([]),
  uncertainties: z.array(z.string()).default([]),
  status: z.enum(['completed', 'insufficient_evidence', 'failed']).default('completed'),
});

export type OpposingFinding = z.infer<typeof OpposingFindingItemSchema>;
export type OpposingCounselOutput = z.infer<typeof OpposingCounselOutputSchema>;
