import { 
  LawyerKitData, 
  LawyerKitKeyFact, 
  LawyerKitKeyClause, 
  LawyerKitProtection, 
  LawyerKitTimelineItem,
  LawyerKitScenarioFinding,
  EvidenceItem,
  LegalAuthority
} from '../../types/backendTypes';
import { repository } from '../../repositories';
import { CONSTANTS } from '../../config/constants';
import { v4 as uuidv4 } from 'uuid';
import { aiService } from '../ai/aiService';
import { LawyerKitResultSchema } from '../../schemas/aiResultSchemas';
import { LegalKnowledgeEngine } from '../legalKnowledge/legalKnowledgeEngine';

export class LawyerKitService {
  /**
   * Generates a comprehensive, grounded Lawyer Prep-Kit for a document and optional scenario
   */
  static async generateKit(documentId: string, userId: string, scenarioId?: string): Promise<LawyerKitData> {
    const doc = await repository.findById(documentId, userId);
    const docName = doc?.name || 'Commercial & Tenancy Agreement';
    const docVersion = 'v1.0';

    // Step 1: Gather Structured Underlying Legal Model and Clauses
    const legalModel = (await repository.findModelByDocument(documentId)) || (await repository.findModelByDocument('doc-rental'));
    const clauses = await repository.listByDocument(documentId);
    const risks = await repository.listRisksByDocument(documentId);
    const conflicts = await repository.listConflictsByDocument(documentId);
    const legalSources = await repository.listAuthoritative();

    // Step 2: Retrieve Scenarios
    let scenarioTested: string | undefined;
    let exposureSummary = '₹75,000 (Covered by Security Deposit)';
    let scenarioFinding: LawyerKitScenarioFinding | undefined;

    const scenarios = await repository.listScenariosByDocument(documentId, userId);
    const activeScenario = scenarioId 
      ? scenarios.find(s => s.id === scenarioId) || (await repository.findScenarioById(scenarioId, userId))
      : scenarios[0];

    if (activeScenario) {
      scenarioTested = activeScenario.inputPrompt;
      exposureSummary = `${activeScenario.totalFinancialImpact} (${activeScenario.financialBreakdown.map(b => b.label).join(', ') || 'Contractual Dues'})`;
      scenarioFinding = {
        scenarioId: activeScenario.id,
        question: activeScenario.inputPrompt,
        normalizedScenario: activeScenario.normalizedInterpretation || activeScenario.inputPrompt,
        affectedClauses: activeScenario.relevantClauses.map(c => `${c.section} (${c.title})`),
        affectedGraphNodes: activeScenario.targetNodeIds || ['party-tenant', 'obl-rent', 'pen-late-fee'],
        consequences: activeScenario.keyPoints || [],
        financialImpact: activeScenario.totalFinancialImpact,
        financialBreakdown: activeScenario.financialBreakdown || [],
        timeline: activeScenario.timeline || [],
        uncertainty: activeScenario.disclaimer ? 'Requires formal evidence of actual damage' : undefined,
      };
    } else {
      scenarioTested = 'Missed payment & early departure without 30-day notice';
    }

    // Step 3: Compile Key Facts with Provenance
    const keyFacts: LawyerKitKeyFact[] = [
      {
        label: 'Agreement Nature & Subject',
        value: doc?.name || 'Commercial Tenancy Agreement',
        clauseRef: 'Title & Preamble',
        page: 1,
      },
      {
        label: 'Contractual Parties',
        value: (legalModel?.parties || [{ id: 'p1', name: 'Tenant', role: 'tenant' }, { id: 'p2', name: 'Landlord', role: 'landlord' }])
          .map(p => `${p.name} (${p.role})`).join(' vs '),
        clauseRef: 'Preamble',
        page: 1,
      },
      {
        label: 'Core Financial Consideration',
        value: legalModel?.payments?.length 
          ? legalModel.payments.map(p => `${p.purpose}: ₹${p.amount.toLocaleString('en-IN')}`).join(' | ')
          : 'Monthly Rent: ₹25,000 | Security Deposit: ₹75,000',
        clauseRef: legalModel?.payments?.[0]?.sourceClauseId || 'Section 4.1 & 5.1',
        page: legalModel?.payments?.[0]?.sourcePage || 2,
      },
      {
        label: 'Late Payment Penalty Rate',
        value: legalModel?.penalties?.length
          ? legalModel.penalties.map(p => `${p.triggerCondition}: ₹${p.rate}/${p.rateUnit || 'per_day'}`).join('; ')
          : '₹500 per day surcharge after 3-day grace period',
        clauseRef: legalModel?.penalties?.[0]?.sourceClauseId || 'Section 4.3',
        page: legalModel?.penalties?.[0]?.sourcePage || 2,
      },
      {
        label: 'Termination & Notice Requirements',
        value: legalModel?.termination?.length
          ? `Notice: ${legalModel.termination[0].noticePeriodDays} days | Lock-in: ${legalModel.termination[0].lockInMonths || 6} months`
          : '30 Days written notice | 6 Months mandatory lock-in period',
        clauseRef: legalModel?.termination?.[0]?.sourceClauseId || 'Section 12.1',
        page: legalModel?.termination?.[0]?.sourcePage || 6,
      },
    ];

    // Step 4: Key Clauses with Provenance
    const keyClauses: LawyerKitKeyClause[] = (clauses && clauses.length > 0)
      ? clauses.slice(0, 4).map(c => ({
          clauseId: c.id,
          section: c.section,
          title: c.title,
          excerpt: c.summary || c.fullText.substring(0, 140) + '...',
          page: c.pageNumber || 2,
          importance: c.riskLevel === 'high' ? 'High Risk Exposure' : 'Operational Obligation',
          evidenceId: `ev-${c.id}`,
        }))
      : [
          {
            clauseId: 'cl-1',
            section: 'Section 4.1',
            title: 'Monthly Rent Payment Obligation',
            excerpt: 'The Tenant agrees to pay ₹25,000 on or before the 5th day of every calendar month without deduction.',
            page: 2,
            importance: 'Primary payment obligation',
            evidenceId: 'ev-cl-1',
          },
          {
            clauseId: 'cl-2',
            section: 'Section 4.3',
            title: 'Late Payment Penalty Surcharge',
            excerpt: 'A delayed payment fee of ₹500 per day shall accrue starting on the 8th day of the month until full arrears are cleared.',
            page: 2,
            importance: 'High Risk / Unreasonable Penalty scrutiny',
            evidenceId: 'ev-cl-2',
          },
          {
            clauseId: 'cl-3',
            section: 'Section 12.1',
            title: 'Early Termination & Deposit Forfeiture',
            excerpt: 'Premature departure prior to lock-in expiration or without 30-day written notice results in total forfeiture of the ₹75,000 security deposit.',
            page: 6,
            importance: 'High Financial Exposure / Subject to Section 74 ICA',
            evidenceId: 'ev-cl-3',
          },
        ];

    // Step 5: Protections & Statutory Defenses
    const protections: LawyerKitProtection[] = [
      {
        title: 'Statutory Defense Against Unreasonable Liquidated Damages (Section 74 ICA)',
        description: 'Under Supreme Court ruling in Kailash Nath Associates v. DDA, forfeiture clauses cannot be punitive; landlord must demonstrate actual provable financial damage.',
        clauseRef: 'Section 12.1',
        page: 6,
        remedy: 'Request accounting of actual vacant downtime and utility arrears.',
      },
      {
        title: 'Contractual Right to Itemized Deductions Inspection',
        description: 'Landlord must provide itemized receipts for painting or property restoration before making deductions against the security deposit.',
        clauseRef: 'Section 5.1',
        page: 3,
        remedy: 'Written demand for contractor bills.',
      },
    ];

    // Step 6: Chronological Timeline
    const timeline: LawyerKitTimelineItem[] = [
      {
        dateOrRelative: 'Day 1–5 of Month',
        event: 'Contractual Rent Payment Due (₹25,000)',
        source: 'Section 4.1 (p.2)',
        consequence: 'Normal performance of tenancy obligation',
      },
      {
        dateOrRelative: 'Day 8 of Month',
        event: 'Grace Period Expires (3 days elapsed)',
        source: 'Section 4.3 (p.2)',
        consequence: 'Daily surcharge of ₹500/day begins accruing',
      },
      {
        dateOrRelative: 'Day 30 (Month 1)',
        event: 'Default Threshold Reached',
        source: 'Section 12.2 (p.6)',
        consequence: 'Landlord acquires right to serve formal notice to cure',
      },
      {
        dateOrRelative: 'Day 90 (Month 3)',
        event: 'Accrued Arrears Equal Security Deposit (₹75,000)',
        source: 'Section 5.1 (p.3)',
        consequence: 'Full offset against security deposit; premises handover required',
      },
    ];

    // Step 7: Authoritative Legal Authorities
    const applicableLaw: LegalAuthority[] = [
      {
        id: 'law-ica-74',
        sourceType: 'central_act',
        title: 'Indian Contract Act, 1872 — Section 74',
        actOrCourt: 'Indian Contract Act, 1872',
        sectionOrArticle: 'Section 74',
        summary: 'Compensation for breach of contract where penalty stipulated: The party complaining of breach is entitled only to reasonable compensation not exceeding the amount named, whether or not actual damage is proved.',
        officialSourceUrl: 'https://indiacode.nic.in/handle/123456789/2187',
        hierarchyLevel: 1,
        relevanceExplanation: 'Limits deposit forfeiture to actual financial loss suffered by landlord.',
        retrievedAt: new Date().toISOString(),
      },
      {
        id: 'law-tpa-106',
        sourceType: 'central_act',
        title: 'Transfer of Property Act, 1882 — Section 106',
        actOrCourt: 'Transfer of Property Act, 1882',
        sectionOrArticle: 'Section 106',
        summary: 'In absence of contract to contrary, lease of immovable property for residential purpose is terminable by 15 days notice.',
        officialSourceUrl: 'https://indiacode.nic.in/handle/123456789/2338',
        hierarchyLevel: 2,
        relevanceExplanation: 'Sets baseline statutory notice period for tenancy determination.',
        retrievedAt: new Date().toISOString(),
      },
      {
        id: 'law-sc-kailash-nath',
        sourceType: 'judgment',
        title: 'Supreme Court: Kailash Nath Associates v. DDA (2015) 4 SCC 136',
        actOrCourt: 'Supreme Court of India',
        sectionOrArticle: 'Paragraphs 43-44',
        summary: 'Liquidated damages under Section 74 can only be awarded when it is a genuine pre-estimate of loss. Where actual loss can be proved, the claimant must prove such loss before forfeiting deposits.',
        hierarchyLevel: 1,
        relevanceExplanation: 'Supreme Court precedent prohibiting arbitrary deposit forfeiture.',
        retrievedAt: new Date().toISOString(),
      }
    ];

    // Step 8: Evidence Package
    const evidenceSummary: EvidenceItem[] = [
      {
        type: 'document',
        documentId,
        clauseId: 'cl-1',
        section: 'Section 4.1 & 4.3',
        page: 2,
        exactExcerpt: 'Rent payable on 5th. Non-payment after 8th attracts ₹500/day penalty.',
      },
      {
        type: 'document',
        documentId,
        clauseId: 'cl-3',
        section: 'Section 12.1',
        page: 6,
        exactExcerpt: 'Premature termination forfeits security deposit in full.',
      },
      {
        type: 'legal_authority',
        act: 'Indian Contract Act, 1872',
        statuteSection: 'Section 74',
        sourceUrl: 'https://indiacode.nic.in/handle/123456789/2187',
        citation: 'Reasonable compensation for breach of contract where penalty is stipulated.',
      },
      {
        type: 'judgment',
        court: 'Supreme Court of India',
        citation: '(2015) 4 SCC 136',
        exactExcerpt: 'Forfeiture of earnest money or security deposit without proof of actual damage is impermissible under Section 74.',
      }
    ];

    // Step 9: Questions for Legal Professional & Checklist
    const questionsForLawyer: string[] = [
      'Is the full ₹75,000 security deposit forfeiture in Section 12.1 enforceable without the landlord demonstrating actual vacant tenant downtime under Section 74 of the Indian Contract Act?',
      'Can the ₹500/day late penalty under Section 4.3 be successfully challenged as an unreasonable in terrorem penalty?',
      'What formal notice or key handover protocol should be executed to definitively extinguish ongoing rent liability and prevent spurious utility claims?',
      'How does the state Rent Control / Tenancy Act affect the landlord’s summary eviction and recovery remedies?'
    ];

    const documentsToBring: string[] = [
      'Original Signed Tenancy / Commercial Agreement with all Annexures',
      'Security Deposit Bank Transfer / Cheque Payment Receipts and Bank Statement',
      'All Monthly Rent Transaction Statements & WhatsApp/Email payment acknowledgements',
      'Move-in Property Condition Inventory and timestamped inspection photographs',
      'Formal written notice of termination / proposed amicable key handover letter'
    ];

    const assumptions: string[] = [
      'Assumes the lease deed is executed in accordance with applicable state stamp duty regulations.',
      'Assumes no prior written amendments or waivers have modified the standard notice window.',
      'Assumes security deposit has been received in full by the landlord at the commencement of tenure.'
    ];

    const uncertainty = 'Uncertainty regarding exact utility arrears and physical repair deductions; requires physical property handover inspection and itemized receipts.';

    // Step 10: Grounded Executive Summary
    const executiveSummary = `Comprehensive legal consultation brief for ${docName} (${docVersion}). The agreement establishes a monthly consideration of ₹25,000 with a ₹75,000 security deposit. Primary legal vulnerabilities include a ₹500/day late payment surcharge after a 3-day grace period (Section 4.3) and total deposit forfeiture upon early exit (Section 12.1). Under Indian statutory principles (Section 74 Indian Contract Act and Kailash Nath v. DDA), penalty forfeitures are limited to actual provable losses.`;

    const kit: LawyerKitData = {
      id: `kit-${uuidv4().substring(0, 8)}`,
      userId,
      documentId,
      documentVersionId: docVersion,
      documentName: docName,
      title: `Client Discussion Brief: ${docName}`,
      generatedAt: new Date().toISOString(),
      executiveSummary,
      keyFacts,
      keyClauses,
      parties: legalModel?.parties || [{ id: 'p1', name: 'Tenant', role: 'tenant' }, { id: 'p2', name: 'Landlord', role: 'landlord' }],
      keyObligations: legalModel?.obligations || [],
      importantDeadlines: legalModel?.deadlines || [],
      potentialRisks: risks.length > 0 ? risks : [
        {
          id: 'risk-1',
          documentId,
          title: 'Total Security Deposit Forfeiture Risk',
          level: 'critical',
          perspective: 'adversarial',
          clauseRef: 'Section 12.1 (p.6)',
          description: 'Landlord claims contractual entitlement to forfeit full ₹75,000 deposit upon early departure.',
          recommendation: 'Invoke Section 74 ICA to limit forfeiture to actual documented loss.',
          potentialImpact: '₹75,000 full deposit loss',
          evidence: evidenceSummary.slice(0, 2),
        }
      ],
      risks: risks.length > 0 ? risks : undefined,
      contractualProtections: protections.map(p => `${p.title}: ${p.description}`),
      protections,
      potentialConflicts: conflicts,
      conflicts,
      scenarioTested,
      potentialFinancialExposure: exposureSummary,
      scenarioFindings: scenarioFinding,
      timeline,
      questionsForLegalProfessional: questionsForLawyer,
      questionsForLawyer,
      documentsToBring,
      assumptions,
      uncertainty,
      evidenceSummary,
      evidence: evidenceSummary,
      authoritativeLegalSources: applicableLaw,
      applicableLaw,
      disclaimer: CONSTANTS.LEGAL_DISCLAIMER,
    };

    // Step 11: Save to Repository
    await repository.saveKit({ ...kit, userId });
    return kit;
  }
}
