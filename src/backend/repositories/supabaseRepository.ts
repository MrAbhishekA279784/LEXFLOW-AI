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
  IChunkRepository,
  DocumentRecord,
  AnalysisJobRecord,
  DocumentChunk 
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
import { memoryStore } from './memoryStore';

import { SupabaseDocumentRepository } from './supabase/SupabaseDocumentRepository';
import { SupabaseClauseRepository } from './supabase/SupabaseClauseRepository';
import { SupabaseLegalModelRepository } from './supabase/SupabaseLegalModelRepository';
import { SupabaseGraphRepository } from './supabase/SupabaseGraphRepository';
import { SupabaseScenarioRepository } from './supabase/SupabaseScenarioRepository';
import { SupabaseComplianceAuditRepository } from './supabase/SupabaseComplianceAuditRepository';
import { SupabaseLawyerKitRepository } from './supabase/SupabaseLawyerKitRepository';

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
  IComplianceAuditRepository,
  IChunkRepository 
{
  private docRepo = new SupabaseDocumentRepository();
  private clauseRepo = new SupabaseClauseRepository();
  private modelRepo = new SupabaseLegalModelRepository();
  private graphRepo = new SupabaseGraphRepository();
  private scenarioRepo = new SupabaseScenarioRepository();
  private complianceRepo = new SupabaseComplianceAuditRepository();
  private lawyerKitRepo = new SupabaseLawyerKitRepository();

  // Document Operations
  create(doc: Partial<DocumentRecord> & { userId: string; name: string; type: 'pdf' | 'docx' }): Promise<DocumentRecord> {
    return this.docRepo.create(doc);
  }
  findById(id: string, userId?: string): Promise<DocumentRecord | null> {
    return this.docRepo.findById(id, userId);
  }
  listByUser(userId: string, options?: { page?: number; limit?: number }): Promise<DocumentRecord[]> {
    return this.docRepo.listByUser(userId, options);
  }
  updateStatus(id: string, status: DocumentStatus, summary?: string | Partial<DocumentRecord>, userId?: string): Promise<void> {
    return this.docRepo.updateStatus(id, status, summary, userId);
  }
  delete(id: string, userId?: string): Promise<void> {
    return this.docRepo.delete(id, userId);
  }

  // Clause Operations
  saveClauses(documentId: string, clauses: ClauseItem[], userId?: string): Promise<ClauseItem[]> {
    return this.clauseRepo.saveClauses(documentId, clauses, userId);
  }
  getClausesByDocument(documentId: string, userId?: string): Promise<ClauseItem[]> {
    return this.clauseRepo.getClausesByDocument(documentId, userId);
  }

  // Legal Model Operations
  saveLegalModel(documentId: string, modelData: LegalModelData, userId?: string): Promise<LegalModelData> {
    return this.modelRepo.saveLegalModel(documentId, modelData, userId);
  }
  getLegalModel(documentId: string, userId?: string): Promise<LegalModelData | null> {
    return this.modelRepo.getLegalModel(documentId, userId);
  }

  // Graph Operations
  saveGraph(documentId: string, graph: LegalGraph, userId?: string): Promise<LegalGraph> {
    return this.graphRepo.saveGraph(documentId, graph, userId);
  }
  getGraphByDocument(documentId: string, userId?: string): Promise<LegalGraph | null> {
    return this.graphRepo.getGraphByDocument(documentId, userId);
  }

  // Scenario Operations
  saveScenario(scenario: ScenarioSimulationResult, userId?: string): Promise<ScenarioSimulationResult> {
    return this.scenarioRepo.saveScenario(scenario, userId);
  }
  getScenarioById(id: string, userId?: string): Promise<ScenarioSimulationResult | null> {
    return this.scenarioRepo.getScenarioById(id, userId);
  }
  getScenariosByDocument(documentId: string, userId?: string): Promise<ScenarioSimulationResult[]> {
    return this.scenarioRepo.getScenariosByDocument(documentId, userId);
  }

  // Compliance Audit Operations
  saveComplianceAudit(audit: ComplianceAuditRecord, userId?: string): Promise<ComplianceAuditRecord> {
    return this.complianceRepo.saveComplianceAudit(audit, userId);
  }
  getComplianceAuditById(id: string, userId?: string): Promise<ComplianceAuditRecord | null> {
    return this.complianceRepo.getComplianceAuditById(id, userId);
  }
  getComplianceAuditsByDocument(documentId: string, userId?: string): Promise<ComplianceAuditRecord[]> {
    return this.complianceRepo.getComplianceAuditsByDocument(documentId, userId);
  }

  // Lawyer Kit Operations
  saveLawyerKit(kit: LawyerKitData, userId?: string): Promise<LawyerKitData> {
    return this.lawyerKitRepo.saveLawyerKit(kit, userId);
  }
  getLawyerKitByDocument(documentId: string, userId?: string): Promise<LawyerKitData | null> {
    return this.lawyerKitRepo.getLawyerKitByDocument(documentId, userId);
  }

  // Analysis Jobs & Additional Operations delegating to MemoryStore / Fallback
  async createJob(job: Partial<AnalysisJobRecord> & { documentId: string; userId: string }): Promise<AnalysisJobRecord> {
    return memoryStore.createJob(job);
  }
  async updateJob(id: string, updates: Partial<AnalysisJobRecord>): Promise<AnalysisJobRecord> {
    return memoryStore.updateJob(id, updates);
  }
  async getJobById(id: string): Promise<AnalysisJobRecord | null> {
    return memoryStore.getJobById(id);
  }
  async getJobByDocumentId(documentId: string): Promise<AnalysisJobRecord | null> {
    return memoryStore.getJobByDocumentId(documentId);
  }

  async saveRisks(documentId: string, risks: RiskFinding[], userId?: string): Promise<RiskFinding[]> {
    return memoryStore.saveRisks(documentId, risks, userId);
  }
  async getRisksByDocument(documentId: string, userId?: string): Promise<RiskFinding[]> {
    return memoryStore.getRisksByDocument(documentId, userId);
  }

  async saveConflicts(documentId: string, conflicts: ConflictFinding[], userId?: string): Promise<ConflictFinding[]> {
    return memoryStore.saveConflicts(documentId, conflicts, userId);
  }
  async getConflictsByDocument(documentId: string, userId?: string): Promise<ConflictFinding[]> {
    return memoryStore.getConflictsByDocument(documentId, userId);
  }

  async saveLegalSources(sources: LegalAuthority[]): Promise<LegalAuthority[]> {
    return memoryStore.saveLegalSources(sources);
  }
  async searchLegalSources(query: string, limit?: number): Promise<LegalAuthority[]> {
    return memoryStore.searchLegalSources(query, limit);
  }

  async saveChunks(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    return memoryStore.saveChunks(chunks);
  }
  async getChunksByDocument(documentId: string): Promise<DocumentChunk[]> {
    return memoryStore.getChunksByDocument(documentId);
  }
  async searchChunksByVector(documentId: string, queryEmbedding: number[], topK?: number): Promise<{ chunk: DocumentChunk; similarity: number }[]> {
    return memoryStore.searchChunksByVector(documentId, queryEmbedding, topK);
  }
  async searchLegalSourcesByVector(queryEmbedding: number[], topK?: number): Promise<{ source: LegalAuthority; similarity: number }[]> {
    return memoryStore.searchLegalSourcesByVector(queryEmbedding, topK);
  }

  // Backwards-compatibility aliases for services
  listByDocument(documentId: string, userId?: string): Promise<ClauseItem[]> {
    return this.getClausesByDocument(documentId, userId);
  }
  findModelByDocument(documentId: string, userId?: string): Promise<LegalModelData | null> {
    return this.getLegalModel(documentId, userId);
  }
  findGraphByDocument(documentId: string, userId?: string): Promise<LegalGraph | null> {
    return this.getGraphByDocument(documentId, userId);
  }
  saveMany(documentId: string, clauses: ClauseItem[], userId?: string): Promise<ClauseItem[]> {
    return this.saveClauses(documentId, clauses, userId);
  }
  updateComplianceAudit(auditOrId: string | ComplianceAuditRecord, updatesOrUserId?: Partial<ComplianceAuditRecord> | string): Promise<ComplianceAuditRecord> {
    if (typeof auditOrId === 'string') {
      return this.complianceRepo.updateComplianceAudit(auditOrId, updatesOrUserId as Partial<ComplianceAuditRecord>);
    }
    return this.saveComplianceAudit(auditOrId, updatesOrUserId as string);
  }
  listAuthoritative(query: string = '', limit?: number): Promise<LegalAuthority[]> {
    return this.searchLegalSources(query, limit);
  }
  findComplianceAuditById(id: string, userId?: string): Promise<ComplianceAuditRecord | null> {
    return this.getComplianceAuditById(id, userId);
  }
  listComplianceAuditsByDocument(documentId: string, userId?: string): Promise<ComplianceAuditRecord[]> {
    return this.getComplianceAuditsByDocument(documentId, userId);
  }
  listRisksByDocument(documentId: string, userId?: string): Promise<RiskFinding[]> {
    return this.getRisksByDocument(documentId, userId);
  }
  listConflictsByDocument(documentId: string, userId?: string): Promise<ConflictFinding[]> {
    return this.getConflictsByDocument(documentId, userId);
  }
  listScenariosByDocument(documentId: string, userId?: string): Promise<ScenarioSimulationResult[]> {
    return this.getScenariosByDocument(documentId, userId);
  }
  findScenarioById(id: string, userId?: string): Promise<ScenarioSimulationResult | null> {
    return this.getScenarioById(id, userId);
  }
  saveKit(kit: LawyerKitData, userId?: string): Promise<LawyerKitData> {
    return this.saveLawyerKit(kit, userId);
  }
  saveModel(documentId: string, modelData: LegalModelData, userId?: string): Promise<LegalModelData> {
    return this.saveLegalModel(documentId, modelData, userId);
  }
  findClauseById(documentId: string, clauseId: string): Promise<ClauseItem | null> {
    return memoryStore.findClauseById(documentId, clauseId);
  }
  findKitById(id: string, userId?: string): Promise<LawyerKitData | null> {
    return this.lawyerKitRepo.getLawyerKitByDocument(id, userId);
  }
  findKitByDocument(documentId: string, userId?: string): Promise<LawyerKitData | null> {
    return this.getLawyerKitByDocument(documentId, userId);
  }
  findJobById(id: string): Promise<AnalysisJobRecord | null> {
    return this.getJobById(id);
  }
  findJobByDocument(documentId: string): Promise<AnalysisJobRecord | null> {
    return this.getJobByDocumentId(documentId);
  }
  listVersions(documentId: string): Promise<DocumentVersion[]> {
    return memoryStore.listVersions(documentId);
  }
  saveVersion(documentId: string, version: Partial<DocumentVersion>): Promise<DocumentVersion> {
    return memoryStore.saveVersion(documentId, version);
  }
  revertVersion(documentId: string, versionId: string, note?: string): Promise<{ document: DocumentRecord; version: DocumentVersion }> {
    return memoryStore.revertVersion(documentId, versionId, note);
  }
}

export const repository = new SupabaseRepository();
