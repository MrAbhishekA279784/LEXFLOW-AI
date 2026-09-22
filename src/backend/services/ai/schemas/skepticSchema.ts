/**
 * Skeptic Agent Schemas
 * Role: Challenge the Compliance Reviewer's findings.
 * Controlled challenge outcomes: CONFIRMED, PARTIALLY_SUPPORTED, DISPUTED, INSUFFICIENT_EVIDENCE, NOT_APPLICABLE.
 * Strictly verifies statutory applicability, jurisdictional scope, factual support, and exceptions.
 */

import { z } from 'zod';

export const SkepticChallengeOutcomeSchema = z.enum([
  'CONFIRMED',
  'PARTIALLY_SUPPORTED',
  'DISPUTED',
  'INSUFFICIENT_EVIDENCE',
  'NOT_APPLICABLE',
]);

export const SkepticChallengeItemSchema = z.object({
  findingId: z.string(),
  challengeOutcome: SkepticChallengeOutcomeSchema.default('PARTIALLY_SUPPORTED'),
  challenge: z.string(),
  alternativeInterpretation: z.string(),
  statutoryApplicabilityDoubt: z.string().optional(),
  missingInformation: z.array(z.string()).default([]),
  confidence: z.number().min(0).max(1).default(0.8),
  isMateriallyDisputed: z.boolean().default(false),
  counterClauseRefs: z.array(z.string()).default([]),
  counterAuthorityIds: z.array(z.string()).default([]),
});

export const SkepticOutputSchema = z.object({
  agent: z.literal('skeptic').optional().default('skeptic'),
  challenges: z.array(SkepticChallengeItemSchema),
  overallVerificationSummary: z.string().optional().default('Independent counter-examination completed.'),
  uncertainties: z.array(z.string()).default([]),
  status: z.enum(['completed', 'insufficient_evidence', 'failed']).default('completed'),
});

export type SkepticChallengeOutcome = z.infer<typeof SkepticChallengeOutcomeSchema>;
export type SkepticChallenge = z.infer<typeof SkepticChallengeItemSchema>;
export type SkepticOutput = z.infer<typeof SkepticOutputSchema>;
