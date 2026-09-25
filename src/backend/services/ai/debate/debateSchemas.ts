import { z } from 'zod';

export const DebateAgentTypeSchema = z.enum([
  'opposing_counsel',
  'defense_protection',
  'compliance_reviewer',
  'skeptic'
]);

export const DebatePairTypeSchema = z.enum([
  'contract_risk_debate',      // Opposing Counsel ↔ Defense
  'compliance_audit_debate'    // Compliance Reviewer ↔ Skeptic
]);

export const DebateMessageSchema = z.object({
  id: z.string(),
  debateId: z.string(),
  pairType: DebatePairTypeSchema,
  agent: DebateAgentTypeSchema,
  round: z.number().int().min(1).max(4),
  findingIdRef: z.string().optional(),
  title: z.string(),
  content: z.string(),
  evidenceIds: z.array(z.string()).default([]),
  clauseRefs: z.array(z.string()).default([]),
  statutoryCitations: z.array(z.string()).default([]),
  status: z.enum(['proposed', 'countered', 'verified', 'disputed', 'resolved']),
  timestamp: z.string(),
});

export const DebateRoundSchema = z.object({
  roundNumber: z.number().int(),
  messages: z.array(DebateMessageSchema),
  earlyStopped: z.boolean().default(false),
  stopReason: z.string().optional(),
});

export const FullDebateRecordSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  userId: z.string(),
  pairType: DebatePairTypeSchema,
  status: z.enum(['active', 'completed', 'early_stopped', 'failed']),
  rounds: z.array(DebateRoundSchema),
  totalRounds: z.number().int(),
  summary: z.string(),
  disputedFindingIds: z.array(z.string()).default([]),
  resolvedFindingIds: z.array(z.string()).default([]),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

export type DebateAgentType = z.infer<typeof DebateAgentTypeSchema>;
export type DebatePairType = z.infer<typeof DebatePairTypeSchema>;
export type DebateMessage = z.infer<typeof DebateMessageSchema>;
export type DebateRound = z.infer<typeof DebateRoundSchema>;
export type FullDebateRecord = z.infer<typeof FullDebateRecordSchema>;
