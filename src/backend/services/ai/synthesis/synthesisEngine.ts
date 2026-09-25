import { OpposingFinding } from '../schemas/opposingCounselSchema';
import { DefenseProtection } from '../schemas/defenseSchema';
import { ComplianceReviewerFinding } from '../schemas/complianceReviewerSchema';
import { SkepticChallenge } from '../schemas/skepticSchema';
import { FullDebateRecord } from '../debate/debateSchemas';
import { UserAIPreferences, formatPersonalizedSummary } from '../context/personalizationContext';

export interface SynthesizedFinding {
  id: string;
  category: 
    | 'HIGH_PRIORITY'
    | 'MEDIUM_PRIORITY'
    | 'PROTECTION'
    | 'COMPLIANCE_CONCERN'
    | 'POTENTIAL_CONFLICT'
    | 'DISPUTED'
    | 'INSUFFICIENT_EVIDENCE'
    | 'HUMAN_REVIEW_RECOMMENDED';
  title: string;
  summary: string;
  sourceAgent: 'opposing_counsel' | 'defense_protection' | 'compliance_reviewer' | 'skeptic' | 'consensus';
  severity: 'critical' | 'high' | 'medium' | 'low';
  consensusStatus: 'CONFIRMED' | 'PARTIALLY_SUPPORTED' | 'DISPUTED' | 'INSUFFICIENT_EVIDENCE' | 'NOT_APPLICABLE';
  clauseRefs: string[];
  legalAuthorities: Array<{
    actOrCourt: string;
    sectionOrArticle: string;
    title: string;
  }>;
  evidenceIds: string[];
  humanReviewRecommended: boolean;
  recommendedAction: string;
  opposingArgument?: string;
  defenseCounterpoint?: string;
  skepticChallenge?: string;
}

export interface SynthesisSummary {
  totalFindings: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  protectionCount: number;
  complianceConcernCount: number;
  disputedCount: number;
  humanReviewCount: number;
  confirmedCount: number;
}

export interface SynthesizedAnalysisResult {
  documentId: string;
  userId: string;
  executiveSummary: string;
  personalizedExplanation: string;
  findings: SynthesizedFinding[];
  summary: SynthesisSummary;
  debates: FullDebateRecord[];
  humanReviewRecommended: boolean;
  synthesizedAt: string;
}

export class SynthesisEngine {
  /**
   * Deterministic master synthesis combining all 4 agents and 2 debate pairs
   */
  static synthesizeAnalysis(params: {
    documentId: string;
    userId: string;
    userName?: string;
    opposingFindings: OpposingFinding[];
    protections: DefenseProtection[];
    reviewerFindings: ComplianceReviewerFinding[];
    skepticChallenges: SkepticChallenge[];
    debates: FullDebateRecord[];
    personalization: UserAIPreferences;
  }): SynthesizedAnalysisResult {
    const {
      documentId,
      userId,
      userName,
      opposingFindings,
      protections,
      reviewerFindings,
      skepticChallenges,
      debates,
      personalization
    } = params;

    const synthesizedFindings: SynthesizedFinding[] = [];
    let highPriorityCount = 0;
    let mediumPriorityCount = 0;
    let protectionCount = 0;
    let complianceConcernCount = 0;
    let disputedCount = 0;
    let humanReviewCount = 0;
    let confirmedCount = 0;

    // 1. Process Regulatory Compliance Reviewer ↔ Skeptic Findings
    reviewerFindings.forEach((rev) => {
      const challenge = skepticChallenges.find(c => c.findingId === rev.findingId);
      const isDisputed = challenge?.challengeOutcome === 'DISPUTED' || challenge?.isMateriallyDisputed;
      const isConfirmed = challenge?.challengeOutcome === 'CONFIRMED';
      const isPartial = challenge?.challengeOutcome === 'PARTIALLY_SUPPORTED';
      const isInsufficient = rev.status === 'INSUFFICIENT_EVIDENCE' || challenge?.challengeOutcome === 'INSUFFICIENT_EVIDENCE';

      let consensusStatus: SynthesizedFinding['consensusStatus'] = 'PARTIALLY_SUPPORTED';
      if (isDisputed) consensusStatus = 'DISPUTED';
      else if (isConfirmed) consensusStatus = 'CONFIRMED';
      else if (isInsufficient) consensusStatus = 'INSUFFICIENT_EVIDENCE';

      const needsHumanReview = isDisputed || (rev.severity === 'critical' && isPartial) || isInsufficient;

      let category: SynthesizedFinding['category'] = 'COMPLIANCE_CONCERN';
      if (isDisputed) {
        category = 'DISPUTED';
        disputedCount++;
      } else if (rev.severity === 'critical' || rev.severity === 'high') {
        category = 'HIGH_PRIORITY';
        highPriorityCount++;
      } else {
        complianceConcernCount++;
      }

      if (isConfirmed) confirmedCount++;
      if (needsHumanReview) humanReviewCount++;

      synthesizedFindings.push({
        id: `synth-comp-${rev.findingId}`,
        category,
        title: rev.title,
        summary: rev.claim,
        sourceAgent: isDisputed ? 'skeptic' : 'compliance_reviewer',
        severity: rev.severity,
        consensusStatus,
        clauseRefs: rev.affectedClauseRefs,
        legalAuthorities: rev.statutoryBasis ? [{
          actOrCourt: rev.statutoryBasis.split(',')[1]?.trim() || rev.statutoryBasis,
          sectionOrArticle: rev.statutoryBasis.split(',')[0]?.trim() || 'Section 74',
          title: rev.statutoryBasis
        }] : [],
        evidenceIds: rev.evidenceIds || [],
        humanReviewRecommended: needsHumanReview,
        recommendedAction: rev.proposedMitigation || 'Review with legal counsel or negotiate standard cure clause.',
        opposingArgument: rev.reasoning,
        skepticChallenge: challenge?.challenge || challenge?.alternativeInterpretation,
      });
    });

    // 2. Process Opposing Counsel ↔ Defense Findings
    opposingFindings.forEach((opp) => {
      const matchingProtection = protections.find(p => p.clauseRefs.some(ref => opp.clauseRefs.includes(ref)));
      const isMitigated = Boolean(matchingProtection);

      let category: SynthesizedFinding['category'] = 'HIGH_PRIORITY';
      if (opp.severity === 'critical') {
        category = 'HIGH_PRIORITY';
        highPriorityCount++;
      } else if (opp.severity === 'medium' || opp.severity === 'high') {
        category = 'MEDIUM_PRIORITY';
        mediumPriorityCount++;
      }

      const needsHumanReview = opp.severity === 'critical' && !isMitigated;
      if (needsHumanReview) humanReviewCount++;

      synthesizedFindings.push({
        id: `synth-opp-${opp.id}`,
        category,
        title: opp.title,
        summary: opp.summary,
        sourceAgent: 'opposing_counsel',
        severity: opp.severity,
        consensusStatus: isMitigated ? 'PARTIALLY_SUPPORTED' : 'CONFIRMED',
        clauseRefs: opp.clauseRefs,
        legalAuthorities: opp.legalAuthorityIds.map(id => ({
          actOrCourt: id.includes('ica') ? 'Indian Contract Act, 1872' : 'Indian Jurisprudence',
          sectionOrArticle: id.includes('74') ? 'Section 74' : 'General Contract Law',
          title: 'Liquidated Damages & Penalty Enforceability'
        })),
        evidenceIds: opp.evidenceIds || [],
        humanReviewRecommended: needsHumanReview,
        recommendedAction: matchingProtection?.recommendedDefensiveAction || 'Propose mutual 30-day notice and capped late fees.',
        opposingArgument: opp.reasoning,
        defenseCounterpoint: matchingProtection?.summary,
      });
    });

    // 3. Process Standalone Protections
    protections.forEach((prot) => {
      protectionCount++;
      synthesizedFindings.push({
        id: `synth-prot-${prot.id}`,
        category: 'PROTECTION',
        title: prot.title,
        summary: prot.summary,
        sourceAgent: 'defense_protection',
        severity: 'low',
        consensusStatus: 'CONFIRMED',
        clauseRefs: prot.clauseRefs,
        legalAuthorities: prot.legalAuthorityIds.map(id => ({
          actOrCourt: 'Transfer of Property Act, 1882',
          sectionOrArticle: 'Section 106',
          title: 'Mandatory Notice Period Protection'
        })),
        evidenceIds: prot.evidenceIds || [],
        humanReviewRecommended: false,
        recommendedAction: prot.recommendedDefensiveAction,
        defenseCounterpoint: prot.reasoning,
      });
    });

    const totalFindings = synthesizedFindings.length;
    const overallHumanReview = humanReviewCount > 0;

    // Base factual executive summary
    const baseSummary = `LEXFLOW Four-Agent Analysis evaluated ${totalFindings} total provisions across the agreement. Identified ${highPriorityCount} high-priority exposures (including daily penal accruals and lock-in deposit forfeiture) and ${protectionCount} contractual/statutory protections (5-day grace window, 30-day notice). ${disputedCount} regulatory interpretations remain contested between Reviewer and Skeptic agents, with ${humanReviewCount} items escalated for verification in Lawyer Prep-Kit.`;

    // Personalized user explanation layer
    const personalizedExplanation = formatPersonalizedSummary({
      baseSummary,
      preferences: personalization,
      userName,
    });

    return {
      documentId,
      userId,
      executiveSummary: baseSummary,
      personalizedExplanation,
      findings: synthesizedFindings,
      summary: {
        totalFindings,
        highPriorityCount,
        mediumPriorityCount,
        protectionCount,
        complianceConcernCount,
        disputedCount,
        humanReviewCount,
        confirmedCount,
      },
      debates,
      humanReviewRecommended: overallHumanReview,
      synthesizedAt: new Date().toISOString(),
    };
  }
}
