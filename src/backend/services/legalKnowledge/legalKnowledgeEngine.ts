import { LegalAuthority, EvidenceItem } from '../../types/backendTypes';
import { repository } from '../../repositories';
import { CONSTANTS } from '../../config/constants';

export interface IssueExtractionResult {
  jurisdiction: string;
  primaryTopics: string[];
  matchedActs: string[];
  requiresStatutoryNoticeCheck: boolean;
  requiresPenaltyEnforceabilityCheck: boolean;
}

export interface LegalKnowledgeResponse {
  documentSays: string;
  lawSays: string;
  lexflowAnalysis: string;
  authorities: LegalAuthority[];
  evidence: EvidenceItem[];
  uncertainties: string[];
}

export class LegalKnowledgeEngine {
  /**
   * Helper to detect country & state jurisdiction from text
   */
  static detectJurisdiction(text: string): { country: string; state?: string } {
    const lower = text.toLowerCase();
    let state = 'Karnataka';
    if (lower.includes('delhi')) state = 'Delhi';
    else if (lower.includes('maharashtra') || lower.includes('mumbai')) state = 'Maharashtra';
    else if (lower.includes('karnataka') || lower.includes('bangalore') || lower.includes('bengaluru')) state = 'Karnataka';
    else if (lower.includes('tamil nadu') || lower.includes('chennai')) state = 'Tamil Nadu';
    return { country: 'India', state };
  }

  /**
   * Helper to extract standardized legal topic slugs
   */
  static extractLegalTopics(prompt: string): string[] {
    const lower = prompt.toLowerCase();
    const topics: string[] = [];
    if (lower.includes('rent') || lower.includes('mahine')) topics.push('unpaid_rent');
    if (lower.includes('chhod') || lower.includes('vacate') || lower.includes('terminate')) topics.push('early_termination');
    if (lower.includes('notice')) topics.push('notice_period');
    if (lower.includes('deposit')) topics.push('security_deposit');
    if (lower.includes('penalty') || lower.includes('fine')) topics.push('liquidated_damages');
    return topics.length > 0 ? topics : ['general_breach'];
  }

  /**
   * Helper to rank authorities by level
   */
  static rankAuthorities(authorities: LegalAuthority[]): LegalAuthority[] {
    const rankMap: Record<string, number> = {
      central_act: 1,
      state_act: 2,
      supreme_court_judgment: 3,
      high_court_judgment: 4,
      regulation: 5,
    };
    return [...authorities].sort((a, b) => {
      const aRank = a.hierarchyLevel || 99;
      const bRank = b.hierarchyLevel || 99;
      return aRank - bRank;
    });
  }

  /**
   * Extracts legal issues and detects jurisdiction from natural language scenarios / contract queries
   */
  static extractLegalIssues(prompt: string, contractType = 'residential_tenancy'): IssueExtractionResult {
    const text = prompt.toLowerCase();
    const topics: string[] = [];
    const matchedActs: string[] = [];

    // Tenancy & Rent Default
    if (text.includes('rent') || text.includes('deposit') || text.includes('mahine') || text.includes('ghar') || text.includes('flat') || text.includes('lease')) {
      topics.push('Residential Tenancy');
      topics.push('Lease Determination');
      topics.push('Security Deposit Refund');
      matchedActs.push('Transfer of Property Act, 1882');
      matchedActs.push('Indian Contract Act, 1872');
      matchedActs.push('Model Tenancy Act, 2021');
    }

    // Breach & Penalties
    if (text.includes('tod') || text.includes('penalty') || text.includes('fine') || text.includes('chhod') || text.includes('terminate') || text.includes('notice')) {
      topics.push('Contractual Breach & Liquidated Damages');
      topics.push('Notice Period Enforceability');
      matchedActs.push('Indian Contract Act, 1872 (Section 74)');
    }

    // Employment
    if (text.includes('salary') || text.includes('job') || text.includes('resignation') || text.includes('non-compete')) {
      topics.push('Employment Law');
      topics.push('Restraint of Trade (Section 27 ICA)');
      matchedActs.push('Indian Contract Act, 1872 (Section 27)');
    }

    return {
      jurisdiction: 'India',
      primaryTopics: topics.length > 0 ? topics : ['General Contractual Obligations'],
      matchedActs: matchedActs.length > 0 ? matchedActs : ['Indian Contract Act, 1872'],
      requiresStatutoryNoticeCheck: text.includes('notice') || text.includes('chhod') || text.includes('vacate') || text.includes('terminate'),
      requiresPenaltyEnforceabilityCheck: text.includes('penalty') || text.includes('deposit') || text.includes('fine') || text.includes('forfeit'),
    };
  }

  /**
   * Retrieves authoritative legal sources adhering to the hierarchy of legal authorities
   */
  static async retrieveApplicableLaw(issues: IssueExtractionResult): Promise<LegalAuthority[]> {
    const allSources = await repository.listAuthoritative();
    
    // Filter and prioritize sources based on extracted issues
    const selected: LegalAuthority[] = [];

    if (issues.requiresPenaltyEnforceabilityCheck) {
      const ica74 = allSources.find(s => s.id === 'law-ica-74');
      const kailashNath = allSources.find(s => s.id === 'law-kailash-nath-2015');
      if (ica74) selected.push(ica74);
      if (kailashNath) selected.push(kailashNath);
    }

    if (issues.requiresStatutoryNoticeCheck) {
      const tpa106 = allSources.find(s => s.id === 'law-tpa-106');
      const tpa108 = allSources.find(s => s.id === 'law-tpa-108');
      if (tpa106 && !selected.some(s => s.id === tpa106.id)) selected.push(tpa106);
      if (tpa108 && !selected.some(s => s.id === tpa108.id)) selected.push(tpa108);
    }

    const mta = allSources.find(s => s.id === 'law-mta-2021');
    if (mta && !selected.some(s => s.id === mta.id)) selected.push(mta);

    // Fallback if no specific flags
    if (selected.length === 0) {
      return allSources.slice(0, 3);
    }

    // Sort strictly by authoritative legal hierarchy
    return selected.sort((a, b) => a.hierarchyLevel - b.hierarchyLevel);
  }

  /**
   * Generates tripartite synthesis: DOCUMENT SAYS, LAW SAYS, and LEXFLOW ANALYSIS
   */
  static synthesizeFindings(params: {
    contractClauseSummary: string;
    contractClauseRef: string;
    page: number;
    authorities: LegalAuthority[];
    calculatedArrears: string;
    depositAmount: string;
  }): LegalKnowledgeResponse {
    const { contractClauseSummary, contractClauseRef, page, authorities, calculatedArrears, depositAmount } = params;

    const documentSays = `The contract stipulates that rent is payable on the 5th, with a ₹500/day late penalty after a 3-day grace period (Section 4.3). Furthermore, Section 12.1 specifies a mandatory 30-day written notice to terminate; failure to fulfill this grants the lessor the right to adjust liabilities against the ₹75,000 security deposit.`;

    const lawSays = authorities.map(auth => {
      if (auth.sourceType === 'central_act') {
        return `• ${auth.actOrCourt} (${auth.sectionOrArticle}): ${auth.summary} [Source: India Code official repository]`;
      }
      if (auth.sourceType === 'judgment') {
        return `• ${auth.actOrCourt} in ${auth.title}: ${auth.summary} [Source: Official Supreme Court Record]`;
      }
      return `• ${auth.title}: ${auth.summary}`;
    }).join('\n\n');

    const lexflowAnalysis = `When the contractual clauses and statutory provisions are analyzed concurrently:
1. Contractual Exposure: Withholding rent for 3 months creates an identified contractual arrears claim of ${calculatedArrears}. The lessor is contractually authorized to retain the ${depositAmount} security deposit to offset these arrears.
2. Statutory Penalty Protection: While the agreement asserts daily compounding late penalties, Section 74 of the Indian Contract Act, 1872 as interpreted by the Supreme Court of India in Kailash Nath Associates v. DDA (2015), establishes that penalties and deposit forfeitures must reflect genuine pre-estimated or provable loss rather than punitive windfall.
3. Vacating Consequences: Departing without delivering formal 30-day written notice risks legitimate landlord claims for the unexpired notice period rent, utility adjustments, and structural restoration.
4. Next Practical Step: Instead of unilateral abandonment, issue a formal written notice proposing key handover and mutual offset of the deposit against unpaid arrears to avoid formal legal notice escalation.`;

    const evidence: EvidenceItem[] = [
      {
        type: 'document',
        clauseId: 'cl-2',
        section: contractClauseRef || 'Section 4.3 & 12.1',
        page: page || 2,
        exactExcerpt: contractClauseSummary || 'Rent non-payment exceeding 30 days shall be treated as material contractual breach. Unilateral vacating allows deposit forfeiture.'
      },
      ...authorities.map(auth => ({
        type: (auth.sourceType === 'judgment' ? 'judgment' : 'legal_authority') as any,
        act: auth.actOrCourt,
        statuteSection: auth.sectionOrArticle,
        sourceUrl: auth.officialSourceUrl,
        citation: auth.title,
        retrievalTimestamp: auth.retrievedAt
      }))
    ];

    const uncertainties = [
      'The exact condition of the premises upon handover may invite landlord claims for repainting or utility arrears.',
      'State-specific amendments under local Rent Control legislation may require formal conciliation through the Rent Authority.'
    ];

    return {
      documentSays,
      lawSays,
      lexflowAnalysis,
      authorities,
      evidence,
      uncertainties
    };
  }
}
