import React, { useState } from 'react';
import { 
  Swords, 
  Bot, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { ComplianceFinding } from '../../types/complianceAuditTypes';
import { ComplianceAuditDebateModal } from './ComplianceAuditDebateModal';

interface ComplianceAuditDebatePreviewProps {
  findings: ComplianceFinding[];
  activeFinding?: ComplianceFinding | null;
}

export const ComplianceAuditDebatePreview: React.FC<ComplianceAuditDebatePreviewProps> = ({
  findings,
  activeFinding
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedRoundIndex, setSelectedRoundIndex] = useState<number>(0);
  const [mobileExpandedRound, setMobileExpandedRound] = useState<number>(0);

  // Pick finding with richest debate rounds, or activeFinding
  const targetFinding = activeFinding || findings.find(f => f.debateRounds && f.debateRounds.length > 0) || findings[0];

  if (!targetFinding) return null;

  const debateRounds = targetFinding.debateRounds || [];
  const currentRound = debateRounds[selectedRoundIndex] || debateRounds[0];

  if (!currentRound) return null;

  return (
    <div className="glass-card p-4 sm:p-5 rounded-3xl border border-white/80 shadow-sm text-left space-y-3.5">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-stone-200/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-2xs">
            <Swords className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-[#151515]">
              Adversarial Agent Debate
            </h3>
            <p className="text-[11px] text-stone-500">
              Audit for <strong className="text-stone-700">{targetFinding.clauseReference?.section || 'Key Clause'}</strong>: {targetFinding.title}
            </p>
          </div>
        </div>

        {/* View Full Debate Trigger */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-xs font-bold text-[#FF6B22] flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer self-start sm:self-auto"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Full Debate ({debateRounds.length} Rounds)</span>
        </button>
      </div>

      {/* DESKTOP & TABLET VIEW: Compact Side-by-Side Exchange with Round Tabs */}
      <div className="hidden sm:block space-y-3">
        {/* Round Switcher Pills */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-tight">
            Exchange:
          </span>
          {debateRounds.map((r, idx) => (
            <button
              key={r.round}
              onClick={() => setSelectedRoundIndex(idx)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedRoundIndex === idx
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white/80 text-stone-600 border border-stone-200/80 hover:bg-white'
              }`}
            >
              Round 0{r.round}
            </button>
          ))}
        </div>

        {/* Side-by-Side Agent Arguments */}
        <div className="grid grid-cols-2 gap-3">
          {/* Reviewer Argument (Left) */}
          <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/70 space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-purple-100">
              <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
                <Bot className="w-3.5 h-3.5 text-purple-600" />
                <span>Reviewer Agent</span>
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                Auditor Claim
              </span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-medium">
              {currentRound.reviewerArgument}
            </p>
          </div>

          {/* Skeptic Argument (Right) */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 space-y-1.5">
            <div className="flex items-center justify-between pb-1 border-b border-amber-100">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Skeptic Agent</span>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                Adversarial Challenge
              </span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed font-medium">
              {currentRound.skepticCounterArgument}
            </p>
          </div>
        </div>

        {/* Unresolved Evidence Gap if any */}
        {currentRound.unresolvedQuestion && (
          <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs text-stone-600 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">
              <strong>Evidentiary Focus:</strong> {currentRound.unresolvedQuestion}
            </span>
          </div>
        )}
      </div>

      {/* MOBILE ACCORDION VIEW: One round open at a time */}
      <div className="sm:hidden space-y-2">
        {debateRounds.map((round, idx) => {
          const isOpen = mobileExpandedRound === idx;
          return (
            <div
              key={round.round}
              className="rounded-2xl border border-stone-200/80 bg-white/90 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setMobileExpandedRound(isOpen ? -1 : idx)}
                className="w-full p-3 flex items-center justify-between text-left cursor-pointer hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900">
                    Round 0{round.round} Debate
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    2 Agent Exchanges
                  </span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
              </button>

              {isOpen && (
                <div className="p-3 pt-0 space-y-2.5 border-t border-stone-100 text-xs">
                  {/* Reviewer */}
                  <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-900 font-bold text-[11px]">
                      <Bot className="w-3.5 h-3.5 text-purple-600" />
                      <span>Reviewer Claim:</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      {round.reviewerArgument}
                    </p>
                  </div>

                  {/* Skeptic */}
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px]">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Skeptic Challenge:</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed text-[11px]">
                      {round.skepticCounterArgument}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <ComplianceAuditDebateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        findings={findings}
        activeFindingTitle={targetFinding.title}
      />
    </div>
  );
};
