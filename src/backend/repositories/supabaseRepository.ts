import { getSupabaseClient } from '../db/client';
import { memoryStore } from './memoryStore';
import { 
  IDocumentRepository, 
  IClauseRepository, 
  ILegalModelRepository, 
  IGraphRepository, 
  IAnalysisJobRepository, 
  IScenarioRepository, 
  IRiskRepository, 
  IConflictRepository, 
  ILawyerKitRepository, 
  ILegalSourceRepository,
  IComplianceAuditRepository,
  DocumentRecord,
  AnalysisJobRecord 
} from './types';
import { 
  LegalModelData, 
  LegalGraph, 
  LegalAuthority, 
  ScenarioSimulationResult, 
  RiskFinding, 
  ConflictFinding, 
  LawyerKitData,
  DocumentStatus 
} from '../types/backendTypes';
import { ClauseItem, DocumentVersion } from '../../types';
import { ComplianceAuditRecord } from '../services/complianceAudit/types';
import { logger } from '../utils/logger';

export class SupabaseRepository implements 
  IDocumentRepository, 
  IClauseRepository, 
  ILegalModelRepository, 
  IGraphRepository, 
  IAnalysisJobRepository, 
  IScenarioRepository, 
  IRiskRepository, 
  IConflictRepository, 
  ILawyerKitRepository, 
  ILegalSourceRepository,
  IComplianceAuditRepository 
{
  // Documents
  async create(doc: Partial<DocumentRecord> & { userId: string; name: string; type: 'pdf' | 'docx' }): Promise<DocumentRecord> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.create(doc);

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert({
          user_id: doc.userId,
          name: doc.name,
          file_type: doc.type,
          file_size_bytes: 1024 * 1024,
          status: doc.status || 'uploaded',
          summary: doc.summary,
        })
        .select()
        .single();

      if (error || !data) throw error;
      return {
        id: data.id,
        name: data.name,
        type: data.file_type,
        size: doc.size || '1.2 MB',
        uploadedAt: data.created_at,
        status: data.status,
        color: data.file_type === 'pdf' ? 'red' : 'blue',
        userId: data.user_id,
        summary: data.summary,
      };
    } catch (err) {
      logger.warn('Supabase document create failed; falling back to memory store', { error: String(err) });
      return memoryStore.create(doc);
    }
  }

  async findById(id: string, userId?: string): Promise<DocumentRecord | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.findById(id, userId);

    try {
      let query = supabase.from('documents').select('*').eq('id', id);
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query.single();
      if (error || !data) return memoryStore.findById(id, userId);

      return {
        id: data.id,
        name: data.name,
        type: data.file_type,
        size: '1.5 MB',
        uploadedAt: data.created_at,
        status: data.status,
        color: data.file_type === 'pdf' ? 'red' : 'blue',
        userId: data.user_id,
        summary: data.summary,
      };
    } catch (err) {
      return memoryStore.findById(id, userId);
    }
  }

  async listByUser(userId: string): Promise<DocumentRecord[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.listByUser(userId);

    try {
      const { data, error } = await supabase.from('documents').select('*').eq('user_id', userId);
      if (error || !data || data.length === 0) return memoryStore.listByUser(userId);
      return data.map(d => ({
        id: d.id,
        name: d.name,
        type: d.file_type,
        size: '1.5 MB',
        uploadedAt: d.created_at,
        status: d.status,
        color: d.file_type === 'pdf' ? 'red' : 'blue',
        userId: d.user_id,
        summary: d.summary,
      }));
    } catch {
      return memoryStore.listByUser(userId);
    }
  }

  async updateStatus(id: string, status: DocumentStatus, updates?: Partial<DocumentRecord>): Promise<DocumentRecord> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.updateStatus(id, status, updates);

    try {
      await supabase.from('documents').update({ status, ...updates }).eq('id', id);
      return (await this.findById(id)) || memoryStore.updateStatus(id, status, updates);
    } catch {
      return memoryStore.updateStatus(id, status, updates);
    }
  }

  async delete(id: string, userId?: string): Promise<boolean> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.delete(id, userId);

    try {
      let query = supabase.from('documents').delete().eq('id', id);
      if (userId) query = query.eq('user_id', userId);
      const { error } = await query;
      return !error;
    } catch {
      return memoryStore.delete(id, userId);
    }
  }

  // Versioning methods
  async listVersions(documentId: string): Promise<DocumentVersion[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.listVersions(documentId);

    try {
      const { data, error } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return memoryStore.listVersions(documentId);
      }

      return data.map(d => ({
        id: d.id,
        documentId: d.document_id,
        versionNumber: d.version_number,
        title: d.title,
        timestamp: new Date(d.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: d.created_at,
        author: {
          name: d.author_name,
          role: d.author_role
        },
        summary: d.summary,
        changeType: d.change_type,
        changeCount: d.change_count,
        riskCount: d.risk_count,
        clauseCount: d.clause_count,
        changes: d.changes || [],
        snapshotClauses: d.snapshot_clauses || [],
        isCurrent: d.is_current,
        revertedFromVersion: d.reverted_from_version
      }));
    } catch {
      return memoryStore.listVersions(documentId);
    }
  }

  async saveVersion(documentId: string, version: Partial<DocumentVersion>): Promise<DocumentVersion> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.saveVersion(documentId, version);

    try {
      await supabase.from('document_versions').update({ is_current: false }).eq('document_id', documentId);

      const record = {
        document_id: documentId,
        version_number: version.versionNumber || 'v1.0',
        title: version.title || 'Amendment',
        author_name: version.author?.name || 'User',
        author_role: version.author?.role || 'User',
        summary: version.summary || '',
        change_type: version.changeType || 'clause_amendment',
        change_count: version.changes?.length || 0,
        risk_count: version.riskCount || 0,
        clause_count: version.clauseCount || 14,
        changes: version.changes || [],
        snapshot_clauses: version.snapshotClauses || [],
        is_current: true
      };

      const { data, error } = await supabase.from('document_versions').insert(record).select().single();
      if (error || !data) return memoryStore.saveVersion(documentId, version);

      return {
        id: data.id,
        documentId: data.document_id,
        versionNumber: data.version_number,
        title: data.title,
        timestamp: 'Just now',
        createdAt: data.created_at,
        author: {
          name: data.author_name,
          role: data.author_role
        },
        summary: data.summary,
        changeType: data.change_type,
        changeCount: data.change_count,
        riskCount: data.risk_count,
        clauseCount: data.clause_count,
        changes: data.changes || [],
        isCurrent: true
      };
    } catch {
      return memoryStore.saveVersion(documentId, version);
    }
  }

  async revertVersion(documentId: string, versionId: string, note?: string): Promise<{ document: DocumentRecord; version: DocumentVersion }> {
    return memoryStore.revertVersion(documentId, versionId, note);
  }

  // Clause methods
  async saveMany(documentId: string, clauses: ClauseItem[]): Promise<ClauseItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.saveMany(documentId, clauses);

    try {
      const records = clauses.map(c => ({
        id: c.id,
        document_id: documentId,
        section_ref: c.section,
        title: c.title,
        summary: c.summary,
        full_text: c.fullText,
        risk_level: c.riskLevel,
        party: c.party,
        page_number: c.pageNumber,
        penalties: c.penalties,
        obligations: c.obligations || [],
        rights: c.rights || []
      }));
      
      const { error } = await supabase.from('clauses').upsert(records);
      if (error) throw error;
      return clauses;
    } catch (err) {
      logger.error('Failed to save clauses to Supabase', { error: String(err) });
      return memoryStore.saveMany(documentId, clauses);
    }
  }

  async listByDocument(documentId: string): Promise<ClauseItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.listByDocument(documentId);

    try {
      const { data, error } = await supabase.from('clauses').select('*').eq('document_id', documentId);
      if (error) throw error;
      if (!data || data.length === 0) return memoryStore.listByDocument(documentId);
      
      return data.map(d => ({
        id: d.id,
        section: d.section_ref,
        title: d.title,
        summary: d.summary,
        fullText: d.full_text,
        riskLevel: d.risk_level,
        party: d.party,
        pageNumber: d.page_number,
        penalties: d.penalties,
        obligations: d.obligations,
        rights: d.rights
      }));
    } catch (err) {
      return memoryStore.listByDocument(documentId);
    }
  }

  async findClauseById(documentId: string, clauseId: string): Promise<ClauseItem | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.findClauseById(documentId, clauseId);

    try {
      const { data, error } = await supabase.from('clauses').select('*').eq('id', clauseId).eq('document_id', documentId).single();
      if (error || !data) return memoryStore.findClauseById(documentId, clauseId);
      
      return {
        id: data.id,
        section: data.section_ref,
        title: data.title,
        summary: data.summary,
        fullText: data.full_text,
        riskLevel: data.risk_level,
        party: data.party,
        pageNumber: data.page_number,
        penalties: data.penalties,
        obligations: data.obligations,
        rights: data.rights
      };
    } catch (err) {
      return memoryStore.findClauseById(documentId, clauseId);
    }
  }

  // Legal Model
  async saveModel(documentId: string, model: LegalModelData): Promise<LegalModelData> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.saveModel(documentId, model);

    try {
      const { error } = await supabase.from('legal_models').upsert({
        document_id: documentId,
        model_data: model,
        updated_at: new Date().toISOString()
      }, { onConflict: 'document_id' });
      
      if (error) throw error;
      return model;
    } catch (err) {
      logger.error('Failed to save legal model to Supabase', { error: String(err) });
      return memoryStore.saveModel(documentId, model);
    }
  }

  async findModelByDocument(documentId: string): Promise<LegalModelData | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.findModelByDocument(documentId);

    try {
      const { data, error } = await supabase.from('legal_models').select('model_data').eq('document_id', documentId).single();
      if (error || !data) return memoryStore.findModelByDocument(documentId);
      return data.model_data as LegalModelData;
    } catch (err) {
      return memoryStore.findModelByDocument(documentId);
    }
  }

  // Graph
  async saveGraph(documentId: string, graph: LegalGraph): Promise<LegalGraph> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.saveGraph(documentId, graph);

    try {
      const nodeRecords = graph.nodes.map(n => ({
        document_id: documentId,
        node_id: n.id,
        node_type: n.type,
        label: n.label,
        node_data: n.data || {}
      }));
      
      const edgeRecords = graph.edges.map(e => ({
        document_id: documentId,
        source_node_id: e.source,
        target_node_id: e.target,
        relationship: e.relationship,
        label: e.label || null
      }));

      // In real scenario we might need to delete old graph first, but upsert is fine for now if IDs match
      if (nodeRecords.length > 0) {
         await supabase.from('graph_nodes').upsert(nodeRecords, { onConflict: 'document_id,node_id' });
      }
      if (edgeRecords.length > 0) {
         await supabase.from('graph_edges').insert(edgeRecords); // edges don't have unique constraint for upsert in schema easily, skipping robust sync for this exercise
      }
      
      return graph;
    } catch (err) {
      logger.error('Failed to save graph to Supabase', { error: String(err) });
      return memoryStore.saveGraph(documentId, graph);
    }
  }

  async findGraphByDocument(documentId: string): Promise<LegalGraph | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.findGraphByDocument(documentId);

    try {
      const { data: nodes } = await supabase.from('graph_nodes').select('*').eq('document_id', documentId);
      const { data: edges } = await supabase.from('graph_edges').select('*').eq('document_id', documentId);
      
      if (!nodes || nodes.length === 0) return memoryStore.findGraphByDocument(documentId);

      return {
        nodes: nodes.map(n => ({ id: n.node_id, type: n.node_type as any, label: n.label, data: n.node_data })),
        edges: (edges || []).map(e => ({ id: e.id, source: e.source_node_id, target: e.target_node_id, relationship: e.relationship as any, label: e.label }))
      };
    } catch (err) {
      return memoryStore.findGraphByDocument(documentId);
    }
  }

  // Jobs
  async createJob(job: Omit<AnalysisJobRecord, 'id' | 'startedAt'>): Promise<AnalysisJobRecord> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.createJob(job);

    try {
      const { data, error } = await supabase.from('analysis_jobs').insert({
        document_id: job.documentId,
        user_id: job.userId,
        status: job.status,
        current_step: job.currentStep,
        progress_percentage: job.progressPercentage
      }).select().single();

      if (error || !data) throw error;
      return {
        id: data.id,
        documentId: data.document_id,
        userId: data.user_id,
        status: data.status as any,
        currentStep: data.current_step,
        progressPercentage: data.progress_percentage,
        startedAt: data.started_at,
      };
    } catch (err) {
      return memoryStore.createJob(job);
    }
  }

  async findJobById(id: string): Promise<AnalysisJobRecord | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.findJobById(id);

    try {
      const { data, error } = await supabase.from('analysis_jobs').select('*').eq('id', id).single();
      if (error || !data) return memoryStore.findJobById(id);
      return {
        id: data.id,
        documentId: data.document_id,
        userId: data.user_id,
        status: data.status as any,
        currentStep: data.current_step,
        progressPercentage: data.progress_percentage,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        errorMessage: data.error_message
      };
    } catch (err) {
      return memoryStore.findJobById(id);
    }
  }

  async findJobByDocument(documentId: string): Promise<AnalysisJobRecord | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.findJobByDocument(documentId);

    try {
      const { data, error } = await supabase.from('analysis_jobs').select('*').eq('document_id', documentId).order('started_at', { ascending: false }).limit(1).single();
      if (error || !data) return memoryStore.findJobByDocument(documentId);
      return {
        id: data.id,
        documentId: data.document_id,
        userId: data.user_id,
        status: data.status as any,
        currentStep: data.current_step,
        progressPercentage: data.progress_percentage,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        errorMessage: data.error_message
      };
    } catch (err) {
      return memoryStore.findJobByDocument(documentId);
    }
  }

  async updateJob(id: string, updates: Partial<AnalysisJobRecord>): Promise<AnalysisJobRecord> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.updateJob(id, updates);

    try {
      const updateData: any = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.currentStep) updateData.current_step = updates.currentStep;
      if (updates.progressPercentage !== undefined) updateData.progress_percentage = updates.progressPercentage;
      if (updates.errorMessage) updateData.error_message = updates.errorMessage;
      if (updates.completedAt) updateData.completed_at = updates.completedAt;

      await supabase.from('analysis_jobs').update(updateData).eq('id', id);
      return (await this.findJobById(id)) || memoryStore.updateJob(id, updates);
    } catch (err) {
      return memoryStore.updateJob(id, updates);
    }
  }

  // Scenarios
  async saveScenario(scenario: ScenarioSimulationResult & { userId: string }): Promise<ScenarioSimulationResult> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.saveScenario(scenario);

    try {
      const { data, error } = await supabase.from('scenarios').upsert({
        id: scenario.id,
        document_id: scenario.documentId,
        user_id: scenario.userId,
        raw_prompt: scenario.inputPrompt,
        normalized_interpretation: scenario.normalizedInterpretation,
        title: scenario.title,
        total_financial_impact: scenario.totalFinancialImpact,
        financial_breakdown: scenario.financialBreakdown,
        document_says: scenario.documentSays,
        law_says: scenario.lawSays,
        lexflow_analysis: scenario.lexflowAnalysis,
        key_points: scenario.keyPoints,
        timeline: scenario.timeline,
        status: scenario.status
      }, { onConflict: 'id' }).select().single();

      if (error) throw error;
      
      // We are skipping robust syncing of related tables like evidence for brevity in this exercise, 
      // but in real app we'd insert into evidence table here.

      return scenario;
    } catch (err) {
      logger.error('Failed to save scenario to Supabase', { error: String(err) });
      return memoryStore.saveScenario(scenario);
    }
  }

  async findScenarioById(id: string, userId?: string): Promise<ScenarioSimulationResult | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.findScenarioById(id, userId);

    try {
      let query = supabase.from('scenarios').select('*').eq('id', id);
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query.single();
      
      if (error || !data) return memoryStore.findScenarioById(id, userId);
      
      // We'd map data back to ScenarioSimulationResult here. Re-using memory store's for full object structure including nested items that aren't fetched easily in one flat query here.
      // A robust implementation would query evidence table and join.
      const scenarioFromMem = await memoryStore.findScenarioById(id, userId);
      if (scenarioFromMem) return scenarioFromMem;

      return {
        id: data.id,
        documentId: data.document_id,
        inputPrompt: data.raw_prompt,
        normalizedInterpretation: data.normalized_interpretation,
        title: data.title,
        documentSays: data.document_says,
        lawSays: data.law_says,
        lexflowAnalysis: data.lexflow_analysis,
        totalFinancialImpact: data.total_financial_impact,
        totalFinancialImpactMinor: 0,
        financialBreakdown: data.financial_breakdown as any || [],
        keyPoints: data.key_points as any || [],
        relevantClauses: [],
        applicableLaw: [],
        timeline: data.timeline as any || [],
        risks: [],
        protections: [],
        conflicts: [],
        evidence: [],
        suggestedNextSteps: [],
        disclaimer: '',
        status: data.status as any
      };
    } catch (err) {
      return memoryStore.findScenarioById(id, userId);
    }
  }

  async listScenariosByDocument(documentId: string, userId?: string): Promise<ScenarioSimulationResult[]> {
    return memoryStore.listScenariosByDocument(documentId, userId);
  }

  // Risks
  async saveRisks(documentId: string, risks: RiskFinding[]): Promise<RiskFinding[]> {
    return memoryStore.saveRisks(documentId, risks);
  }

  async listRisksByDocument(documentId: string): Promise<RiskFinding[]> {
    return memoryStore.listRisksByDocument(documentId);
  }

  // Conflicts
  async saveConflicts(documentId: string, conflicts: ConflictFinding[]): Promise<ConflictFinding[]> {
    return memoryStore.saveConflicts(documentId, conflicts);
  }

  async listConflictsByDocument(documentId: string): Promise<ConflictFinding[]> {
    return memoryStore.listConflictsByDocument(documentId);
  }

  // Lawyer Kit
  async saveKit(kit: LawyerKitData & { userId: string }): Promise<LawyerKitData> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.saveKit(kit);

    try {
      const { error } = await supabase.from('lawyer_kits').upsert({
        id: kit.id,
        document_id: kit.documentId,
        user_id: kit.userId,
        briefing_data: kit
      }, { onConflict: 'id' });

      if (error) throw error;
      return kit;
    } catch (err) {
      logger.error('Failed to save lawyer kit to Supabase', { error: String(err) });
      return memoryStore.saveKit(kit);
    }
  }

  async findKitById(id: string, userId?: string): Promise<LawyerKitData | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.findKitById(id, userId);

    try {
      let query = supabase.from('lawyer_kits').select('briefing_data').eq('id', id);
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query.single();
      if (error || !data) return memoryStore.findKitById(id, userId);
      return data.briefing_data as LawyerKitData;
    } catch (err) {
      return memoryStore.findKitById(id, userId);
    }
  }

  async findKitByDocument(documentId: string, userId?: string): Promise<LawyerKitData | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.findKitByDocument(documentId, userId);

    try {
      let query = supabase.from('lawyer_kits').select('briefing_data').eq('document_id', documentId).order('created_at', { ascending: false }).limit(1);
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query.single();
      if (error || !data) return memoryStore.findKitByDocument(documentId, userId);
      return data.briefing_data as LawyerKitData;
    } catch (err) {
      return memoryStore.findKitByDocument(documentId, userId);
    }
  }

  // Legal Sources
  async searchLegalSources(query: string, limit?: number): Promise<LegalAuthority[]> {
    return memoryStore.searchLegalSources(query, limit);
  }

  async listAuthoritative(): Promise<LegalAuthority[]> {
    return memoryStore.listAuthoritative();
  }

  // Compliance Audit Methods (delegating to memoryStore with Supabase compatibility)
  async saveComplianceAudit(audit: ComplianceAuditRecord): Promise<ComplianceAuditRecord> {
    return memoryStore.saveComplianceAudit(audit);
  }

  async findComplianceAuditById(id: string, userId?: string): Promise<ComplianceAuditRecord | null> {
    return memoryStore.findComplianceAuditById(id, userId);
  }

  async listComplianceAuditsByDocument(documentId: string, userId?: string): Promise<ComplianceAuditRecord[]> {
    return memoryStore.listComplianceAuditsByDocument(documentId, userId);
  }

  async updateComplianceAudit(id: string, updates: Partial<ComplianceAuditRecord>): Promise<ComplianceAuditRecord> {
    return memoryStore.updateComplianceAudit(id, updates);
  }
}

export const repository = new SupabaseRepository();
