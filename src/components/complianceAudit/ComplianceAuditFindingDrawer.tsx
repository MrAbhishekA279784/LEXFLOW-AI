import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  Bot, 
  Swords, 
  BookOpen, 
  ExternalLink,
  Scale, 
  Briefcase, 
  Layers, 
  FileText,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { ComplianceFinding } from '../../types/complianceAuditTypes';
import { useApp } from '../../context/AppContext';

interface ComplianceAuditFindingDrawerProps {
  finding: ComplianceFinding | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ComplianceAuditFindingDrawer: React.FC<ComplianceAuditFindingDrawerProps> = ({
  finding,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'debate' | 'evidence'>('overview');
  const { navigateTo, setScenarioInputText, setActiveDocTab } = useApp();

  if (!finding) return null;

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
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-red-100 text-red-700 border border-red-200">Critical Risk</span>;
      case 'high':
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-orange-100 text-orange-700 border border-orange-200">High Risk</span>;
      case 'medium':
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-amber-100 text-amber-700 border border-amber-200">Medium Risk</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-extrabold uppercase bg-stone-100 text-stone-700 border border-stone-200">Low Risk</span>;
    }
  };

  const getConsensusBadge = (status: string) => {
    switch (status) {
      case 'DISPUTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" /> Disputed by Skeptic
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed Consensus
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Factual Gaps
          </span>
        );
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Partially Supported
          </span>
        );
      case 'NEUTRALIZED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Risk Neutralized
          </span>
        );
      default:
        return null;
    }
  };

  const handleTestInWhatIf = () => {
    const prompt = `What happens under ${sectionRef} (${finding.title}) if enforcement is contested under Indian Contract Act Section 74?`;
    setScenarioInputText(prompt);
    onClose();
    navigateTo('scenario-input');
  };

  const handleViewInGraph = () => {
    setActiveDocTab('Clauses');
    onClose();
    navigateTo('legal-graph');
  };

  const handleEscalateToLawyerKit = () => {
    onClose();
    navigateTo('lawyer-kit');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="relative w-full max-w-xl sm:max-w-2xl bg-[#FCFAF6] border-l border-white/80 shadow-2xl z-10 flex flex-col h-full overflow-hidden text-left"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200/70 bg-white/70 backdrop-blur-sm flex items-start justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-stone-500">
                    {findingId}
                  </span>
                  {getSeverityBadge(finding.severity)}
                  {getConsensusBadge(finding.consensusStatus)}
                </div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#151515] leading-snug">
                  {finding.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                  <span>{sectionRef}</span>
                  {clausePage && <span>• Page {clausePage}</span>}
                  <span>• Confidence {reviewerConfidence}%</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 pt-3 pb-2 border-b border-stone-200/60 flex items-center gap-2 bg-white/40">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-[#FF6B22] text-white shadow-xs'
                    : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Overview & Synthesis</span>
              </button>

              <button
                onClick={() => setActiveTab('debate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'debate'
                    ? 'bg-[#FF6B22] text-white shadow-xs'
                    : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/60'
                }`}
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Agent Debate ({debateRounds.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('evidence')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'evidence'
                    ? 'bg-[#FF6B22] text-white shadow-xs'
                    : 'bg-white/80 text-stone-600 hover:bg-white border border-stone-200/60'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Evidence & Law ({authorities.length})</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Human Legal Review Banner */}
              {finding.humanReviewRecommended && (
                <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/80 flex items-start gap-3 shadow-2xs">
                  <div className="p-1.5 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-purple-950">
                      Escalated for Human Lawyer Review
                    </h4>
                    <p className="text-[11px] text-purple-800 mt-0.5 leading-relaxed">
                      {finding.humanReviewReason || 'High contractual exposure with significant disagreement between Reviewer and Skeptic agent positions.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Consensus Synthesis Card */}
                  <div className="glass-card p-4 rounded-2xl border border-white/80 space-y-2">
                    <div className="flex items-center gap-2 text-stone-800 font-bold text-xs pb-1 border-b border-stone-200/50">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF6B22]" />
                      <span>Consensus Synthesis & Key Takeaway</span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed font-medium">
                      {synthesisText}
                    </p>
                  </div>

                  {/* Side-by-Side Agent Positions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Reviewer Position */}
                    <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/70 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-purple-900 font-bold pb-1 border-b border-purple-100">
                        <Bot className="w-3.5 h-3.5 text-purple-600" />
                        <span>Reviewer Agent Position</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-purple-800 block">Claim:</span>
                        <p className="text-stone-800 mt-0.5 font-medium leading-relaxed">
                          {reviewerClaimText}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-purple-800 block">Reasoning:</span>
                        <p className="text-stone-700 mt-0.5 leading-relaxed">
                          {reviewerReasoningText}
                        </p>
                      </div>
                    </div>

                    {/* Skeptic Position */}
                    <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold pb-1 border-b border-amber-100">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Skeptic Agent Challenge</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-amber-800 block">Challenge:</span>
                        <p className="text-stone-800 mt-0.5 font-medium leading-relaxed">
                          {skepticChallengeText}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase text-amber-800 block">Interpretation:</span>
                        <p className="text-stone-700 mt-0.5 leading-relaxed">
                          {skepticAltInterpretation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Proposed Contractual Mitigation */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 space-y-1.5 text-xs">
                    <span className="text-[10px] font-bold uppercase text-emerald-900 block flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Recommended Negotiation Redline:
                    </span>
                    <p className="text-stone-800 leading-relaxed font-medium bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                      {proposedMitigationText}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 2: DEBATE TRANSCRIPT */}
              {activeTab === 'debate' && (
                <div className="space-y-3">
                  {debateRounds.map((round) => (
                    <div 
                      key={round.round}
                      className="p-3.5 rounded-2xl bg-white border border-stone-200/80 space-y-2.5 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
                        <span className="font-extrabold uppercase tracking-wider text-stone-700 text-[10px]">
                          Debate Round 0{round.round}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          Bounded Protocol
                        </span>
                      </div>

                      {/* Reviewer Argument */}
                      <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-100 text-left">
                        <div className="flex items-center gap-1.5 mb-1 text-purple-900 font-bold text-[11px]">
                          <Bot className="w-3.5 h-3.5 text-purple-600" />
                          <span>Reviewer Agent:</span>
                        </div>
                        <p className="text-stone-800 leading-relaxed pl-5">
                          {round.reviewerArgument}
                        </p>
                      </div>

                      {/* Skeptic Counter-Argument */}
                      <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-100 text-left">
                        <div className="flex items-center gap-1.5 mb-1 text-amber-900 font-bold text-[11px]">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Skeptic Agent:</span>
                        </div>
                        <p className="text-stone-800 leading-relaxed pl-5">
                          {round.skepticCounterArgument}
                        </p>
                      </div>

                      {/* Unresolved Question */}
                      {round.unresolvedQuestion && (
                        <div className="px-3 py-1.5 rounded-lg bg-stone-100 text-[11px] text-stone-600 flex items-start gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                          <span><strong>Evidentiary Gap:</strong> {round.unresolvedQuestion}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: EVIDENCE & LAW */}
              {activeTab === 'evidence' && (
                <div className="space-y-4">
                  {/* Contract Excerpt */}
                  <div className="p-3.5 rounded-2xl bg-white border border-stone-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                        <FileText className="w-4 h-4 text-[#FF6B22]" />
                        <span>Contract Clause: {sectionRef}</span>
                      </div>
                      {clausePage && (
                        <span className="text-[10px] text-stone-400 font-mono">
                          Page {clausePage}
                        </span>
                      )}
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 font-mono text-[11px] text-stone-800 leading-relaxed">
                      "{clauseExcerpt}"
                    </div>
                  </div>

                  {/* Statutory Authorities & Precedents */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-stone-700 font-bold text-xs">
                      <Scale className="w-4 h-4 text-emerald-600" />
                      <span>Statutory Authorities & Landmark Decisions</span>
                    </div>

                    <div className="space-y-2">
                      {authorities.map((auth, idx) => {
                        const actName = auth.actOrCourt || auth.title || 'Applicable Law';
                        const secOrArt = auth.sectionOrArticle || '';
                        const precedent = auth.precedentCitation || auth.title;
                        const courtName = auth.court || auth.actOrCourt || 'Supreme Court of India';

                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5 text-left"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-emerald-950">
                                {actName}
                              </span>
                              {secOrArt && (
                                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  {secOrArt}
                                </span>
                              )}
                            </div>
                            {precedent && (
                              <div className="text-[11px] font-serif italic text-emerald-900">
                                {precedent} ({courtName})
                              </div>
                            )}
                            <p className="text-[11px] text-stone-700 leading-relaxed">
                              {auth.summary}
                            </p>
                            {auth.officialSourceUrl && (
                              <a
                                href={auth.officialSourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 mt-1 hover:underline"
                              >
                                <span>Verify in Official Knowledge Engine</span>
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
            </div>

            {/* Bottom Action Footer */}
            <div className="p-4 sm:p-5 border-t border-stone-200/70 bg-white/90 flex flex-wrap items-center justify-between gap-2.5">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Integrations:
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleTestInWhatIf}
                  className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF6B22] border border-[#FF6B22]/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Stress-Test</span>
                </button>

                <button
                  onClick={handleViewInGraph}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Action Graph</span>
                </button>

                <button
                  onClick={handleEscalateToLawyerKit}
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Add to Lawyer Kit</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
