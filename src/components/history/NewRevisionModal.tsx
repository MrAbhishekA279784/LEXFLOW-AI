import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  X, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { VersionChangeItem } from '../../types';

interface NewRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentName: string;
  onSaveRevision: (revision: {
    title: string;
    summary: string;
    changeType: 'clause_amendment' | 'counter_offer' | 'signed_addendum' | 'ai_redline';
    changes: VersionChangeItem[];
  }) => Promise<void>;
}

export const NewRevisionModal: React.FC<NewRevisionModalProps> = ({
  isOpen,
  onClose,
  documentName,
  onSaveRevision
}) => {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [clauseSection, setClauseSection] = useState('Section 4.1');
  const [clauseTitle, setClauseTitle] = useState('Monthly Payment Adjustment');
  const [updatedText, setUpdatedText] = useState('');
  const [riskImpact, setRiskImpact] = useState<'mitigated' | 'increased' | 'neutral'>('mitigated');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    setIsSubmitting(true);
    try {
      const changes: VersionChangeItem[] = [
        {
          id: `ch-custom-${Date.now()}`,
          clauseSection: clauseSection || 'General Clause',
          clauseTitle: clauseTitle || 'Amended Covenant',
          changeType: 'modified',
          updatedText: updatedText || summary,
          riskImpact,
          explanation: `Amended via custom revision: ${summary}`
        }
      ];

      await onSaveRevision({
        title,
        summary,
        changeType: 'clause_amendment',
        changes
      });

      setIsSubmitting(false);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg glass-panel bg-white/95 rounded-3xl border border-white shadow-2xl p-6 text-left relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-200/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#FF6B22]">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#151515]">
                Log Document Revision
              </h3>
              <p className="text-xs text-[#6F6A64]">
                {documentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 py-3">
          <div>
            <label className="text-xs font-bold text-[#151515] block mb-1">
              Revision Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Tenant Counter-Offer on Notice Period"
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs text-[#151515] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B22]/30"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#151515] block mb-1">
              Revision Summary & Changes Description *
            </label>
            <textarea
              required
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe what clauses were negotiated or amended..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs text-[#151515] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B22]/30 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#151515] block mb-1">
                Affected Clause Ref
              </label>
              <input
                type="text"
                value={clauseSection}
                onChange={(e) => setClauseSection(e.target.value)}
                placeholder="e.g., Section 4.1"
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-[#151515]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#151515] block mb-1">
                Clause Title
              </label>
              <input
                type="text"
                value={clauseTitle}
                onChange={(e) => setClauseTitle(e.target.value)}
                placeholder="e.g., Notice Period"
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-[#151515]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#151515] block mb-1">
              New Clause / Amended Text (optional)
            </label>
            <textarea
              rows={2}
              value={updatedText}
              onChange={(e) => setUpdatedText(e.target.value)}
              placeholder="Paste updated clause wording here..."
              className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs text-[#151515] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B22]/30 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#151515] block mb-1">
              Risk Assessment
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'mitigated', label: 'Risk Mitigated (Safer)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                { id: 'neutral', label: 'Neutral', color: 'text-stone-700 bg-stone-50 border-stone-200' },
                { id: 'increased', label: 'Risk Increased', color: 'text-amber-700 bg-amber-50 border-amber-200' },
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRiskImpact(r.id as any)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                    riskImpact === r.id ? `${r.color} ring-2 ring-[#FF6B22]/30 shadow-2xs` : 'bg-white text-stone-500 border-stone-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#FF6B22] hover:bg-[#F25E12] text-white text-xs font-bold shadow-md shadow-[#FF6B22]/25 flex items-center gap-1.5 transition-all hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Revision</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
