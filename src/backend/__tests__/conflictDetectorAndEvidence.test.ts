import { describe, it, expect } from 'vitest';
import { ConflictDetector } from '../services/conflicts/conflictDetector';
import { EvidenceEngine } from '../services/evidence/evidenceEngine';
import { ClauseItem } from '../../types';

const testClauses: ClauseItem[] = [
  {
    id: 'c1',
    section: 'Section 4.3',
    title: '30-Day Notice Requirement',
    summary: 'Tenant must provide 30-day written notice prior to termination.',
    fullText: 'Lessee shall have a mandatory notice period of 30 calendar days to terminate.',
    riskLevel: 'low',
    party: 'tenant',
    pageNumber: 2
  },
  {
    id: 'c2',
    section: 'Section 11.2',
    title: 'Immediate Default & Penalty Clause',
    summary: 'Failure to pay on 1st day results in immediate default.',
    fullText: 'Failure to remit rent strictly results in immediate default penalty.',
    riskLevel: 'high',
    party: 'landlord',
    pageNumber: 5
  }
];

describe('ConflictDetector & EvidenceEngine', () => {
  it('should detect contradictory contractual clauses', () => {
    const conflicts = ConflictDetector.detectConflicts(testClauses);
    expect(conflicts.length).toBeGreaterThanOrEqual(1);
    expect(conflicts[0].interactionDescription.toLowerCase()).toContain('notice');
  });

  it('should format verified evidence citations with document, page, statute, and official URL', () => {
    const citation = EvidenceEngine.formatCitation({
      documentName: 'Rental Agreement.pdf',
      clauseSection: 'Section 4.3',
      pageNumber: 2,
      actTitle: 'Indian Contract Act, 1872',
      sectionNumber: 'Section 74',
      officialUrl: 'https://indiacode.nic.in/handle/123456789/2187',
      caseCitation: 'Kailash Nath Associates v. DDA (2015) 4 SCC 136'
    });

    expect(citation.fullCitationText).toContain('Rental Agreement.pdf');
    expect(citation.fullCitationText).toContain('Section 4.3 (p. 2)');
    expect(citation.fullCitationText).toContain('Section 74');
    expect(citation.officialUrl).toBe('https://indiacode.nic.in/handle/123456789/2187');
  });
});
