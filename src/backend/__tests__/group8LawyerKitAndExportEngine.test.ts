import { describe, it, expect, beforeEach } from 'vitest';
import { LawyerKitService } from '../services/lawyerKit/lawyerKitService';
import { PdfExportService } from '../services/export/pdfExportService';
import { memoryStore } from '../repositories/memoryStore';
import { LawyerKitData } from '../types/backendTypes';
import { CONSTANTS } from '../config/constants';

describe('GROUP 8: Lawyer Prep-Kit & Export Engine Forensic Verification', () => {
  const testDocId = 'doc-g8-test';
  const tenantAId = 'usr-tenant-alpha';
  const tenantBId = 'usr-tenant-beta';

  beforeEach(async () => {
    // Seed mock document in memoryStore for tenant A
    await memoryStore.create({
      id: testDocId,
      userId: tenantAId,
      name: 'Commercial Supply & Tenancy Agreement',
      type: 'pdf',
      size: '1.2 MB',
      uploadedAt: new Date().toISOString(),
      status: 'analyzed',
      riskCount: 2,
      clauseCount: 14,
      summary: 'Commercial agreement with 30-day notice and lock-in.',
      rawText: 'Section 4.1: Rent is ₹50,000 payable monthly on or before the 5th of each month. Late payment attracts ₹500 per day after a 3-day grace period. Section 12.1: Termination prior to the 6-month lock-in period results in forfeiture of ₹100,000 security deposit.'
    });

    // Seed mock legal model
    await memoryStore.saveModel(testDocId, {
      documentId: testDocId,
      parties: [
        { id: 'p1', name: 'Apex Logistics Pvt Ltd', role: 'tenant' },
        { id: 'p2', name: 'Metro Infra Estates', role: 'landlord' }
      ],
      obligations: [
        { id: 'obl-1', actor: 'tenant', action: 'Pay rent', description: 'Pay ₹50,000 monthly rent before 5th', sourceClauseId: 'cl-1', sourcePage: 2, confidence: 0.95 }
      ],
      rights: [],
      conditions: [],
      payments: [
        { id: 'pay-1', payer: 'tenant', payee: 'landlord', purpose: 'rent', amount: 50000, currency: 'INR', frequency: 'monthly', sourceClauseId: 'cl-1', sourcePage: 2 }
      ],
      penalties: [
        { id: 'pen-1', actorSubject: 'tenant', triggerCondition: 'Late rent payment', penaltyType: 'daily_fine', rate: 500, rateUnit: 'per_day', description: '₹500 per day late fee', sourceClauseId: 'cl-2', sourcePage: 2 }
      ],
      termination: [
        { id: 'term-1', noticePeriodDays: 30, grounds: 'convenience', lockInMonths: 6, consequences: ['Security deposit forfeiture'], sourceClauseId: 'cl-3', sourcePage: 6 }
      ],
      deadlines: [
        { id: 'dl-1', actor: 'tenant', description: 'Monthly Rent Payment', triggerEvent: '5th of each month', mandatory: true, sourceClauseId: 'cl-1', sourcePage: 2 }
      ],
      events: [],
      dependencies: [],
      conflicts: []
    });
  });

  it('1. Data Assembly: Assembles comprehensive structured Lawyer Prep-Kit with provenance', async () => {
    const kit = await LawyerKitService.generateKit(testDocId, tenantAId);

    expect(kit).toBeDefined();
    expect(kit.id).toBeDefined();
    expect(kit.documentId).toBe(testDocId);
    expect(kit.userId).toBe(tenantAId);
    expect(kit.documentName).toBe('Commercial Supply & Tenancy Agreement');

    // Key facts
    expect(kit.keyFacts.length).toBeGreaterThanOrEqual(3);
    expect(kit.keyFacts[0].label).toBeDefined();
    expect(kit.keyFacts[0].value).toBeDefined();

    // Key clauses with provenance
    expect(kit.keyClauses.length).toBeGreaterThanOrEqual(2);
    expect(kit.keyClauses[0].clauseId).toBeDefined();
    expect(kit.keyClauses[0].page).toBeDefined();
    expect(kit.keyClauses[0].excerpt).toBeDefined();

    // Indian Legal Authorities
    expect(kit.authoritativeLegalSources.length).toBeGreaterThanOrEqual(1);
    expect(kit.authoritativeLegalSources[0].actOrCourt).toBeDefined();
    expect(kit.authoritativeLegalSources[0].sectionOrArticle).toBeDefined();
  });

  it('2. Grounded Questions & Documents-to-bring checklist derived without fabrication', async () => {
    const kit = await LawyerKitService.generateKit(testDocId, tenantAId);

    // Questions for lawyer
    expect(kit.questionsForLegalProfessional.length).toBeGreaterThanOrEqual(2);
    const hasDepositQuestion = kit.questionsForLegalProfessional.some(q => 
      q.includes('deposit') || q.includes('Section 74') || q.includes('forfeiture') || q.includes('penalty')
    );
    expect(hasDepositQuestion).toBe(true);

    // Documents to bring checklist
    expect(kit.documentsToBring.length).toBeGreaterThanOrEqual(3);
    expect(kit.documentsToBring[0]).toContain('Agreement');

    // Assumptions & Uncertainty
    expect(kit.assumptions.length).toBeGreaterThanOrEqual(1);
    expect(kit.uncertainty).toBeDefined();
    expect(kit.disclaimer).toBe(CONSTANTS.LEGAL_DISCLAIMER);
  });

  it('3. Scenario findings & calculations integration', async () => {
    // Seed scenario
    const scenario = await memoryStore.saveScenario({
      id: 'scen-g8-test',
      documentId: testDocId,
      userId: tenantAId,
      title: 'Missed Rent Payment Simulation',
      inputPrompt: 'I missed rent by 15 days',
      normalizedInterpretation: 'Missed rent payment by 15 days',
      totalFinancialImpact: '₹6,000',
      totalFinancialImpactMinor: 600000,
      financialBreakdown: [{ label: 'Late Penalty (12 days)', amount: '₹6,000', amountMinor: 600000, note: '₹500/day after 3 days' }],
      keyPoints: ['₹6,000 late fee calculated', 'Grace period applied'],
      documentSays: 'Late fee ₹500/day after 3 days.',
      lawSays: 'Section 74 Indian Contract Act limits penalties.',
      lexflowAnalysis: 'Total exposure calculated at ₹6,000.',
      applicableLaw: [],
      risks: [{ title: 'Late Fee Accumulation', description: 'Accrues daily', level: 'high' }],
      protections: [{ title: '3-Day Grace Period', description: 'No penalty during first 3 days' }],
      conflicts: [],
      evidence: [],
      suggestedNextSteps: ['Pay arrears immediately'],
      targetNodeIds: ['node-rent', 'node-penalty'],
      relevantClauses: [{ clauseId: 'cl-2', section: 'Section 4.3', title: 'Late Fee', excerpt: '₹500 per day', page: 2 }],
      timeline: [
        { step: 1, time: 'Day 5', event: 'Payment Due', status: 'past' },
        { step: 2, time: 'Day 8', event: 'Late Fee Starts', status: 'trigger' },
        { step: 3, time: 'Day 20', event: '₹6,000 Accrued', status: 'consequence' }
      ],
      status: 'completed',
      disclaimer: CONSTANTS.LEGAL_DISCLAIMER
    });

    const kitWithScenario = await LawyerKitService.generateKit(testDocId, tenantAId, scenario.id);

    expect(kitWithScenario.scenarioFindings).toBeDefined();
    expect(kitWithScenario.scenarioFindings?.question).toBe('I missed rent by 15 days');
    expect(kitWithScenario.scenarioFindings?.financialImpact).toBe('₹6,000');
    expect(kitWithScenario.scenarioTested).toBe('I missed rent by 15 days');
  });

  it('4. Multi-Tenant Isolation: Tenant B cannot access or retrieve Tenant A prep-kit', async () => {
    const kitA = await LawyerKitService.generateKit(testDocId, tenantAId);

    // Tenant A can retrieve
    const retrievedA = await memoryStore.findKitById(kitA.id, tenantAId);
    expect(retrievedA).toBeDefined();
    expect(retrievedA?.userId).toBe(tenantAId);

    // Tenant B cannot retrieve
    const retrievedB = await memoryStore.findKitById(kitA.id, tenantBId);
    expect(retrievedB).toBeNull();

    // Find by document with tenant B
    const docKitB = await memoryStore.findKitByDocument(testDocId, tenantBId);
    expect(docKitB).toBeNull();
  });

  it('5. PDF Generation Engine: Generates valid vector PDF binary stream', async () => {
    const kit = await LawyerKitService.generateKit(testDocId, tenantAId);
    const pdfBuffer = await PdfExportService.generatePdfBuffer(kit);

    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(1000); // Substantial PDF size

    // Verify PDF header magic bytes "%PDF-"
    const header = pdfBuffer.subarray(0, 5).toString('ascii');
    expect(header).toBe('%PDF-');
  });

  it('6. PDF Generation with scenario findings and long text handles pagination cleanly', async () => {
    const kit = await LawyerKitService.generateKit(testDocId, tenantAId);
    kit.scenarioFindings = {
      question: 'Withholding rent due to maintenance breach',
      normalizedScenario: 'Tenant withholds rent after 45 days unresolved dampness',
      affectedClauses: ['Section 4.1', 'Section 8.2'],
      affectedGraphNodes: ['party-tenant', 'obl-rent'],
      consequences: ['Risk of summary default notice', 'Need to preserve maintenance correspondence'],
      financialImpact: '₹50,000',
      financialBreakdown: [{ label: 'Withheld Rent', amount: '₹50,000', amountMinor: 5000000, note: '1 month arrears' }],
      timeline: [
        { step: 1, time: 'Day 1', event: 'Defect Notified', status: 'past' },
        { step: 2, time: 'Day 30', event: 'Follow-up sent', status: 'past' },
        { step: 3, time: 'Day 45', event: 'Rent Withheld', status: 'trigger' },
      ],
      uncertainty: 'Requires proof of written notice to landlord'
    };

    const pdfBuffer = await PdfExportService.generatePdfBuffer(kit);
    expect(pdfBuffer).toBeDefined();
    expect(pdfBuffer.length).toBeGreaterThan(1500);
    expect(pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');
  });

  it('7. Persistence: Kit is persisted across repository lookups', async () => {
    const kit = await LawyerKitService.generateKit(testDocId, tenantAId);
    const retrieved = await memoryStore.findKitByDocument(testDocId, tenantAId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.id).toBe(kit.id);
    expect(retrieved?.executiveSummary).toBe(kit.executiveSummary);
  });
});
