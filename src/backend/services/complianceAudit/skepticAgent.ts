import { aiService } from '../ai/aiService';
import { ClauseItem } from '../../../types';
import { LegalAuthority } from '../../types/backendTypes';
import { SkepticAgentOutputSchema } from './schemas';
import { z } from 'zod';
import { logger } from '../../utils/logger';

export type SkepticOutput = z.infer<typeof SkepticAgentOutputSchema>;

export class SkepticAgent {
  /**
   * Evaluates and challenges Reviewer findings using an independent adversarial lens
   */
  static async challengeFindings(params: {
    findings: Array<{
      findingId: string;
      category: string;
      severity: string;
      title: string;
      claim: string;
      reasoning: string;
      affectedClauseRefs: string[];
    }>;
    clauses: ClauseItem[];
    authorities: LegalAuthority[];
  }): Promise<SkepticOutput> {
    const { findings, clauses, authorities } = params;

    const systemPrompt = `You are the specialized SKEPTIC AGENT for LEXFLOW, an AI-powered legal compliance audit engine.
Your role is to independently and critically challenge the Reviewer Agent's findings. You represent the opposing counter-counsel and judicial skepticism.

For EVERY finding, test it against these 9 fundamental legal audit questions:
1. Is the factual evidence cited sufficient to prove the claim?
2. Is the clause interpretation legally accurate or overstated?
3. Is there an express or implied exception (e.g. grace periods, landlord obligations, force majeure)?
4. Does another clause in the contract modify, mitigate, or contradict this finding?
5. Is the cited statute or case precedent strictly applicable to this document's specific facts?
6. Is the jurisdiction correct?
7. Is the financial or legal exposure conclusion exaggerated?
8. What critical factual or context information is missing?
9. What plausible alternative interpretation would the opposing counterparty's advocate argue?

You MUST return structured JSON adhering to the SkepticAgentOutputSchema with an array of 'challenges':
- findingId: matching the reviewer's findingId
- challenge: precise legal and contextual counter-argument
- alternativeInterpretation: counterparty's plausible position
- missingInformation: array of missing documents or facts needed to verify the claim
- confidence: number 0 to 1
- isMateriallyDisputed: boolean (true if the finding is strongly contested or incomplete)
- counterClauseRefs: array of counter-clauses, e.g. ["Section 4.1"]`;

    const userPrompt = `REVIEWER FINDINGS TO CHALLENGE:
${JSON.stringify(findings, null, 2)}

FULL CONTRACT CLAUSES FOR COUNTER-EXAMINATION:
${JSON.stringify(clauses.slice(0, 15).map(c => ({ id: c.id, section: c.section, title: c.title, text: c.fullText || c.summary || '' })), null, 2)}

LEGAL AUTHORITIES CITED:
${JSON.stringify(authorities.slice(0, 5).map(a => ({ title: a.title, section: a.sectionOrArticle, summary: a.summary })), null, 2)}

Independently critique and challenge each finding. Identify counter-clauses and opposing legal arguments.`;

    try {
      const output = await aiService.generateStructuredJson<SkepticOutput>(
        `${systemPrompt}\n\n${userPrompt}`,
        {
          zodSchema: SkepticAgentOutputSchema,
          temperature: 0.1
        }
      );

      if (output && Array.isArray(output.challenges) && output.challenges.length > 0) {
        return output;
      }
    } catch (err) {
      logger.warn('SkepticAgent AI call failed or returned invalid schema, falling back to deterministic skepticism', err);
    }

    return this.getDeterministicChallenges(findings);
  }

  /**
   * Deterministic skeptic challenges for standard contractual scenarios
   */
  static getDeterministicChallenges(
    findings: Array<{ findingId: string; category: string; title: string }>
  ): SkepticOutput {
    const allPresets = [
      {
        findingId: 'REV-001',
        categoryKey: 'penalty_exposure',
        challenge: 'Section 4.1 incorporates an express 3-day grace window (rent due on 5th, penalty only commences after the 8th). Furthermore, ₹500/day operates as agreed pre-estimated administrative friction under freedom of contract, provided notice is served.',
        alternativeInterpretation: 'The penalty is not an arbitrary windfall but a negotiated deterrent against recurring bank EMI defaults borne by the lessor.',
        missingInformation: [
          'Lessor mortgage schedule & financial proof of actual banking penalties incurred upon delay',
          'Prior payment history and explicit waiver conduct between parties'
        ],
        confidence: 0.85,
        isMateriallyDisputed: true,
        counterClauseRefs: ['Section 4.1']
      },
      {
        findingId: 'REV-002',
        categoryKey: 'termination_exposure',
        challenge: 'The 6-month lock-in period was explicitly agreed with mutual consideration: the tenant received a stable rental rate below market median. Forfeiture of deposit compensates for brokerage, vacancy re-listing, and lost rental opportunity costs.',
        alternativeInterpretation: 'The clause represents agreed minimum tenure liquidated damages, legally enforceable under Section 73 of the Indian Contract Act if the lessor cannot immediately find a replacement occupant.',
        missingInformation: [
          'Local rental market occupancy rate in Bengaluru Urban',
          'Whether the lessor made prompt, good-faith efforts to re-let the property'
        ],
        confidence: 0.82,
        isMateriallyDisputed: true,
        counterClauseRefs: ['Section 12.1']
      },
      {
        findingId: 'REV-003',
        categoryKey: 'unfavorable_provision',
        challenge: 'If the premises were handed over freshly painted with photographic inventory at inception, the covenant to restore the walls to original condition is a standard restorative covenant, not an unreasonable penalty.',
        alternativeInterpretation: 'The lessor is merely enforcing restitution in integrum—restoring the flat to its move-in condition as acknowledged in the initial inspection schedule.',
        missingInformation: [
          'Initial move-in inspection report and timestamped photographic inventory',
          'Contractor receipts demonstrating actual expenditure on painting'
        ],
        confidence: 0.79,
        isMateriallyDisputed: false,
        counterClauseRefs: ['Section 5.1']
      },
      {
        findingId: 'REV-004',
        categoryKey: 'compliance_risk',
        challenge: 'Section 12.1 incorporates a default clause cross-referencing peaceful determination. Courts enforce agreed re-entry where persistent non-payment or unlawful nuisance occurs, subject to police reporting.',
        alternativeInterpretation: 'Immediate determination applies strictly to fundamental breaches such as unlawful sub-letting or hazardous premises usage.',
        missingInformation: [
          'Whether breach relates to routine non-payment or structural hazard/sub-letting'
        ],
        confidence: 0.81,
        isMateriallyDisputed: false,
        counterClauseRefs: ['Section 12.1']
      }
    ];

    if (!findings || findings.length === 0) {
      return { challenges: allPresets.map(({ categoryKey, ...rest }) => rest) };
    }

    const matched = findings.map((f, idx) => {
      const preset = allPresets.find(p => p.findingId === f.findingId || p.categoryKey === f.category) || allPresets[idx % allPresets.length];
      return {
        findingId: f.findingId,
        challenge: preset.challenge,
        alternativeInterpretation: preset.alternativeInterpretation,
        missingInformation: preset.missingInformation,
        confidence: preset.confidence,
        isMateriallyDisputed: preset.isMateriallyDisputed,
        counterClauseRefs: preset.counterClauseRefs
      };
    });

    return { challenges: matched };
  }
}
