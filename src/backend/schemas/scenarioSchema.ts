import { z } from 'zod';

export const ScenarioInputSchema = z.object({
  prompt: z.string().min(3, 'Scenario prompt must be at least 3 characters long').max(1000),
  actorRole: z.string().optional().default('tenant'),
});

export const NormalizedEventSchema = z.object({
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
});

export const NormalizedScenarioSchema = z.object({
  rawPrompt: z.string(),
  actor: z.string().default('tenant'),
  events: z.array(NormalizedEventSchema).min(1),
  intent: z.enum(['understand_consequences', 'financial_exposure', 'defense_options', 'dispute_resolution']).default('understand_consequences'),
  isClear: z.boolean().default(true),
  clarificationOptions: z.array(z.string()).optional(),
});

export const FinancialBreakdownItemSchema = z.object({
  label: z.string(),
  amount: z.string(),
  amountMinor: z.number().int(),
  calculationFormula: z.string().optional(),
  note: z.string(),
  sourceClauseId: z.string().optional(),
});

export const EvidenceItemSchema = z.object({
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

export const ScenarioResultTimelineStepSchema = z.object({
  step: z.number().int().positive(),
  time: z.string(),
  event: z.string(),
  status: z.enum(['past', 'trigger', 'consequence']),
  clauseRef: z.string().optional(),
});

export const ScenarioSimulationResultSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  inputPrompt: z.string(),
  normalizedInterpretation: z.string(),
  title: z.string(),
  documentSays: z.string(),
  lawSays: z.string(),
  lexflowAnalysis: z.string(),
  totalFinancialImpact: z.string(),
  totalFinancialImpactMinor: z.number().int(),
  financialBreakdown: z.array(FinancialBreakdownItemSchema),
  keyPoints: z.array(z.string()),
  relevantClauses: z.array(
    z.object({
      clauseId: z.string(),
      section: z.string(),
      title: z.string(),
      excerpt: z.string(),
      page: z.number(),
    })
  ),
  applicableLaw: z.array(z.any()),
  timeline: z.array(ScenarioResultTimelineStepSchema),
  risks: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      level: z.enum(['low', 'medium', 'high', 'critical']),
    })
  ),
  protections: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
    })
  ),
  conflicts: z.array(
    z.object({
      clauseA: z.string(),
      clauseB: z.string(),
      description: z.string(),
    })
  ),
  evidence: z.array(EvidenceItemSchema),
  suggestedNextSteps: z.array(z.string()),
  disclaimer: z.string(),
  status: z.enum(['completed', 'needs_clarification', 'failed']),
});
