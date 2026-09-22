import { 
  LegalGraph, 
  GraphNode, 
  GraphEdge, 
  LegalModelData, 
  GraphRelationshipType 
} from '../../types/backendTypes';

export class GraphEngine {
  /**
   * Generates a fully connected Legal Action Graph from structured Legal Model facts and authorities
   */
  static buildGraph(model: LegalModelData): LegalGraph {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // 1. Party Nodes
    (model.parties || []).forEach(p => {
      nodes.push({
        id: `party-${p.id}`,
        type: 'Party',
        label: `${p.name} (${p.role})`,
        data: { role: p.role, identifier: p.identifier },
        sourceClauseId: p.sourceClauseId,
        sourcePage: p.sourcePage,
      });
    });

    // 2. Obligation Nodes
    (model.obligations || []).forEach(obl => {
      const oblNodeId = `obl-${obl.id}`;
      nodes.push({
        id: oblNodeId,
        type: 'Obligation',
        label: obl.description,
        data: { actor: obl.actor, action: obl.action, dueDay: obl.dueDay },
        sourceClauseId: obl.sourceClauseId,
        sourcePage: obl.sourcePage,
      });

      // Edge from actor party to obligation
      const party = (model.parties || []).find(p => p.role === obl.actor);
      if (party) {
        edges.push({
          id: `edge-owes-${obl.id}`,
          source: `party-${party.id}`,
          target: oblNodeId,
          relationship: 'OWES',
          label: 'Obligated to perform',
        });
      }
    });

    // 3. Payment Nodes
    (model.payments || []).forEach(pmt => {
      const pmtNodeId = `pmt-${pmt.id}`;
      nodes.push({
        id: pmtNodeId,
        type: 'Payment',
        label: `${(pmt.purpose || 'PAYMENT').toUpperCase()}: ₹${(pmt.amount || 0).toLocaleString('en-IN')}`,
        data: { amount: pmt.amount, currency: pmt.currency, frequency: pmt.frequency },
        sourceClauseId: pmt.sourceClauseId,
        sourcePage: pmt.sourcePage,
      });

      // Edge from payer to payment
      const payerParty = (model.parties || []).find(p => p.role === pmt.payer);
      if (payerParty) {
        edges.push({
          id: `edge-pays-${pmt.id}`,
          source: `party-${payerParty.id}`,
          target: pmtNodeId,
          relationship: 'OWES',
          label: `Pays ${pmt.purpose}`,
        });
      }
    });

    // 4. Penalty Nodes & Conditions
    (model.penalties || []).forEach(pen => {
      const penNodeId = `pen-${pen.id}`;
      nodes.push({
        id: penNodeId,
        type: 'Penalty',
        label: `Penalty: ${pen.description}`,
        data: { penaltyType: pen.penaltyType, rate: pen.rate, rateUnit: pen.rateUnit },
        sourceClauseId: pen.sourceClauseId,
        sourcePage: pen.sourcePage,
      });
    });

    // 5. Conditions
    (model.conditions || []).forEach(cnd => {
      const cndNodeId = `cnd-${cnd.id}`;
      nodes.push({
        id: cndNodeId,
        type: 'Condition',
        label: cnd.description,
        data: { predicate: cnd.predicate, outcomes: cnd.outcomes },
        sourceClauseId: cnd.sourceClauseId,
        sourcePage: cnd.sourcePage,
      });

      // Connect condition to penalties or consequences
      (model.penalties || []).forEach(pen => {
        edges.push({
          id: `edge-trig-${cnd.id}-${pen.id}`,
          source: cndNodeId,
          target: `pen-${pen.id}`,
          relationship: 'TRIGGERS',
          label: 'Triggers on breach',
        });
      });
    });

    // 6. Connect Statutes & Legal Authorities
    const statIca = {
      id: 'stat-ica-74',
      type: 'Statute' as const,
      label: 'Indian Contract Act 1872, Sec 74 (Reasonable Compensation)',
      data: { act: 'ICA 1872', section: '74' }
    };
    const jdgKailash = {
      id: 'jdg-kailash-nath',
      type: 'Judgment' as const,
      label: 'Kailash Nath v. DDA (Deposit Forfeiture Proof of Loss)',
      data: { citation: '(2015) 4 SCC 136' }
    };
    nodes.push(statIca, jdgKailash);

    edges.push({
      id: 'edge-stat-jdg',
      source: statIca.id,
      target: jdgKailash.id,
      relationship: 'SUPPORTED_BY',
      label: 'Interprets penalty limits',
    });

    // Connect tenant protection
    const tenantParty = model.parties.find(p => p.role === 'tenant');
    if (tenantParty) {
      edges.push({
        id: 'edge-tenant-protection',
        source: `party-${tenantParty.id}`,
        target: statIca.id,
        relationship: 'PROTECTED_BY',
        label: 'Statutory protection against excessive forfeiture',
      });
    }

    return { nodes, edges };
  }

  /**
   * Bounded graph traversal from scenario event triggers to consequences and legal protections
   */
  static traverseScenario(
    graph: LegalGraph, 
    startNodeIds: string[], 
    maxDepth = 4
  ): { visitedNodeIds: string[]; triggeredEdges: GraphEdge[]; consequenceNodes: GraphNode[] } {
    const visited = new Set<string>();
    const triggeredEdges: GraphEdge[] = [];
    const queue: Array<{ nodeId: string; depth: number }> = [];

    startNodeIds.forEach(id => {
      if (graph.nodes.some(n => n.id === id)) {
        queue.push({ nodeId: id, depth: 0 });
        visited.add(id);
      }
    });

    // If starting nodes are not directly in graph, default to key event/condition nodes
    if (queue.length === 0) {
      const defaultStart = graph.nodes.find(n => n.type === 'Condition' || n.type === 'Event' || n.id.includes('missed') || n.id.includes('cnd'));
      if (defaultStart) {
        queue.push({ nodeId: defaultStart.id, depth: 0 });
        visited.add(defaultStart.id);
      }
    }

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;
      if (depth >= maxDepth) continue;

      const outgoing = graph.edges.filter(e => e.source === nodeId);
      for (const edge of outgoing) {
        triggeredEdges.push(edge);
        if (!visited.has(edge.target)) {
          visited.add(edge.target);
          queue.push({ nodeId: edge.target, depth: depth + 1 });
        }
      }
    }

    const consequenceNodes = graph.nodes.filter(
      n => visited.has(n.id) && (n.type === 'Consequence' || n.type === 'Penalty' || n.type === 'Statute' || n.type === 'Judgment')
    );

    return {
      visitedNodeIds: Array.from(visited),
      triggeredEdges,
      consequenceNodes,
    };
  }
}
