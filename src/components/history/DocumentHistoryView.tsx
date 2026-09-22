import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  RotateCcw, 
  GitCommit, 
  GitBranch, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  ShieldCheck, 
  ArrowRight, 
  Search, 
  Plus, 
  FileText, 
  Layers, 
  Clock, 
  User, 
  Building2, 
  Scale, 
  Download,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentVersion, VersionChangeItem } from '../../types';
import { GlassCard } from '../common/GlassCard';
import { GlassBadge } from '../common/GlassBadge';
import { RevertVersionModal } from './RevertVersionModal';
import { NewRevisionModal } from './NewRevisionModal';

interface DocumentHistoryViewProps {
  onBackToOverview?: () => void;
}

export const DocumentHistoryView: React.FC<DocumentHistoryViewProps> = ({ onBackToOverview }) => {
  const { 
    activeDocument, 
    documentVersions, 
    revertToVersion, 
    createVersionRevision,
    openEvidence,
    setActiveDocTab
  } = useApp();

  const [selectedVersionId, setSelectedVersionId] = useState<string>(
    documentVersions.find(v => v.isCurrent)?.id || documentVersions[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isRevertModalOpen, setIsRevertModalOpen] = useState(false);
  const [isNewRevisionModalOpen, setIsNewRevisionModalOpen] = useState(false);
  const [targetRevertVersion, setTargetRevertVersion] = useState<DocumentVersion | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareWithVersionId, setCompareWithVersionId] = useState<string>(
    documentVersions[documentVersions.length - 1]?.id || ''
  );

  const currentVersion = documentVersions.find(v => v.isCurrent) || documentVersions[0];
  const selectedVersion = documentVersions.find(v => v.id === selectedVersionId) || currentVersion;
  const compareWithVersion = documentVersions.find(v => v.id === compareWithVersionId);

  const handleOpenRevert = (version: DocumentVersion) => {
    setTargetRevertVersion(version);
    setIsRevertModalOpen(true);
  };

  const handleConfirmRevert = async (versionId: string, note?: string) => {
    await revertToVersion(versionId, note);
    setSelectedVersionId(versionId);
  };

  const handleSaveRevision = async (revision: {
    title: string;
    summary: string;
    changeType: 'clause_amendment' | 'counter_offer' | 'signed_addendum' | 'ai_redline';
    changes: VersionChangeItem[];
  }) => {
    const created = await createVersionRevision(revision);
    if (created) {
      setSelectedVersionId(created.id);
    }
  };

  // Filtered changes in selected version
  const filteredChanges = (selectedVersion?.changes || []).filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.clauseSection.toLowerCase().includes(q) ||
      c.clauseTitle.toLowerCase().includes(q) ||
      c.explanation.toLowerCase().includes(q) ||
      (c.updatedText && c.updatedText.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-5 text-left pb-12 select-none">
      {/* 1. Header Banner & Action Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white/80 border border-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-100/90 border border-orange-200/80 flex items-center justify-center text-[#FF6B22] shadow-2xs">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#151515]">
                Document History & Revisions
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B22]/10 text-[#FF6B22] border border-[#FF6B22]/20">
                {documentVersions.length} {documentVersions.length === 1 ? 'Version' : 'Versions'}
              </span>
            </div>
            <p className="text-xs text-[#6F6A64]">
              Tracking all clause amendments, counter-offers, and redlines for <span className="font-semibold text-stone-800">{activeDocument.name}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCompareMode(!compareMode)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
              compareMode
                ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>{compareMode ? 'Exit Diff View' : 'Compare Revisions'}</span>
          </button>

          <button
            onClick={() => setIsNewRevisionModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#FF6B22] hover:bg-[#F25E12] text-white text-xs font-bold shadow-md shadow-[#FF6B22]/20 flex items-center gap-1.5 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Revision</span>
          </button>
        </div>
      </div>

      {/* 2. Side-by-Side Version Diff (if Compare Mode active) */}
      <AnimatePresence>
        {compareMode && compareWithVersion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 rounded-3xl bg-blue-50/60 border border-blue-200/80 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900">
                  Version Comparison Mode
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500">Compare with:</span>
                <select
                  value={compareWithVersionId}
                  onChange={(e) => setCompareWithVersionId(e.target.value)}
                  aria-label="Select version to compare with"
                  className="px-2.5 py-1 rounded-xl bg-white border border-blue-200 text-xs font-semibold text-[#151515]"
                >
                  {documentVersions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.versionNumber} ({v.title})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                  <span className="font-bold text-blue-700">Selected: {selectedVersion.versionNumber}</span>
                  <span className="text-[11px] text-stone-500">{selectedVersion.timestamp}</span>
                </div>
                <p className="text-stone-700 font-medium leading-relaxed">{selectedVersion.summary}</p>
                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  <span>Author: {selectedVersion.author.name}</span>
                  <span>·</span>
                  <span>{selectedVersion.riskCount} Risk Flags</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-stone-200 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-stone-100">
                  <span className="font-bold text-stone-700">Compared Against: {compareWithVersion.versionNumber}</span>
                  <span className="text-[11px] text-stone-500">{compareWithVersion.timestamp}</span>
                </div>
                <p className="text-stone-700 font-medium leading-relaxed">{compareWithVersion.summary}</p>
                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  <span>Author: {compareWithVersion.author.name}</span>
                  <span>·</span>
                  <span>{compareWithVersion.riskCount} Risk Flags</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Workspace: Version Timeline (Left) + Detailed Clause Diff Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Timeline List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Audit Timeline
            </span>
            <span className="text-[11px] text-stone-400 font-medium">
              Click version to inspect
            </span>
          </div>

          <div className="space-y-2.5">
            {documentVersions.map((version, index) => {
              const isSelected = version.id === selectedVersionId;
              const isCurrent = version.isCurrent;

              return (
                <motion.div
                  key={version.id}
                  whileHover={{ x: 2 }}
                  onClick={() => setSelectedVersionId(version.id)}
                  className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer text-left relative ${
                    isSelected
                      ? 'bg-white border-[#FF6B22]/50 shadow-md ring-1 ring-[#FF6B22]/30'
                      : 'bg-white/60 hover:bg-white/90 border-white/90 shadow-2xs'
                  }`}
                >
                  {/* Status Badges Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${
                        isCurrent 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/80' 
                          : 'bg-stone-100 text-stone-700 border border-stone-200'
                      }`}>
                        {version.versionNumber}
                      </span>
                      {isCurrent && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                      {version.changeType === 'reverted' && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-200">
                          <RotateCcw className="w-3 h-3" />
                          <span>Restored</span>
                        </span>
                      )}
                    </div>

                    <span className="text-[11px] text-stone-400 font-medium">
                      {version.timestamp}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <h4 className="text-xs font-bold text-[#151515] line-clamp-1 mb-1">
                    {version.title}
                  </h4>
                  <p className="text-[11px] text-[#6F6A64] line-clamp-2 leading-relaxed mb-2.5">
                    {version.summary}
                  </p>

                  {/* Bottom Stats & Quick Revert Button */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px]">
                    <div className="flex items-center gap-2 text-stone-500">
                      <span>{version.changeCount} changes</span>
                      <span>·</span>
                      <span className={version.riskCount > 1 ? 'text-amber-600 font-bold' : 'text-stone-500'}>
                        {version.riskCount} risks
                      </span>
                    </div>

                    {!isCurrent && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenRevert(version);
                        }}
                        className="text-xs font-bold text-[#FF6B22] hover:text-[#E0530E] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Revert</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Version Deep Dive */}
        <div className="lg:col-span-7 space-y-4">
          <GlassCard className="space-y-4">
            {/* Version Profile Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-stone-200/70">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-[#151515]">
                    {selectedVersion.versionNumber} · {selectedVersion.title}
                  </span>
                  {selectedVersion.isCurrent ? (
                    <GlassBadge variant="success">Currently Active</GlassBadge>
                  ) : (
                    <GlassBadge variant="neutral">Archived Revision</GlassBadge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{selectedVersion.timestamp}</span>
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Author: {selectedVersion.author.name} ({selectedVersion.author.role})</span>
                  </span>
                </div>
              </div>

              {/* Primary Revert CTA in Version Detail Header */}
              {!selectedVersion.isCurrent ? (
                <button
                  onClick={() => handleOpenRevert(selectedVersion)}
                  className="px-4 py-2 rounded-xl bg-[#FFF2EA] hover:bg-[#FFE3D1] border border-[#FF6B22]/30 text-[#FF6B22] text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Revert to this Version</span>
                </button>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Serving Active Analysis</span>
                </div>
              )}
            </div>

            {/* Revision Summary Callout */}
            <div className="p-3.5 rounded-2xl bg-white/90 border border-stone-200/80 space-y-1 text-xs">
              <span className="font-bold text-stone-500 uppercase text-[10px] tracking-wider block">
                Revision Overview
              </span>
              <p className="text-stone-800 leading-relaxed font-medium">
                {selectedVersion.summary}
              </p>
            </div>

            {/* Metric Pills */}
            <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-white/70 border border-stone-200/70">
                <span className="text-[10px] text-stone-400 font-bold uppercase">Clauses Modified</span>
                <p className="text-lg font-extrabold text-[#151515] mt-0.5">{selectedVersion.changeCount}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 border border-stone-200/70">
                <span className="text-[10px] text-stone-400 font-bold uppercase">Risk Exposure</span>
                <p className={`text-lg font-extrabold mt-0.5 ${selectedVersion.riskCount > 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {selectedVersion.riskCount} {selectedVersion.riskCount === 1 ? 'Flag' : 'Flags'}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/70 border border-stone-200/70">
                <span className="text-[10px] text-stone-400 font-bold uppercase">Total Clauses</span>
                <p className="text-lg font-extrabold text-[#151515] mt-0.5">{selectedVersion.clauseCount}</p>
              </div>
            </div>

            {/* Changes Search & Filter Bar */}
            <div className="pt-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter modified clauses (e.g. rent, notice, deposit)..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/90 border border-stone-200 text-xs text-[#151515] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B22]/30"
                />
              </div>
            </div>

            {/* Granular Clause Diff List */}
            <div className="space-y-3 pt-1">
              <span className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
                Detailed Clause Changes ({filteredChanges.length})
              </span>

              {filteredChanges.length === 0 ? (
                <div className="p-6 rounded-2xl bg-white/60 border border-dashed border-stone-200 text-center text-xs text-stone-500">
                  No clause changes match the current filter.
                </div>
              ) : (
                filteredChanges.map((change) => {
                  const isMitigated = change.riskImpact === 'mitigated';
                  const isIncreased = change.riskImpact === 'increased';

                  return (
                    <div
                      key={change.id}
                      className="p-4 rounded-2xl bg-white/90 border border-stone-200/80 shadow-2xs space-y-2.5 text-xs text-left"
                    >
                      {/* Change Item Header */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[#FF6B22] bg-orange-50 border border-orange-200/60 text-[11px]">
                            {change.clauseSection}
                          </span>
                          <h5 className="font-bold text-[#151515]">
                            {change.clauseTitle}
                          </h5>
                        </div>

                        {/* Risk Impact Badge */}
                        <div className="flex items-center gap-1.5">
                          {isMitigated && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Risk Mitigated</span>
                            </span>
                          )}
                          {isIncreased && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3" />
                              <span>Risk Increased</span>
                            </span>
                          )}
                          {!isMitigated && !isIncreased && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-50 text-stone-600 border border-stone-200">
                              Neutral
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Diff Comparison Blocks */}
                      <div className="space-y-1.5">
                        {change.originalText && (
                          <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-200/70 text-red-900 text-[11px] leading-relaxed">
                            <span className="font-bold uppercase text-[10px] text-red-600 block mb-0.5">
                              - Previous Text:
                            </span>
                            <span className="line-through decoration-red-400 opacity-80">
                              {change.originalText}
                            </span>
                          </div>
                        )}

                        {change.updatedText && (
                          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 text-emerald-900 text-[11px] leading-relaxed">
                            <span className="font-bold uppercase text-[10px] text-emerald-600 block mb-0.5">
                              + Amended / New Text:
                            </span>
                            <span className="font-medium">
                              {change.updatedText}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Plain-English Impact Note */}
                      <div className="pt-1 flex items-start gap-1.5 text-[11px] text-stone-600">
                        <Info className="w-3.5 h-3.5 text-[#FF6B22] shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-stone-800">Legal Consequence: </strong>
                          {change.explanation}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Restore Bar for Previous Versions */}
            {!selectedVersion.isCurrent && (
              <div className="pt-3 border-t border-stone-200/60 flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Want to apply these terms back to your active document?
                </span>
                <button
                  onClick={() => handleOpenRevert(selectedVersion)}
                  className="px-4 py-2 rounded-xl bg-[#FF6B22] hover:bg-[#F25E12] text-white text-xs font-bold shadow-md shadow-[#FF6B22]/25 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-102"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore {selectedVersion.versionNumber}</span>
                </button>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Modals */}
      <RevertVersionModal
        isOpen={isRevertModalOpen}
        onClose={() => setIsRevertModalOpen(false)}
        targetVersion={targetRevertVersion}
        currentVersion={currentVersion}
        documentName={activeDocument.name}
        onConfirmRevert={handleConfirmRevert}
      />

      <NewRevisionModal
        isOpen={isNewRevisionModalOpen}
        onClose={() => setIsNewRevisionModalOpen(false)}
        documentName={activeDocument.name}
        onSaveRevision={handleSaveRevision}
      />
    </div>
  );
};
