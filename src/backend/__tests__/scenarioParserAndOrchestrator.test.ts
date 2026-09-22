import { describe, it, expect } from 'vitest';
import { ScenarioOrchestrator } from '../services/scenarios/scenarioOrchestrator';

describe('Scenario Parser & Orchestration Pipeline', () => {
  it('should parse messy Hinglish input into structured scenario facts', async () => {
    const hinglishInput = 'Agar main 3 mahine rent nahi du aur phir ghar chhod du toh kya hoga?';
    
    const result = await ScenarioOrchestrator.runScenario(
      'doc-rental',
      hinglishInput,
      'usr-demo-1',
      'tenant'
    );

    expect(result).toBeDefined();
    expect(result.status).toBe('completed');
    expect(result.inputPrompt).toBe(hinglishInput);
    
    // Check normalized interpretation
    expect(result.normalizedInterpretation.toLowerCase()).toContain('rent');
    
    // Check tripartite breakdown
    expect(result.documentSays).toBeDefined();
    expect(result.documentSays.length).toBeGreaterThan(0);
    expect(result.lawSays).toBeDefined();
    expect(result.lawSays.length).toBeGreaterThan(0);
    expect(result.lexflowAnalysis).toBeDefined();
    expect(result.lexflowAnalysis.length).toBeGreaterThan(0);

    // Check financial impact breakdown
    expect(result.totalFinancialImpact).toContain('₹');
    expect(result.financialBreakdown.length).toBeGreaterThanOrEqual(1);

    // Check legal citations
    expect(result.applicableLaw.length).toBeGreaterThanOrEqual(1);
    expect(result.applicableLaw[0].officialSourceUrl).toBeDefined();

    // Check timeline steps
    expect(result.timeline.length).toBeGreaterThanOrEqual(2);
  });
});
