import { getSupabaseClient } from '../../db/client';
import { memoryStore } from '../memoryStore';
import { IGraphRepository } from '../types';
import { LegalGraph, GraphNode, GraphEdge, GraphNodeType, GraphRelationshipType } from '../../types/backendTypes';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';

export class SupabaseGraphRepository implements IGraphRepository {
  private static hasLoggedFallbackNotice = false;

  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV !== 'production' || !!process.env.VITEST;
  }

  private async handleFallback<T>(operation: string, err: unknown, memoryFallback: () => Promise<T>): Promise<T> {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (this.isTestEnvironment()) {
      if (!SupabaseGraphRepository.hasLoggedFallbackNotice) {
        SupabaseGraphRepository.hasLoggedFallbackNotice = true;
        logger.info(`Supabase not configured; operating with in-memory persistence store.`);
      }
      return memoryFallback();
    }
    logger.error(`Database error in ${operation}`, { error: errorMsg });
    throw new DatabaseError(`Database operation failed during ${operation}: ${errorMsg}`);
  }

  async saveGraph(documentId: string, graph: LegalGraph, userId?: string): Promise<LegalGraph> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('save graph', 'Supabase client not initialized', () => memoryStore.saveGraph(documentId, graph));

    try {
      if (graph.nodes && graph.nodes.length > 0) {
        const nodeRows = graph.nodes.map((n) => ({
          id: n.id,
          document_id: documentId,
          node_type: n.type,
          label: n.label,
          description: n.description || '',
          data: n.data || {},
          source_clause_id: n.sourceClauseId || null,
          source_page: n.sourcePage || null,
        }));
        await supabase.from('graph_nodes').upsert(nodeRows);
      }

      if (graph.edges && graph.edges.length > 0) {
        const edgeRows = graph.edges.map((e) => ({
          id: e.id,
          document_id: documentId,
          source_node_id: e.source,
          target_node_id: e.target,
          relationship: e.relationship,
          label: e.label || '',
          weight: e.weight || 1.0,
          metadata: e.metadata || {},
          source_clause_id: e.sourceClauseId || null,
        }));
        await supabase.from('graph_edges').upsert(edgeRows);
      }

      return graph;
    } catch (err) {
      return this.handleFallback('save graph', err, () => memoryStore.saveGraph(documentId, graph));
    }
  }

  async getGraphByDocument(documentId: string, userId?: string): Promise<LegalGraph | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('get graph by document', 'Supabase client not initialized', () => memoryStore.getGraphByDocument(documentId, userId));

    try {
      const [nodesRes, edgesRes] = await Promise.all([
        supabase.from('graph_nodes').select('*').eq('document_id', documentId),
        supabase.from('graph_edges').select('*').eq('document_id', documentId),
      ]);

      if (nodesRes.error || !nodesRes.data || nodesRes.data.length === 0) {
        const memGraph = await memoryStore.getGraphByDocument(documentId, userId);
        return memGraph;
      }

      const nodes: GraphNode[] = nodesRes.data.map((n) => ({
        id: n.id,
        type: n.node_type as GraphNodeType,
        label: n.label,
        description: n.description,
        data: (n.data as Record<string, unknown>) || {},
        sourceClauseId: n.source_clause_id,
        sourcePage: n.source_page,
      }));

      const edges: GraphEdge[] = (edgesRes.data || []).map((e) => ({
        id: e.id,
        source: e.source_node_id,
        target: e.target_node_id,
        relationship: e.relationship as GraphRelationshipType,
        label: e.label,
        weight: e.weight,
        metadata: (e.metadata as Record<string, unknown>) || {},
        sourceClauseId: e.source_clause_id,
      }));

      return {
        documentId,
        nodes,
        edges,
        metadata: {
          generatedAt: new Date().toISOString(),
          nodeCount: nodes.length,
          edgeCount: edges.length,
          isValid: true,
        },
      };
    } catch (err) {
      return this.handleFallback('get graph by document', err, () => memoryStore.getGraphByDocument(documentId, userId));
    }
  }
}
