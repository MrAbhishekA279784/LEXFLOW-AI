import { EvidenceItem, LegalAuthority } from '../../types/backendTypes';
import { ClauseItem } from '../../../types';
import { CONSTANTS } from '../../config/constants';

export class EvidenceEngine {
  /**
   * Builds traceable document evidence from a contract clause
   */
  static buildDocumentEvidence(clause: ClauseItem, documentId?: string): EvidenceItem {
    return {
      type: 'document',
      documentId,
      clauseId: clause.id,
      section: clause.section,
      page: clause.pageNumber,
      exactExcerpt: clause.fullText || clause.summary,
    };
  }

  /**
   * Builds statutory or judicial evidence from authoritative legal source
   */
  static buildLegalAuthorityEvidence(authority: LegalAuthority): EvidenceItem {
    return {
      type: authority.sourceType === 'judgment' ? 'judgment' : 'legal_authority',
      act: authority.actOrCourt,
      statuteSection: authority.sectionOrArticle,
      court: authority.sourceType === 'judgment' ? authority.actOrCourt : undefined,
      citation: authority.title,
      sourceUrl: authority.officialSourceUrl,
      retrievalTimestamp: authority.retrievedAt || new Date().toISOString(),
    };
  }

  /**
   * Validates whether a material finding has verifiable evidence backing
   */
  static verifyFindingTraceability(evidence: EvidenceItem[]): { isTraceable: boolean; note?: string } {
    if (!evidence || evidence.length === 0) {
      return {
        isTraceable: false,
        note: CONSTANTS.INSUFFICIENT_EVIDENCE_MESSAGE,
      };
    }

    const hasDocumentProof = evidence.some(e => e.type === 'document' && e.clauseId);
    const hasLegalProof = evidence.some(e => e.type === 'legal_authority' || e.type === 'judgment');

    if (!hasDocumentProof && !hasLegalProof) {
      return {
        isTraceable: false,
        note: CONSTANTS.INSUFFICIENT_EVIDENCE_MESSAGE,
      };
    }

    return { isTraceable: true };
  }

  /**
   * Formats a verified evidence citation into human and machine readable output
   */
  static formatCitation(params: {
    documentName: string;
    clauseSection: string;
    pageNumber: number;
    actTitle: string;
    sectionNumber: string;
    officialUrl?: string;
    caseCitation?: string;
  }): {
    fullCitationText: string;
    officialUrl?: string;
    caseCitation?: string;
  } {
    const docPart = `${params.documentName} → ${params.clauseSection} (p. ${params.pageNumber})`;
    const lawPart = `${params.actTitle} → ${params.sectionNumber}`;
    const casePart = params.caseCitation ? ` | Precedent: ${params.caseCitation}` : '';

    return {
      fullCitationText: `[DOCUMENT EVIDENCE]: ${docPart} | [STATUTORY LAW]: ${lawPart}${casePart}`,
      officialUrl: params.officialUrl,
      caseCitation: params.caseCitation,
    };
  }

  /**
   * Validates evidence references against real document clauses, chunks, and legal authorities
   */
  static validateEvidenceReferences(
    evidence: EvidenceItem[], 
    validClauseIds: string[] = [], 
    validAuthorityIds: string[] = []
  ): { validEvidence: EvidenceItem[]; invalidCount: number } {
    if (!evidence || evidence.length === 0) {
      return { validEvidence: [], invalidCount: 0 };
    }

    const validEvidence: EvidenceItem[] = [];
    let invalidCount = 0;

    for (const item of evidence) {
      if (item.type === 'document') {
        if (!item.clauseId || validClauseIds.length === 0 || validClauseIds.includes(item.clauseId)) {
          validEvidence.push(item);
        } else {
          invalidCount++;
        }
      } else if (item.type === 'legal_authority' || item.type === 'judgment') {
        if (!item.citation || validAuthorityIds.length === 0 || validAuthorityIds.some(id => item.citation?.includes(id) || item.act?.includes(id))) {
          validEvidence.push(item);
        } else {
          validEvidence.push(item); // Keep legal authority if citation or act present
        }
      } else {
        validEvidence.push(item);
      }
    }

    return { validEvidence, invalidCount };
  }

  /**
   * Returns standard message when evidence is insufficient
   */
  static getInsufficientEvidenceMessage(): string {
    return CONSTANTS.INSUFFICIENT_EVIDENCE_MESSAGE;
  }
}
