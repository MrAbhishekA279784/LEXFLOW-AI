import { v4 as uuidv4 } from 'uuid';
import { 
  DebateMessage, 
  DebateRound, 
  FullDebateRecord, 
  DebatePairType 
} from './debateSchemas';
import { OpposingFinding } from '../schemas/opposingCounselSchema';
import { DefenseProtection, Counterpoint } from '../schemas/defenseSchema';
import { ComplianceReviewerFinding } from '../schemas/complianceReviewerSchema';
import { SkepticChallenge } from '../schemas/skepticSchema';
import { logger } from '../../../utils/logger';

export class MultiAgentDebateEngine {
  /**
   * PAIR 1: Opposing Counsel ↔ Defense / Protection Debate
   * Maximum 3 rounds with deterministic early stopping
   */
  static runContractRiskDebate(params: {
    documentId: string;
    userId: string;
    opposingFindings: OpposingFinding[];
    protections: DefenseProtection[];
    counterpoints: Counterpoint[];
  }): FullDebateRecord {
    const { documentId, userId, opposingFindings, protections, counterpoints } = params;
    const debateId = `deb-risk-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const rounds: DebateRound[] = [];
    const disputedIds: string[] = [];
    const resolvedIds: string[] = [];

    // Round 1: Opposing Counsel identifies risks
    const round1Messages: DebateMessage[] = opposingFindings.slice(0, 4).map((opp, idx) => ({
      id: `msg-opp-${idx + 1}`,
      debateId,
      pairType: 'contract_risk_debate',
      agent: 'opposing_counsel',
      round: 1,
      findingIdRef: opp.id,
      title: opp.title,
      content: opp.summary + ' ' + opp.reasoning,
      clauseRefs: opp.clauseRefs,
      evidenceIds: opp.evidenceIds,
      statutoryCitations: opp.legalAuthorityIds,
      status: 'proposed',
      timestamp: now,
    }));

    rounds.push({
      roundNumber: 1,
      messages: round1Messages,
      earlyStopped: false,
    });

    // Round 2: Defense reviews findings & offers counterpoints/protections
    const round2Messages: DebateMessage[] = [];
    
    opposingFindings.slice(0, 4).forEach((opp, idx) => {
      const counter = counterpoints.find(c => c.opposingFindingId === opp.id);
      const prot = protections.find(p => p.clauseRefs.some(ref => opp.clauseRefs.includes(ref)));

      if (counter) {
        round2Messages.push({
          id: `msg-def-${idx + 1}`,
          debateId,
          pairType: 'contract_risk_debate',
          agent: 'defense_protection',
          round: 2,
          findingIdRef: opp.id,
          title: `Defensive Shield: Mitigating ${opp.title}`,
          content: counter.counterArgument + (prot ? ` (Supported by Clause ${prot.clauseRefs.join(', ')})` : ''),
          clauseRefs: counter.supportingClauseRefs,
          evidenceIds: opp.evidenceIds,
          statutoryCitations: counter.supportingAuthorityIds,
          status: 'countered',
          timestamp: now,
        });
      } else if (prot) {
        round2Messages.push({
          id: `msg-def-prot-${idx + 1}`,
          debateId,
          pairType: 'contract_risk_debate',
          agent: 'defense_protection',
          round: 2,
          findingIdRef: opp.id,
          title: `Contractual Protection: ${prot.title}`,
          content: prot.summary,
          clauseRefs: prot.clauseRefs,
          evidenceIds: prot.evidenceIds,
          statutoryCitations: prot.legalAuthorityIds,
          status: 'countered',
          timestamp: now,
        });
      }
    });

    rounds.push({
      roundNumber: 2,
      messages: round2Messages,
      earlyStopped: false,
    });

    // Round 3: Opposing Counsel may respond ONLY if material disagreement remains
    const round3Messages: DebateMessage[] = [];
    let earlyStopped = true;
    let stopReason = 'No material unmitigated risk remaining; consensus reached on statutory baseline.';

    opposingFindings.slice(0, 4).forEach((opp, idx) => {
      const counter = counterpoints.find(c => c.opposingFindingId === opp.id);
      if (opp.severity === 'critical' && (!counter || !counter.materiallyMitigates)) {
        // Unresolved critical exposure
        disputedIds.push(opp.id);
        earlyStopped = false;
        round3Messages.push({
          id: `msg-opp-resp-${idx + 1}`,
          debateId,
          pairType: 'contract_risk_debate',
          agent: 'opposing_counsel',
          round: 3,
          findingIdRef: opp.id,
          title: `Surviving Exposure: ${opp.title}`,
          content: `Despite defense arguments, lessor can still enforce immediate contract termination or hold back deposit pending judicial adjudication.`,
          clauseRefs: opp.clauseRefs,
          evidenceIds: opp.evidenceIds,
          statutoryCitations: opp.legalAuthorityIds,
          status: 'disputed',
          timestamp: now,
        });
      } else {
        resolvedIds.push(opp.id);
      }
    });

    if (round3Messages.length > 0) {
      rounds.push({
        roundNumber: 3,
        messages: round3Messages,
        earlyStopped: false,
      });
    } else {
      rounds[1].earlyStopped = true;
      rounds[1].stopReason = stopReason;
    }

    return {
      id: debateId,
      documentId,
      userId,
      pairType: 'contract_risk_debate',
      status: 'completed',
      rounds,
      totalRounds: rounds.length,
      summary: `Contract Risk debate concluded across ${rounds.length} rounds. ${resolvedIds.length} provisions mitigated by contractual/statutory defenses; ${disputedIds.length} flagged for attention.`,
      disputedFindingIds: disputedIds,
      resolvedFindingIds: resolvedIds,
      createdAt: now,
      completedAt: new Date().toISOString(),
    };
  }

  /**
   * PAIR 2: Compliance Reviewer ↔ Skeptic Debate
   * Problem Statement #5 primary compliance debate with controlled early stopping
   */
  static runComplianceAuditDebate(params: {
    documentId: string;
    userId: string;
    reviewerFindings: ComplianceReviewerFinding[];
    skepticChallenges: SkepticChallenge[];
  }): FullDebateRecord {
    const { documentId, userId, reviewerFindings, skepticChallenges } = params;
    const debateId = `deb-comp-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const rounds: DebateRound[] = [];
    const disputedIds: string[] = [];
    const resolvedIds: string[] = [];

    // Round 1: Compliance Reviewer produces findings
    const round1Messages: DebateMessage[] = reviewerFindings.map((f, idx) => ({
      id: `msg-rev-${idx + 1}`,
      debateId,
      pairType: 'compliance_audit_debate',
      agent: 'compliance_reviewer',
      round: 1,
      findingIdRef: f.findingId,
      title: f.title,
      content: `${f.claim} ${f.reasoning}`,
      clauseRefs: f.affectedClauseRefs,
      evidenceIds: f.evidenceIds,
      statutoryCitations: f.statutoryBasis ? [f.statutoryBasis] : [],
      status: 'proposed',
      timestamp: now,
    }));

    rounds.push({
      roundNumber: 1,
      messages: round1Messages,
      earlyStopped: false,
    });

    // Round 2: Skeptic challenges material findings
    const round2Messages: DebateMessage[] = skepticChallenges.map((c, idx) => {
      const f = reviewerFindings.find(r => r.findingId === c.findingId);
      return {
        id: `msg-skep-${idx + 1}`,
        debateId,
        pairType: 'compliance_audit_debate',
        agent: 'skeptic',
        round: 2,
        findingIdRef: c.findingId,
        title: `Independent Counter-Examination: ${f?.title || c.findingId}`,
        content: `[${c.challengeOutcome}] ${c.challenge}\nAlternative Position: ${c.alternativeInterpretation}`,
        clauseRefs: c.counterClauseRefs,
        evidenceIds: f?.evidenceIds || [],
        statutoryCitations: c.counterAuthorityIds,
        status: c.challengeOutcome === 'DISPUTED' ? 'disputed' : 'countered',
        timestamp: now,
      };
    });

    rounds.push({
      roundNumber: 2,
      messages: round2Messages,
      earlyStopped: false,
    });

    // Round 3: Reviewer responds ONLY to Skeptic challenges where outcome is DISPUTED
    const round3Messages: DebateMessage[] = [];
    skepticChallenges.forEach((c, idx) => {
      const f = reviewerFindings.find(r => r.findingId === c.findingId);
      if (!f) return;

      if (c.challengeOutcome === 'DISPUTED' || c.isMateriallyDisputed) {
        disputedIds.push(f.findingId);
        round3Messages.push({
          id: `msg-rev-resp-${idx + 1}`,
          debateId,
          pairType: 'compliance_audit_debate',
          agent: 'compliance_reviewer',
          round: 3,
          findingIdRef: f.findingId,
          title: `Reviewer Defense: Reaffirming Statutory Mandate on ${f.findingId}`,
          content: `While commercial leeway is recognized, landmark Supreme Court precedent (Fateh Chand / Maula Bux) strictly holds that forfeiture without proving actual damage constitutes an invalid penalty in law.`,
          clauseRefs: f.affectedClauseRefs,
          evidenceIds: f.evidenceIds,
          statutoryCitations: f.statutoryBasis ? [f.statutoryBasis] : [],
          status: 'disputed',
          timestamp: now,
        });
      } else if (c.challengeOutcome === 'CONFIRMED') {
        resolvedIds.push(f.findingId);
      }
    });

    if (round3Messages.length > 0) {
      rounds.push({
        roundNumber: 3,
        messages: round3Messages,
        earlyStopped: false,
      });

      // Round 4: Skeptic final verification
      const round4Messages: DebateMessage[] = disputedIds.map((fId, idx) => ({
        id: `msg-skep-final-${idx + 1}`,
        debateId,
        pairType: 'compliance_audit_debate',
        agent: 'skeptic',
        round: 4,
        findingIdRef: fId,
        title: `Skeptic Final Determination on ${fId}`,
        content: `Contested interpretation preserved. Recommendation: Escalated for Human Legal Review with lawyer negotiation points.`,
        clauseRefs: [],
        evidenceIds: [],
        statutoryCitations: [],
        status: 'verified',
        timestamp: now,
      }));

      rounds.push({
        roundNumber: 4,
        messages: round4Messages,
        earlyStopped: false,
      });
    } else {
      rounds[1].earlyStopped = true;
      rounds[1].stopReason = 'All findings verified or confirmed without material disagreement.';
    }

    return {
      id: debateId,
      documentId,
      userId,
      pairType: 'compliance_audit_debate',
      status: 'completed',
      rounds,
      totalRounds: rounds.length,
      summary: `Regulatory Compliance debate concluded across ${rounds.length} rounds. ${resolvedIds.length} findings confirmed; ${disputedIds.length} findings disputed and escalated for legal counsel.`,
      disputedFindingIds: disputedIds,
      resolvedFindingIds: resolvedIds,
      createdAt: now,
      completedAt: new Date().toISOString(),
    };
  }
}
