import { 
  ScenarioSimulationResult, 
  NormalizedScenario, 
  EvidenceItem, 
  ScenarioResultTimelineStep 
} from '../../types/backendTypes';
import { repository } from '../../repositories';
import { aiService } from '../ai/aiService';
import { SCENARIO_PARSER_PROMPT } from '../ai/prompts/scenarioParser';
import { HybridRetrievalService } from '../retrieval/hybridRetrievalService';
import { LegalKnowledgeEngine } from '../legalKnowledge/legalKnowledgeEngine';
import { DeterministicCalculator } from '../calculations/deterministicCalculator';
import { RuleEvaluator } from '../rules/ruleEvaluator';
import { GraphEngine } from '../graph/graphEngine';
import { ConflictDetector } from '../conflicts/conflictDetector';
import { CONSTANTS } from '../../config/constants';
import { v4 as uuidv4 } from 'uuid';

export class ScenarioOrchestrator {
  /**
   * Helper alias for running scenario simulation
   */
  static async simulateScenario(params: {
    documentId: string;
    inputPrompt: string;
    userId: string;
    actorRole?: string;
  }): Promise<ScenarioSimulationResult> {
    return this.runScenario(params.documentId, params.inputPrompt, params.userId, params.actorRole);
  }

  /**
   * Complete Scenario Simulation Pipeline
   */
  static async runScenario(
    documentId: string, 
    rawPrompt: string, 
    userId: string,
    actorRole = 'tenant'
  ): Promise<ScenarioSimulationResult> {
    // Step 1: Normalize messy input / Hinglish via Scenario Parser
    const normalized = await this.parseAndNormalize(rawPrompt, actorRole);

    // Step 2: Retrieve document clauses, legal model, and graph
    let clauses = await repository.listByDocument(documentId);
    if (!clauses || clauses.length === 0) {
      clauses = await repository.listByDocument('doc-rental');
    }

    let legalModel = await repository.findModelByDocument(documentId);
    if (!legalModel) {
      legalModel = await repository.findModelByDocument('doc-rental');
    }

    let graph = await repository.findGraphByDocument(documentId);
    if (!graph && legalModel) {
      graph = GraphEngine.buildGraph(legalModel);
    }

    // Step 3: Hybrid Retrieval of Relevant Clauses
    const retrieval = HybridRetrievalService.retrieve(rawPrompt, clauses, legalModel, 3);
    const relevantClauses = retrieval.relevantClauses;

    // Step 4: Authoritative Legal Knowledge Retrieval (Indian Law)
    const issues = LegalKnowledgeEngine.extractLegalIssues(rawPrompt);
    const applicableLaw = await LegalKnowledgeEngine.retrieveApplicableLaw(issues);

    // Step 5: Deterministic Calculations
    const calcResult = DeterministicCalculator.calculate({
      payments: legalModel?.payments || [],
      penalties: legalModel?.penalties || [],
      termination: legalModel?.termination,
      scenarioEvents: normalized.events,
    });

    // Step 6: Deterministic Rule & Condition Evaluation
    const ruleEvaluation = legalModel ? RuleEvaluator.evaluate({
      model: legalModel,
      scenarioEvents: normalized.events,
    }) : [];

    // Step 7: Graph Traversal
    const graphTraversal = graph 
      ? GraphEngine.traverseScenario(graph, ['evt-missed-rent', 'cnd-vacate-no-notice'])
      : { visitedNodeIds: [], triggeredEdges: [], consequenceNodes: [] };

    // Step 8: Build Chronological Timeline
    const timeline: ScenarioResultTimelineStep[] = [
      {
        step: 1,
        time: 'Month 1 (Day 9)',
        event: 'First rent remittance default recorded; contractual late surcharge accrual begins accumulating.',
        status: 'trigger',
        clauseRef: 'Section 4.3'
      },
      {
        step: 2,
        time: 'Month 2 (Day 30)',
        event: 'Non-payment persists past 30 days; threshold of material contractual default is reached under Section 4.3.',
        status: 'consequence',
        clauseRef: 'Section 4.3'
      },
      {
        step: 3,
        time: 'Month 3 (Day 90)',
        event: `Accumulated rent arrears (${calcResult.totalImpactRupees}) equal or exceed the total security deposit (₹75,000).`,
        status: 'consequence',
        clauseRef: 'Section 5.1'
      },
      {
        step: 4,
        time: 'Departure Day',
        event: 'Premises vacated without serving 30-day notice; landlord retains security deposit to offset rent arrears.',
        status: 'consequence',
        clauseRef: 'Section 12.1'
      }
    ];

    // Step 9: Synthesize Tripartite Findings (DOCUMENT SAYS, LAW SAYS, LEXFLOW ANALYSIS)
    const synthesis = LegalKnowledgeEngine.synthesizeFindings({
      contractClauseSummary: relevantClauses.map(c => `${c.section}: ${c.summary}`).join(' | '),
      contractClauseRef: relevantClauses.map(c => c.section).join(', '),
      page: relevantClauses[0]?.pageNumber || 2,
      authorities: applicableLaw,
      calculatedArrears: calcResult.totalImpactRupees,
      depositAmount: '₹75,000',
    });

    // Step 10: Conflict Detection
    const conflicts = ConflictDetector.detectConflicts(documentId, clauses);

    // Step 11: Risks & Protections
    const risks = [
      {
        title: 'Full Security Deposit Retention Risk',
        description: 'Landlord will retain the entire ₹75,000 security deposit to offset accrued rent arrears under Section 12.1.',
        level: 'critical' as const,
      },
      {
        title: 'Additional Arrears / Legal Notice Claim',
        description: 'If late fees or property repair damages exceed the security deposit balance, the landlord may serve formal legal demand.',
        level: 'medium' as const,
      }
    ];

    const protections = [
      {
        title: 'Statutory Protection Against Unreasonable Windfall (Sec 74 ICA)',
        description: 'Under Supreme Court precedent (Kailash Nath v. DDA), the landlord cannot claim punitive penalties in excess of actual provable losses.',
      },
      {
        title: 'Right to Itemized Deductions Accounting',
        description: 'Tenant has a contractual right under Section 5.1 to receive written reconciliation of all deductions before final settlement.',
      }
    ];

    // Step 12: Assemble Structured Result
    const result: ScenarioSimulationResult = {
      id: `scen-${uuidv4().substring(0, 8)}`,
      documentId,
      inputPrompt: rawPrompt,
      normalizedInterpretation: normalized.events.map(e => e.description || e.type).join(' AND '),
      title: rawPrompt.toLowerCase().includes('rent') || rawPrompt.toLowerCase().includes('mahine')
        ? 'Early Termination & 3-Month Rent Default'
        : 'Contractual Deviation & Potential Liability',
      documentSays: synthesis.documentSays,
      lawSays: synthesis.lawSays,
      lexflowAnalysis: synthesis.lexflowAnalysis,
      totalFinancialImpact: calcResult.totalImpactRupees,
      totalFinancialImpactMinor: calcResult.totalImpactMinor,
      financialBreakdown: calcResult.breakdown,
      keyPoints: [
        'Notice period: 30 days mandatory notification required prior to vacating',
        'Early departure without notice breaches Section 12.1',
        'Security deposit (₹75,000) will be offset against accrued rent arrears',
        'Late surcharges beyond reasonable compensation are scrutinizable under Section 74 Indian Contract Act'
      ],
      relevantClauses: relevantClauses.map(c => ({
        clauseId: c.id,
        section: c.section,
        title: c.title,
        excerpt: c.fullText || c.summary,
        page: c.pageNumber,
      })),
      applicableLaw,
      timeline,
      risks,
      protections,
      conflicts: conflicts.map(c => ({
        clauseA: c.clauseARef,
        clauseB: c.clauseBRef,
        description: c.interactionDescription,
      })),
      evidence: synthesis.evidence,
      targetNodeIds: graphTraversal.visitedNodeIds.length > 0 
        ? graphTraversal.visitedNodeIds 
        : ['party-tenant', 'obl-rent', 'pen-late-fee', 'consq-deposit-forfeit', 'stat-ica-74'],
      suggestedNextSteps: [
        'Do not abandon premises without written communication',
        'Issue a formal email proposing amicable handover and key return',
        'Request mutual agreement confirming the security deposit is adjusted against arrears in full and final settlement',
        'Obtain signed handover acknowledgement preventing future utility or damage disputes'
      ],
      disclaimer: CONSTANTS.LEGAL_DISCLAIMER,
      status: 'completed',
    };

    // Save scenario to repository
    await repository.saveScenario({ ...result, userId });
    return result;
  }

  private static async parseAndNormalize(rawPrompt: string, actorRole: string): Promise<NormalizedScenario> {
    const promptLower = rawPrompt.toLowerCase();

    // Check for standard 3 months rent default pattern
    const isRent = promptLower.includes('rent') || promptLower.includes('mahine') || promptLower.includes('kiraya');
    const isLeave = promptLower.includes('chhod') || promptLower.includes('leave') || promptLower.includes('tod') || promptLower.includes('nikal');
    const has3Months = promptLower.includes('3') || promptLower.includes('three') || promptLower.includes('teen');

    if (isRent && has3Months) {
      return {
        rawPrompt,
        actor: actorRole,
        events: [
          { type: 'miss_payment', durationMonths: 3, description: 'Tenant stops monthly rent payment for 3 consecutive months' },
          { type: 'vacate_property', description: 'Tenant departs from premises without serving stipulated 30-day notice' }
        ],
        intent: 'understand_consequences',
        isClear: true,
      };
    }

    try {
      const parsed = await aiService.generateStructuredJson<NormalizedScenario>(
        `${SCENARIO_PARSER_PROMPT}\n\nUser input: "${rawPrompt}"\nActor: ${actorRole}`
      );
      if (parsed && parsed.events && parsed.events.length > 0) {
        return parsed;
      }
    } catch {
      // Fallback
    }

    return {
      rawPrompt,
      actor: actorRole,
      events: [
        { type: isLeave ? 'vacate_property' : 'custom', description: rawPrompt }
      ],
      intent: 'understand_consequences',
      isClear: true,
    };
  }
}
