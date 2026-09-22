import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  RotateCcw, 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  FileText,
  Loader2
} from 'lucide-react';
import { DocumentVersion } from '../../types';

interface RevertVersionModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetVersion: DocumentVersion | null;
  currentVersion: DocumentVersion | null;
  documentName: string;
  onConfirmRevert: (versionId: string, restoreNote?: string) => Promise<void>;
}

export const RevertVersionModal: React.FC<RevertVersionModalProps> = ({
  isOpen,
  onClose,
  targetVersion,
  currentVersion,
  documentName,
  onConfirmRevert
}) => {
  const [restoreNote, setRestoreNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !targetVersion) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmRevert(targetVersion.id, restoreNote);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 1200);
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
        {/* Ambient warm gradient glow */}
        <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-orange-200/30 blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-stone-200/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF2EA] border border-[#FF6B22]/30 flex items-center justify-center text-[#FF6B22] shadow-2xs">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#151515]">
                Revert to {targetVersion.versionNumber}
              </h3>
              <p className="text-xs text-[#6F6A64]">
                {documentName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {success ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#151515]">
              Document Successfully Restored!
            </h4>
            <p className="text-xs text-[#6F6A64]">
              Active document state restored to {targetVersion.versionNumber} ({targetVersion.title}).
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-3">
            {/* Version Transition Banner */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-stone-400">Current Active</span>
                <p className="font-bold text-[#151515]">
                  {currentVersion?.versionNumber || 'Current'} · {currentVersion?.title || 'Active Version'}
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-400 shrink-0 mx-2" />
              <div className="space-y-0.5 text-right">
                <span className="text-[10px] uppercase font-bold text-[#FF6B22]">Reverting To</span>
                <p className="font-bold text-[#FF6B22]">
                  {targetVersion.versionNumber} · {targetVersion.title}
                </p>
              </div>
            </div>

            {/* Warning / Impact Note */}
            <div className="p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold">What will change:</span>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Your document's active clauses, Legal Action Graph nodes, and risk counts will revert back to the exact snapshot recorded in {targetVersion.versionNumber}. A new audit history checkpoint will be generated.
                </p>
              </div>
            </div>

            {/* Target Version Summary */}
            <div className="p-3 rounded-2xl bg-white border border-stone-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-stone-500 text-[11px]">
                <span>Recorded: {targetVersion.timestamp}</span>
                <span>By: {targetVersion.author.name} ({targetVersion.author.role})</span>
              </div>
              <p className="text-stone-700 italic">
                “{targetVersion.summary}”
              </p>
            </div>

            {/* Optional Reason / Restoration Note */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#151515] block">
                Restoration Note <span className="text-stone-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={restoreNote}
                onChange={(e) => setRestoreNote(e.target.value)}
                placeholder="e.g., Reverting to original terms per counterparty agreement..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 text-xs text-[#151515] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B22]/30"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#FF6B22] hover:bg-[#F25E12] text-white text-xs font-bold shadow-md shadow-[#FF6B22]/25 flex items-center gap-1.5 transition-all hover:scale-102 active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Confirm & Restore Version</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
