import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, ShieldCheck, AlertCircle, Copy, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GlassButton } from './GlassButton';
import { GlassBadge } from './GlassBadge';

export const EvidenceModal: React.FC = () => {
  const { selectedEvidenceClause, closeEvidence, activeDocument } = useApp();
  const [copied, setCopied] = React.useState(false);

  if (!selectedEvidenceClause) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedEvidenceClause.fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeEvidence}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        />

        {/* Modal / Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="relative z-10 w-full max-w-lg glass-panel bg-white/95 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-white/80 max-h-[85vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-stone-200/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF6B22]/10 border border-[#FF6B22]/20 flex items-center justify-center text-[#FF6B22]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#FF6B22]">
                    {selectedEvidenceClause.section}
                  </span>
                  <GlassBadge variant="neutral" size="sm">
                    Page {selectedEvidenceClause.pageNumber}
                  </GlassBadge>
                  {selectedEvidenceClause.riskLevel === 'high' && (
                    <GlassBadge variant="warning" size="sm">
                      High Impact
                    </GlassBadge>
                  )}
                </div>
                <h3 className="text-base font-bold text-[#151515] mt-0.5">
                  {selectedEvidenceClause.title}
                </h3>
              </div>
            </div>

            <button
              onClick={closeEvidence}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Finding Context & Summary */}
          <div className="mt-4 p-3.5 rounded-2xl bg-[#FFF8F2] border border-[#FF6B22]/20">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FF6B22]">
              <ShieldCheck className="w-4 h-4" />
              <span>Plain English Interpretation</span>
            </div>
            <p className="text-sm text-[#151515] mt-1.5 leading-relaxed font-medium">
              {selectedEvidenceClause.summary}
            </p>
          </div>

          {/* Verbatim Source Excerpt */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#6F6A64] uppercase tracking-wider">
                Verbatim Contract Excerpt ({activeDocument.name})
              </span>
              <button
                onClick={handleCopy}
                className="text-xs text-[#FF6B22] hover:underline flex items-center gap-1 font-medium cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-white/90 border border-stone-200/80 text-xs sm:text-sm font-mono text-stone-800 leading-relaxed max-h-48 overflow-y-auto">
              "{selectedEvidenceClause.fullText}"
            </div>
          </div>

          {/* Obligations or Penalties */}
          {selectedEvidenceClause.penalties && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <span className="font-bold">Contractual Consequence / Penalty: </span>
                {selectedEvidenceClause.penalties}
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div className="mt-6 pt-3 border-t border-stone-200/60 flex items-center justify-between">
            <p className="text-[11px] text-[#6F6A64] max-w-[280px]">
              Verified against extracted legal text · Immutable evidence trace
            </p>
            <GlassButton size="sm" variant="dark" onClick={closeEvidence}>
              Done
            </GlassButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
