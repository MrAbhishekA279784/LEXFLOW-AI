import { DocumentItem, ClauseItem, RiskItem, ScenarioSimulation, ComparisonDiff, ChatMessage, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  name: '',
  email: '',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
  documentsAnalyzed: 0,
  scenariosRun: 0,
};

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-rental',
    name: 'Rental Agreement.pdf',
    type: 'pdf',
    size: '2.4 MB',
    uploadedAt: 'Analyzed · 2 hours ago',
    status: 'analyzed',
    color: 'red',
    riskCount: 3,
    clauseCount: 14,
    summary: 'Residential Tenancy Agreement for Flat 402, Lotus Heights, Bangalore for 11 months with ₹25,000 monthly rent and ₹75,000 security deposit.'
  },
  {
    id: 'doc-employment',
    name: 'Employment Contract.pdf',
    type: 'pdf',
    size: '1.8 MB',
    uploadedAt: 'Analyzed · 1 day ago',
    status: 'analyzed',
    color: 'red',
    riskCount: 1,
    clauseCount: 18,
    summary: 'Full-time Senior Software Engineer employment contract with 90-day non-compete and IP assignment.'
  },
  {
    id: 'doc-nda',
    name: 'NDA.pdf',
    type: 'pdf',
    size: '1.1 MB',
    uploadedAt: 'Uploaded · 2 days ago',
    status: 'analyzing',
    color: 'red',
    riskCount: 1,
    clauseCount: 8,
    summary: 'Unilateral Non-Disclosure Agreement covering proprietary software architecture and client lists with 3-year term.'
  },
  {
    id: 'doc-service',
    name: 'Service Contract.docx',
    type: 'docx',
    size: '980 KB',
    uploadedAt: 'Analyzed · 5 days ago',
    status: 'analyzed',
    color: 'blue',
    riskCount: 2,
    clauseCount: 11,
    summary: 'Consulting & Software Development Services master agreement detailing milestone payments and IP indemnities.'
  },
  {
    id: 'doc-partnership',
    name: 'Partnership Agreement.pdf',
    type: 'pdf',
    size: '3.2 MB',
    uploadedAt: 'Analyzed · 1 week ago',
    status: 'analyzed',
    color: 'red',
    riskCount: 2,
    clauseCount: 24,
    summary: 'Joint Venture and General Partnership agreement covering 50-50 equity distribution and dispute mediation.'
  }
];

export const RENTAL_CLAUSES: ClauseItem[] = [
  {
    id: 'cl-1',
    section: 'Section 4.1',
    title: 'Monthly Rent Payment & Due Date',
    summary: 'Rent of ₹25,000 is payable in advance on or before the 5th day of every English calendar month.',
    fullText: 'The Tenant agrees to pay the Landlord a monthly rent of INR 25,000/- (Rupees Twenty Five Thousand only) on or before the 5th day of each calendar month via direct NEFT/UPI bank transfer.',
    riskLevel: 'low',
    party: 'tenant',
    pageNumber: 2,
    penalties: '₹500 per day after a 3-day grace period ending on the 8th.',
    obligations: ['Pay by the 5th of each month', 'Furnish electronic transaction receipt upon request']
  },
  {
    id: 'cl-2',
    section: 'Section 4.3',
    title: 'Late Payment & Default Penalty',
    summary: 'Late fee of ₹500 per day accrues if rent is unpaid after the 8th of the month.',
    fullText: 'In the event of failure to pay the monthly rental by the 8th of the month, a penalty surcharge of INR 500/- per day shall accrue until full settlement. Continued non-payment exceeding 30 days shall be treated as material contractual breach.',
    riskLevel: 'medium',
    party: 'tenant',
    pageNumber: 2,
    penalties: 'Late surcharge of ₹500/day + potential eviction notice after 30 days.'
  },
  {
    id: 'cl-3',
    section: 'Section 5.1',
    title: 'Security Deposit',
    summary: 'Refundable security deposit of ₹75,000 held without interest, subject to deductions.',
    fullText: 'The Tenant has deposited an interest-free refundable Security Deposit of INR 75,000/- (Rupees Seventy Five Thousand only) with the Landlord, refundable upon peaceful handover of premises subject to deductions for unpaid rent, electricity dues, and structural repairs.',
    riskLevel: 'medium',
    party: 'mutual',
    pageNumber: 3,
    rights: ['Full refund within 14 days of handover after verifiable repairs inspection.']
  },
  {
    id: 'cl-4',
    section: 'Section 8.2',
    title: 'Rent Escalation & Annual Increment',
    summary: 'Landlord may increase rent up to 7% only upon completion of 12 months with 30-day prior written notice.',
    fullText: 'The monthly rent is fixed for the initial 11 months. Should the agreement be renewed for an additional period, rent escalation shall not exceed 7% per annum and requires at least 30 calendar days written notice prior to the expiration of the active term.',
    riskLevel: 'low',
    party: 'landlord',
    pageNumber: 4,
    rights: ['Protection from ad-hoc mid-term rent spikes.']
  },
  {
    id: 'cl-5',
    section: 'Section 9.1',
    title: 'Premises Maintenance & Structural Upkeep',
    summary: 'Landlord is liable for major structural repairs, plumbing seepage, and electrical main issues.',
    fullText: 'The Landlord shall remain responsible for major structural repairs, dampness/seepage, and exterior wall maintenance. The Tenant shall bear minor day-to-day consumable maintenance (light fixtures, tap washers) not exceeding INR 1,000 per instance.',
    riskLevel: 'low',
    party: 'landlord',
    pageNumber: 5
  },
  {
    id: 'cl-6',
    section: 'Section 12.1',
    title: 'Early Termination & Notice Period',
    summary: 'Mandatory 30-day written notice required by either party; unilateral premature vacation forfeits deposit.',
    fullText: 'Either party may terminate this agreement by providing one (1) month written notice. If the Tenant terminates or vacates before the expiry of the mandatory 6-month lock-in period without cause, the Landlord reserves the right to forfeit the Security Deposit as liquidated damages in addition to claiming accrued rent arrears.',
    riskLevel: 'high',
    party: 'mutual',
    pageNumber: 6,
    penalties: 'Forfeiture of ₹75,000 security deposit plus liability for notice period rent.'
  }
];

export const RENTAL_RISKS: RiskItem[] = [
  {
    id: 'rk-1',
    title: 'Security Deposit Forfeiture on Premature Vacation',
    level: 'critical',
    perspective: 'adversarial',
    clauseRef: 'Section 12.1',
    description: 'Clause 12.1 allows the landlord to retain the full ₹75,000 deposit if the lock-in period or 30-day notice is breached, even if a replacement tenant is promptly found.',
    recommendation: 'Request a mitigation clause stating deposit deduction is capped at actual vacancy loss or marketing costs.',
    potentialImpact: 'Loss of ₹75,000 deposit plus rent arrears.'
  },
  {
    id: 'rk-2',
    title: 'Uncapped Painting & Wear-and-Tear Deductions',
    level: 'moderate',
    perspective: 'adversarial',
    clauseRef: 'Section 5.1',
    description: 'The agreement does not distinguish normal wear and tear from tenant damage, allowing arbitrary repainting quotes to be subtracted from deposit.',
    recommendation: 'Insist on standard phrasing: "excluding normal wear and tear" and a fixed paint deduction cap (e.g. ₹8,000).',
    potentialImpact: 'Potential ₹15,000 - ₹25,000 arbitrary deduction.'
  },
  {
    id: 'rk-3',
    title: 'Short 3-Day Late Fee Grace Window',
    level: 'low',
    perspective: 'protection',
    clauseRef: 'Section 4.3',
    description: 'A ₹500/day penalty activates automatically on the 9th day, which can quickly compound over bank holiday weekends.',
    recommendation: 'Extend grace period from 3 days to 7 business days before late fees initiate.',
    potentialImpact: '₹500/day compounding fine.'
  }
];

export const DEFAULT_SCENARIO: ScenarioSimulation = {
  id: 'scen-rent-default',
  inputPrompt: 'Agar main 3 mahine rent nahi du aur phir ghar chhod du toh kya hoga?',
  normalizedInterpretation: 'You cease paying rent for approximately 3 consecutive months and subsequently vacate the premises without serving the stipulated 30-day notice.',
  title: 'Early termination after 3 months & Rent Default',
  totalFinancialImpact: '₹75,000',
  financialBreakdown: [
    { label: 'Unpaid Rent (3 months)', amount: '₹75,000', note: '₹25,000 × 3 months accrued liability' },
    { label: 'Late Payment Penalties (est.)', amount: '₹12,000 – ₹15,000', note: 'Section 4.3 ₹500/day penalty rate' },
    { label: 'Security Deposit Forfeiture', amount: '₹75,000 (Lost)', note: 'Landlord will retain against accrued dues (Section 12.1)' },
    { label: 'Net Additional Claim Risk', amount: '₹12,000 – ₹25,000', note: 'If damages/painting exceed deposit balance' }
  ],
  keyPoints: [
    'Notice period: 30 days mandatory written notice not fulfilled',
    'Early termination clause applies (Section 12.1)',
    'Security deposit of ₹75,000 will be completely forfeited / adjusted',
    'Landlord may claim additional damages and issue legal notice for rent arrears'
  ],
  relevantClauses: [
    { section: 'Section 4.1 & 4.3', title: 'Rent Payment & Late Penalties', excerpt: 'Rent payable on 5th. Non-payment after 8th attracts ₹500/day penalty.', page: 2 },
    { section: 'Section 5.1', title: 'Security Deposit Adjustment', excerpt: 'Deposit subject to deductions for unpaid rent, electricity dues, and structural repairs.', page: 3 },
    { section: 'Section 12.1', title: 'Early Termination & Liquidated Damages', excerpt: 'Vacating without 30-day notice during lock-in period grants right to forfeit full deposit.', page: 6 }
  ],
  timeline: [
    { step: 1, time: 'Month 1 (Day 9)', event: 'First rent default recorded; late fee ₹500/day begins accumulating.', status: 'trigger' },
    { step: 2, time: 'Month 2 (Day 30)', event: 'Landlord delivers formal written breach notice under Section 4.3.', status: 'consequence' },
    { step: 3, time: 'Month 3 (Day 90)', event: 'Accumulated arrears equal total security deposit (₹75,000).', status: 'consequence' },
    { step: 4, time: 'Vacating Day', event: 'Premises vacated without notice; deposit forfeited; legal demand for utility arrears.', status: 'consequence' }
  ],
  status: 'completed'
};

export const COMPARISON_DATA: {
  docA: string;
  docB: string;
  diffs: ComparisonDiff[];
} = {
  docA: 'Rental Agreement.pdf',
  docB: 'New Agreement.pdf',
  diffs: [
    {
      category: 'modified',
      title: 'Rent Escalation Cap',
      docAValue: 'Capped at 7% annually after 12 months with 30-day notice.',
      docBValue: 'Capped at 10% annually or market rate at Landlord sole discretion.',
      riskImpact: 'higher',
      explanation: 'New Agreement increases annual rent jump ceiling from 7% to 10% and introduces ambiguous "market rate" discretion.'
    },
    {
      category: 'modified',
      title: 'Security Deposit Refund Timeline',
      docAValue: 'Refund within 14 days of peaceful handover.',
      docBValue: 'Refund within 45 days after finding a replacement tenant.',
      riskImpact: 'higher',
      explanation: 'Refund is delayed from 14 to 45 days and made conditional on finding a successor tenant, a major protection risk.'
    },
    {
      category: 'removed',
      title: 'Landlord Structural Maintenance Obligation',
      docAValue: 'Landlord covers structural, plumbing seepage, and exterior repairs.',
      docBValue: 'Removed entirely; tenant responsible for interior and exterior dampness.',
      riskImpact: 'higher',
      explanation: 'Removes landlord duty for seepage repairs, exposing tenant to structural maintenance costs.'
    },
    {
      category: 'added',
      title: 'Pre-mature Subletting Prohibition',
      docAValue: 'Subletting permitted with written landlord consent.',
      docBValue: 'Strict zero-tolerance ban on guest stays exceeding 14 days and subletting.',
      riskImpact: 'neutral',
      explanation: 'Explicitly bans guests staying over 14 consecutive days without prior registration.'
    }
  ]
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    text: 'Can the landlord increase rent anytime?',
    timestamp: '10:42 AM'
  },
  {
    id: 'msg-2',
    sender: 'assistant',
    text: 'Based on your uploaded document, the landlord can increase rent only once every 12 months, with a 30-day written notice (Section 8.2).\n\nNote: This is a general explanation based on your document, not legal advice.',
    timestamp: '10:42 AM',
    clauseRef: {
      section: 'Section 8.2',
      page: 4,
      text: 'Rent escalation shall not exceed 7% per annum and requires at least 30 calendar days written notice prior to the expiration of the active term.'
    },
    suggestedPrompts: [
      'Show clause',
      'Explain in simpler terms',
      'What happens if I refuse the increase?'
    ]
  }
];
