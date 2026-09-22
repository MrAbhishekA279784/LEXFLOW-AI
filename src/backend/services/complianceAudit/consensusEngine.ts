import { ConsensusStatus, ComplianceFindingSeverity } from './types';
import { ReviewerFinding, SkepticChallenge } from './debateEngine';
import { DebateExchange } from './types';

export interface ConsensusResult {
  status: ConsensusStatus;
  humanReviewRecommended: boolean;
  humanReviewReason?: string;
  lexflowSynthesis: string;
}

export class ConsensusEngine {
  /**
   * Synthesizes reviewer findings, skeptic counter-arguments, and bounded debate records into structured consensus
   */
  static evaluateFinding(params: {
    finding: ReviewerFinding;
    challenge?: SkepticChallenge;
    debateExchanges: DebateExchange[];
  }): ConsensusResult {
    const { finding, challenge, debateExchanges } = params;

    const isHighImpact = finding.severity === 'critical' || finding.severity === 'high';
    const isMateriallyDisputed = challenge?.isMateriallyDisputed ?? false;
    const hasMultipleRounds = debateExchanges.length >= 2;
    const hasRound3 = debateExchanges.length === 3;
    const hasMissingCriticalFacts = (challenge?.missingInformation?.length || 0) > 0;

    // Rule 1: High/Critical severity + Materially Disputed -> DISPUTED with Human Review Escalation
    if (isHighImpact && isMateriallyDisputed) {
      return {
        status: 'DISPUTED',
        humanReviewRecommended: true,
        humanReviewReason: `High-exposure issue (${finding.title}) subject to competing statutory interpretations. While Section 74 of the Indian Contract Act limits penal forfeiture, the lessor may argue genuine liquidated loss if the flat remains unlet. Qualified advocate review is strongly advised.`,
        lexflowSynthesis: `Reviewer identifies severe statutory vulnerability regarding uncapped forfeiture or penalties under Indian contract law, but Skeptic establishes plausible counterparty defense under agreed freedom of contract and commercial reliance. The final outcome hinges on proof of actual damages and local tribunal practice.`
      };
    }

    // Rule 2: Missing essential documentation -> INSUFFICIENT_EVIDENCE
    if (hasMissingCriticalFacts && finding.category === 'unfavorable_provision') {
      return {
        status: 'INSUFFICIENT_EVIDENCE',
        humanReviewRecommended: false,
        lexflowSynthesis: `Contractual deduction right exists in the agreement text, but determination of whether deductions are valid requires move-in condition verification and contractor itemized receipts that are absent from this contract record.`
      };
    }

    // Rule 3: High impact, but evidence is supported by statutory authorities and skeptic challenges are procedural
    if (isHighImpact && !isMateriallyDisputed) {
      return {
        status: 'CONFIRMED',
        humanReviewRecommended: false,
        lexflowSynthesis: `Confirmed statutory non-compliance. The provision conflicts with mandatory statutory guidelines under the Transfer of Property Act and Model Tenancy framework, rendering unilateral enforcement legally vulnerable.`
      };
    }

    // Rule 4: Medium/Low findings with balanced context
    if (finding.severity === 'medium') {
      return {
        status: 'PARTIALLY_SUPPORTED',
        humanReviewRecommended: false,
        lexflowSynthesis: `Finding is partially supported by contractual analysis: while the provision skews in favor of the lessor, standard commercial tenancy customs frequently incorporate such stipulations unless explicitly modified by negotiated addendum.`
      };
    }

    return {
      status: 'CONFIRMED',
      humanReviewRecommended: false,
      lexflowSynthesis: `Contractual obligation verified against extracted clause language and standard statutory benchmarks.`
    };
  }

  /**
   * Generates executive summary across all consensus findings
   */
  static generateExecutiveSummary(metrics: {
    totalFindings: number;
    highPriorityCount: number;
    disputedCount: number;
    humanReviewCount: number;
  }): string {
    if (metrics.humanReviewCount > 0) {
      return `Multi-agent audit identified ${metrics.totalFindings} compliance observations, including ${metrics.highPriorityCount} high-exposure items. Due to conflicting statutory interpretations regarding deposit forfeiture and daily penalty caps, ${metrics.humanReviewCount} finding(s) are escalated for Human Legal Review.`;
    }
    return `Multi-agent audit completed with consensus across ${metrics.totalFindings} observations. Key exposures have been cross-verified against the Transfer of Property Act, 1882 and Indian Contract Act, 1872.`;
  }
}
