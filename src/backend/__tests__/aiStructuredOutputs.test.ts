import { describe, it, expect } from 'vitest';
import { 
  ScenarioParseResultSchema, 
  ComparisonResultSchema, 
  AssistantResultSchema,
  AdversarialReviewResultSchema,
  LawyerKitResultSchema
} from '../schemas/aiResultSchemas';

describe('AI Structured Zod Schemas Validation', () => {
  it('should validate ScenarioParseResultSchema accurately', () => {
    const validScenario = {
      rawPrompt: '3 mahine rent nahi diya aur flat chhod diya',
      actor: 'tenant',
      events: [
        { type: 'miss_payment', durationMonths: 3, amount: 75000, description: 'Missed 3 months' },
        { type: 'vacate_property', description: 'Left property' }
      ],
      intent: 'understand_consequences',
      isClear: true,
      assumptions: ['Rent is 25000'],
      uncertainties: ['Notice served status']
    };

    const parsed = ScenarioParseResultSchema.safeParse(validScenario);
    expect(parsed.success).toBe(true);
  });

  it('should validate ComparisonResultSchema accurately', () => {
    const validComparison = {
      docAName: 'Current Agreement.pdf',
      docBName: 'Renewal Agreement.pdf',
      summary: 'Annual escalation increase and longer refund timeline',
      riskDelta: {
        increasedRisks: ['Higher escalation'],
        decreasedRisks: [],
        overallRiskScoreDiff: '+15%',
      },
      protectionDelta: {
        addedProtections: [],
        removedProtections: ['14-day refund guarantee'],
      },
      diffs: [
        {
          id: 'diff-1',
          category: 'Escalation',
          clauseName: 'Annual Escalation',
          status: 'modified',
          changeType: 'more_restrictive',
          docAValue: '7%',
          docBValue: '10%',
          impactSummary: 'Increases annual cost',
        }
      ],
      recommendation: 'Negotiate the escalation rate down to 7% before executing'
    };

    const parsed = ComparisonResultSchema.safeParse(validComparison);
    expect(parsed.success).toBe(true);
  });

  it('should validate AssistantResultSchema accurately', () => {
    const validAssistant = {
      reply: 'Under Section 5.1 of the agreement, the security deposit is refundable within 14 days.',
      clauseRef: {
        section: 'Section 5.1',
        page: 2,
        text: 'Deposit refundable in 14 days',
      },
      authorities: [
        {
          title: 'Section 74 Indian Contract Act',
          sectionOrArticle: 'Section 74',
          summary: 'Reasonable compensation for breach',
        }
      ],
      suggestedPrompts: ['What if landlord refuses refund?'],
      disclaimer: 'Informational analysis only.'
    };

    const parsed = AssistantResultSchema.safeParse(validAssistant);
    expect(parsed.success).toBe(true);
  });

  it('should validate AdversarialReviewResultSchema accurately', () => {
    const validAdversarial = {
      documentId: 'doc-rental',
      opposingRisks: [
        {
          id: 'risk-1',
          title: 'Compounding daily late fee',
          level: 'critical',
          perspective: 'adversarial',
          clauseRef: 'Section 4.3',
          description: 'Imposes ₹500/day fine',
          recommendation: 'Cap late fees',
          potentialImpact: 'Accelerating financial exposure',
          evidence: []
        }
      ],
      protections: [
        {
          id: 'prot-1',
          title: '3-day grace period',
          level: 'low',
          perspective: 'protection',
          clauseRef: 'Section 4.1',
          description: 'Grace period before penalty',
          recommendation: 'Keep date proof',
          potentialImpact: 'Defense shield',
          evidence: []
        }
      ],
      synthesis: {
        highPriority: [],
        mediumPriority: [],
        protectionHighlights: [],
      }
    };

    const parsed = AdversarialReviewResultSchema.safeParse(validAdversarial);
    expect(parsed.success).toBe(true);
  });
});
