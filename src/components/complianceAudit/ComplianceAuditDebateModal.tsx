import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Swords, Bot, HelpCircle, AlertTriangle, Scale } from 'lucide-react';
import { ComplianceFinding } from '../../types/complianceAuditTypes';

interface ComplianceAuditDebateModalProps {
  isOpen: boolean;
  onClose: () => void;
  findings: ComplianceFinding[];
  activeFindingTitle?: string;
}

export const ComplianceAuditDebateModal: React.FC<ComplianceAuditDebateModalProps> = ({
  isOpen,
  onClose,
  findings,
  activeFindingTitle
}) => {
  const [selectedFindingIndex, setSelectedFindingIndex] = React.useState<number>(0);

  if (!isOpen) return null;

  const currentFinding = findings[selectedFindingIndex] || findings[0];
  const debateRounds = currentFinding?.debateRounds || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 text-left">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-3xl max-h-[85vh] bg-[#FCFAF6] rounded-3xl border border-white/90 shadow-2xl z-10 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200/70 bg-white/80 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-orange-100 text-[#FF6B22] flex items-center justify-center shadow-2xs">
                <Swords className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#151515]">
                  Full Multi-Agent Debate Transcript
                </h3>
                <p className="text-[11px] text-stone-500">
                  Reviewer Auditor Claim vs Skeptic Adversarial Challenge
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Finding Selector Bar */}
          {findings.length > 1 && (
            <div className="px-4 py-2 bg-stone-100/70 border-b border-stone-200/60 flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[10px] font-bold text-stone-500 uppercase shrink-0 mr-1">
                Finding:
              </span>
              {findings.map((f, idx) => (
                <button
                  key={f.findingId || f.id || idx}
                  onClick={() => setSelectedFindingIndex(idx)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedFindingIndex === idx
                      ? 'bg-[#FF6B22] text-white shadow-2xs'
                      : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {f.clauseReference?.section || `Finding ${idx + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* Scrollable Debate Transcript */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {currentFinding && (
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200/70 space-y-1">
                <span className="text-[10px] font-bold uppercase text-[#FF6B22]">
                  Active Provision: {currentFinding.clauseReference?.section || currentFinding.affectedClauseRefs?.[0]}
                </span>
                <h4 className="text-xs sm:text-sm font-extrabold text-stone-900">
                  {currentFinding.title}
                </h4>
              </div>
            )}

            {debateRounds.map((round) => (
              <div 
                key={round.round}
                className="p-4 rounded-2xl bg-white border border-stone-200/80 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs">
                  <span className="font-extrabold uppercase tracking-wider text-stone-800">
                    Debate Round 0{round.round}
                  </span>
                  <span className="text-[11px] text-stone-400 font-mono">
                    Multi-Agent Protocol
                  </span>
                </div>

                {/* Reviewer Argument */}
                <div className="p-3 rounded-xl bg-purple-50/90 border border-purple-100 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-900 font-bold text-xs">
                    <Bot className="w-4 h-4 text-purple-600" />
                    <span>Reviewer Agent (Auditor Finding):</span>
                  </div>
                  <p className="text-xs text-stone-800 leading-relaxed pl-5">
                    {round.reviewerArgument}
                  </p>
                </div>

                {/* Skeptic Counter-Argument */}
                <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-100 text-left space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    <span>Skeptic Agent (Adversarial Counter):</span>
                  </div>
                  <p className="text-xs text-stone-800 leading-relaxed pl-5">
                    {round.skepticCounterArgument}
                  </p>
                </div>

                {/* Unresolved Question */}
                {round.unresolvedQuestion && (
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900">Missing Evidentiary Information: </span>
                      <span>{round.unresolvedQuestion}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-stone-200/70 bg-white/90 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Close Debate Transcript
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
