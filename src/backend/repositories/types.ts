import { 
  LegalModelData, 
  LegalGraph, 
  LegalAuthority, 
  ScenarioSimulationResult, 
  RiskFinding, 
  ConflictFinding, 
  LawyerKitData,
  DocumentStatus,
  EvidenceItem 
} from '../types/backendTypes';
import { ClauseItem, DocumentItem, DocumentVersion } from '../../types';
import { ComplianceAuditRecord } from '../services/complianceAudit/types';

export interface DocumentRecord extends DocumentItem {
  userId: string;
  storagePath?: string;
  rawText?: string;
}

export interface AnalysisJobRecord {
  id: string;
  documentId: string;
  userId: string;
  status: DocumentStatus;
  currentStep: string;
  progressPercentage: number;
  errorMessage?: string;
  startedAt: string;
  completedAt?: string;
}

export interface IDocumentRepository {
  create(doc: Partial<DocumentRecord> & { userId: string; name: string; type: 'pdf' | 'docx' }): Promise<DocumentRecord>;
  findById(id: string, userId?: string): Promise<DocumentRecord | null>;
  listByUser(userId: string, options?: { page?: number; limit?: number }): Promise<DocumentRecord[]>;
  updateStatus(id: string, status: DocumentStatus, summary?: string | Partial<DocumentRecord>, userId?: string): Promise<DocumentRecord | void>;
  delete(id: string, userId?: string): Promise<boolean | void>;
  listVersions?(documentId: string): Promise<DocumentVersion[]>;
  saveVersion?(documentId: string, version: Partial<DocumentVersion>): Promise<DocumentVersion>;
  revertVersion?(documentId: string, versionId: string, note?: string): Promise<{ document: DocumentRecord; version: DocumentVersion }>;
}

export interface IClauseRepository {
  saveClauses?(documentId: string, clauses: ClauseItem[], userId?: string): Promise<ClauseItem[]>;
  getClausesByDocument?(documentId: string, userId?: string): Promise<ClauseItem[]>;
  saveMany?(documentId: string, clauses: ClauseItem[], userId?: string): Promise<ClauseItem[]>;
  listByDocument?(documentId: string, userId?: string): Promise<ClauseItem[]>;
  findClauseById?(documentId: string, clauseId: string): Promise<ClauseItem | null>;
}

export interface ILegalModelRepository {
  saveLegalModel?(documentId: string, modelData: LegalModelData, userId?: string): Promise<LegalModelData>;
  getLegalModel?(documentId: string, userId?: string): Promise<LegalModelData | null>;
  saveModel?(documentId: string, model: LegalModelData): Promise<LegalModelData>;
  findModelByDocument?(documentId: string): Promise<LegalModelData | null>;
}

export interface IGraphRepository {
  saveGraph(documentId: string, graph: LegalGraph, userId?: string): Promise<LegalGraph>;
  getGraphByDocument(documentId: string, userId?: string): Promise<LegalGraph | null>;
  findGraphByDocument?(documentId: string, userId?: string): Promise<LegalGraph | null>;
}

export interface IAnalysisJobRepository {
  createJob(job: Partial<AnalysisJobRecord> & { documentId: string; userId: string }): Promise<AnalysisJobRecord>;
  findJobById?(id: string): Promise<AnalysisJobRecord | null>;
  getJobById?(id: string): Promise<AnalysisJobRecord | null>;
  findJobByDocument?(documentId: string): Promise<AnalysisJobRecord | null>;
  getJobByDocumentId?(documentId: string): Promise<AnalysisJobRecord | null>;
  updateJob(id: string, updates: Partial<AnalysisJobRecord>): Promise<AnalysisJobRecord>;
}

export interface IScenarioRepository {
  saveScenario(scenario: ScenarioSimulationResult, userId?: string): Promise<ScenarioSimulationResult>;
  getScenarioById?(id: string, userId?: string): Promise<ScenarioSimulationResult | null>;
  getScenariosByDocument?(documentId: string, userId?: string): Promise<ScenarioSimulationResult[]>;
  findScenarioById?(id: string, userId?: string): Promise<ScenarioSimulationResult | null>;
  listScenariosByDocument?(documentId: string, userId?: string): Promise<ScenarioSimulationResult[]>;
}

export interface IRiskRepository {
  saveRisks(documentId: string, risks: RiskFinding[], userId?: string): Promise<RiskFinding[]>;
  getRisksByDocument?(documentId: string, userId?: string): Promise<RiskFinding[]>;
  listRisksByDocument?(documentId: string): Promise<RiskFinding[]>;
}

export interface IConflictRepository {
  saveConflicts(documentId: string, conflicts: ConflictFinding[], userId?: string): Promise<ConflictFinding[]>;
  getConflictsByDocument?(documentId: string, userId?: string): Promise<ConflictFinding[]>;
  listConflictsByDocument?(documentId: string): Promise<ConflictFinding[]>;
}

export interface ILawyerKitRepository {
  saveLawyerKit?(kit: LawyerKitData, userId?: string): Promise<LawyerKitData>;
  getLawyerKitByDocument?(documentId: string, userId?: string): Promise<LawyerKitData | null>;
  saveKit?(kit: LawyerKitData, userId?: string): Promise<LawyerKitData>;
  findKitById?(id: string, userId?: string): Promise<LawyerKitData | null>;
  findKitByDocument?(documentId: string, userId?: string): Promise<LawyerKitData | null>;
}

export interface ILegalSourceRepository {
  saveLegalSources?(sources: LegalAuthority[]): Promise<LegalAuthority[]>;
  searchLegalSources(query: string, limit?: number): Promise<LegalAuthority[]>;
  listAuthoritative?(query?: string, limit?: number): Promise<LegalAuthority[]>;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  clauseId?: string;
  section?: string;
  title?: string;
  pageNumber: number;
  chunkIndex: number;
  chunkText: string;
  embedding?: number[];
  createdAt?: string;
}

export interface IChunkRepository {
  saveChunks(chunks: DocumentChunk[]): Promise<DocumentChunk[]>;
  getChunksByDocument(documentId: string): Promise<DocumentChunk[]>;
  searchChunksByVector(documentId: string, queryEmbedding: number[], topK?: number): Promise<{ chunk: DocumentChunk; similarity: number }[]>;
  searchLegalSourcesByVector(queryEmbedding: number[], topK?: number): Promise<{ source: LegalAuthority; similarity: number }[]>;
}

export interface IComplianceAuditRepository {
  saveComplianceAudit(audit: ComplianceAuditRecord, userId?: string): Promise<ComplianceAuditRecord>;
  getComplianceAuditById?(id: string, userId?: string): Promise<ComplianceAuditRecord | null>;
  getComplianceAuditsByDocument?(documentId: string, userId?: string): Promise<ComplianceAuditRecord[]>;
  findComplianceAuditById?(id: string, userId?: string): Promise<ComplianceAuditRecord | null>;
  listComplianceAuditsByDocument?(documentId: string, userId?: string): Promise<ComplianceAuditRecord[]>;
  updateComplianceAudit?(auditOrId: string | ComplianceAuditRecord, updatesOrUserId?: Partial<ComplianceAuditRecord> | string): Promise<ComplianceAuditRecord>;
}
