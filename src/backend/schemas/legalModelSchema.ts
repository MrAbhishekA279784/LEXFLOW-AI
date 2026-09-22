import { z } from 'zod';

export const ExtractedPartySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().default('party'),
  identifier: z.string().optional(),
  sourceClauseId: z.string().optional(),
  sourcePage: z.number().int().positive().optional(),
});

export const ExtractedObligationSchema = z.object({
  id: z.string().min(1),
  actor: z.string().min(1),
  action: z.string().min(1),
  description: z.string().min(1),
  frequency: z.enum(['once', 'daily', 'monthly', 'annually', 'on_demand']).optional(),
  dueDay: z.number().int().min(1).max(31).optional(),
  conditions: z.array(z.string()).optional(),
  sourceClauseId: z.string().min(1),
  sourcePage: z.number().int().positive(),
  confidence: z.number().min(0).max(1).default(0.9),
});

export const ExtractedRightSchema = z.object({
  id: z.string().min(1),
  beneficiary: z.string().min(1),
  description: z.string().min(1),
  conditions: z.array(z.string()).optional(),
  sourceClauseId: z.string().min(1),
  sourcePage: z.number().int().positive(),
  confidence: z.number().min(0).max(1).default(0.9),
});

export const ExtractedPaymentSchema = z.object({
  id: z.string().min(1),
  payer: z.string().min(1),
  payee: z.string().min(1),
  purpose: z.enum(['rent', 'deposit', 'maintenance', 'service_fee', 'utility', 'other']),
  amount: z.number().nonnegative(),
  currency: z.string().default('INR'),
  frequency: z.enum(['once', 'monthly', 'quarterly', 'annually']),
  dueDay: z.number().int().min(1).max(31).optional(),
  gracePeriodDays: z.number().int().nonnegative().optional(),
  sourceClauseId: z.string().min(1),
  sourcePage: z.number().int().positive(),
});

export const ExtractedDeadlineSchema = z.object({
  id: z.string().min(1),
  actor: z.string().min(1),
  description: z.string().min(1),
  durationDays: z.number().int().positive().optional(),
  triggerEvent: z.string().min(1),
  mandatory: z.boolean().default(true),
  sourceClauseId: z.string().min(1),
  sourcePage: z.number().int().positive(),
});

export const ExtractedPenaltySchema = z.object({
  id: z.string().min(1),
  actorSubject: z.string().min(1),
  triggerCondition: z.string().min(1),
  penaltyType: z.enum(['daily_fine', 'percentage', 'forfeiture', 'flat_fee', 'damages', 'termination']),
  rate: z.number().nonnegative().optional(),
  rateUnit: z.enum(['per_day', 'percentage_per_annum', 'fixed']).optional(),
  description: z.string().min(1),
  sourceClauseId: z.string().min(1),
  sourcePage: z.number().int().positive(),
});

export const ExtractedConditionSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  predicate: z.string().min(1),
  outcomes: z.array(z.string()),
  sourceClauseId: z.string().min(1),
  sourcePage: z.number().int().positive(),
});

export const ExtractedTerminationSchema = z.object({
  id: z.string().min(1),
  noticePeriodDays: z.number().int().nonnegative(),
  grounds: z.enum(['convenience', 'for_cause', 'mutual_consent', 'lock_in_breach']),
  lockInMonths: z.number().int().nonnegative().optional(),
  consequences: z.array(z.string()),
  sourceClauseId: z.string().min(1),
  sourcePage: z.number().int().positive(),
});

export const LegalModelSchema = z.object({
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

export type ValidatedLegalModel = z.infer<typeof LegalModelSchema>;
