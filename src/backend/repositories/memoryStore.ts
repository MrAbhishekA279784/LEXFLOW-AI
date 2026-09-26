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
import { INITIAL_DOCUMENTS, RENTAL_CLAUSES, DEFAULT_SCENARIO } from '../../data/initialData';
import { INITIAL_DOCUMENT_VERSIONS } from '../../data/documentVersionsData';
import { INITIAL_COMPLIANCE_AUDIT } from '../data/complianceAuditSeedData';
import { EmbeddingService } from '../services/retrieval/embeddingService';
import { v4 as uuidv4 } from 'uuid';

export class MemoryStore implements 
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
  private documents: Map<string, DocumentRecord> = new Map();
  private clauses: Map<string, ClauseItem[]> = new Map();
  private chunks: Map<string, DocumentChunk[]> = new Map();
  private legalModels: Map<string, LegalModelData> = new Map();
  private graphs: Map<string, LegalGraph> = new Map();
  private jobs: Map<string, AnalysisJobRecord> = new Map();
  private scenarios: Map<string, ScenarioSimulationResult & { userId: string }> = new Map();
  private risks: Map<string, RiskFinding[]> = new Map();
  private conflicts: Map<string, ConflictFinding[]> = new Map();
  private lawyerKits: Map<string, LawyerKitData & { userId: string }> = new Map();
  private legalSources: LegalAuthority[] = [];
  private versions: Map<string, DocumentVersion[]> = new Map();
  private complianceAudits: Map<string, ComplianceAuditRecord> = new Map();
  private seededUsers: Set<string> = new Set();

  constructor() {
    this.seedSharedStaticData();
  }

  private seedSharedStaticData() {
    // Seed Indian Legal Authorities catalog
    this.legalSources = [
      {
        id: 'law-tpa-106',
        sourceType: 'central_act',
        title: 'Transfer of Property Act, 1882 — Section 106',
        actOrCourt: 'Transfer of Property Act, 1882',
        sectionOrArticle: 'Section 106',
        subSectionOrPara: 'Sub-section (1)',
        officialSourceUrl: 'https://indiacode.nic.in/handle/123456789/2338',
        summary: 'In the absence of a written contract or local law to the contrary, a lease of immovable property for residential purposes shall be deemed to be a lease from month to month, terminable, on the part of either lessor or lessee, by fifteen days’ notice.',
        relevanceExplanation: 'Applies to statutory notice requirements for terminating periodic tenancies.',
        retrievedAt: new Date().toISOString(),
        hierarchyLevel: 2
      },
      {
        id: 'law-tpa-108',
        sourceType: 'central_act',
        title: 'Transfer of Property Act, 1882 — Section 108',
        actOrCourt: 'Transfer of Property Act, 1882',
        sectionOrArticle: 'Section 108',
        subSectionOrPara: 'Clause (q)',
        officialSourceUrl: 'https://indiacode.nic.in/handle/123456789/2338',
        summary: 'The lessee is bound on the determination of the lease to put the lessor into possession of the property.',
        relevanceExplanation: 'Establishes the tenant’s mandatory duty to restore vacant and peaceful possession to the lessor.',
        retrievedAt: new Date().toISOString(),
        hierarchyLevel: 2
      },
      {
        id: 'law-ica-74',
        sourceType: 'central_act',
        title: 'Indian Contract Act, 1872 — Section 74',
        actOrCourt: 'Indian Contract Act, 1872',
        sectionOrArticle: 'Section 74',
        subSectionOrPara: 'Compensation for breach where penalty stipulated',
        officialSourceUrl: 'https://indiacode.nic.in/handle/123456789/2187',
        summary: 'When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, or if the contract contains any other stipulation by way of penalty, the party complaining of the breach is entitled to receive from the party who has broken the contract reasonable compensation not exceeding the amount so named.',
        relevanceExplanation: 'Indian law forbids unreasonable penalties. Forfeiture of security deposits or punitive daily fines requires proving genuine loss.',
        retrievedAt: new Date().toISOString(),
        hierarchyLevel: 2
      },
      {
        id: 'law-kailash-nath-2015',
        sourceType: 'judgment',
        title: 'Kailash Nath Associates v. Delhi Development Authority (2015) 4 SCC 136',
        actOrCourt: 'Supreme Court of India',
        sectionOrArticle: 'Civil Appeal No. 193 of 2015',
        subSectionOrPara: 'Paragraph 43',
        officialSourceUrl: 'https://main.sci.gov.in/judgment',
        summary: 'The Supreme Court held that forfeiture of earnest money or security deposits is subject to Section 74 of the Contract Act. Damage or loss is not dispensed with. Where it is possible to prove actual damage or loss, such proof is not dispensed with before retaining funds as liquidated damages.',
        relevanceExplanation: 'Landlord cannot arbitrarily forfeit the entire deposit of ₹75,000 without demonstrating actual unpaid rent, repair costs, or physical damages.',
        retrievedAt: new Date().toISOString(),
        hierarchyLevel: 5
      },
      {
        id: 'law-mta-2021',
        sourceType: 'central_act',
        title: 'Model Tenancy Act, 2021 — Section 11 & Section 21',
        actOrCourt: 'Model Tenancy Act, 2021 (Ministry of Housing and Urban Affairs)',
        sectionOrArticle: 'Section 11 & Section 21',
        officialSourceUrl: 'https://mohua.gov.in',
        summary: 'Caps residential security deposits at a maximum of two months’ rent and mandates refund within one month of vacating premises after due settlement.',
        relevanceExplanation: 'Benchmarks standard statutory caps for residential deposits and refund timelines across Indian states adopting tenancy reforms.',
        retrievedAt: new Date().toISOString(),
        hierarchyLevel: 2
      }
    ];

    // Seed Clauses & Graphs for standard document templates
    this.clauses.set('doc-rental', [...RENTAL_CLAUSES]);
    this.clauses.set('doc-rental-001', [...RENTAL_CLAUSES]);

    const rentalLegalModel: LegalModelData = {
      documentId: 'doc-rental',
      parties: [
        { id: 'p1', name: 'Dr. Ramesh Sharma', role: 'landlord', identifier: 'Lessor / Owner', sourceClauseId: 'cl-preamble', sourcePage: 1 },
        { id: 'p2', name: 'Tenant', role: 'tenant', identifier: 'Lessee / Occupant', sourceClauseId: 'cl-preamble', sourcePage: 1 }
      ],
      obligations: [
        { id: 'obl-1', actor: 'tenant', action: 'pay_rent', description: 'Pay monthly rent of ₹25,000 on or before the 5th of each month', frequency: 'monthly', dueDay: 5, sourceClauseId: 'cl-1', sourcePage: 2, confidence: 0.98 },
        { id: 'obl-2', actor: 'tenant', action: 'notice', description: 'Serve 30 days prior written notice before vacating the premises', frequency: 'on_demand', sourceClauseId: 'cl-3', sourcePage: 6, confidence: 0.96 },
        { id: 'obl-3', actor: 'landlord', action: 'refund_deposit', description: 'Refund ₹75,000 interest-free security deposit within 14 days of handover', frequency: 'once', sourceClauseId: 'cl-4', sourcePage: 3, confidence: 0.95 }
      ],
      rights: [
        { id: 'rgt-1', beneficiary: 'landlord', description: 'Right to deduct unpaid dues, utility bills, and painting/repair charges from security deposit', sourceClauseId: 'cl-4', sourcePage: 3, confidence: 0.97 },
        { id: 'rgt-2', beneficiary: 'tenant', description: 'Right to quiet and peaceful enjoyment of the flat without unreasonable interference', sourceClauseId: 'cl-5', sourcePage: 4, confidence: 0.94 }
      ],
      deadlines: [
        { id: 'ddl-1', actor: 'tenant', description: 'Monthly rent due date', durationDays: 5, triggerEvent: 'Beginning of each calendar month', mandatory: true, sourceClauseId: 'cl-1', sourcePage: 2 },
        { id: 'ddl-2', actor: 'tenant', description: 'Grace period before penalty activates', durationDays: 3, triggerEvent: 'Rent due on 5th', mandatory: false, sourceClauseId: 'cl-1', sourcePage: 2 },
        { id: 'ddl-3', actor: 'tenant', description: 'Mandatory notice period for early termination', durationDays: 30, triggerEvent: 'Intention to vacate', mandatory: true, sourceClauseId: 'cl-3', sourcePage: 6 },
        { id: 'ddl-4', actor: 'landlord', description: 'Deposit refund deadline after handover', durationDays: 14, triggerEvent: 'Peaceful keys handover', mandatory: true, sourceClauseId: 'cl-4', sourcePage: 3 }
      ],
      conditions: [
        { id: 'cnd-1', description: 'Rent unpaid after 8th of the month', predicate: 'rent_paid == false && current_day > 8', outcomes: ['late_penalty_activates', 'breach_notice_eligible'], sourceClauseId: 'cl-2', sourcePage: 2 },
        { id: 'cnd-2', description: 'Vacating without 30-day written notice during lock-in period', predicate: 'notice_served == false && tenancy_duration < 11', outcomes: ['deposit_forfeiture_right', 'liquidated_damages'], sourceClauseId: 'cl-3', sourcePage: 6 }
      ],
      payments: [
        { id: 'pmt-1', payer: 'tenant', payee: 'landlord', purpose: 'rent', amount: 25000, currency: 'INR', frequency: 'monthly', dueDay: 5, gracePeriodDays: 3, sourceClauseId: 'cl-1', sourcePage: 2 },
        { id: 'pmt-2', payer: 'tenant', payee: 'landlord', purpose: 'deposit', amount: 75000, currency: 'INR', frequency: 'once', sourceClauseId: 'cl-4', sourcePage: 3 }
      ],
      penalties: [
        { id: 'pen-1', actorSubject: 'tenant', triggerCondition: 'Rent non-payment after 8th of month', penaltyType: 'daily_fine', rate: 500, rateUnit: 'per_day', description: '₹500 per day surcharge until full payment', sourceClauseId: 'cl-2', sourcePage: 2 },
        { id: 'pen-2', actorSubject: 'tenant', triggerCondition: 'Breach of lock-in period / unserved notice', penaltyType: 'forfeiture', description: 'Forfeiture of security deposit in lieu of notice period rent', sourceClauseId: 'cl-3', sourcePage: 6 }
      ],
      termination: [
        { id: 'term-1', noticePeriodDays: 30, grounds: 'convenience', lockInMonths: 6, consequences: ['Notice period rent due', 'Deduction from deposit if unserved'], sourceClauseId: 'cl-3', sourcePage: 6 }
      ],
      events: ['Rent Payment', 'Late Payment Trigger', 'Written Notice', 'Handover of Keys', 'Deposit Refund'],
      dependencies: [
        { fromEntityId: 'cnd-1', toEntityId: 'pen-1', type: 'TRIGGERS' },
        { fromEntityId: 'cnd-2', toEntityId: 'pen-2', type: 'TRIGGERS' }
      ],
      conflicts: [
        { clauseAId: 'cl-2', clauseBId: 'cl-3', description: 'Interaction between daily late penalty accumulation and immediate lock-in forfeiture clause.' }
      ]
    };
    this.legalModels.set('doc-rental', rentalLegalModel);
    this.legalModels.set('doc-rental-001', rentalLegalModel);

    const rentalGraph: LegalGraph = {
      nodes: [
        { id: 'party-tenant', type: 'Party', label: 'Tenant', data: { role: 'tenant' } },
        { id: 'party-landlord', type: 'Party', label: 'Landlord (Dr. Ramesh)', data: { role: 'landlord' } },
        { id: 'obl-rent', type: 'Obligation', label: 'Pay Rent (₹25k/mo on 5th)', data: { amount: 25000 }, sourceClauseId: 'cl-1', sourcePage: 2 },
        { id: 'pmt-deposit', type: 'Payment', label: 'Security Deposit (₹75k)', data: { amount: 75000 }, sourceClauseId: 'cl-4', sourcePage: 3 },
        { id: 'evt-missed-rent', type: 'Event', label: 'Missed Payment (3 Mos)', data: { months: 3 } },
        { id: 'cnd-grace-expired', type: 'Condition', label: 'Grace Period Expired (Day 8)', data: { graceDays: 3 } },
        { id: 'pen-late-fee', type: 'Penalty', label: 'Late Fee Accrual (₹500/day)', data: { rate: 500 }, sourceClauseId: 'cl-2', sourcePage: 2 },
        { id: 'cnd-default', type: 'Condition', label: 'Contractual Default (>30 Days)', data: {} },
        { id: 'cnd-vacate-no-notice', type: 'Event', label: 'Vacate Without 30-Day Notice', data: {} },
        { id: 'consq-deposit-forfeit', type: 'Consequence', label: 'Deposit Offset & Forfeiture Risk', data: { amount: 75000 }, sourceClauseId: 'cl-3', sourcePage: 6 },
        { id: 'consq-arrears-claim', type: 'Consequence', label: 'Landlord Legal Demand for Arrears', data: {} },
        { id: 'stat-ica-74', type: 'Statute', label: 'Indian Contract Act, Sec 74 (Reasonable Compensation)', data: { act: 'ICA 1872' } },
        { id: 'jdg-kailash-nath', type: 'Judgment', label: 'Kailash Nath v. DDA (Deposit Forfeiture Proof of Loss)', data: {} },
        { id: 'act-seek-settlement', type: 'Action', label: 'Action: Offer Formal Key Handover & Written Offset', data: {} }
      ],
      edges: [
        { id: 'e1', source: 'party-tenant', target: 'obl-rent', relationship: 'OWES', label: 'Monthly' },
        { id: 'e2', source: 'evt-missed-rent', target: 'cnd-grace-expired', relationship: 'TRIGGERS' },
        { id: 'e3', source: 'cnd-grace-expired', target: 'pen-late-fee', relationship: 'TRIGGERS' },
        { id: 'e4', source: 'pen-late-fee', target: 'cnd-default', relationship: 'LEADS_TO' },
        { id: 'e5', source: 'cnd-vacate-no-notice', target: 'consq-deposit-forfeit', relationship: 'TRIGGERS' },
        { id: 'e6', source: 'cnd-default', target: 'consq-arrears-claim', relationship: 'LEADS_TO' },
        { id: 'e7', source: 'consq-deposit-forfeit', target: 'pmt-deposit', relationship: 'DEPENDS_ON' },
        { id: 'e8', source: 'party-tenant', target: 'stat-ica-74', relationship: 'PROTECTED_BY' },
        { id: 'e9', source: 'stat-ica-74', target: 'jdg-kailash-nath', relationship: 'SUPPORTED_BY' },
        { id: 'e10', source: 'jdg-kailash-nath', target: 'consq-deposit-forfeit', relationship: 'CONFLICTS_WITH', label: 'Requires actual damage proof' },
        { id: 'e11', source: 'consq-arrears-claim', target: 'act-seek-settlement', relationship: 'REQUIRES' }
      ]
    };
    this.graphs.set('doc-rental', rentalGraph);
    this.graphs.set('doc-rental-001', rentalGraph);

    // Seed shared base documents
    INITIAL_DOCUMENTS.forEach(doc => {
      const docRecord: DocumentRecord = {
        ...doc,
        userId: 'system',
        size: doc.size,
        status: doc.status as DocumentStatus,
      };
      this.documents.set(doc.id, docRecord);
    });
    const rentalDoc = this.documents.get('doc-rental');
    if (rentalDoc) {
      this.documents.set('doc-rental-001', { ...rentalDoc, id: 'doc-rental-001' });
    }
  }

  private ensureUserSeeded(userId: string) {
    if (!userId || this.seededUsers.has(userId)) return;
    this.seededUsers.add(userId);

    // Seed initial demo documents specifically for this authenticated user
    INITIAL_DOCUMENTS.forEach(doc => {
      const key = `${doc.id}:${userId}`;
      if (!this.documents.has(key)) {
        this.documents.set(key, {
          ...doc,
          userId,
          size: doc.size,
          status: doc.status as DocumentStatus,
        });
      }
    });
    // Also seed alias for rental agreement
    const rentalUserDoc = this.documents.get(`doc-rental:${userId}`);
    if (rentalUserDoc && !this.documents.has(`doc-rental-001:${userId}`)) {
      this.documents.set(`doc-rental-001:${userId}`, {
        ...rentalUserDoc,
        id: 'doc-rental-001',
      });
    }

    // Seed versions for this user
    Object.entries(INITIAL_DOCUMENT_VERSIONS).forEach(([docId, vers]) => {
      const key = `${docId}:${userId}`;
      if (!this.versions.has(key)) {
        this.versions.set(key, [...vers]);
      }
    });

    // Seed compliance audit for this user
    const auditKey = `${INITIAL_COMPLIANCE_AUDIT.id}:${userId}`;
    if (!this.complianceAudits.has(auditKey)) {
      this.complianceAudits.set(auditKey, {
        ...INITIAL_COMPLIANCE_AUDIT,
        userId,
      });
    }
  }

  // Document Methods
  async create(doc: Partial<DocumentRecord> & { userId: string; name: string; type: 'pdf' | 'docx' }): Promise<DocumentRecord> {
    const id = doc.id || `doc-${uuidv4().substring(0, 8)}`;
    const newDoc: DocumentRecord = {
      id,
      userId: doc.userId,
      name: doc.name,
      type: doc.type,
      size: doc.size || '1.2 MB',
      uploadedAt: 'Just now',
      status: doc.status || 'uploaded',
      color: doc.type === 'pdf' ? 'red' : 'blue',
      riskCount: doc.riskCount || 0,
      clauseCount: doc.clauseCount || 0,
      summary: doc.summary || `Document ${doc.name} uploaded successfully.`,
      storagePath: doc.storagePath,
      rawText: doc.rawText
    };
    this.documents.set(`${id}:${doc.userId}`, newDoc);
    this.documents.set(id, newDoc);
    return newDoc;
  }

  async findById(id: string, userId?: string): Promise<DocumentRecord | null> {
    const aliasId = id === 'doc-rental-001' ? 'doc-rental' : (id === 'doc-rental' ? 'doc-rental-001' : null);

    if (userId) {
      this.ensureUserSeeded(userId);
      const doc = this.documents.get(`${id}:${userId}`);
      if (doc) return doc;

      if (aliasId) {
        const aliasDoc = this.documents.get(`${aliasId}:${userId}`);
        if (aliasDoc) {
          const mappedDoc = { ...aliasDoc, id };
          this.documents.set(`${id}:${userId}`, mappedDoc);
          return mappedDoc;
        }
      }

      // Check base template in memoryStore (only system templates can be shared)
      const baseDoc = this.documents.get(id) || (aliasId ? this.documents.get(aliasId) : null);
      if (baseDoc) {
        if (baseDoc.userId === userId) {
          return baseDoc;
        }
        if (baseDoc.userId === 'system' || INITIAL_DOCUMENTS.some(d => d.id === id || (aliasId && d.id === aliasId))) {
          const userDoc: DocumentRecord = { ...baseDoc, id, userId };
          this.documents.set(`${id}:${userId}`, userDoc);
          return userDoc;
        }
        // Base doc belongs to another user - strictly deny cross-tenant access!
        return null;
      }

      // Check initial documents list
      const template = INITIAL_DOCUMENTS.find(d => d.id === id || (aliasId && d.id === aliasId));
      if (template) {
        const userDoc: DocumentRecord = {
          ...template,
          id,
          userId,
          status: template.status as DocumentStatus,
        };
        this.documents.set(`${id}:${userId}`, userDoc);
        return userDoc;
      }

      return null;
    }

    // Fallback search when no userId specified (internal/admin / system callers)
    if (this.documents.has(id)) {
      return this.documents.get(id)!;
    }
    if (aliasId && this.documents.has(aliasId)) {
      return this.documents.get(aliasId)!;
    }
    for (const doc of this.documents.values()) {
      if (doc.id === id) {
        return doc;
      }
    }
    const template = INITIAL_DOCUMENTS.find(d => d.id === id || (aliasId && d.id === aliasId));
    if (template) {
      const docRecord: DocumentRecord = {
        ...template,
        id,
        userId: 'system',
        status: template.status as DocumentStatus,
      };
      this.documents.set(id, docRecord);
      return docRecord;
    }
    return null;
  }

  async listByUser(userId: string, options?: { page?: number; limit?: number }): Promise<DocumentRecord[]> {
    this.ensureUserSeeded(userId);
    const page = Math.max(1, Math.floor(Number(options?.page) || 1));
    const rawLimit = Number(options?.limit);
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 100) : 50;
    const offset = (page - 1) * limit;

    const userDocs = Array.from(this.documents.values()).filter(d => d.userId === userId);
    return userDocs.slice(offset, offset + limit);
  }

  async updateStatus(id: string, status: DocumentStatus, updates?: string | Partial<DocumentRecord>): Promise<DocumentRecord> {
    const isString = typeof updates === 'string';
    const actualUpdates = isString ? { summary: updates as string } : (updates as Partial<DocumentRecord> || {});
    const doc = await this.findById(id, actualUpdates.userId);
    if (!doc) throw new Error(`Document ${id} not found`);
    const updated: DocumentRecord = {
      ...doc,
      status,
      ...actualUpdates
    };
    this.documents.set(`${id}:${doc.userId}`, updated);
    return updated;
  }

  async delete(id: string, userId?: string): Promise<boolean> {
    const doc = await this.findById(id, userId);
    if (!doc) return false;
    this.documents.delete(`${id}:${doc.userId}`);
    this.clauses.delete(id);
    this.legalModels.delete(id);
    this.graphs.delete(id);
    this.versions.delete(`${id}:${doc.userId}`);
    return true;
  }

  // Versioning Methods
  async listVersions(documentId: string): Promise<DocumentVersion[]> {
    for (const [key, vers] of this.versions.entries()) {
      if (key === documentId || key.startsWith(`${documentId}:`)) {
        return vers;
      }
    }
    return [];
  }

  async saveVersion(documentId: string, version: Partial<DocumentVersion>): Promise<DocumentVersion> {
    const existing = await this.listVersions(documentId);
    const newVer: DocumentVersion = {
      id: version.id || `ver-${uuidv4().substring(0, 8)}`,
      documentId,
      versionNumber: version.versionNumber || `v1.${existing.length}`,
      title: version.title || 'Document Amendment',
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      author: version.author || { name: 'User', role: 'User' },
      summary: version.summary || 'Clause amendment recorded.',
      changeType: version.changeType || 'clause_amendment',
      changeCount: version.changes?.length || 1,
      riskCount: version.riskCount ?? 1,
      clauseCount: version.clauseCount ?? 14,
      changes: version.changes || [],
      isCurrent: true,
      ...version
    };

    const updated = [
      newVer,
      ...existing.map(v => ({ ...v, isCurrent: false }))
    ];
    this.versions.set(documentId, updated);
    return newVer;
  }

  async revertVersion(documentId: string, versionId: string, note?: string): Promise<{ document: DocumentRecord; version: DocumentVersion }> {
    let doc = await this.findById(documentId);
    if (!doc) {
      const { repository } = await import('./supabaseRepository');
      doc = await repository.findById(documentId);
      if (doc) {
        this.documents.set(documentId, doc);
      } else {
        throw new Error(`Document ${documentId} not found`);
      }
    }

    const vers = await this.listVersions(documentId);
    const target = vers.find(v => v.id === versionId);
    if (!target) throw new Error(`Version ${versionId} not found`);

    const nextVerNumber = `v1.${vers.length}`;
    const revertedVersion: DocumentVersion = {
      id: `ver-${uuidv4().substring(0, 8)}`,
      documentId,
      versionNumber: nextVerNumber,
      title: `Restored to ${target.versionNumber}`,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      author: { name: 'User', role: 'User' },
      summary: note?.trim() || `Reverted active document back to ${target.versionNumber} snapshot (${target.title}).`,
      changeType: 'reverted',
      changeCount: target.changeCount,
      riskCount: target.riskCount,
      clauseCount: target.clauseCount,
      changes: target.changes.map(ch => ({ ...ch, explanation: `Restored: ${ch.explanation}` })),
      snapshotClauses: target.snapshotClauses,
      isCurrent: true,
      revertedFromVersion: target.versionNumber
    };

    this.versions.set(documentId, [
      revertedVersion,
      ...vers.map(v => ({ ...v, isCurrent: false }))
    ]);

    doc.summary = target.summary;
    doc.riskCount = target.riskCount;
    doc.clauseCount = target.clauseCount;
    this.documents.set(`${documentId}:${doc.userId}`, doc);

    if (target.snapshotClauses && target.snapshotClauses.length > 0) {
      this.clauses.set(documentId, [...target.snapshotClauses]);
    }

    return { document: doc, version: revertedVersion };
  }

  // Clause Methods
  async saveMany(documentId: string, clauses: ClauseItem[]): Promise<ClauseItem[]> {
    this.clauses.set(documentId, clauses);
    return clauses;
  }

  async saveClauses(documentId: string, clauses: ClauseItem[], userId?: string): Promise<ClauseItem[]> {
    return this.saveMany(documentId, clauses);
  }

  async listByDocument(documentId: string): Promise<ClauseItem[]> {
    return this.clauses.get(documentId) || [];
  }

  async getClausesByDocument(documentId: string, userId?: string): Promise<ClauseItem[]> {
    return this.listByDocument(documentId);
  }

  async findClauseById(documentId: string, clauseId: string): Promise<ClauseItem | null> {
    const list = this.clauses.get(documentId) || [];
    return list.find(c => c.id === clauseId) || null;
  }

  // Legal Model Methods
  async saveModel(documentId: string, model: LegalModelData): Promise<LegalModelData> {
    this.legalModels.set(documentId, model);
    return model;
  }

  async saveLegalModel(documentId: string, model: LegalModelData, userId?: string): Promise<LegalModelData> {
    return this.saveModel(documentId, model);
  }

  async findModelByDocument(documentId: string): Promise<LegalModelData | null> {
    return this.legalModels.get(documentId) || null;
  }

  async getLegalModel(documentId: string, userId?: string): Promise<LegalModelData | null> {
    return this.findModelByDocument(documentId);
  }

  // Graph Methods
  async saveGraph(documentId: string, graph: LegalGraph): Promise<LegalGraph> {
    const stampedGraph: LegalGraph = {
      documentId,
      nodes: graph.nodes.map(n => ({
        ...n,
        documentId: n.documentId || documentId,
        data: { ...(n.data || {}) }
      })),
      edges: graph.edges.map(e => ({
        ...e,
        documentId: e.documentId || documentId
      })),
      metadata: {
        generatedAt: graph.metadata?.generatedAt || new Date().toISOString(),
        nodeCount: graph.nodes.length,
        edgeCount: graph.edges.length,
        isValid: graph.metadata?.isValid ?? true,
        errors: graph.metadata?.errors || []
      }
    };
    this.graphs.set(documentId, stampedGraph);
    return stampedGraph;
  }

  async findGraphByDocument(documentId: string): Promise<LegalGraph | null> {
    const g = this.graphs.get(documentId);
    if (!g) return null;
    return {
      documentId,
      nodes: g.nodes.map(n => ({ ...n, data: { ...(n.data || {}) } })),
      edges: g.edges.map(e => ({ ...e })),
      metadata: g.metadata || {
        generatedAt: new Date().toISOString(),
        nodeCount: g.nodes.length,
        edgeCount: g.edges.length,
        isValid: true
      }
    };
  }

  async getGraphByDocument(documentId: string, userId?: string): Promise<LegalGraph | null> {
    return this.findGraphByDocument(documentId);
  }

  // Analysis Jobs
  async createJob(job: Partial<AnalysisJobRecord> & { documentId: string; userId: string }): Promise<AnalysisJobRecord> {
    const id = job.id || `job-${uuidv4().substring(0, 8)}`;
    const record: AnalysisJobRecord = {
      id,
      documentId: job.documentId,
      userId: job.userId,
      status: job.status || 'uploaded',
      currentStep: job.currentStep || 'Job started',
      progressPercentage: job.progressPercentage || 0,
      errorMessage: job.errorMessage,
      startedAt: job.startedAt || new Date().toISOString(),
      completedAt: job.completedAt
    };
    this.jobs.set(id, record);
    return record;
  }

  async findJobById(id: string): Promise<AnalysisJobRecord | null> {
    return this.jobs.get(id) || null;
  }

  async getJobById(id: string): Promise<AnalysisJobRecord | null> {
    return this.findJobById(id);
  }

  async findJobByDocument(documentId: string): Promise<AnalysisJobRecord | null> {
    const list = Array.from(this.jobs.values());
    return list.filter(j => j.documentId === documentId).sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] || null;
  }

  async getJobByDocumentId(documentId: string): Promise<AnalysisJobRecord | null> {
    return this.findJobByDocument(documentId);
  }

  async updateJob(id: string, updates: Partial<AnalysisJobRecord>): Promise<AnalysisJobRecord> {
    const job = this.jobs.get(id);
    if (!job) throw new Error(`Job ${id} not found`);
    const updated: AnalysisJobRecord = {
      ...job,
      ...updates
    };
    this.jobs.set(id, updated);
    return updated;
  }

  // Scenario Methods
  async saveScenario(scenario: ScenarioSimulationResult & { userId: string }): Promise<ScenarioSimulationResult> {
    this.scenarios.set(scenario.id, scenario);
    return scenario;
  }

  async findScenarioById(id: string, userId?: string): Promise<ScenarioSimulationResult | null> {
    const scen = this.scenarios.get(id);
    if (!scen) return null;
    if (userId && scen.userId !== userId) return null;
    return scen;
  }

  async listScenariosByDocument(documentId: string, userId?: string): Promise<ScenarioSimulationResult[]> {
    const all = Array.from(this.scenarios.values());
    return all.filter(s => s.documentId === documentId && (!userId || s.userId === userId));
  }

  async findScenariosByDocument(documentId: string, userId?: string): Promise<ScenarioSimulationResult[]> {
    return this.listScenariosByDocument(documentId, userId);
  }

  // Risk Methods
  async saveRisks(documentId: string, risks: RiskFinding[], userId?: string): Promise<RiskFinding[]> {
    this.risks.set(documentId, risks);
    return risks;
  }

  async listRisksByDocument(documentId: string): Promise<RiskFinding[]> {
    return this.risks.get(documentId) || [];
  }

  async getRisksByDocument(documentId: string, userId?: string): Promise<RiskFinding[]> {
    return this.listRisksByDocument(documentId);
  }

  // Conflict Methods
  async saveConflicts(documentId: string, conflicts: ConflictFinding[], userId?: string): Promise<ConflictFinding[]> {
    this.conflicts.set(documentId, conflicts);
    return conflicts;
  }

  async listConflictsByDocument(documentId: string): Promise<ConflictFinding[]> {
    return this.conflicts.get(documentId) || [];
  }

  async getConflictsByDocument(documentId: string, userId?: string): Promise<ConflictFinding[]> {
    return this.listConflictsByDocument(documentId);
  }

  // Lawyer Kit Methods
  async saveKit(kit: LawyerKitData & { userId?: string }): Promise<LawyerKitData> {
    const fullKit = { ...kit, userId: kit.userId || 'demo-user-123' };
    this.lawyerKits.set(kit.id, fullKit);
    return fullKit;
  }

  async saveLawyerKit(kit: LawyerKitData, userId?: string): Promise<LawyerKitData> {
    return this.saveKit({ ...kit, userId: userId || kit.userId });
  }


  async findKitById(id: string, userId?: string): Promise<LawyerKitData | null> {
    const kit = this.lawyerKits.get(id);
    if (!kit) return null;
    if (userId && kit.userId !== userId) return null;
    return kit;
  }

  async findKitByDocument(documentId: string, userId?: string): Promise<LawyerKitData | null> {
    const list = Array.from(this.lawyerKits.values());
    return list.slice().reverse().find(k => k.documentId === documentId && (!userId || k.userId === userId)) || null;
  }

  async getLawyerKitByDocument(documentId: string, userId?: string): Promise<LawyerKitData | null> {
    return this.findKitByDocument(documentId, userId);
  }

  // Legal Source Search
  async searchLegalSources(query: string, limit = 5): Promise<LegalAuthority[]> {
    const q = query.toLowerCase();
    const scored = this.legalSources.map(src => {
      let score = 0;
      if (src.title.toLowerCase().includes(q)) score += 5;
      if (src.summary.toLowerCase().includes(q)) score += 3;
      if (src.relevanceExplanation.toLowerCase().includes(q)) score += 2;
      return { src, score };
    });
    return scored
      .filter(s => s.score > 0 || query.length < 4)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.src);
  }

  async saveLegalSources(sources: LegalAuthority[]): Promise<LegalAuthority[]> {
    this.legalSources = [...this.legalSources, ...sources];
    return sources;
  }

  async listAuthoritative(): Promise<LegalAuthority[]> {
    return [...this.legalSources];
  }

  // Compliance Audit Repository Methods
  async saveComplianceAudit(audit: ComplianceAuditRecord): Promise<ComplianceAuditRecord> {
    const key = audit.userId ? `${audit.id}:${audit.userId}` : audit.id;
    this.complianceAudits.set(key, { ...audit });
    return { ...audit };
  }

  async findComplianceAuditById(id: string, userId?: string): Promise<ComplianceAuditRecord | null> {
    if (userId) {
      this.ensureUserSeeded(userId);
      const audit = this.complianceAudits.get(`${id}:${userId}`);
      if (audit) return { ...audit };
    }
    for (const audit of this.complianceAudits.values()) {
      if (audit.id === id && (!userId || audit.userId === userId)) {
        return { ...audit };
      }
    }
    return null;
  }

  async getComplianceAuditById(id: string, userId?: string): Promise<ComplianceAuditRecord | null> {
    return this.findComplianceAuditById(id, userId);
  }

  async listComplianceAuditsByDocument(documentId: string, userId?: string): Promise<ComplianceAuditRecord[]> {
    if (userId) {
      this.ensureUserSeeded(userId);
    }
    return Array.from(this.complianceAudits.values())
      .filter(a => a.documentId === documentId && (!userId || a.userId === userId))
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }

  async getComplianceAuditsByDocument(documentId: string, userId?: string): Promise<ComplianceAuditRecord[]> {
    return this.listComplianceAuditsByDocument(documentId, userId);
  }

  async updateComplianceAudit(id: string, updates: Partial<ComplianceAuditRecord>): Promise<ComplianceAuditRecord> {
    const existing = await this.findComplianceAuditById(id, updates.userId);
    if (!existing) {
      throw new Error(`Compliance audit not found: ${id}`);
    }
    const updated: ComplianceAuditRecord = {
      ...existing,
      ...updates,
      summaryMetrics: updates.summaryMetrics || existing.summaryMetrics,
      findings: updates.findings || existing.findings,
      debateLog: updates.debateLog || existing.debateLog,
      applicableAuthorities: updates.applicableAuthorities || existing.applicableAuthorities
    };
    const key = updated.userId ? `${updated.id}:${updated.userId}` : updated.id;
    this.complianceAudits.set(key, updated);
    return { ...updated };
  }

  // Chunk Repository Methods
  async saveChunks(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    if (!chunks || chunks.length === 0) return [];
    const docId = chunks[0].documentId;
    this.chunks.set(docId, [...chunks]);
    return [...chunks];
  }

  async getChunksByDocument(documentId: string): Promise<DocumentChunk[]> {
    return this.chunks.get(documentId) || [];
  }

  async searchChunksByVector(
    documentId: string, 
    queryEmbedding: number[], 
    topK = 5
  ): Promise<{ chunk: DocumentChunk; similarity: number }[]> {
    const docChunks = await this.getChunksByDocument(documentId);
    if (!docChunks || docChunks.length === 0) return [];

    const scored = docChunks.map(chunk => {
      const vec = chunk.embedding || EmbeddingService.generateDeterministicVector(chunk.chunkText);
      const similarity = EmbeddingService.cosineSimilarity(queryEmbedding, vec);
      return { chunk, similarity };
    });

    return scored
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  async searchLegalSourcesByVector(
    queryEmbedding: number[], 
    topK = 5
  ): Promise<{ source: LegalAuthority; similarity: number }[]> {
    const scored = this.legalSources.map(source => {
      const text = `${source.title} ${source.summary} ${source.actOrCourt} ${source.sectionOrArticle}`;
      const vec = EmbeddingService.generateDeterministicVector(text);
      const similarity = EmbeddingService.cosineSimilarity(queryEmbedding, vec);
      return { source, similarity };
    });

    return scored
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }
}

export const memoryStore = new MemoryStore();
