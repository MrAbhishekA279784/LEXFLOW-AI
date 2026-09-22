import { describe, it, expect } from 'vitest';
import { LegalKnowledgeEngine } from '../services/legalKnowledge/legalKnowledgeEngine';

describe('LegalKnowledgeEngine & Authoritative Source Retrieval', () => {
  it('should detect jurisdiction as India by default', () => {
    const jurisdiction = LegalKnowledgeEngine.detectJurisdiction('Residential tenancy agreement in Bangalore, Karnataka.');
    expect(jurisdiction.country).toBe('India');
    expect(jurisdiction.state).toBe('Karnataka');
  });

  it('should extract relevant legal topics from scenario context', () => {
    const topics = LegalKnowledgeEngine.extractLegalTopics('Tenant stopped paying rent for 3 months and vacated without notice');
    expect(topics).toContain('unpaid_rent');
    expect(topics).toContain('early_termination');
    expect(topics).toContain('notice_period');
  });

  it('should retrieve authoritative Indian statutes and Supreme Court precedent', async () => {
    const issues = LegalKnowledgeEngine.extractLegalIssues(
      'Tenant penalty for early termination and deposit forfeiture after 3 months unpaid rent'
    );
    const retrieved = await LegalKnowledgeEngine.retrieveApplicableLaw(issues);

    expect(retrieved.length).toBeGreaterThanOrEqual(2);

    // Verify presence of Indian Contract Act 1872 Section 74
    const ica74 = retrieved.find(r => r.actOrCourt.includes('Indian Contract Act') && r.sectionOrArticle.includes('74'));
    expect(ica74).toBeDefined();
    expect(ica74?.officialSourceUrl).toContain('indiacode.nic.in');

    // Verify presence of Supreme Court landmark precedent
    const landmarkCase = retrieved.find(r => r.title?.includes('Kailash Nath'));
    expect(landmarkCase).toBeDefined();
    expect(landmarkCase?.sourceType).toBe('judgment');
  });

  it('should properly rank authorities (Statute > Supreme Court > High Court)', () => {
    const authorities = LegalKnowledgeEngine.rankAuthorities([
      {
        id: '1',
        title: 'High Court Ruling',
        actOrCourt: 'High Court of Karnataka',
        sectionOrArticle: 'Section 1',
        officialSourceUrl: 'https://example.com',
        summary: 'Ruling',
        relevanceExplanation: 'Precedent',
        retrievedAt: new Date().toISOString(),
        sourceType: 'judgment',
        hierarchyLevel: 4
      },
      {
        id: '2',
        title: 'Central Act',
        actOrCourt: 'Indian Contract Act, 1872',
        sectionOrArticle: 'Section 74',
        officialSourceUrl: 'https://indiacode.nic.in',
        summary: 'Statute',
        relevanceExplanation: 'Statutory basis',
        retrievedAt: new Date().toISOString(),
        sourceType: 'central_act',
        hierarchyLevel: 1
      }
    ]);

    expect(authorities[0].sourceType).toBe('central_act');
    expect(authorities[1].sourceType).toBe('judgment');
  });
});
