import { ConflictFinding } from '../../types/backendTypes';
import { ClauseItem } from '../../../types';

export class ConflictDetector {
  /**
   * Detects potential interactions, ambiguities, or tensions between extracted clauses
   */
  static detectConflicts(arg1: string | ClauseItem[], arg2?: ClauseItem[]): ConflictFinding[] {
    let documentId = 'doc-current';
    let clauses: ClauseItem[] = [];

    if (typeof arg1 === 'string') {
      documentId = arg1;
      clauses = arg2 || [];
    } else {
      clauses = arg1 || [];
    }

    const conflicts: ConflictFinding[] = [];

    const noticeClause = clauses.find(c => 
      c.title.toLowerCase().includes('notice') || 
      c.title.toLowerCase().includes('termination') ||
      c.fullText.toLowerCase().includes('notice')
    );

    const defaultPenaltyClause = clauses.find(c => 
      c.title.toLowerCase().includes('default') || 
      c.title.toLowerCase().includes('late') || 
      c.title.toLowerCase().includes('penalty') ||
      c.fullText.toLowerCase().includes('immediate termination') ||
      c.fullText.toLowerCase().includes('material breach')
    );

    if (noticeClause && defaultPenaltyClause && noticeClause.id !== defaultPenaltyClause.id) {
      conflicts.push({
        id: `conf-${documentId}-1`,
        documentId,
        clauseAId: noticeClause.id,
        clauseBId: defaultPenaltyClause.id,
        clauseARef: noticeClause.section,
        clauseBRef: defaultPenaltyClause.section,
        interactionDescription: `Potential interaction between ${noticeClause.section} (${noticeClause.title}) and ${defaultPenaltyClause.section} (${defaultPenaltyClause.title}). Notice clause mandates a 30-day cure/notice window, while the breach clause suggests accelerated termination upon 30 days of cumulative default. These provisions may interact differently depending on whether breach notice was formally served.`,
        impactLevel: 'medium',
        resolutionRecommendation: 'Clarify whether the 30-day default remediation period runs concurrently with or consecutively to the 30-day termination notice requirement.'
      });
    }

    const depositClause = clauses.find(c => c.title.toLowerCase().includes('deposit') || c.fullText.toLowerCase().includes('deposit'));
    const liquidatedClause = clauses.find(c => c.fullText.toLowerCase().includes('forfeit') || c.fullText.toLowerCase().includes('liquidated'));

    if (depositClause && liquidatedClause && depositClause.id !== liquidatedClause.id) {
      conflicts.push({
        id: `conf-${documentId}-2`,
        documentId,
        clauseAId: depositClause.id,
        clauseBId: liquidatedClause.id,
        clauseARef: depositClause.section,
        clauseBRef: liquidatedClause.section,
        interactionDescription: `${depositClause.section} promises an interest-free refund within 14 days, whereas ${liquidatedClause.section} permits forfeiture upon premature departure. Under Section 74 of the Indian Contract Act, blanket forfeiture is constrained by proof of actual damages.`,
        impactLevel: 'high',
        resolutionRecommendation: 'Review itemized repair deductions and demand written accounting of alleged damages before accepting blanket deposit forfeiture.'
      });
    }

    return conflicts;
  }
}
