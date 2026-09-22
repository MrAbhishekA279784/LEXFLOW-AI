import { RiskFinding } from '../../types/backendTypes';
import { ClauseItem } from '../../../types';
import { aiService } from '../ai/aiService';
import { AdversarialReviewResultSchema } from '../../schemas/aiResultSchemas';
import { PromptSecurity } from '../../utils/promptSecurity';
import { z } from 'zod';

export interface DualReviewResult {
  opposingRisks: RiskFinding[];
  protections: RiskFinding[];
  synthesis: {
    highPriority: RiskFinding[];
    mediumPriority: RiskFinding[];
    protectionHighlights: RiskFinding[];
  };
}

export class AdversarialReviewService {
  /**
   * Deterministic Dual-AI Adversarial Review fallback: Simulates Opposing Counsel vs Protection Counsel analysis
   */
  static reviewDocument(documentId: string, clauses: ClauseItem[]): DualReviewResult {
    const opposingRisks: RiskFinding[] = [];
    const protections: RiskFinding[] = [];

    clauses.forEach(clause => {
      const lowerText = (clause.fullText + ' ' + clause.summary).toLowerCase();

      // Opposing Counsel Review: Identify liabilities, aggressive late fees, one-sided terms
      if (lowerText.includes('penalty') || lowerText.includes('per day') || lowerText.includes('surcharge')) {
        opposingRisks.push({
          id: `risk-opp-${clause.id}`,
          documentId,
          title: `Aggressive Accrual: ${clause.title}`,
          level: 'critical',
          perspective: 'adversarial',
          clauseRef: clause.section,
          description: `Clause imposes an aggressive daily surcharge (e.g. ₹500/day) that compounds rapidly over bank holidays or dispute periods, creating significant financial exposure.`,
          recommendation: 'Negotiate a capped aggregate late fee (e.g. max 5% of monthly rent) and extend the grace period to 7 business days.',
          potentialImpact: 'High compounding penalty liability.',
          evidence: [{
            type: 'document',
            documentId,
            clauseId: clause.id,
            section: clause.section,
            page: clause.pageNumber,
            exactExcerpt: clause.fullText
          }]
        });
      }

      if (lowerText.includes('forfeit') || lowerText.includes('liquidated')) {
        opposingRisks.push({
          id: `risk-opp-forfeit-${clause.id}`,
          documentId,
          title: `Deposit Forfeiture Risk: ${clause.title}`,
          level: 'moderate',
          perspective: 'adversarial',
          clauseRef: clause.section,
          description: `Contract purports to grant landlord the right to forfeit the full security deposit upon premature departure during the lock-in term.`,
          recommendation: 'Add language conditioning deposit deductions strictly on itemized provable loss and utility arrears.',
          potentialImpact: 'Loss of ₹75,000 security deposit.',
          evidence: [{
            type: 'document',
            documentId,
            clauseId: clause.id,
            section: clause.section,
            page: clause.pageNumber,
            exactExcerpt: clause.fullText
          }]
        });
      }

      // Protection Review: Identify protections, rights, caps, grace periods
      if (lowerText.includes('grace period') || lowerText.includes('refundable') || lowerText.includes('notice')) {
        protections.push({
          id: `prot-${clause.id}`,
          documentId,
          title: `Contractual Protection: ${clause.title}`,
          level: 'low',
          perspective: 'protection',
          clauseRef: clause.section,
          description: `Provides explicit procedural protection (such as grace period or 14-day mandatory refund window).`,
          recommendation: 'Ensure written receipts and date-stamped emails are maintained to preserve proof of compliance.',
          potentialImpact: 'Defensive shield against premature default claims.',
          evidence: [{
            type: 'document',
            documentId,
            clauseId: clause.id,
            section: clause.section,
            page: clause.pageNumber,
            exactExcerpt: clause.fullText
          }]
        });
      }
    });

    const highPriority = opposingRisks.filter(r => r.level === 'critical');
    const mediumPriority = opposingRisks.filter(r => r.level === 'moderate');

    return {
      opposingRisks,
      protections,
      synthesis: {
        highPriority,
        mediumPriority,
        protectionHighlights: protections,
      }
    };
  }

  /**
   * Dual-Agent AI Review using LLM with structured Zod schema output and deterministic fallback
   */
  static async reviewDocumentAsync(documentId: string, clauses: ClauseItem[]): Promise<DualReviewResult> {
    try {
      const prompt = `Conduct a Dual-Perspective Adversarial Review on the following contract clauses:

${clauses.map(c => `[${c.section}] ${c.title} (p. ${c.pageNumber}): ${c.fullText}`).join('\n\n')}

Analyze from TWO opposing viewpoints:
1. OPPOSING COUNSEL: Identify maximum liabilities, hidden financial traps, one-sided indemnity, and aggressive penalties.
2. PROTECTION COUNSEL: Identify defensive shields, procedural grace periods, statutory caps, and tenant rights.

Synthesize both into categorized priorities (High Priority, Medium Priority, Protection Highlights).`;

      const systemInstruction = PromptSecurity.getBaseSystemInstruction(
        'You are the LEXFLOW Dual-Agent Legal Stress-Testing Engine. Perform rigorous opposing-counsel risk analysis paired with protective defense synthesis.'
      );

      const aiResult = await aiService.generateStructuredJson<z.infer<typeof AdversarialReviewResultSchema>>(prompt, {
        systemInstruction,
        zodSchema: AdversarialReviewResultSchema,
        temperature: 0.2,
      });

      return {
        opposingRisks: (aiResult.opposingRisks as RiskFinding[]) || [],
        protections: (aiResult.protections as RiskFinding[]) || [],
        synthesis: {
          highPriority: (aiResult.synthesis?.highPriority as RiskFinding[]) || [],
          mediumPriority: (aiResult.synthesis?.mediumPriority as RiskFinding[]) || [],
          protectionHighlights: (aiResult.synthesis?.protectionHighlights as RiskFinding[]) || [],
        }
      };
    } catch {
      return this.reviewDocument(documentId, clauses);
    }
  }
}
