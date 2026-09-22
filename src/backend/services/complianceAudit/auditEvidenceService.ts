import { ClauseItem } from '../../../types';
import { EvidenceItem, LegalAuthority } from '../../types/backendTypes';

export class AuditEvidenceService {
  /**
   * Matches clause references (e.g. 'Section 4.3', 'Section 12.1') to full ClauseItems
   */
  static matchClauses(clauseRefs: string[], clauses: ClauseItem[]): ClauseItem[] {
    const matched: ClauseItem[] = [];
    clauseRefs.forEach(ref => {
      const cleanRef = ref.trim().toLowerCase();
      const found = clauses.find(c => 
        c.section.toLowerCase() === cleanRef || 
        c.section.toLowerCase().includes(cleanRef) ||
        cleanRef.includes(c.section.toLowerCase()) ||
        c.id.toLowerCase() === cleanRef
      );
      if (found && !matched.some(m => m.id === found.id)) {
        matched.push(found);
      }
    });
    return matched;
  }

  /**
   * Builds structured evidence items from matched clauses
   */
  static buildClauseEvidence(clauses: ClauseItem[]): EvidenceItem[] {
    return clauses.map(c => ({
      type: 'document' as const,
      clauseId: c.id,
      section: c.section,
      page: c.pageNumber,
      exactExcerpt: c.fullText,
      explanation: c.summary
    }));
  }

  /**
   * Formats statutory & judicial evidence from Legal Authorities
   */
  static buildLegalEvidence(authorities: LegalAuthority[]): EvidenceItem[] {
    return authorities.map(a => ({
      type: 'legal_authority' as const,
      section: a.sectionOrArticle,
      courtOrStatute: a.actOrCourt,
      exactExcerpt: `${a.title}: ${a.summary}`,
      officialSourceUrl: a.officialSourceUrl,
      explanation: a.relevanceExplanation
    }));
  }

  /**
   * Correlates findings with applicable law based on topic keywords and statutory sections
   */
  static correlateAuthorities(
    category: string,
    title: string,
    reasoning: string,
    allAuthorities: LegalAuthority[]
  ): LegalAuthority[] {
    const text = `${category} ${title} ${reasoning}`.toLowerCase();
    const matched: LegalAuthority[] = [];

    allAuthorities.forEach(auth => {
      const authText = `${auth.title} ${auth.actOrCourt} ${auth.sectionOrArticle} ${auth.summary} ${auth.relevanceExplanation}`.toLowerCase();
      
      let isRelevant = false;

      // Penalties & Liquidated Damages
      if ((text.includes('penalty') || text.includes('deposit') || text.includes('forfeit') || text.includes('liquidated')) &&
          (authText.includes('section 74') || authText.includes('kailash nath') || authText.includes('deposit'))) {
        isRelevant = true;
      }

      // Notice period & termination
      if ((text.includes('notice') || text.includes('terminat') || text.includes('vacat') || text.includes('lock-in')) &&
          (authText.includes('section 106') || authText.includes('notice') || authText.includes('tenancy act'))) {
        isRelevant = true;
      }

      // Dispute & Arbitration / Jurisdiction
      if ((text.includes('arbitrat') || text.includes('dispute') || text.includes('jurisdiction') || text.includes('stamp')) &&
          (authText.includes('arbitration') || authText.includes('jurisdiction') || authText.includes('contract act'))) {
        isRelevant = true;
      }

      // Security deposit caps (Model Tenancy Act)
      if ((text.includes('deposit') || text.includes('security') || text.includes('refund')) &&
          (authText.includes('model tenancy') || authText.includes('section 11') || authText.includes('two months'))) {
        isRelevant = true;
      }

      if (isRelevant && !matched.some(m => m.id === auth.id)) {
        matched.push(auth);
      }
    });

    // Fallback: If none matched, return top primary authority
    if (matched.length === 0 && allAuthorities.length > 0) {
      matched.push(allAuthorities[0]);
    }

    return matched;
  }
}
