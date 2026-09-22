import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  Bot, 
  Swords, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  ExternalLink,
  Scale,
  Briefcase,
  Layers,
  FileText
} from 'lucide-react';
import { ComplianceFinding } from '../../types/complianceAuditTypes';
import { useApp } from '../../context/AppContext';

interface ComplianceAuditFindingCardProps {
  finding: ComplianceFinding;
}

export const ComplianceAuditFindingCard: React.FC<ComplianceAuditFindingCardProps> = ({ finding }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'debate' | 'agents' | 'evidence'>('debate');
  const { navigateTo, setScenarioInputText, setActiveDocTab } = useApp();

  // Safe normalized field access
  const findingId = finding.findingId || finding.id || 'AUDIT-FINDING';
  const sectionRef = finding.affectedClauseRefs?.[0] || finding.clauseReference?.section || 'Clause';
  const clauseTitle = finding.clauseReference?.title || finding.title;
  const clauseExcerpt = finding.evidence?.find(e => e.type === 'document')?.exactExcerpt || finding.clauseReference?.excerpt || finding.claim;
  const clausePage = finding.evidence?.find(e => e.type === 'document')?.page || finding.clauseReference?.pageNumber;
  const synthesisText = finding.lexflowSynthesis || finding.synthesis || finding.reasoning;
  const reviewerConfidence = Math.round((finding.reviewerPosition?.confidence ?? finding.confidenceScore ?? 0.88) * 100);
  const reviewerClaimText = finding.claim || finding.reviewerClaim || finding.reviewerPosition?.argument || '';
  const reviewerReasoningText = finding.reasoning || finding.reviewerReasoning || finding.reviewerPosition?.argument || '';
  const proposedMitigationText = finding.proposedMitigation || finding.reviewerPosition?.proposedMitigation || 'Review and structure fair statutory thresholds with cure provisions.';
  const skepticChallengeText = typeof finding.skepticChallenge === 'string'
    ? finding.skepticChallenge
    : finding.skepticChallenge?.challenge || '';
  const skepticAltInterpretation = typeof finding.skepticChallenge === 'object'
    ? finding.skepticChallenge?.alternativeInterpretation
    : finding.skepticAlternativeInterpretation || '';
  const skepticMissingFacts = typeof finding.skepticChallenge === 'object'
    ? (finding.skepticChallenge?.missingInformation || [])
    : (finding.skepticMissingInformation || []);
  const debateRounds = finding.debateRounds || [];
  const authorities = finding.legalAuthorities || finding.statutoryAuthorities || [];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-700 border border-red-200">Critical Risk</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-100 text-orange-700 border border-orange-200">High Risk</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700 border border-amber-200">Medium Risk</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-stone-100 text-stone-700 border border-stone-200">Low Risk</span>;
    }
  };

  const getConsensusBadge = (status: string) => {
    switch (status) {
      case 'DISPUTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" /> Disputed by Skeptic
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Confirmed Consensus
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Factual Gaps
          </span>
        );
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Partially Supported
          </span>
        );
      case 'NEUTRALIZED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Risk Neutralized
          </span>
        );
      default:
        return null;
    }
  };

  const handleTestInWhatIf = () => {
    const prompt = `What happens under ${sectionRef} (${finding.title}) if enforcement is contested under Indian Contract Act Section 74?`;
    setScenarioInputText(prompt);
    navigateTo('scenario-input');
  };

  const handleViewInGraph = () => {
    setActiveDocTab('Clauses');
    navigateTo('legal-graph');
  };

  const handleEscalateToLawyerKit = () => {
    navigateTo('lawyer-kit');
  };

  return (
    <div className="glass-card rounded-3xl border border-white/80 shadow-md shadow-[#46321e]/5 text-left overflow-hidden transition-all duration-200">
      {/* Card Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/40 transition-colors border-b border-stone-200/50"
      >
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-stone-500 font-mono">
              {findingId}
            </span>
            {getSeverityBadge(finding.severity)}
            {getConsensusBadge(finding.consensusStatus)}
            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider bg-stone-100/90 px-2 py-0.5 rounded-md">
              {sectionRef}
            </span>
          </div>

          <h3 className="text-base font-extrabold text-[#151515] leading-snug">
            {finding.title}
          </h3>
          <p className="text-xs text-[#6F6A64] line-clamp-2">
            {synthesisText}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-bold text-stone-700 block">
              Confidence {reviewerConfidence}%
            </span>
            <span className="text-[10px] text-stone-400">
              {debateRounds.length} debate round{debateRounds.length > 1 ? 's' : ''}
            </span>
          </div>
          <button 
            type="button"
            className="w-8 h-8 rounded-full bg-white/90 border border-stone-200/80 flex items-center justify-center text-stone-500 hover:text-[#FF6B22] shadow-2xs"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 sm:p-5 space-y-4 bg-white/30"
          >
            {/* Human Legal Review Escalation Banner */}
            {finding.humanReviewRecommended && (
              <div className="p-3.5 rounded-2xl bg-purple-50/90 border border-purple-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-900">
                      Escalated for Human Legal Review
                    </h4>
                    <p className="text-[11px] text-purple-700 mt-0.5">
                      {finding.humanReviewReason || 'High-impact contractual exposure with unresolved multi-agent disagreement.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleEscalateToLawyerKit}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Escalate to Lawyer Kit</span>
                </button>
              </div>
            )}

            {/* Inner Tabs: Debate Log, Agents View, Evidence Grounding */}
            <div className="flex items-center gap-2 border-b border-stone-200/70 pb-2">
              <button
                onClick={() => setActiveTab('debate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'debate'
                    ? 'bg-[#FF6B22] text-white shadow-xs'
                    : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/60'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Multi-Agent Debate ({debateRounds.length} Rounds)</span>
              </button>

              <button
                onClick={() => setActiveTab('agents')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'agents'
                    ? 'bg-[#FF6B22] text-white shadow-xs'
                    : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/60'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Reviewer vs. Skeptic Breakdown</span>
              </button>

              <button
                onClick={() => setActiveTab('evidence')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'evidence'
                    ? 'bg-[#FF6B22] text-white shadow-xs'
                    : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/60'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Traceable Evidence ({authorities.length + 1})</span>
              </button>
            </div>

            {/* TAB 1: Multi-Agent Debate Transcript */}
            {activeTab === 'debate' && (
              <div className="space-y-3">
                {debateRounds.map((round) => (
                  <div 
                    key={round.round}
                    className="p-3.5 rounded-2xl bg-white/70 border border-stone-200/70 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                      <span className="font-extrabold uppercase tracking-wider text-stone-600 text-[10px]">
                        Debate Exchange — Round 0{round.round}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Structured Adversarial Protocol
                      </span>
                    </div>

                    {/* Reviewer Argument */}
                    <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100/90 text-left">
                      <div className="flex items-center gap-1.5 mb-1 text-purple-900 font-bold text-[11px]">
                        <Bot className="w-3.5 h-3.5 text-purple-600" />
                        <span>Reviewer Agent (Auditor Claim):</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed pl-5">
                        {round.reviewerArgument}
                      </p>
                    </div>

                    {/* Skeptic Counter-Argument */}
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100/90 text-left">
                      <div className="flex items-center gap-1.5 mb-1 text-amber-900 font-bold text-[11px]">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Skeptic Agent (Adversarial Challenge):</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed pl-5">
                        {round.skepticCounterArgument}
                      </p>
                    </div>

                    {/* Unresolved Question / Factual Gap if any */}
                    {round.unresolvedQuestion && (
                      <div className="px-3 py-2 rounded-lg bg-stone-100/80 text-[11px] text-stone-600 flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-stone-800">Missing Evidence to Resolve: </span>
                          <span>{round.unresolvedQuestion}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB 2: Reviewer vs Skeptic Breakdown */}
            {activeTab === 'agents' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Reviewer Agent Box */}
                <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/70 space-y-2.5">
                  <div className="flex items-center gap-2 text-purple-900 font-bold text-xs pb-1 border-b border-purple-100">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span>Reviewer Agent Finding</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
                      Core Claim:
                    </span>
                    <p className="text-stone-800 mt-0.5 font-medium leading-relaxed">
                      {reviewerClaimText}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
                      Legal Reasoning:
                    </span>
                    <p className="text-stone-700 mt-0.5 leading-relaxed">
                      {reviewerReasoningText}
                    </p>
                  </div>
                  <div className="pt-1.5 border-t border-purple-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
                      Proposed Contractual Mitigation:
                    </span>
                    <p className="text-stone-800 mt-0.5 font-medium leading-relaxed bg-white/70 p-2 rounded-lg border border-purple-100">
                      {proposedMitigationText}
                    </p>
                  </div>
                </div>

                {/* Skeptic Agent Box */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-2.5">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-xs pb-1 border-b border-amber-100">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Skeptic Agent Challenge</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                      Adversarial Challenge:
                    </span>
                    <p className="text-stone-800 mt-0.5 font-medium leading-relaxed">
                      {skepticChallengeText}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                      Commercial Alternative Interpretation:
                    </span>
                    <p className="text-stone-700 mt-0.5 leading-relaxed">
                      {skepticAltInterpretation}
                    </p>
                  </div>
                  {skepticMissingFacts.length > 0 && (
                    <div className="pt-1.5 border-t border-amber-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                        Critical Missing Evidentiary Facts:
                      </span>
                      <ul className="list-disc pl-4 space-y-0.5 text-stone-700">
                        {skepticMissingFacts.map((info, idx) => (
                          <li key={idx}>{info}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Evidence Grounding (Clauses + Indian Precedents) */}
            {activeTab === 'evidence' && (
              <div className="space-y-3 text-xs">
                {/* Contract Clause Excerpt */}
                <div className="p-3.5 rounded-2xl bg-white/80 border border-stone-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#FF6B22]" />
                      <span className="font-bold text-stone-800">
                        Contract Clause: {sectionRef} ({clauseTitle})
                      </span>
                    </div>
                    {clausePage && (
                      <span className="text-[10px] text-stone-400 font-mono">
                        Page {clausePage}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 font-mono text-[11px] text-stone-700 leading-relaxed">
                    "{clauseExcerpt}"
                  </div>
                </div>

                {/* Indian Statutory Authorities & Precedents */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-stone-700 font-bold text-xs">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>Statutory Authorities & Binding Precedents</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {authorities.map((auth, idx) => {
                      const actName = auth.actOrCourt || (auth as any).actOrStatute || auth.title || 'Applicable Law';
                      const secOrArt = auth.sectionOrArticle || '';
                      const precedent = (auth as any).precedentCitation || auth.title;
                      const courtName = (auth as any).court || auth.actOrCourt || 'Supreme Court of India';

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200/70 space-y-1.5 flex flex-col justify-between text-left"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-950">
                                {actName}
                              </span>
                              {secOrArt && (
                                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                                  {secOrArt}
                                </span>
                              )}
                            </div>
                            {precedent && (
                              <div className="text-[11px] font-serif italic text-emerald-900 mt-0.5">
                                {precedent} ({courtName})
                              </div>
                            )}
                            <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                              {auth.summary}
                            </p>
                          </div>

                          {auth.officialSourceUrl && (
                            <a
                              href={auth.officialSourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 mt-2 hover:underline"
                            >
                              <span>Verify in Legal Knowledge Engine</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Action Bar: Cross-linking to LEXFLOW capabilities */}
            <div className="pt-3 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight">
                LEXFLOW Action Integrations:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleTestInWhatIf}
                  className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-stone-200/70 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs hover:border-[#FF6B22]/50 hover:text-[#FF6B22] cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5 text-[#FF6B22]" />
                  <span>Stress-Test in What-If</span>
                </button>

                <button
                  onClick={handleViewInGraph}
                  className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-stone-200/70 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs hover:border-blue-400 hover:text-blue-600 cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>View in Action Graph</span>
                </button>

                <button
                  onClick={handleEscalateToLawyerKit}
                  className="px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-stone-200/70 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs hover:border-purple-400 hover:text-purple-600 cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                  <span>Include in Lawyer Prep-Kit</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
