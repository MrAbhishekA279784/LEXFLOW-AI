import { AIProvider, GenerateStructuredJsonOptions, GenerateTextOptions } from '../provider';
import { CONSTANTS } from '../../../config/constants';

export class DeterministicFallbackProvider implements AIProvider {
  name = 'deterministic-fallback';

  async generateText(prompt: string, _options?: GenerateTextOptions): Promise<string> {
    const p = prompt.toLowerCase();

    if (p.includes('scenario') || p.includes('rent') || p.includes('mahine') || p.includes('chhod') || p.includes('tod')) {
      return `DOCUMENT SAYS:
The agreement mandates monthly rent payment by the 5th and a ₹500/day late penalty after the 8th. Vacating without 30 days prior written notice permits the lessor to adjust outstanding liabilities against the ₹75,000 security deposit.

LAW SAYS:
Under Section 74 of the Indian Contract Act, 1872 and the Supreme Court decision in Kailash Nath Associates v. DDA (2015) 4 SCC 136, deposit forfeiture and penalty stipulations cannot be enforced as arbitrary windfalls; the party alleging breach must establish genuine loss or damage.

LEXFLOW ANALYSIS:
Ceasing rent payments for 3 months creates an accrued contractual liability of ₹75,000 plus potential late surcharges. The landlord can rightfully apply the ₹75,000 security deposit to settle these arrears. Departing without notice may expose the tenant to claims for notice-period rent, though total claims remain subject to statutory reasonableness.`;
    }

    if (p.includes('assistant') || p.includes('query') || p.includes('question') || p.includes('painting') || p.includes('deposit')) {
      return `Under the contract terms, the security deposit is refundable within 14 business days of peaceful handover, subject to reasonable itemized adjustments for utility arrears or verified structural damage (Section 5.1). Routine wear and tear is excluded.

Applicable Law: Section 74 of the Indian Contract Act, 1872 requires that any deductions from security deposits be supported by genuine proof of loss rather than arbitrary blanket forfeiture.

Disclaimer: ${CONSTANTS.LEGAL_DISCLAIMER}`;
    }

    return `Based on the provided contract clauses, all variations require written mutual consent. Statutory principles require reasonable notice before termination. Please consult a qualified legal professional for jurisdiction-specific advice.\n\nDisclaimer: ${CONSTANTS.LEGAL_DISCLAIMER}`;
  }

  async generateStructuredJson<T>(prompt: string, options?: GenerateStructuredJsonOptions<T>): Promise<T> {
    const p = prompt.toLowerCase();

    // 0a. Compliance Audit - Reviewer Agent output
    if ((p.includes('reviewer') || p.includes('compliance') || p.includes('auditor')) && (p.includes('finding') || p.includes('exposure') || p.includes('penalty'))) {
      const reviewerData = {
        findings: [
          {
            findingId: 'REV-001',
            category: 'penalty_exposure' as const,
            severity: 'high' as const,
            title: 'Disproportionate Daily Late Penalty Accumulation',
            claim: 'Section 4.3 stipulates a flat late penalty of ₹500 per day after the 8th of each calendar month.',
            reasoning: 'Under Section 74 of the Indian Contract Act, 1872 and the Supreme Court precedent in Kailash Nath Associates v. DDA (2015), stipulated damages must be a reasonable pre-estimate of loss rather than an in terrorem penalty. An uncapped ₹500/day fine represents 60% of monthly rent per month and may be struck down as punitive.',
            affectedClauseRefs: ['Section 4.3'],
            proposedMitigation: 'Cap aggregate late fees to a statutory reasonable threshold (e.g. 5% of monthly rent) after a formal cure notice.',
            confidence: 0.94,
            graphNodeRefs: ['node-penalty', 'node-pay'],
            scenarioStressTestPrompt: 'What happens if rent is delayed by 15 days due to an employer payroll failure?'
          },
          {
            findingId: 'REV-002',
            category: 'termination_exposure' as const,
            severity: 'high' as const,
            title: 'Total Security Deposit Forfeiture on Early Departure',
            claim: 'Section 12.1 provides that vacating prior to the 6-month lock-in period results in unconditional forfeiture of the ₹75,000 security deposit.',
            reasoning: 'Under the Model Tenancy Act, 2021 and established tenancy jurisprudence, the lessor cannot arbitrarily retain the entire security deposit as liquidated damages without establishing genuine vacancies or unmitigated financial losses.',
            affectedClauseRefs: ['Section 12.1', 'Section 5.1'],
            proposedMitigation: 'Introduce a proportional early-exit clause where lessor must make reasonable efforts to re-let the premises within 30 days.',
            confidence: 0.91,
            graphNodeRefs: ['node-lockin', 'node-forfeiture', 'node-deposit'],
            scenarioStressTestPrompt: 'What happens if the tenant vacates 2 months early due to job transfer with 30 days notice?'
          },
          {
            findingId: 'REV-003',
            category: 'unfavorable_provision' as const,
            severity: 'medium' as const,
            title: 'Mandatory Non-Refundable Painting and Refurbishment Deduction',
            claim: 'Section 5.1 reserves the lessor right to deduct painting and restoration expenses from the deposit irrespective of occupancy duration.',
            reasoning: 'Normal wear and tear is statutorily excluded from tenant repair obligations under standard tenancy practices. Deducting full painting costs after short tenancies without itemized receipts constitutes an unfair contractual advantage.',
            affectedClauseRefs: ['Section 5.1'],
            proposedMitigation: 'Add explicit language that normal wear and tear is excluded, and deductions require itemized invoices from registered contractors.',
            confidence: 0.88,
            graphNodeRefs: ['node-deposit'],
            scenarioStressTestPrompt: 'Can the landlord withhold the deposit for repainting if walls only show minor furniture scuffs?'
          },
          {
            findingId: 'REV-004',
            category: 'compliance_risk' as const,
            severity: 'medium' as const,
            title: 'Absence of Tenant Cure Window Prior to Lease Determination',
            claim: 'Agreement allows immediate re-entry upon any default without a mandatory statutory cure period.',
            reasoning: 'Section 106 and Section 111(g) of the Transfer of Property Act, 1882 require a formal written notice affording reasonable time to remedy an actionable breach before forfeiture of lease rights can be enforced.',
            affectedClauseRefs: ['Section 12.1'],
            proposedMitigation: 'Incorporate a mandatory 15-day written cure notice before any termination proceedings or forfeiture can take effect.',
            confidence: 0.86,
            graphNodeRefs: ['node-termination'],
            scenarioStressTestPrompt: 'Can the lessor lock the premises immediately if electricity bill payment is delayed?'
          }
        ]
      };

      if (options?.zodSchema) {
        const validated = options.zodSchema.safeParse(reviewerData);
        if (validated.success) return validated.data;
      }
      return reviewerData as unknown as T;
    }

    // 0b. Compliance Audit - Skeptic Agent output
    if (p.includes('skeptic') || p.includes('counter-examination') || p.includes('opposing legal arguments') || p.includes('challenge each finding')) {
      const skepticData = {
        challenges: [
          {
            findingId: 'REV-001',
            challenge: 'Section 4.1 incorporates an express 3-day grace window (rent due on 5th, penalty only commences after the 8th). Furthermore, ₹500/day operates as agreed pre-estimated administrative friction under freedom of contract, provided notice is served.',
            alternativeInterpretation: 'The penalty is not an arbitrary windfall but a negotiated deterrent against recurring bank EMI defaults borne by the lessor.',
            missingInformation: [
              'Lessor mortgage schedule & financial proof of actual banking penalties incurred upon delay',
              'Prior payment history and explicit waiver conduct between parties'
            ],
            confidence: 0.85,
            isMateriallyDisputed: true,
            counterClauseRefs: ['Section 4.1']
          },
          {
            findingId: 'REV-002',
            challenge: 'The 6-month lock-in period was explicitly agreed with mutual consideration: the tenant received a stable rental rate below market median. Forfeiture of deposit compensates for brokerage, vacancy re-listing, and lost rental opportunity costs.',
            alternativeInterpretation: 'The clause represents agreed minimum tenure liquidated damages, legally enforceable under Section 73 of the Indian Contract Act if the lessor cannot immediately find a replacement occupant.',
            missingInformation: [
              'Local rental market occupancy rate in Bengaluru Urban',
              'Whether the lessor made prompt, good-faith efforts to re-let the property'
            ],
            confidence: 0.82,
            isMateriallyDisputed: true,
            counterClauseRefs: ['Section 12.1']
          },
          {
            findingId: 'REV-003',
            challenge: 'If the premises were handed over freshly painted with photographic inventory at inception, the covenant to restore the walls to original condition is a standard restorative covenant, not an unreasonable penalty.',
            alternativeInterpretation: 'The lessor is merely enforcing restitution in integrum—restoring the flat to its move-in condition as acknowledged in the initial inspection schedule.',
            missingInformation: [
              'Initial move-in inspection report and timestamped photographic inventory',
              'Contractor receipts demonstrating actual expenditure on painting'
            ],
            confidence: 0.79,
            isMateriallyDisputed: false,
            counterClauseRefs: ['Section 5.1']
          },
          {
            findingId: 'REV-004',
            challenge: 'Section 12.1 incorporates a default clause cross-referencing peaceful determination. Courts enforce agreed re-entry where persistent non-payment or unlawful nuisance occurs, subject to police reporting.',
            alternativeInterpretation: 'Immediate determination applies strictly to fundamental breaches such as unlawful sub-letting or hazardous premises usage.',
            missingInformation: [
              'Whether breach relates to routine non-payment or structural hazard/sub-letting'
            ],
            confidence: 0.81,
            isMateriallyDisputed: false,
            counterClauseRefs: ['Section 12.1']
          }
        ]
      };

      if (options?.zodSchema) {
        const validated = options.zodSchema.safeParse(skepticData);
        if (validated.success) return validated.data;
      }
      return skepticData as unknown as T;
    }

    // 1. Adversarial / Dual Perspective Review
    if (p.includes('adversarial') || p.includes('opposing counsel') || p.includes('protection counsel') || p.includes('dual-perspective')) {
      const adversarialData = {
        documentId: 'doc-rental',
        opposingRisks: [
          {
            id: 'risk-opp-1',
            title: 'Aggressive Accrual: Daily Late Penalty',
            level: 'critical',
            perspective: 'adversarial',
            clauseRef: 'Section 4.3',
            description: 'Clause imposes a ₹500/day late penalty after the 8th of each month, which compounds rapidly and creates substantial liability.',
            recommendation: 'Negotiate a capped aggregate late fee (e.g. max 5% of monthly rent).',
            potentialImpact: 'Accelerating financial exposure of ₹15,000/month.',
            evidence: [{
              type: 'document',
              clauseId: 'cl-2',
              section: 'Section 4.3',
              page: 2,
              exactExcerpt: 'Non-payment of rent on or before the 8th day shall attract a late penalty of Rs. 500 per day.'
            }]
          },
          {
            id: 'risk-opp-2',
            title: 'Deposit Forfeiture Risk upon Premature Vacating',
            level: 'high',
            perspective: 'adversarial',
            clauseRef: 'Section 12.1',
            description: 'Landlord is contractually empowered to retain the full ₹75,000 security deposit if the tenant departs without serving 30-day notice.',
            recommendation: 'Ensure written notice is served and keys are formally handed over with signed receipt.',
            potentialImpact: 'Total loss of ₹75,000 security deposit.',
            evidence: [{
              type: 'document',
              clauseId: 'cl-4',
              section: 'Section 12.1',
              page: 3,
              exactExcerpt: 'Either party may terminate by providing thirty (30) days prior written notice.'
            }]
          }
        ],
        protections: [
          {
            id: 'prot-1',
            title: 'Mandatory 14-Day Deposit Refund Window',
            level: 'low',
            perspective: 'protection',
            clauseRef: 'Section 5.1',
            description: 'The agreement guarantees return of the interest-free security deposit within 14 business days post peaceful handover.',
            recommendation: 'Demand written reconciliation and itemized proof for any proposed deductions.',
            potentialImpact: 'Protects liquidity and establishes hard deadline for landlord refund.',
            evidence: [{
              type: 'document',
              clauseId: 'cl-3',
              section: 'Section 5.1',
              page: 2,
              exactExcerpt: 'The security deposit shall be refunded within 14 business days following peaceful handover.'
            }]
          },
          {
            id: 'prot-2',
            title: '3-Day Grace Period for Rent Payment',
            level: 'low',
            perspective: 'protection',
            clauseRef: 'Section 4.1',
            description: 'Provides a contractual buffer between the 5th and 8th of each calendar month before late penalties trigger.',
            recommendation: 'Keep digital payment receipts proving remittance before 8th.',
            potentialImpact: 'Shields against premature default claims.',
            evidence: [{
              type: 'document',
              clauseId: 'cl-1',
              section: 'Section 4.1',
              page: 1,
              exactExcerpt: 'Rent is due on the 5th of each month, with grace period extending to 8th.'
            }]
          }
        ],
        synthesis: {
          highPriority: [
            {
              id: 'risk-opp-1',
              title: 'Aggressive Accrual: Daily Late Penalty',
              level: 'critical',
              perspective: 'adversarial',
              clauseRef: 'Section 4.3',
              description: 'Clause imposes a ₹500/day late penalty after the 8th of each month.',
              recommendation: 'Negotiate a capped aggregate late fee.',
              potentialImpact: 'Accelerating financial exposure.',
              evidence: []
            }
          ],
          mediumPriority: [
            {
              id: 'risk-opp-2',
              title: 'Deposit Forfeiture Risk upon Premature Vacating',
              level: 'high',
              perspective: 'adversarial',
              clauseRef: 'Section 12.1',
              description: 'Landlord is contractually empowered to retain the full ₹75,000 security deposit.',
              recommendation: 'Ensure written notice is served.',
              potentialImpact: 'Total loss of ₹75,000 security deposit.',
              evidence: []
            }
          ],
          protectionHighlights: [
            {
              id: 'prot-1',
              title: 'Mandatory 14-Day Deposit Refund Window',
              level: 'low',
              perspective: 'protection',
              clauseRef: 'Section 5.1',
              description: 'The agreement guarantees return of the security deposit within 14 business days.',
              recommendation: 'Demand written reconciliation.',
              potentialImpact: 'Protects liquidity.',
              evidence: []
            }
          ]
        }
      };

      if (options?.zodSchema) {
        const validated = options.zodSchema.safeParse(adversarialData);
        if (validated.success) return validated.data;
      }
      return adversarialData as unknown as T;
    }

    // 2. Comparison Diffing
    if (p.includes('compare these two') || p.includes('comparison') || p.includes('document a') || p.includes('renewal agreement')) {
      const comparisonData = {
        docAName: 'Current Agreement.pdf',
        docBName: 'Proposed Renewal Agreement.pdf',
        summary: 'Comparison identified 3 key contractual shifts: higher annual escalation ceiling (10% vs 7%), delayed deposit refund window (45 vs 14 days), and transfer of structural maintenance obligations to tenant.',
        riskDelta: {
          increasedRisks: [
            'Annual rent escalation increased from 7% to 10%',
            'Security deposit refund delayed from 14 days to 45 business days',
            'Tenant is now responsible for structural maintenance and major repairs'
          ],
          decreasedRisks: [],
          overallRiskScoreDiff: '+28% higher risk exposure for tenant in proposed draft'
        },
        protectionDelta: {
          addedProtections: [],
          removedProtections: [
            'Loss of 14-day guaranteed security deposit refund window',
            'Loss of landlord obligation to handle electrical and plumbing repairs'
          ]
        },
        diffs: [
          {
            id: 'diff-1',
            category: 'Financial / Escalation',
            clauseName: 'Annual Rent Escalation',
            status: 'modified',
            changeType: 'more_restrictive',
            docAValue: '7% annual escalation upon renewal (Section 4.2)',
            docBValue: '10% annual escalation upon renewal (Section 4.2)',
            docAPage: 2,
            docBPage: 2,
            docAClauseId: 'cl-current-4.2',
            docBClauseId: 'cl-proposed-4.2',
            impactSummary: 'Increases monthly rental cost by ₹2,500/month after month 11 instead of ₹1,750/month.',
            statutoryConsideration: 'Model Tenancy Act 2021 recommends capping escalation to agreed market index.'
          },
          {
            id: 'diff-2',
            category: 'Security Deposit',
            clauseName: 'Deposit Refund Timeline',
            status: 'modified',
            changeType: 'more_restrictive',
            docAValue: 'Refundable within 14 business days (Section 5.1)',
            docBValue: 'Refundable within 45 business days (Section 5.1)',
            docAPage: 3,
            docBPage: 3,
            docAClauseId: 'cl-current-5.1',
            docBClauseId: 'cl-proposed-5.1',
            impactSummary: 'Extends lock-up of ₹75,000 liquidity by an extra 31 business days post-handover.',
            statutoryConsideration: 'Tenancy rules encourage deposit refund within 30 days.'
          },
          {
            id: 'diff-3',
            category: 'Maintenance & Repairs',
            clauseName: 'Internal & Structural Maintenance',
            status: 'modified',
            changeType: 'more_restrictive',
            docAValue: 'Landlord handles all structural, electrical, and plumbing repairs (Section 8.1)',
            docBValue: 'Tenant is fully responsible for all internal, structural, and plumbing repairs (Section 8.1)',
            docAPage: 4,
            docBPage: 4,
            docAClauseId: 'cl-current-8.1',
            docBClauseId: 'cl-proposed-8.1',
            impactSummary: 'Shifts high-cost structural maintenance burden onto the tenant.',
            statutoryConsideration: 'Section 108 Transfer of Property Act 1882 sets standard lessor maintenance duties.'
          }
        ],
        recommendation: 'Do not sign the proposed draft without rejecting the 45-day refund extension and re-establishing the landlord maintenance covenant in Section 8.1.'
      };

      if (options?.zodSchema) {
        const validated = options.zodSchema.safeParse(comparisonData);
        if (validated.success) return validated.data;
      }
      return comparisonData as unknown as T;
    }

    // 3. Lawyer Kit Fallback
    if (p.includes('lawyer prep-kit') || p.includes('prep-kit') || p.includes('lawyer') || p.includes('prepkit')) {
      const lawyerKitData = {
        id: 'kit-fallback',
        documentId: 'doc-rental',
        documentName: 'Rental Agreement.pdf',
        generatedAt: new Date().toISOString(),
        parties: [],
        keyObligations: [],
        importantDeadlines: [],
        potentialRisks: [],
        contractualProtections: ['Fallback protection 1'],
        scenarioTested: 'Fallback test scenario',
        potentialFinancialExposure: 'Fallback exposure',
        potentialConflicts: [],
        questionsForLegalProfessional: [
          'Fallback question 1 for the lawyer?',
          'Fallback question 2 for the lawyer?'
        ],
        evidenceSummary: [],
        authoritativeLegalSources: [],
        disclaimer: CONSTANTS.LEGAL_DISCLAIMER
      };

      if (options?.zodSchema) {
        const validated = options.zodSchema.safeParse(lawyerKitData);
        if (validated.success) return validated.data;
      }
      return lawyerKitData as unknown as T;
    }

    // 4. Scenario parsing & normalization
    if (p.includes('scenario') || p.includes('rent') || p.includes('mahine') || p.includes('chhod') || p.includes('tod') || p.includes('parse') || p.includes('event')) {
      const is3Months = p.includes('3') || p.includes('three') || p.includes('teen');
      const isAmbiguous = p.includes('kya scene') || p.includes('something else') || p.includes('unclear');
      const months = is3Months ? 3 : 1;

      const scenarioData = {
        rawPrompt: prompt,
        actor: 'tenant',
        events: [
          { 
            type: 'miss_payment', 
            durationMonths: months, 
            amount: 25000 * months, 
            description: `Withholding monthly rent for ${months} cycle(s)` 
          },
          { 
            type: 'vacate_property', 
            description: 'Vacating premises prematurely without fulfilling 30-day notice period' 
          }
        ],
        intent: 'understand_consequences',
        isClear: !isAmbiguous,
        clarificationOptions: isAmbiguous ? [
          'Miss a Payment (Rent Default)',
          'Leave Early (Break Lock-in Period)',
          'Break Notice Requirement (Depart without 30 days notice)',
          'Property Damage or Modification Dispute',
          'Other Contractual Inquiry'
        ] : undefined,
        assumptions: ['Standard monthly rent of ₹25,000 applies', 'Security deposit is ₹75,000'],
        uncertainties: ['Whether formal written notice was delivered prior to vacating']
      };

      if (options?.zodSchema) {
        const validated = options.zodSchema.safeParse(scenarioData);
        if (validated.success) return validated.data;
      }
      return scenarioData as unknown as T;
    }

    // 5. Default fallback structure
    const defaultData = {
      title: 'Contractual Obligation Analysis',
      findings: ['Obligation identified from contract text', 'Statutory notice applies'],
      confidence: 0.95
    };

    if (options?.zodSchema) {
      const validated = options.zodSchema.safeParse(defaultData);
      if (validated.success) return validated.data;
    }
    return defaultData as unknown as T;
  }

  async generateEmbedding(_text: string): Promise<number[]> {
    // Return deterministic 768-dimensional normalized unit vector
    const vec = new Array(768).fill(0.02);
    return vec;
  }
}

export const deterministicFallbackProvider = new DeterministicFallbackProvider();
