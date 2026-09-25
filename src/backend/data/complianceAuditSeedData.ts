import { ComplianceAuditRecord } from '../services/complianceAudit/types';

export const INITIAL_COMPLIANCE_AUDIT: ComplianceAuditRecord = {
  id: 'audit-rental-001',
  documentId: 'doc-rental',
  documentName: 'Rental Agreement.pdf',
  userId: 'demo-user-seed',
  status: 'completed',
  currentStep: 'Compliance audit synthesis completed. Report ready for review.',
  progressPercentage: 100,
  startedAt: '2025-04-24T10:00:00.000Z',
  completedAt: '2025-04-24T10:01:15.000Z',
  summaryMetrics: {
    totalFindings: 4,
    highPriorityCount: 2,
    mediumPriorityCount: 2,
    protectionCount: 1,
    disputedCount: 2,
    humanReviewCount: 2,
    criticalFindings: 0,
    highFindings: 2,
    disputedFindings: 2,
    humanReviewRecommendedCount: 2,
    confirmedFindings: 1
  },
  summary: {
    totalFindings: 4,
    highPriorityCount: 2,
    mediumPriorityCount: 2,
    protectionCount: 1,
    disputedCount: 2,
    humanReviewCount: 2,
    criticalFindings: 0,
    highFindings: 2,
    disputedFindings: 2,
    humanReviewRecommendedCount: 2,
    confirmedFindings: 1
  },
  overallExecutiveSummary: 'Multi-agent audit identified 4 compliance observations, including 2 high-exposure items. Due to conflicting statutory interpretations regarding deposit forfeiture and daily penalty caps, 2 finding(s) are escalated for Human Legal Review.',
  applicableAuthorities: [
    {
      id: 'law-ica-74',
      sourceType: 'central_act',
      title: 'Indian Contract Act, 1872 — Section 74',
      actOrCourt: 'Indian Contract Act, 1872',
      sectionOrArticle: 'Section 74',
      officialSourceUrl: 'https://indiacode.nic.in/handle/123456789/2187',
      summary: 'Stipulations by way of penalty require proof of reasonable compensation; arbitrary forfeiture is impermissible.',
      relevanceExplanation: 'Restricts unilateral deposit forfeiture and excessive liquidated damages.',
      retrievedAt: '2025-04-24T10:00:00.000Z',
      hierarchyLevel: 1
    },
    {
      id: 'law-kailash-nath-2015',
      sourceType: 'judgment',
      title: 'Kailash Nath Associates v. Delhi Development Authority (2015) 4 SCC 136',
      actOrCourt: 'Supreme Court of India',
      sectionOrArticle: 'Civil Appeal No. 193 of 2015',
      subSectionOrPara: 'Paras 43-44',
      officialSourceUrl: 'https://main.sci.gov.in/judgments',
      summary: 'Supreme Court ruled that where damage or loss is capable of assessment, proof of such damage is a condition precedent for damages under Section 74.',
      relevanceExplanation: 'Directly strikes down arbitrary blanket deposit forfeitures absent proof of actual loss.',
      retrievedAt: '2025-04-24T10:00:00.000Z',
      hierarchyLevel: 3
    },
    {
      id: 'law-model-tenancy-2021',
      sourceType: 'central_act',
      title: 'Model Tenancy Act, 2021 — Section 11',
      actOrCourt: 'Ministry of Housing and Urban Affairs',
      sectionOrArticle: 'Section 11',
      officialSourceUrl: 'https://mohua.gov.in/upload/uploadfiles/files/Model_Tenancy_Act_English.pdf',
      summary: 'Caps residential security deposits at a maximum of two months rent, refundable upon peaceful handover.',
      relevanceExplanation: 'Benchmark statutory protection for residential tenants in urban districts.',
      retrievedAt: '2025-04-24T10:00:00.000Z',
      hierarchyLevel: 2
    },
    {
      id: 'law-tpa-106',
      sourceType: 'central_act',
      title: 'Transfer of Property Act, 1882 — Section 106',
      actOrCourt: 'Transfer of Property Act, 1882',
      sectionOrArticle: 'Section 106',
      officialSourceUrl: 'https://indiacode.nic.in/handle/123456789/2338',
      summary: 'Requires statutory written notice affording reasonable time before determination of tenancy.',
      relevanceExplanation: 'Prevents unilateral extra-judicial lockouts or immediate termination.',
      retrievedAt: '2025-04-24T10:00:00.000Z',
      hierarchyLevel: 2
    }
  ],
  debateLog: [
    {
      roundNumber: 3,
      focusIssue: 'Disproportionate Daily Late Penalty Accumulation',
      reviewerStatement: 'Section 4.3 imposes an uncapped ₹500/day fine which accumulates to ₹15,000/month (60% of rent), violating Section 74 ICA as punitive liquidated damages.',
      skepticChallenge: 'Section 4.1 contains a 3-day grace window, and ₹500/day reflects negotiated commercial friction to deter recurring mortgage defaults under freedom of contract.',
      resolution: 'Reviewer identifies severe statutory vulnerability under Section 74 ICA, but Skeptic establishes plausible defense under agreed pre-estimates. Escalated to Human Legal Review.',
      status: 'DISPUTED'
    },
    {
      roundNumber: 3,
      focusIssue: 'Total Security Deposit Forfeiture on Early Departure',
      reviewerStatement: 'Section 12.1 forfeits the entire ₹75,000 security deposit upon early exit during the 6-month lock-in, breaching Supreme Court rules in Kailash Nath (2015).',
      skepticChallenge: 'The 6-month lock-in was reciprocal consideration for below-market rent; deposit forfeiture directly mitigates vacancy, brokerage, and re-listing costs.',
      resolution: 'Material conflict between contractual freedom and statutory public policy against penal forfeiture. Escalated to Human Legal Review.',
      status: 'DISPUTED'
    },
    {
      roundNumber: 2,
      focusIssue: 'Mandatory Non-Refundable Painting and Refurbishment Deduction',
      reviewerStatement: 'Section 5.1 deducts full repainting expenses regardless of tenancy length, conflicting with normal wear-and-tear standards.',
      skepticChallenge: 'Standard restorative covenant if the premises were delivered freshly painted with signed move-in condition inventory.',
      resolution: 'Deduction right exists in contract, but enforceability requires initial photographic inventory and contractor receipts.',
      status: 'INSUFFICIENT_EVIDENCE'
    },
    {
      roundNumber: 2,
      focusIssue: 'Absence of Tenant Cure Window Prior to Lease Determination',
      reviewerStatement: 'Agreement permits immediate re-entry without a mandatory statutory cure period, violating Section 106 and 111(g) TPA.',
      skepticChallenge: 'Immediate termination is intended strictly for fundamental breaches like unlawful sub-letting or hazardous premises misuse.',
      resolution: 'Confirmed statutory vulnerability. The provision conflicts with mandatory Transfer of Property Act cure notice requirements.',
      status: 'CONFIRMED'
    }
  ],
  findings: [
    {
      findingId: 'REV-001',
      category: 'penalty_exposure',
      severity: 'high',
      title: 'Disproportionate Daily Late Penalty Accumulation',
      claim: 'Section 4.3 stipulates a flat late penalty of ₹500 per day after the 8th of each calendar month.',
      reasoning: 'Under Section 74 of the Indian Contract Act, 1872 and the Supreme Court precedent in Kailash Nath Associates v. DDA (2015), stipulated damages must be a reasonable pre-estimate of loss rather than an in terrorem penalty. An uncapped ₹500/day fine represents 60% of monthly rent per month and may be struck down as punitive.',
      affectedClauseRefs: ['Section 4.3'],
      proposedMitigation: 'Cap aggregate late fees to a statutory reasonable threshold (e.g. 5% of monthly rent) after a formal cure notice.',
      consensusStatus: 'DISPUTED',
      humanReviewRecommended: true,
      humanReviewReason: 'High-exposure issue subject to competing statutory interpretations. While Section 74 ICA limits penal forfeiture, the lessor may argue genuine liquidated loss if mortgage arrears occur. Qualified advocate review is strongly advised.',
      lexflowSynthesis: 'Reviewer identifies severe statutory vulnerability regarding uncapped penalties under Indian contract law, but Skeptic establishes plausible counterparty defense under agreed freedom of contract and commercial reliance. The outcome hinges on proof of actual loss.',
      reviewerPosition: {
        argument: 'Section 4.3 imposes an uncapped ₹500/day fine, representing ₹15,000/month or 60% of monthly rent. Under Section 74 of the Indian Contract Act, stipulations by way of penalty cannot be enforced without proof of actual financial damage.',
        confidence: 0.94,
        proposedMitigation: 'Cap aggregate late fees to a maximum of 5% of monthly rent after a mandatory 7-day cure notice.'
      },
      skepticChallenge: {
        challenge: 'Section 4.1 contains an express 3-day grace period (rent due on 5th, penalty starts on 9th). The ₹500/day fee reflects agreed pre-estimated administrative friction to offset bank EMI penalties incurred by the lessor.',
        alternativeInterpretation: 'The penalty is a valid deterrent against recurring payment defaults, negotiated under freedom of contract.',
        missingInformation: [
          'Lessor home loan EMI schedule and proof of actual bank penalty surcharges',
          'Prior waiver conduct between parties'
        ],
        confidence: 0.85,
        counterEvidence: [
          {
            type: 'document',
            clauseId: 'cl-1',
            section: 'Section 4.1',
            page: 2,
            exactExcerpt: 'The rent shall be paid on or before the 5th day of each calendar month, with a grace period extending up to the 8th day.',
            explanation: 'Express 3-day grace window prior to late fee accrual.'
          }
        ]
      },
      debateRounds: [
        {
          round: 1,
          reviewerArgument: 'Section 4.3 late surcharge of ₹500/day compounds rapidly and acts as an in terrorem penalty.',
          skepticCounterArgument: 'Grace period until the 8th provides protection; fee compensates for real financial exposure of lessor EMI default.',
          unresolvedQuestion: 'Proof of actual loss incurred by landlord upon delayed payment.'
        },
        {
          round: 2,
          reviewerArgument: 'Section 74 of the Indian Contract Act overrides private contracts when liquidated damages are punitive.',
          skepticCounterArgument: 'Parties of equal bargaining capacity are entitled to agree reasonable administrative fees.',
          unresolvedQuestion: 'Whether local rent tribunal enforces daily late charges exceeding 10% of rent.'
        },
        {
          round: 3,
          reviewerArgument: 'Supreme Court in Kailash Nath (2015) mandates proof of actual damage where assessment is possible.',
          skepticCounterArgument: 'If tenant remains habitually in arrears, the accumulated sum reflects persistent breach costs.',
          unresolvedQuestion: 'Requires legal professional assessment on tribunal precedent in Bengaluru Urban.'
        }
      ],
      evidence: [
        {
          type: 'document',
          clauseId: 'cl-2',
          section: 'Section 4.3',
          page: 2,
          exactExcerpt: 'Non-payment of rent on or before the 8th day shall attract a late penalty of Rs. 500 per day until full realization.',
          explanation: 'Clause prescribing daily compounding late penalty.'
        },
        {
          type: 'legal_authority',
          courtOrStatute: 'Indian Contract Act, 1872',
          section: 'Section 74',
          exactExcerpt: 'Indian Contract Act, 1872 — Section 74: Compensation for breach where penalty stipulated. Proof of reasonable compensation required.',
          officialSourceUrl: 'https://indiacode.nic.in/handle/123456789/2187',
          explanation: 'Prohibits penalty stipulations that exceed reasonable pre-estimated damages.'
        }
      ],
      legalAuthorities: [
        {
          id: 'law-ica-74',
          sourceType: 'central_act',
          title: 'Indian Contract Act, 1872 — Section 74',
          actOrCourt: 'Indian Contract Act, 1872',
          sectionOrArticle: 'Section 74',
          officialSourceUrl: 'https://indiacode.nic.in/handle/123456789/2187',
          summary: 'Penalty stipulations require proof of genuine reasonable loss.',
          relevanceExplanation: 'Restricts arbitrary daily late surcharges.',
          retrievedAt: '2025-04-24T10:00:00.000Z',
          hierarchyLevel: 1
        }
      ],
      graphNodeRefs: ['node-penalty', 'node-pay', 'node-grace'],
      scenarioStressTestPrompt: 'What happens if rent is delayed by 15 days due to an employer payroll failure?'
    },
    {
      findingId: 'REV-002',
      category: 'termination_exposure',
      severity: 'high',
      title: 'Total Security Deposit Forfeiture on Early Departure',
      claim: 'Section 12.1 provides that vacating prior to the 6-month lock-in period results in unconditional forfeiture of the ₹75,000 security deposit.',
      reasoning: 'Under the Model Tenancy Act, 2021 and Supreme Court precedent in Kailash Nath (2015), deposit forfeiture cannot be enforced as an arbitrary windfall. The lessor has a duty to mitigate loss and can only deduct actual unmitigated rental deficit.',
      affectedClauseRefs: ['Section 12.1', 'Section 5.1'],
      proposedMitigation: 'Introduce a proportional early-exit clause where lessor must make reasonable efforts to re-let the premises within 30 days.',
      consensusStatus: 'DISPUTED',
      humanReviewRecommended: true,
      humanReviewReason: 'High-exposure issue subject to competing statutory interpretations. While Section 74 ICA limits penal forfeiture, the lessor may argue genuine liquidated loss if the flat remains unlet. Qualified advocate review is strongly advised.',
      lexflowSynthesis: 'Reviewer identifies severe statutory vulnerability regarding uncapped deposit forfeiture, but Skeptic establishes plausible counterparty defense under agreed minimum tenure and brokerage costs. Enforceability depends on landlord mitigation efforts.',
      reviewerPosition: {
        argument: 'Unconditional forfeiture of the ₹75,000 security deposit without establishing actual vacancy loss violates Section 74 of the Indian Contract Act and Kailash Nath Associates v. DDA (2015).',
        confidence: 0.91,
        proposedMitigation: 'Amend to allow tenant termination with 30 days notice subject to paying actual re-letting costs up to 1 month rent.'
      },
      skepticChallenge: {
        challenge: 'The 6-month lock-in was reciprocal consideration for below-market rent. Forfeiture of deposit compensates for brokerage, vacancy re-listing, and lost rental opportunity costs.',
        alternativeInterpretation: 'The clause represents agreed minimum tenure liquidated damages, legally enforceable under Section 73 ICA.',
        missingInformation: [
          'Local rental market occupancy rate in Bengaluru Urban',
          'Whether lessor makes good-faith efforts to find a replacement tenant'
        ],
        confidence: 0.82,
        counterEvidence: [
          {
            type: 'document',
            clauseId: 'cl-6',
            section: 'Section 12.1',
            page: 4,
            exactExcerpt: 'The Tenant agrees to a mandatory initial lock-in period of 6 (six) months from the commencement date.',
            explanation: 'Bilateral covenant establishing mutual lock-in.'
          }
        ]
      },
      debateRounds: [
        {
          round: 1,
          reviewerArgument: 'Forfeiting ₹75,000 without proof of 3 months vacancy is an illegal penalty under Kailash Nath.',
          skepticCounterArgument: 'Tenant consented to lock-in; landlord incurs immediate brokerage and refurbishment costs.',
          unresolvedQuestion: 'Proof of landlord brokerage and lost rental receipts.'
        },
        {
          round: 2,
          reviewerArgument: 'Lessor must mitigate damages by actively marketing the property upon receiving 30 days notice.',
          skepticCounterArgument: 'Tenant breach forces unexpected vacancy in off-peak leasing months.',
          unresolvedQuestion: 'Whether tenant offered a suitable replacement tenant.'
        },
        {
          round: 3,
          reviewerArgument: 'Supreme Court jurisprudence prohibits windfalls where deposit exceeds actual proved losses.',
          skepticCounterArgument: 'If apartment remains empty for 3 months, ₹75,000 equals exact rent lost.',
          unresolvedQuestion: 'Depends on local Small Causes Court / Rent Tribunal interpretation.'
        }
      ],
      evidence: [
        {
          type: 'document',
          clauseId: 'cl-6',
          section: 'Section 12.1',
          page: 4,
          exactExcerpt: 'Vacating the premises prior to expiry of the 6-month lock-in shall entitle the Landlord to forfeit the entire security deposit of Rs. 75,000.',
          explanation: 'Contract clause establishing total deposit forfeiture.'
        },
        {
          type: 'legal_authority',
          courtOrStatute: 'Supreme Court of India',
          section: 'Kailash Nath Associates (2015)',
          exactExcerpt: 'Kailash Nath Associates v. DDA (2015) 4 SCC 136: Damage must be proved where capable of assessment; forfeiture cannot be an arbitrary penalty.',
          officialSourceUrl: 'https://main.sci.gov.in/judgments',
          explanation: 'Binding precedent striking down arbitrary deposit forfeiture.'
        }
      ],
      legalAuthorities: [
        {
          id: 'law-kailash-nath-2015',
          sourceType: 'judgment',
          title: 'Kailash Nath Associates v. Delhi Development Authority (2015) 4 SCC 136',
          actOrCourt: 'Supreme Court of India',
          sectionOrArticle: 'Civil Appeal No. 193 of 2015',
          officialSourceUrl: 'https://main.sci.gov.in/judgments',
          summary: 'Proof of actual loss is a condition precedent for damages under Section 74.',
          relevanceExplanation: 'Limits deposit forfeiture to actual proved loss.',
          retrievedAt: '2025-04-24T10:00:00.000Z',
          hierarchyLevel: 1
        }
      ],
      graphNodeRefs: ['node-lockin', 'node-forfeiture', 'node-deposit'],
      scenarioStressTestPrompt: 'What happens if the tenant vacates 2 months early due to job transfer with 30 days notice?'
    },
    {
      findingId: 'REV-003',
      category: 'unfavorable_provision',
      severity: 'medium',
      title: 'Mandatory Non-Refundable Painting and Refurbishment Deduction',
      claim: 'Section 5.1 reserves the lessor right to deduct painting and restoration expenses from the deposit irrespective of occupancy duration.',
      reasoning: 'Normal wear and tear is statutorily excluded from tenant repair obligations under standard tenancy practices. Deducting full painting costs after short tenancies without itemized receipts constitutes an unfair contractual advantage.',
      affectedClauseRefs: ['Section 5.1'],
      proposedMitigation: 'Add explicit language that normal wear and tear is excluded, and deductions require itemized invoices from registered contractors.',
      consensusStatus: 'INSUFFICIENT_EVIDENCE',
      humanReviewRecommended: false,
      lexflowSynthesis: 'Contractual deduction right exists in the agreement text, but determination of whether deductions are valid requires move-in condition verification and contractor itemized receipts that are absent from this contract record.',
      reviewerPosition: {
        argument: 'Routine scuffs and wall discoloration constitute normal wear and tear under standard Indian tenancy practice. Deducting a flat ₹15,000 to ₹25,000 without proof of structural damage is an unreasonable deduction.',
        confidence: 0.88,
        proposedMitigation: 'Require lessor to produce formal contractor quotation and invoice for any painting deduction.'
      },
      skepticChallenge: {
        challenge: 'If the premises were handed over freshly painted with photographic inventory at inception, the covenant to restore the walls to original condition is a standard restorative covenant, not an unreasonable penalty.',
        alternativeInterpretation: 'The lessor is merely enforcing restitution in integrum—restoring the flat to move-in condition.',
        missingInformation: [
          'Initial move-in inspection report and timestamped photographic inventory',
          'Contractor receipts demonstrating actual expenditure on painting'
        ],
        confidence: 0.79,
        counterEvidence: [
          {
            type: 'document',
            clauseId: 'cl-3',
            section: 'Section 5.1',
            page: 2,
            exactExcerpt: 'The Security Deposit shall be refunded within 14 days after deducting arrears or costs of restoration.',
            explanation: 'Clause conditioning deposit refund on restoration expenses.'
          }
        ]
      },
      debateRounds: [
        {
          round: 1,
          reviewerArgument: 'Painting deduction without excluding normal wear and tear is an abusive deduction.',
          skepticCounterArgument: 'If apartment was pristine at handover, repainting obligation is customary.',
          unresolvedQuestion: 'Existence of photographic move-in inspection inventory.'
        },
        {
          round: 2,
          reviewerArgument: 'Lessor must prove actual costs incurred via GST invoices.',
          skepticCounterArgument: 'Contract grants lessor discretion to assess restorative requirements.',
          unresolvedQuestion: 'Receipts and contractor vouchers.'
        }
      ],
      evidence: [
        {
          type: 'document',
          clauseId: 'cl-3',
          section: 'Section 5.1',
          page: 2,
          exactExcerpt: 'The Landlord reserves the right to deduct expenses toward painting and wall restoration from the security deposit prior to refund.',
          explanation: 'Restoration deduction provision.'
        }
      ],
      legalAuthorities: [
        {
          id: 'law-model-tenancy-2021',
          sourceType: 'central_act',
          title: 'Model Tenancy Act, 2021 — Section 11',
          actOrCourt: 'Ministry of Housing and Urban Affairs',
          sectionOrArticle: 'Section 11',
          officialSourceUrl: 'https://mohua.gov.in',
          summary: 'Security deposit refundable within one month of vacating premises after agreed deductions.',
          relevanceExplanation: 'Sets standards for transparent deposit refunds.',
          retrievedAt: '2025-04-24T10:00:00.000Z',
          hierarchyLevel: 2
        }
      ],
      graphNodeRefs: ['node-deposit'],
      scenarioStressTestPrompt: 'Can the landlord withhold the deposit for repainting if walls only show minor furniture scuffs?'
    },
    {
      findingId: 'REV-004',
      category: 'compliance_risk',
      severity: 'medium',
      title: 'Absence of Tenant Cure Window Prior to Lease Determination',
      claim: 'Agreement allows immediate re-entry upon any default without a mandatory statutory cure period.',
      reasoning: 'Section 106 and Section 111(g) of the Transfer of Property Act, 1882 require a formal written notice affording reasonable time to remedy an actionable breach before forfeiture of lease rights can be enforced.',
      affectedClauseRefs: ['Section 12.1'],
      proposedMitigation: 'Incorporate a mandatory 15-day written cure notice before any termination proceedings or forfeiture can take effect.',
      consensusStatus: 'CONFIRMED',
      humanReviewRecommended: false,
      lexflowSynthesis: 'Confirmed statutory non-compliance. The provision conflicts with mandatory statutory guidelines under the Transfer of Property Act and Model Tenancy framework, rendering unilateral extra-judicial enforcement legally vulnerable.',
      reviewerPosition: {
        argument: 'Immediate termination without written cure notice contradicts Section 106 and 111(g) of the Transfer of Property Act, 1882.',
        confidence: 0.86,
        proposedMitigation: 'Mandate 15 days written cure period for all non-monetary and monetary covenant defaults.'
      },
      skepticChallenge: {
        challenge: 'Section 12.1 defaults are intended to prevent hazardous premises usage, persistent nuisance, or unauthorized subletting where immediate re-entry is required for property protection.',
        alternativeInterpretation: 'Clause distinguishes between minor delays (covered by grace period) and structural/legal violations.',
        missingInformation: [
          'Classification of breach type: monetary arrears vs structural hazard'
        ],
        confidence: 0.81,
        counterEvidence: [
          {
            type: 'document',
            clauseId: 'cl-6',
            section: 'Section 12.1',
            page: 4,
            exactExcerpt: 'Upon breach of any term, the Landlord shall be entitled to terminate this agreement forthwith.',
            explanation: 'Immediate termination clause without cure period.'
          }
        ]
      },
      debateRounds: [
        {
          round: 1,
          reviewerArgument: 'Forthwith termination violates statutory notice principles under TPA Section 106.',
          skepticCounterArgument: 'Parties contracted out of statutory notice for severe covenant violations.',
          unresolvedQuestion: 'Whether TPA Section 106 is non-derogable in residential tenancy.'
        },
        {
          round: 2,
          reviewerArgument: 'Courts have consistently held that statutory forfeiture for breach requires giving tenant opportunity to remedy.',
          skepticCounterArgument: 'Remedy window is practically afforded via negotiation before filing an eviction petition.',
          unresolvedQuestion: 'Jurisdiction-specific rent court practice.'
        }
      ],
      evidence: [
        {
          type: 'document',
          clauseId: 'cl-6',
          section: 'Section 12.1',
          page: 4,
          exactExcerpt: 'Upon breach of any term herein, the Landlord shall be entitled to terminate this agreement forthwith and resume possession.',
          explanation: 'Forthwith lease termination clause.'
        },
        {
          type: 'legal_authority',
          courtOrStatute: 'Transfer of Property Act, 1882',
          section: 'Section 106',
          exactExcerpt: 'Transfer of Property Act, 1882 — Section 106: Duration of certain leases in absence of written contract; requires notice to quit.',
          officialSourceUrl: 'https://indiacode.nic.in/handle/123456789/2338',
          explanation: 'Mandates notice before determination.'
        }
      ],
      legalAuthorities: [
        {
          id: 'law-tpa-106',
          sourceType: 'central_act',
          title: 'Transfer of Property Act, 1882 — Section 106',
          actOrCourt: 'Transfer of Property Act, 1882',
          sectionOrArticle: 'Section 106',
          officialSourceUrl: 'https://indiacode.nic.in/handle/123456789/2338',
          summary: 'Notice period required for determining tenancies.',
          relevanceExplanation: 'Protects tenants against immediate arbitrary lockouts.',
          retrievedAt: '2025-04-24T10:00:00.000Z',
          hierarchyLevel: 2
        }
      ],
      graphNodeRefs: ['node-termination'],
      scenarioStressTestPrompt: 'Can the lessor lock the premises immediately if electricity bill payment is delayed?'
    }
  ]
};
