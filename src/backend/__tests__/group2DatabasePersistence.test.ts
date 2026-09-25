import { describe, it, expect, beforeEach } from 'vitest';
import { SupabaseRepository } from '../repositories/supabaseRepository';
import { memoryStore } from '../repositories/memoryStore';
import { DatabaseError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

describe('Group 2 — Database & Persistence Parity Test Suite', () => {
  const repo = new SupabaseRepository();
  const userA = 'user-persistence-a-' + uuidv4().substring(0, 8);
  const userB = 'user-persistence-b-' + uuidv4().substring(0, 8);

  it('should persist document creation and maintain tenant isolation', async () => {
    const docA = await repo.create({
      userId: userA,
      name: 'User A Commercial Lease.pdf',
      type: 'pdf',
      summary: 'Lease for User A office space'
    });

    expect(docA.id).toBeDefined();
    expect(docA.userId).toBe(userA);

    const docB = await repo.create({
      userId: userB,
      name: 'User B Service Agreement.docx',
      type: 'docx',
      summary: 'Agreement for User B services'
    });

    expect(docB.id).toBeDefined();
    expect(docB.userId).toBe(userB);

    // User A can fetch Doc A
    const fetchedA = await repo.findById(docA.id, userA);
    expect(fetchedA).not.toBeNull();
    expect(fetchedA?.id).toBe(docA.id);

    // User B CANNOT fetch Doc A (Tenant Isolation)
    const crossFetchA = await repo.findById(docA.id, userB);
    expect(crossFetchA).toBeNull();

    // User A list contains docA, not docB
    const userADocs = await repo.listByUser(userA);
    expect(userADocs.some(d => d.id === docA.id)).toBe(true);
    expect(userADocs.some(d => d.id === docB.id)).toBe(false);
  });

  it('should persist document versions and allow version reversion', async () => {
    const doc = await repo.create({
      userId: userA,
      name: 'Versioned Lease.pdf',
      type: 'pdf'
    });

    const v1 = await repo.saveVersion(doc.id, {
      versionNumber: 'v1.0',
      title: 'Initial Draft',
      summary: 'First draft of lease',
      author: { name: 'User A', role: 'Counsel' }
    });

    const v2 = await repo.saveVersion(doc.id, {
      versionNumber: 'v2.0',
      title: 'Landlord Comments',
      summary: 'Added indemnification clause',
      author: { name: 'Landlord Counsel', role: 'Landlord' }
    });

    expect(v1.id).toBeDefined();
    expect(v2.id).toBeDefined();

    const versions = await repo.listVersions(doc.id);
    expect(versions.length).toBeGreaterThanOrEqual(2);

    const reverted = await repo.revertVersion(doc.id, v1.id, 'Rolling back landlord changes');
    expect(reverted.version).toBeDefined();
  });

  it('should persist compliance audit records with full findings', async () => {
    const doc = await repo.create({
      userId: userA,
      name: 'Audit Target Contract.pdf',
      type: 'pdf'
    });

    const auditId = 'audit-' + uuidv4().substring(0, 8);
    const auditRecord = await repo.saveComplianceAudit({
      id: auditId,
      documentId: doc.id,
      documentName: doc.name,
      userId: userA,
      status: 'completed',
      currentStep: 'Audit Completed',
      progressPercentage: 100,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      summaryMetrics: {
        totalFindings: 2,
        highPriorityCount: 1,
        mediumPriorityCount: 1,
        protectionCount: 0,
        disputedCount: 0,
        humanReviewCount: 1
      },
      findings: [
        {
          findingId: 'f-101',
          category: 'penalty_exposure',
          severity: 'high',
          title: 'Uncapped Late Fee Penalty',
          claim: 'Daily 2% late fee exceeds statutory caps under Indian Contract Act Section 74',
          reasoning: 'Punitive damages without genuine pre-estimate of loss',
          affectedClauseRefs: ['cl-3'],
          evidence: [],
          legalAuthorities: [],
          consensusStatus: 'CONFIRMED',
          humanReviewRecommended: true,
          lexflowSynthesis: 'Late fee clause is legally vulnerable',
          reviewerPosition: { argument: 'Clause is punitive', confidence: 0.95 },
          skepticChallenge: { challenge: 'May be customary', counterEvidence: [], alternativeInterpretation: 'Enforceable if pre-agreed', missingInformation: [], confidence: 0.6 },
          debateRounds: []
        }
      ],
      debateLog: [],
      applicableAuthorities: [],
      overallExecutiveSummary: 'Audit flagged 1 high penalty exposure finding.'
    });

    expect(auditRecord.id).toBe(auditId);

    const fetchedAudit = await repo.findComplianceAuditById(auditId, userA);
    expect(fetchedAudit).not.toBeNull();
    expect(fetchedAudit?.documentId).toBe(doc.id);

    // Cross-user access check
    const crossAudit = await repo.findComplianceAuditById(auditId, userB);
    expect(crossAudit).toBeNull();
  });

  it('should persist scenarios and lawyer kits', async () => {
    const doc = await repo.create({
      userId: userA,
      name: 'Scenario Contract.pdf',
      type: 'pdf'
    });

    const scenarioId = 'scen-' + uuidv4().substring(0, 8);
    const scenario = await repo.saveScenario({
      id: scenarioId,
      documentId: doc.id,
      userId: userA,
      inputPrompt: 'What happens if tenant vacates early?',
      normalizedInterpretation: 'Early termination consequences',
      title: 'Early Termination Scenario',
      documentSays: 'Tenant forfeits security deposit',
      lawSays: 'Section 74 limits arbitrary forfeiture',
      lexflowAnalysis: 'Landlord can only retain actual proved loss',
      totalFinancialImpact: '₹75,000 max exposure',
      totalFinancialImpactMinor: 0,
      financialBreakdown: [],
      keyPoints: [],
      relevantClauses: [],
      applicableLaw: [],
      timeline: [],
      risks: [],
      protections: [],
      conflicts: [],
      evidence: [],
      suggestedNextSteps: [],
      disclaimer: 'Legal analysis only',
      status: 'completed'
    });

    expect(scenario.id).toBe(scenarioId);

    const fetchedScenario = await repo.findScenarioById(scenarioId, userA);
    expect(fetchedScenario).not.toBeNull();
    expect(fetchedScenario?.title).toBe('Early Termination Scenario');

    // Cross-tenant check
    const crossScenario = await repo.findScenarioById(scenarioId, userB);
    expect(crossScenario).toBeNull();
  });

  it('should throw DatabaseError in production when Supabase is unconfigured/fails instead of silent fake success', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalVitest = process.env.VITEST;

    try {
      // Simulate production environment
      process.env.NODE_ENV = 'production';
      delete process.env.VITEST;

      const prodRepo = new SupabaseRepository();
      // Calling repository when Supabase client fails in production should throw DatabaseError
      await expect(prodRepo.listByUser('invalid-user')).rejects.toThrow();
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
      if (originalVitest) process.env.VITEST = originalVitest;
    }
  });
});
