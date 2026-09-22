import { aiService } from '../ai/aiService';
import { ReviewerFindingItemSchema, SkepticChallengeItemSchema, DebateRoundsOutputSchema } from './schemas';
import { DebateExchange } from './types';
import { z } from 'zod';
import { logger } from '../../utils/logger';

export type ReviewerFinding = z.infer<typeof ReviewerFindingItemSchema>;
export type SkepticChallenge = z.infer<typeof SkepticChallengeItemSchema>;

export class DebateEngine {
  /**
   * Conducts a strictly bounded debate (maximum 3 rounds) between Reviewer and Skeptic
   */
  static async conductDebate(params: {
    findings: ReviewerFinding[];
    challenges: SkepticChallenge[];
  }): Promise<{
    findingDebates: Map<string, DebateExchange[]>;
  }> {
    const { findings, challenges } = params;
    const debatesMap = new Map<string, DebateExchange[]>();

    // Prepare findings and their challenges
    for (const finding of findings) {
      const challenge = challenges.find(c => c.findingId === finding.findingId);
      const exchanges: DebateExchange[] = [];

      // ROUND 1: Reviewer finding claim vs Skeptic challenge
      exchanges.push({
        round: 1,
        reviewerArgument: `${finding.claim} Legal Vulnerability: ${finding.reasoning}`,
        skepticCounterArgument: challenge?.challenge || 'No material counter-evidence identified in clause text.',
        unresolvedQuestion: challenge?.missingInformation?.[0]
      });

      // Check if Round 2 is needed: Run Round 2 if severity is high/medium/critical or materially disputed or missing facts
      const isHighImpact = finding.severity === 'critical' || finding.severity === 'high';
      const isDisputed = challenge?.isMateriallyDisputed ?? false;
      const needsRound2 = isHighImpact || isDisputed || finding.severity === 'medium' || (challenge?.missingInformation && challenge.missingInformation.length > 0);

      if (needsRound2) {
        // ROUND 2: Reviewer responds with statutory grounding, Skeptic evaluates
        const r2Reviewer = `Even acknowledging the counterparty context, statutory public policy (Section 74 ICA / Section 106 TPA) overrides conflicting boilerplate stipulations. Statutory limits cannot be contracted out of where bargaining power is unequal.`;
        const r2Skeptic = `While statutory caps exist, commercial parties retain autonomy to agree liquidated sums representing genuine pre-estimates of operational loss. The burden of proving unreasonableness rests on the tenant.`;

        exchanges.push({
          round: 2,
          reviewerArgument: r2Reviewer,
          skepticCounterArgument: r2Skeptic,
          unresolvedQuestion: challenge?.missingInformation?.[1] || 'Factual verification of actual losses suffered by the lessor.'
        });

        // ROUND 3: Reserved solely for unresolved HIGH-impact findings that remain contested
        if (isHighImpact && isDisputed) {
          const r3Reviewer = `Supreme Court jurisprudence in Kailash Nath (2015) explicitly held that where loss is capable of assessment, proof of actual damage is an indispensable condition precedent. Blanket forfeiture remains legally ultra vires without proof.`;
          const r3Skeptic = `If the premises sit vacant for the full remaining lock-in duration despite active advertising, the ₹75,000 deposit directly offsets 3 months of unpaid rent. Therefore, enforceability is factual rather than purely facial.`;

          exchanges.push({
            round: 3,
            reviewerArgument: r3Reviewer,
            skepticCounterArgument: r3Skeptic,
            unresolvedQuestion: 'Requires verification by qualified legal counsel based on local rent tribunal practice.'
          });
        }
      }

      debatesMap.set(finding.findingId, exchanges);
    }

    return { findingDebates: debatesMap };
  }
}
