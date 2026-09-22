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
  listByUser(userId: string): Promise<DocumentRecord[]>;
  updateStatus(id: string, status: DocumentStatus, updates?: Partial<DocumentRecord>): Promise<DocumentRecord>;
  delete(id: string, userId?: string): Promise<boolean>;
  listVersions(documentId: string): Promise<DocumentVersion[]>;
  saveVersion(documentId: string, version: Partial<DocumentVersion>): Promise<DocumentVersion>;
  revertVersion(documentId: string, versionId: string, note?: string): Promise<{ document: DocumentRecord; version: DocumentVersion }>;
}

export interface IClauseRepository {
  saveMany(documentId: string, clauses: ClauseItem[]): Promise<ClauseItem[]>;
  listByDocument(documentId: string): Promise<ClauseItem[]>;
  findClauseById(documentId: string, clauseId: string): Promise<ClauseItem | null>;
}

export interface ILegalModelRepository {
  saveModel(documentId: string, model: LegalModelData): Promise<LegalModelData>;
  findModelByDocument(documentId: string): Promise<LegalModelData | null>;
}

export interface IGraphRepository {
  saveGraph(documentId: string, graph: LegalGraph): Promise<LegalGraph>;
  findGraphByDocument(documentId: string): Promise<LegalGraph | null>;
}

export interface IAnalysisJobRepository {
  createJob(job: Omit<AnalysisJobRecord, 'id' | 'startedAt'>): Promise<AnalysisJobRecord>;
  findJobById(id: string): Promise<AnalysisJobRecord | null>;
  findJobByDocument(documentId: string): Promise<AnalysisJobRecord | null>;
  updateJob(id: string, updates: Partial<AnalysisJobRecord>): Promise<AnalysisJobRecord>;
}

export interface IScenarioRepository {
  saveScenario(scenario: ScenarioSimulationResult & { userId: string }): Promise<ScenarioSimulationResult>;
  findScenarioById(id: string, userId?: string): Promise<ScenarioSimulationResult | null>;
  listScenariosByDocument(documentId: string, userId?: string): Promise<ScenarioSimulationResult[]>;
}

export interface IRiskRepository {
  saveRisks(documentId: string, risks: RiskFinding[]): Promise<RiskFinding[]>;
  listRisksByDocument(documentId: string): Promise<RiskFinding[]>;
}

export interface IConflictRepository {
  saveConflicts(documentId: string, conflicts: ConflictFinding[]): Promise<ConflictFinding[]>;
  listConflictsByDocument(documentId: string): Promise<ConflictFinding[]>;
}

export interface ILawyerKitRepository {
  saveKit(kit: LawyerKitData & { userId: string }): Promise<LawyerKitData>;
  findKitById(id: string, userId?: string): Promise<LawyerKitData | null>;
  findKitByDocument(documentId: string, userId?: string): Promise<LawyerKitData | null>;
}

export interface ILegalSourceRepository {
  searchLegalSources(query: string, limit?: number): Promise<LegalAuthority[]>;
  listAuthoritative(): Promise<LegalAuthority[]>;
}

export interface IComplianceAuditRepository {
  saveComplianceAudit(audit: ComplianceAuditRecord): Promise<ComplianceAuditRecord>;
  findComplianceAuditById(id: string, userId?: string): Promise<ComplianceAuditRecord | null>;
  listComplianceAuditsByDocument(documentId: string, userId?: string): Promise<ComplianceAuditRecord[]>;
  updateComplianceAudit(id: string, updates: Partial<ComplianceAuditRecord>): Promise<ComplianceAuditRecord>;
}
