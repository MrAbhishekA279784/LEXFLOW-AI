import { ClauseItem } from '../../types';
import { ExtractedPage } from './textExtractor';

export class ClauseSegmenter {
  /**
   * Deterministically segments extracted document text into structured clauses.
   * Uses heading detection, section patterns, and paragraph bounds.
   */
  static segment(documentId: string, fullText: string, pages: ExtractedPage[]): ClauseItem[] {
    if (!fullText || fullText.trim().length === 0) {
      return [];
    }

    const clauses: ClauseItem[] = [];
    
    // Pattern for section / clause headings:
    // e.g., "SECTION 1:", "Section 2.1", "Clause 4 -", "1. DEFINITIONS", "ARTICLE III", "7. PAYMENT"
    const sectionPattern = /(?:(?:SECTION|Section|CLAUSE|Clause|ARTICLE|Article)\s+([0-9a-zA-Z\.]+)|(?:^|\n)([0-9]+\.[0-9A-Z\.]*|[A-Z\s]{4,30}:))/g;
    
    // Split into candidate blocks by double linebreaks or section headers
    const rawBlocks = fullText.split(/\n\s*\n/);
    let clauseCounter = 1;

    for (let i = 0; i < rawBlocks.length; i++) {
      const block = rawBlocks[i].trim();
      if (block.length < 15) continue; // Skip trivial noise

      // Extract title line if available
      const lines = block.split('\n');
      const firstLine = lines[0].trim();
      
      let sectionRef = `Section ${clauseCounter}`;
      let title = `Clause ${clauseCounter}`;
      let bodyText = block;

      // Check if first line resembles a heading
      if (firstLine.length < 80 && (firstLine.toUpperCase() === firstLine || /^\d+[\.\)]|\b(SECTION|CLAUSE|ARTICLE)\b/i.test(firstLine))) {
        sectionRef = firstLine.length < 30 ? firstLine : `Section ${clauseCounter}`;
        title = firstLine;
        bodyText = lines.slice(1).join('\n').trim() || firstLine;
      }

      // Determine page number where block appears
      let pageNumber = 1;
      for (const p of pages) {
        if (p.text.includes(block.substring(0, 30))) {
          pageNumber = p.pageNumber;
          break;
        }
      }

      // Assign risk level based on key legal risk markers
      const lower = block.toLowerCase();
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (lower.includes('indemnify') || lower.includes('penalty') || lower.includes('forfeit') || lower.includes('liquidated damages') || lower.includes('terminate immediately') || lower.includes('unlimited liability')) {
        riskLevel = 'high';
      } else if (lower.includes('notice') || lower.includes('default') || lower.includes('breach') || lower.includes('interest') || lower.includes('deduction')) {
        riskLevel = 'medium';
      }

      // Assign primary party
      let party: 'landlord' | 'tenant' | 'mutual' | 'counsel' = 'mutual';
      if (lower.includes('tenant') || lower.includes('lessee') || lower.includes('borrower') || lower.includes('employee')) {
        party = 'tenant';
      } else if (lower.includes('landlord') || lower.includes('lessor') || lower.includes('lender') || lower.includes('employer')) {
        party = 'landlord';
      }

      // Extract penalties if mentioned
      let penalties: string | undefined;
      if (lower.includes('penalty') || lower.includes('forfeit') || lower.includes('surcharge') || lower.includes('fine')) {
        const penaltyMatch = block.match(/(?:penalty|forfeit|surcharge|fine|interest)[^.\n]*/i);
        if (penaltyMatch) {
          penalties = penaltyMatch[0].trim();
        }
      }

      clauses.push({
        id: `cl-${documentId}-${clauseCounter}`,
        section: sectionRef,
        title,
        summary: bodyText.length > 150 ? bodyText.substring(0, 147) + '...' : bodyText,
        fullText: bodyText,
        riskLevel,
        party,
        pageNumber,
        penalties,
        obligations: []
      });

      clauseCounter++;
    }

    // Fallback if no block was large enough: treat entire text as single clause
    if (clauses.length === 0) {
      clauses.push({
        id: `cl-${documentId}-1`,
        section: 'Section 1',
        title: 'Full Document Text',
        summary: fullText.length > 150 ? fullText.substring(0, 147) + '...' : fullText,
        fullText,
        riskLevel: 'low',
        party: 'mutual',
        pageNumber: 1,
        obligations: []
      });
    }

    return clauses;
  }
}
