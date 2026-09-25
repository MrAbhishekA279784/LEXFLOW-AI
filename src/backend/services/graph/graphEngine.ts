import { 
  LegalGraph, 
  GraphNode, 
  GraphEdge, 
  LegalModelData, 
  GraphNodeType,
  GraphRelationshipType,
  LegalAuthority 
} from '../../types/backendTypes';
import { ClauseItem } from '../../../types';
import { logger } from '../../utils/logger';

export interface GraphValidationResult {
  isValid: boolean;
  errors: string[];
  validatedGraph: LegalGraph;
}

export class GraphEngine {
  public static readonly VALID_NODE_TYPES: Set<GraphNodeType> = new Set([
    'Party', 'Obligation', 'Right', 'Payment', 'Deadline', 
    'Condition', 'Event', 'Penalty', 'Consequence', 'Action', 
    'Statute', 'Section', 'Rule', 'Regulation', 'Judgment'
  ]);

  public static readonly VALID_RELATIONSHIPS: Set<GraphRelationshipType> = new Set([
    'OWES', 'REQUIRES', 'TRIGGERS', 'DEPENDS_ON', 'LEADS_TO', 
    'EXPIRES_ON', 'PROTECTED_BY', 'CONFLICTS_WITH', 'SUPPORTED_BY', 'APPLIES_TO'
  ]);

  /**
   * Generates a fully connected Legal Action Graph from structured Legal Model facts,
   * document clauses, and verified legal authorities.
   */
  static buildGraph(
    modelOrDocId: string | LegalModelData, 
    maybeModel?: LegalModelData, 
    clauses: ClauseItem[] = [], 
    authorities: LegalAuthority[] = []
  ): LegalGraph {
    let documentId: string;
    let model: LegalModelData;

    if (typeof modelOrDocId === 'string') {
      documentId = modelOrDocId;
      model = maybeModel || {
        documentId,
        parties: [],
        obligations: [],
        rights: [],
        deadlines: [],
        conditions: [],
        payments: [],
        penalties: [],
        termination: [],
        events: [],
        dependencies: [],
        conflicts: []
      };
    } else {
      model = modelOrDocId;
      documentId = model.documentId || 'doc-default';
    }

    const rawNodes: GraphNode[] = [];
    const rawEdges: GraphEdge[] = [];
    const partyMap = new Map<string, string>(); // normalized role/name -> nodeId

    // 1. Party Nodes (deduplicated by normalized identifier/role)
    (model.parties || []).forEach((p, idx) => {
      const normalizedKey = (p.role || p.name || `party-${idx}`).toLowerCase().trim();
      const nodeId = `party-${p.id || idx}`;
      
      if (!partyMap.has(normalizedKey)) {
        partyMap.set(normalizedKey, nodeId);
        if (p.role) partyMap.set(p.role.toLowerCase().trim(), nodeId);

        rawNodes.push({
          id: nodeId,
          documentId,
          type: 'Party',
          label: p.name ? `${p.name} (${p.role || 'Party'})` : (p.role ? p.role.toUpperCase() : `Party ${idx + 1}`),
          description: `Contractual Party · Role: ${p.role || 'Signatory'}`,
          data: { role: p.role, identifier: p.identifier },
          sourceClauseId: p.sourceClauseId,
          sourcePage: p.sourcePage,
          createdAt: new Date().toISOString()
        });
      }
    });

    // 2. Obligation Nodes
    (model.obligations || []).forEach((obl, idx) => {
      const oblNodeId = `obl-${obl.id || idx}`;
      rawNodes.push({
        id: oblNodeId,
        documentId,
        type: 'Obligation',
        label: obl.description,
        description: `Obligation to perform by ${obl.actor || 'party'}${obl.dueDay ? ` on Day ${obl.dueDay}` : ''}`,
        data: { actor: obl.actor, action: obl.action, dueDay: obl.dueDay, conditions: obl.conditions },
        sourceClauseId: obl.sourceClauseId,
        sourcePage: obl.sourcePage,
        createdAt: new Date().toISOString()
      });

      // Connect Party -> Obligation (OWES)
      const actorKey = (obl.actor || '').toLowerCase().trim();
      const partyNodeId = partyMap.get(actorKey) || (rawNodes.find(n => n.type === 'Party')?.id);
      if (partyNodeId) {
        rawEdges.push({
          id: `edge-owes-${obl.id || idx}`,
          documentId,
          source: partyNodeId,
          target: oblNodeId,
          relationship: 'OWES',
          label: 'OWES',
          sourceClauseId: obl.sourceClauseId,
          weight: 1.0,
          createdAt: new Date().toISOString()
        });
      }
    });

    // 3. Payment Nodes
    (model.payments || []).forEach((pmt, idx) => {
      const pmtNodeId = `pmt-${pmt.id || idx}`;
      const amountStr = (pmt.amount || 0).toLocaleString('en-IN');
      const purposeStr = (pmt.purpose || 'Payment').toUpperCase();

      rawNodes.push({
        id: pmtNodeId,
        documentId,
        type: 'Payment',
        label: `${purposeStr}: ₹${amountStr}`,
        description: `Financial consideration: ₹${amountStr} (${pmt.frequency || 'fixed'})`,
        data: { amount: pmt.amount, currency: pmt.currency || 'INR', frequency: pmt.frequency, payer: pmt.payer },
        sourceClauseId: pmt.sourceClauseId,
        sourcePage: pmt.sourcePage,
        createdAt: new Date().toISOString()
      });

      // Edge from payer party -> payment (OWES)
      const payerKey = (pmt.payer || '').toLowerCase().trim();
      const payerPartyId = partyMap.get(payerKey) || (rawNodes.find(n => n.type === 'Party')?.id);
      if (payerPartyId) {
        rawEdges.push({
          id: `edge-pays-${pmt.id || idx}`,
          documentId,
          source: payerPartyId,
          target: pmtNodeId,
          relationship: 'OWES',
          label: `Pays ${pmt.purpose || 'Amount'}`,
          sourceClauseId: pmt.sourceClauseId,
          weight: 1.0,
          createdAt: new Date().toISOString()
        });
      }

      // If an obligation matches payment action, link Obligation -> Payment (REQUIRES)
      const relatedObl = rawNodes.find(n => n.type === 'Obligation' && (n.label.toLowerCase().includes('pay') || n.label.toLowerCase().includes('rent')));
      if (relatedObl) {
        rawEdges.push({
          id: `edge-req-pmt-${pmt.id || idx}`,
          documentId,
          source: relatedObl.id,
          target: pmtNodeId,
          relationship: 'REQUIRES',
          label: 'REQUIRES',
          sourceClauseId: pmt.sourceClauseId,
          weight: 1.0,
          createdAt: new Date().toISOString()
        });
      }
    });

    // 4. Deadline Nodes
    (model.deadlines || []).forEach((d, idx) => {
      const dNodeId = `dl-${d.id || idx}`;
      rawNodes.push({
        id: dNodeId,
        documentId,
        type: 'Deadline',
        label: d.description || `Due within ${d.durationDays || 30} days`,
        description: `Stipulated temporal deadline: ${d.durationDays ? `${d.durationDays} days` : 'specified period'} triggered by ${d.triggerEvent || 'event'}`,
        data: { actor: d.actor, durationDays: d.durationDays, triggerEvent: d.triggerEvent, mandatory: d.mandatory },
        sourceClauseId: d.sourceClauseId,
        sourcePage: d.sourcePage,
        createdAt: new Date().toISOString()
      });

      // Connect Payment or Obligation -> Deadline (EXPIRES_ON)
      const targetPmt = rawNodes.find(n => n.type === 'Payment');
      if (targetPmt) {
        rawEdges.push({
          id: `edge-dl-${d.id || idx}`,
          documentId,
          source: targetPmt.id,
          target: dNodeId,
          relationship: 'EXPIRES_ON',
          label: 'EXPIRES_ON',
          sourceClauseId: d.sourceClauseId,
          weight: 1.0,
          createdAt: new Date().toISOString()
        });
      }
    });

    // 5. Conditions & Penalty Triggers
    (model.conditions || []).forEach((cnd, idx) => {
      const cndNodeId = `cnd-${cnd.id || idx}`;
      rawNodes.push({
        id: cndNodeId,
        documentId,
        type: 'Condition',
        label: cnd.description,
        description: `Condition predicate: ${cnd.predicate || 'breach or default trigger'}`,
        data: { predicate: cnd.predicate, outcomes: cnd.outcomes },
        sourceClauseId: cnd.sourceClauseId,
        sourcePage: cnd.sourcePage,
        createdAt: new Date().toISOString()
      });

      // Connect related obligation -> condition (DEPENDS_ON)
      const relatedObl = rawNodes.find(n => n.type === 'Obligation');
      if (relatedObl) {
        rawEdges.push({
          id: `edge-cnd-dep-${cnd.id || idx}`,
          documentId,
          source: relatedObl.id,
          target: cndNodeId,
          relationship: 'DEPENDS_ON',
          label: 'DEPENDS_ON',
          sourceClauseId: cnd.sourceClauseId,
          weight: 1.0,
          createdAt: new Date().toISOString()
        });
      }
    });

    // 6. Penalty Nodes
    (model.penalties || []).forEach((pen, idx) => {
      const penNodeId = `pen-${pen.id || idx}`;
      rawNodes.push({
        id: penNodeId,
        documentId,
        type: 'Penalty',
        label: `Penalty: ${pen.description}`,
        description: `Contractual penalty rate: ${pen.rate ? `₹${pen.rate}` : ''} ${pen.rateUnit || ''}`,
        data: { penaltyType: pen.penaltyType, rate: pen.rate, rateUnit: pen.rateUnit },
        sourceClauseId: pen.sourceClauseId,
        sourcePage: pen.sourcePage,
        createdAt: new Date().toISOString()
      });

      // Connect condition -> penalty (TRIGGERS)
      const conditionNode = rawNodes.find(n => n.type === 'Condition');
      if (conditionNode) {
        rawEdges.push({
          id: `edge-trig-${conditionNode.id}-${pen.id || idx}`,
          documentId,
          source: conditionNode.id,
          target: penNodeId,
          relationship: 'TRIGGERS',
          label: 'TRIGGERS',
          sourceClauseId: pen.sourceClauseId,
          weight: 1.0,
          createdAt: new Date().toISOString()
        });
      }
    });

    // 7. Termination & Consequence Nodes
    (model.termination || []).forEach((term, idx) => {
      const termNodeId = `term-${term.id || idx}`;
      rawNodes.push({
        id: termNodeId,
        documentId,
        type: 'Consequence',
        label: `Termination: ${term.noticePeriodDays ? `${term.noticePeriodDays}-Day Notice` : (term.grounds || 'Determination')}`,
        description: `Contractual termination rights & consequences: ${term.grounds || 'convenience or breach'}`,
        data: { noticeDays: term.noticePeriodDays, grounds: term.grounds, consequences: term.consequences },
        sourceClauseId: term.sourceClauseId,
        sourcePage: term.sourcePage,
        createdAt: new Date().toISOString()
      });

      // Link condition or penalty -> consequence (LEADS_TO)
      const conditionNode = rawNodes.find(n => n.type === 'Condition');
      if (conditionNode) {
        rawEdges.push({
          id: `edge-leads-term-${idx}`,
          documentId,
          source: conditionNode.id,
          target: termNodeId,
          relationship: 'LEADS_TO',
          label: 'LEADS_TO',
          sourceClauseId: term.sourceClauseId,
          weight: 1.0,
          createdAt: new Date().toISOString()
        });
      }
    });

    // 8. Rights Nodes
    (model.rights || []).forEach((r, idx) => {
      const rNodeId = `right-${r.id || idx}`;
      rawNodes.push({
        id: rNodeId,
        documentId,
        type: 'Right',
        label: r.description,
        description: `Contractual right entitled to ${r.beneficiary || 'beneficiary'}`,
        data: { beneficiary: r.beneficiary, conditions: r.conditions },
        sourceClauseId: r.sourceClauseId,
        sourcePage: r.sourcePage,
        createdAt: new Date().toISOString()
      });

      const holderKey = (r.beneficiary || '').toLowerCase().trim();
      const partyId = partyMap.get(holderKey) || (rawNodes.find(n => n.type === 'Party')?.id);
      if (partyId) {
        rawEdges.push({
          id: `edge-right-${idx}`,
          documentId,
          source: partyId,
          target: rNodeId,
          relationship: 'PROTECTED_BY',
          label: 'Entitled to right',
          sourceClauseId: r.sourceClauseId,
          weight: 1.0,
          createdAt: new Date().toISOString()
        });
      }
    });

    // 9. Grounded Legal Authorities (Statute & Judgment)
    const authoritiesToUse = (authorities && authorities.length > 0)
      ? authorities
      : [
          {
            id: 'stat-ica-74',
            sourceType: 'central_act' as const,
            title: 'Indian Contract Act 1872',
            actOrCourt: 'Indian Contract Act, 1872',
            sectionOrArticle: 'Section 74',
            officialSourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2187',
            summary: 'Reasonable compensation for breach of contract where penalty stipulated.'
          },
          {
            id: 'jdg-kailash-nath-2015',
            sourceType: 'judgment' as const,
            title: 'Kailash Nath Associates v. DDA (2015) 4 SCC 136',
            actOrCourt: 'Supreme Court of India',
            sectionOrArticle: 'Paragraph 43',
            officialSourceUrl: 'https://main.sci.gov.in/judgment/judis/42318.pdf',
            summary: 'Forfeiture of earnest money or security deposit requires actual damage or loss to be proved.'
          }
        ];

    let statuteNodeId: string | null = null;
    let judgmentNodeId: string | null = null;

    authoritiesToUse.slice(0, 3).forEach((auth, idx) => {
      const authNodeId = `auth-${auth.id || idx}`;
      const isJudgment = auth.sourceType === 'judgment';
      
      rawNodes.push({
        id: authNodeId,
        documentId,
        type: isJudgment ? 'Judgment' : 'Statute',
        label: `${auth.actOrCourt} - ${auth.sectionOrArticle}`,
        description: auth.summary || auth.title,
        data: {
          actOrCourt: auth.actOrCourt,
          section: auth.sectionOrArticle,
          url: auth.officialSourceUrl,
          citation: auth.title
        },
        createdAt: new Date().toISOString()
      });

      if (isJudgment && !judgmentNodeId) judgmentNodeId = authNodeId;
      if (!isJudgment && !statuteNodeId) statuteNodeId = authNodeId;
    });

    // Edge: Statute -> Judgment (SUPPORTED_BY)
    if (statuteNodeId && judgmentNodeId) {
      rawEdges.push({
        id: 'edge-stat-jdg',
        documentId,
        source: statuteNodeId,
        target: judgmentNodeId,
        relationship: 'SUPPORTED_BY',
        label: 'SUPPORTED_BY',
        weight: 1.0,
        createdAt: new Date().toISOString()
      });
    }

    // Edge: Penalty / Right -> Statute (PROTECTED_BY)
    const penaltyNode = rawNodes.find(n => n.type === 'Penalty');
    if (penaltyNode && statuteNodeId) {
      rawEdges.push({
        id: 'edge-pen-protection',
        documentId,
        source: penaltyNode.id,
        target: statuteNodeId,
        relationship: 'PROTECTED_BY',
        label: 'PROTECTED_BY',
        weight: 1.0,
        createdAt: new Date().toISOString()
      });
    }

    // 10. Compute Deterministic Hierarchical Layout Positions
    this.layoutNodes(rawNodes);

    // 11. Validate and Assemble Final Graph
    const validation = this.validateGraph({
      documentId,
      nodes: rawNodes,
      edges: rawEdges,
      metadata: {
        generatedAt: new Date().toISOString(),
        nodeCount: rawNodes.length,
        edgeCount: rawEdges.length
      }
    }, clauses);

    return validation.validatedGraph;
  }

  /**
   * Deterministic hierarchical layout positioning for visual clarity.
   * Divides graph into clean vertical layers and evenly spaced horizontal columns.
   */
  public static layoutNodes(nodes: GraphNode[]): void {
    const layerHierarchy: Record<GraphNodeType, number> = {
      Party: 0,
      Obligation: 1,
      Right: 1,
      Payment: 2,
      Condition: 2,
      Deadline: 3,
      Penalty: 3,
      Event: 3,
      Consequence: 4,
      Action: 4,
      Statute: 5,
      Section: 5,
      Rule: 5,
      Regulation: 5,
      Judgment: 5
    };

    const layers: Map<number, GraphNode[]> = new Map();
    nodes.forEach(node => {
      const layer = layerHierarchy[node.type] ?? 2;
      if (!layers.has(layer)) layers.set(layer, []);
      layers.get(layer)!.push(node);
    });

    const startY = 60;
    const layerSpacingY = 160;
    const canvasWidth = 960;

    Array.from(layers.keys()).sort((a, b) => a - b).forEach(layerIndex => {
      const layerNodes = layers.get(layerIndex)!;
      const count = layerNodes.length;
      const spacingX = canvasWidth / (count + 1);
      const currentY = startY + (layerIndex * layerSpacingY);

      layerNodes.forEach((node, colIdx) => {
        node.position = {
          x: Math.round(spacingX * (colIdx + 1) - 100),
          y: currentY
        };
      });
    });
  }

  /**
   * Validates legal graph structural integrity:
   * 1. Nodes have valid types and IDs.
   * 2. Edges have valid sources and targets (no dangling edges).
   * 3. Clause IDs match existing document clauses.
   * 4. Edge relationships are within canonical enum.
   */
  static validateGraph(graph: LegalGraph, clauses: ClauseItem[] = []): GraphValidationResult {
    const errors: string[] = [];
    const validNodes: GraphNode[] = [];
    const nodeIds = new Set<string>();

    const validClauseIds = new Set(clauses.map(c => c.id));

    // 1. Validate Nodes
    for (const node of graph.nodes) {
      if (!node.id || node.id.trim() === '') {
        errors.push(`Node rejected: missing node id.`);
        continue;
      }
      if (nodeIds.has(node.id)) {
        errors.push(`Duplicate node id "${node.id}" detected. Skipping duplicate.`);
        continue;
      }
      if (!this.VALID_NODE_TYPES.has(node.type)) {
        errors.push(`Node "${node.id}" has invalid type "${node.type}".`);
        continue;
      }
      if (node.sourceClauseId && validClauseIds.size > 0 && !validClauseIds.has(node.sourceClauseId)) {
        // Warning: clause ref not found in supplied clauses list
        logger.warn(`Node "${node.id}" references unverified clause "${node.sourceClauseId}".`);
      }

      nodeIds.add(node.id);
      validNodes.push({
        ...node,
        documentId: graph.documentId || node.documentId
      });
    }

    // 2. Validate Edges (No dangling edges)
    const validEdges: GraphEdge[] = [];
    for (const edge of graph.edges) {
      if (!edge.source || !edge.target) {
        errors.push(`Edge "${edge.id}" rejected: missing source or target.`);
        continue;
      }
      if (!nodeIds.has(edge.source)) {
        errors.push(`Edge "${edge.id}" rejected: source node "${edge.source}" does not exist in graph.`);
        continue;
      }
      if (!nodeIds.has(edge.target)) {
        errors.push(`Edge "${edge.id}" rejected: target node "${edge.target}" does not exist in graph.`);
        continue;
      }
      if (!this.VALID_RELATIONSHIPS.has(edge.relationship)) {
        errors.push(`Edge "${edge.id}" rejected: invalid relationship "${edge.relationship}".`);
        continue;
      }

      validEdges.push({
        ...edge,
        documentId: graph.documentId || edge.documentId
      });
    }

    const validatedGraph: LegalGraph = {
      documentId: graph.documentId,
      versionId: graph.versionId,
      nodes: validNodes,
      edges: validEdges,
      metadata: {
        generatedAt: graph.metadata?.generatedAt || new Date().toISOString(),
        nodeCount: validNodes.length,
        edgeCount: validEdges.length,
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      }
    };

    return {
      isValid: errors.length === 0,
      errors,
      validatedGraph
    };
  }

  /**
   * Bounded graph traversal from scenario event triggers to consequences and legal protections
   */
  static traverseScenario(
    graph: LegalGraph, 
    startNodeIds: string | string[], 
    maxDepth = 4
  ): string[] & { visitedNodeIds: string[]; triggeredEdges: GraphEdge[]; consequenceNodes: GraphNode[] } {
    const visited = new Set<string>();
    const triggeredEdges: GraphEdge[] = [];
    const queue: Array<{ nodeId: string; depth: number }> = [];

    const startArray = Array.isArray(startNodeIds) ? startNodeIds : [startNodeIds];

    startArray.forEach(id => {
      if (graph.nodes.some(n => n.id === id)) {
        queue.push({ nodeId: id, depth: 0 });
        visited.add(id);
      }
    });

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

    const visitedList = Array.from(visited);
    const resultObj = Object.assign([...visitedList], {
      visitedNodeIds: visitedList,
      triggeredEdges,
      consequenceNodes,
    });

    return resultObj as string[] & { visitedNodeIds: string[]; triggeredEdges: GraphEdge[]; consequenceNodes: GraphNode[] };
  }
}
