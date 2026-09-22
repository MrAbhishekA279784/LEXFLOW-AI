/**
 * Defense / Protection Agent Schemas
 * Role: Analyze document from the user's protective perspective.
 * Identifies contractual protections, statutory shields, notice rights, cure periods,
 * and formulates evidence-grounded counterpoints against Opposing Counsel findings.
 */

import { z } from 'zod';

export const ProtectionTypeSchema = z.enum([
  'user_right',
  'contractual_protection',
  'statutory_shield',
  'grace_period',
  'cure_window',
  'remedy',
  'counterpoint_to_risk',
]);

export const DefenseProtectionItemSchema = z.object({
  id: z.string(),
  type: ProtectionTypeSchema,
  strength: z.enum(['strong', 'moderate', 'conditional']),
  title: z.string(),
  summary: z.string(),
  reasoning: z.string(),
  clauseIds: z.array(z.string()).default([]),
  clauseRefs: z.array(z.string()).default([]),
  legalAuthorityIds: z.array(z.string()).default([]),
  evidenceIds: z.array(z.string()).default([]),
  opposingFindingIdRef: z.string().optional(),
  counterpointArgument: z.string().optional(),
  recommendedDefensiveAction: z.string(),
  status: z.enum(['identified', 'insufficient_evidence']).default('identified'),
});

export const CounterpointItemSchema = z.object({
  opposingFindingId: z.string(),
  counterArgument: z.string(),
  supportingClauseRefs: z.array(z.string()).default([]),
  supportingAuthorityIds: z.array(z.string()).default([]),
  materiallyMitigates: z.boolean().default(true),
});

export const DefenseOutputSchema = z.object({
  agent: z.literal('defense_protection'),
  protections: z.array(DefenseProtectionItemSchema),
  counterpoints: z.array(CounterpointItemSchema).default([]),
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

export type DefenseProtection = z.infer<typeof DefenseProtectionItemSchema>;
export type Counterpoint = z.infer<typeof CounterpointItemSchema>;
export type DefenseOutput = z.infer<typeof DefenseOutputSchema>;
