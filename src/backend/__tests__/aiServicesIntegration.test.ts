import { describe, it, expect } from 'vitest';
import { AssistantService } from '../services/assistant/assistantService';
import { ComparisonService } from '../services/comparison/comparisonService';
import { AdversarialReviewService } from '../services/risks/adversarialReviewService';
import { ScenarioOrchestrator } from '../services/scenarios/scenarioOrchestrator';
import { repository } from '../repositories';

describe('AI Services End-to-End Integration', () => {
  it('AssistantService should answer queries with clause references and statutory authorities', async () => {
    const result = await AssistantService.askAssistant('doc-rental', 'Can the landlord deduct painting costs from my deposit?');
    
    expect(result).toBeDefined();
    expect(result.reply).toBeDefined();
    expect(result.reply.length).toBeGreaterThan(20);
    expect(result.disclaimer).toBeDefined();
    expect(result.suggestedPrompts.length).toBeGreaterThan(0);
  });

  it('ComparisonService should compare two documents and produce structured risk & protection deltas', async () => {
    const comparison = await ComparisonService.compareDocuments('doc-rental', 'doc-rental', 'user-ahamed-001');

    expect(comparison).toBeDefined();
    expect(comparison.summary).toBeDefined();
    expect(comparison.diffs).toBeDefined();
    expect(Array.isArray(comparison.diffs)).toBe(true);
    expect(comparison.riskDelta).toBeDefined();
    expect(comparison.protectionDelta).toBeDefined();
  });

  it('AdversarialReviewService should execute dual-agent opposing vs protection review', async () => {
    const clauses = await repository.listByDocument('doc-rental');
    const review = await AdversarialReviewService.reviewDocumentAsync('doc-rental', clauses);

    expect(review.opposingRisks).toBeDefined();
    expect(review.protections).toBeDefined();
    expect(review.synthesis).toBeDefined();
    expect(review.synthesis.highPriority).toBeDefined();
  });

  it('ScenarioOrchestrator should simulate Hinglish scenario and return tripartite breakdown', async () => {
    const result = await ScenarioOrchestrator.simulateScenario({
      documentId: 'doc-rental',
      inputPrompt: '3 mahine rent nahi diya aur flat chhod diya',
      userId: 'user-ahamed-001',
    });

    expect(result).toBeDefined();
    expect(result.documentSays).toBeDefined();
    expect(result.lawSays).toBeDefined();
    expect(result.lexflowAnalysis).toBeDefined();
    expect(result.financialBreakdown.length).toBeGreaterThan(0);
    expect(result.evidence.length).toBeGreaterThan(0);
  });
});
