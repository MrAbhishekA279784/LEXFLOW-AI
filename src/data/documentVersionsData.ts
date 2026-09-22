import { DocumentVersion } from '../types';
import { RENTAL_CLAUSES } from './initialData';

export const INITIAL_DOCUMENT_VERSIONS: Record<string, DocumentVersion[]> = {
  'doc-rental': [
    {
      id: 'ver-rental-3',
      documentId: 'doc-rental',
      versionNumber: 'v1.2',
      title: 'Mutual Protections & Signed Addendum',
      timestamp: 'Today · 2 hours ago',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      author: {
        name: 'Vikram Sharma',
        role: 'User',
      },
      summary: 'Re-negotiated late fee penalty cap, added landlord structural repair duty, and clarified deposit refund timelines under Model Tenancy guidelines.',
      changeType: 'signed_addendum',
      changeCount: 3,
      riskCount: 1,
      clauseCount: 14,
      isCurrent: true,
      changes: [
        {
          id: 'ch-rent-3-1',
          clauseSection: 'Section 4.3',
          clauseTitle: 'Late Payment & Default Penalty',
          changeType: 'modified',
          originalText: 'Penalty surcharge of INR 500/- per day shall accrue starting on the 8th of the month until full settlement.',
          updatedText: 'Penalty surcharge shall be capped at INR 200/- per day, applying strictly after an extended 5-day grace period ending on the 10th.',
          riskImpact: 'mitigated',
          explanation: 'Reduced excessive daily late penalty by 60% and extended tenant payment grace buffer.'
        },
        {
          id: 'ch-rent-3-2',
          clauseSection: 'Section 5.1',
          clauseTitle: 'Security Deposit Refund Window',
          changeType: 'modified',
          originalText: 'Security deposit refundable within 45 days after key handover subject to discretionary landlord deductions.',
          updatedText: 'Interest-free deposit of INR 75,000/- refundable within 14 calendar days of handover, supported by an itemized deduction invoice.',
          riskImpact: 'mitigated',
          explanation: 'Shortened refund timeline from 45 days to 14 days and required itemized proof for any deductions.'
        },
        {
          id: 'ch-rent-3-3',
          clauseSection: 'Section 9.1',
          clauseTitle: 'Major Structural Repairs',
          changeType: 'added',
          originalText: undefined,
          updatedText: 'Landlord shall be solely liable for all structural seepage, electrical mainline failure, and roof waterproofing expenses exceeding INR 2,000/- per event.',
          riskImpact: 'mitigated',
          explanation: 'Explicitly insulated tenant from major building structural repair liabilities.'
        }
      ],
      snapshotClauses: RENTAL_CLAUSES
    },
    {
      id: 'ver-rental-2',
      documentId: 'doc-rental',
      versionNumber: 'v1.1',
      title: 'Counterparty Counsel Counter-Draft',
      timestamp: 'Yesterday · 4:15 PM',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      author: {
        name: 'Rajesh Verma (Landlord)',
        role: 'Landlord',
      },
      summary: 'Landlord inserted strict 6-month lock-in clause and increased notice period from 15 days to 30 days.',
      changeType: 'counter_offer',
      changeCount: 2,
      riskCount: 2,
      clauseCount: 13,
      isCurrent: false,
      changes: [
        {
          id: 'ch-rent-2-1',
          clauseSection: 'Section 12.1',
          clauseTitle: 'Lock-in Period & Early Termination',
          changeType: 'modified',
          originalText: 'Either party may terminate the tenancy at any time by giving 15 calendar days written notice.',
          updatedText: 'Mandatory 6-month lock-in period. Vacating prior to completion of lock-in incurs forfeiture of full security deposit.',
          riskImpact: 'increased',
          explanation: 'Imposed lock-in restriction with complete security deposit forfeiture penalty.'
        },
        {
          id: 'ch-rent-2-2',
          clauseSection: 'Section 8.2',
          clauseTitle: 'Annual Rent Escalation Cap',
          changeType: 'added',
          originalText: undefined,
          updatedText: 'Upon renewal after 11 months, monthly rent shall escalate automatically by 7% without renegotiation.',
          riskImpact: 'neutral',
          explanation: 'Capped rent increase rate at 7% per renewal term.'
        }
      ],
      snapshotClauses: RENTAL_CLAUSES.map(c => {
        if (c.section === 'Section 4.3') {
          return {
            ...c,
            penalties: '₹500 per day late surcharge.',
            riskLevel: 'high'
          };
        }
        return c;
      })
    },
    {
      id: 'ver-rental-1',
      documentId: 'doc-rental',
      versionNumber: 'v1.0',
      title: 'Original Document Intake (V1.0)',
      timestamp: 'Apr 21, 2025 · 11:20 AM',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      author: {
        name: 'System Intake',
        role: 'System',
      },
      summary: 'Initial raw PDF upload parsed and vectorized. Flagged 3 high-risk asymmetrical covenants including uncapped late penalties and ambiguous deposit return terms.',
      changeType: 'initial_upload',
      changeCount: 14,
      riskCount: 3,
      clauseCount: 14,
      isCurrent: false,
      changes: [
        {
          id: 'ch-rent-1-1',
          clauseSection: 'Document Upload',
          clauseTitle: 'Baseline Ingestion of 14 Clauses',
          changeType: 'added',
          originalText: undefined,
          updatedText: 'Extracted initial 14 clauses across 8 pages of Bangalore standard residential agreement.',
          riskImpact: 'increased',
          explanation: '3 critical risk flags identified in baseline agreement regarding termination penalties.'
        }
      ],
      snapshotClauses: RENTAL_CLAUSES.map(c => {
        if (c.section === 'Section 4.3') {
          return {
            ...c,
            penalties: 'Uncapped ₹500/day late penalty.',
            riskLevel: 'high'
          };
        }
        if (c.section === 'Section 5.1') {
          return {
            ...c,
            summary: 'Security deposit refundable within 45 days subject to unspecified landlord deductions.',
            riskLevel: 'medium'
          };
        }
        return c;
      })
    }
  ],
  'doc-employment': [
    {
      id: 'ver-emp-2',
      documentId: 'doc-employment',
      versionNumber: 'v1.1',
      title: 'Non-Compete Geographic Scope Amendment',
      timestamp: 'Apr 23, 2025 · 2:00 PM',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      author: {
        name: 'Legal Counsel',
        role: 'Counsel',
      },
      summary: 'Clarified non-compete enforceability under Section 27 Indian Contract Act; restricted restriction to active direct competitors only.',
      changeType: 'clause_amendment',
      changeCount: 1,
      riskCount: 1,
      clauseCount: 18,
      isCurrent: true,
      changes: [
        {
          id: 'ch-emp-1',
          clauseSection: 'Clause 9.2',
          clauseTitle: 'Post-Termination Non-Compete Scope',
          changeType: 'modified',
          originalText: 'Employee shall not engage in any software consulting or engineering activities for 12 months globally.',
          updatedText: 'Employee shall not provide direct consulting to specified key named competitors for a period of 90 days post-termination.',
          riskImpact: 'mitigated',
          explanation: 'Narrowed non-compete from 12 months worldwide to 90 days restricted to named direct competitors.'
        }
      ]
    },
    {
      id: 'ver-emp-1',
      documentId: 'doc-employment',
      versionNumber: 'v1.0',
      title: 'Original Employment Agreement Upload',
      timestamp: 'Apr 22, 2025 · 9:30 AM',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      author: {
        name: 'System Intake',
        role: 'System',
      },
      summary: 'Initial intake of Senior Software Engineer contract with 90-day probation and IP assignment provisions.',
      changeType: 'initial_upload',
      changeCount: 18,
      riskCount: 2,
      clauseCount: 18,
      isCurrent: false,
      changes: [
        {
          id: 'ch-emp-0',
          clauseSection: 'Intake',
          clauseTitle: 'Full Agreement Parsing',
          changeType: 'added',
          originalText: undefined,
          updatedText: 'Ingested 18 clauses spanning compensation, stock options, confidential information, and IP assignment.',
          riskImpact: 'neutral',
          explanation: 'Baseline contract ingested successfully.'
        }
      ]
    }
  ]
};
