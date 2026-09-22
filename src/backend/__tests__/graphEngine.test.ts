import { describe, it, expect } from 'vitest';
import { GraphEngine } from '../services/graph/graphEngine';
import { LegalModelData } from '../types/backendTypes';

const mockModel: LegalModelData = {
  documentId: 'doc-test-1',
  parties: [
    { id: 'p1', name: 'Dr. Ramesh Sharma', role: 'landlord' },
    { id: 'p2', name: 'Ahamed Khan', role: 'tenant' }
  ],
  obligations: [
    {
      id: 'ob-1',
      actor: 'tenant',
      action: 'Pay monthly rent on or before 5th of each month',
      description: 'Pay monthly rent of ₹25,000 on or before 5th of each month',
      sourceClauseId: 'c-4.1',
      sourcePage: 2,
      confidence: 0.95
    }
  ],
  rights: [],
  deadlines: [],
  conditions: [],
  payments: [
    {
      id: 'pay-1',
      payer: 'tenant',
      payee: 'landlord',
      amount: 25000,
      currency: 'INR',
      frequency: 'monthly',
      purpose: 'rent',
      sourceClauseId: 'c-4.1',
      sourcePage: 2
    }
  ],
  penalties: [
    {
      id: 'pen-1',
      actorSubject: 'tenant',
      triggerCondition: 'Payment delayed past 8th',
      description: 'Daily late charge of ₹500',
      penaltyType: 'daily_fine',
      rate: 500,
      rateUnit: 'per_day',
      sourceClauseId: 'c-4.3',
      sourcePage: 2
    }
  ],
  termination: [],
  events: [],
  dependencies: [],
  conflicts: []
};

describe('GraphEngine & Traversal', () => {
  it('should build a multi-node typed graph from LegalModelData', () => {
    const graph = GraphEngine.buildGraph(mockModel);
    
    expect(graph.nodes.length).toBeGreaterThanOrEqual(4);
    expect(graph.edges.length).toBeGreaterThanOrEqual(3);

    const partyNodes = graph.nodes.filter(n => n.type === 'Party');
    expect(partyNodes.length).toBe(2);

    const obligationNodes = graph.nodes.filter(n => n.type === 'Obligation');
    expect(obligationNodes.length).toBe(1);
  });

  it('should traverse scenario consequences without infinite cycles', () => {
    const graph = GraphEngine.buildGraph(mockModel);
    const traversal = GraphEngine.traverseScenario(graph, ['party-p2'], 3);

    expect(traversal.visitedNodeIds.length).toBeGreaterThanOrEqual(2);
    expect(traversal.triggeredEdges.length).toBeGreaterThanOrEqual(1);
  });
});
