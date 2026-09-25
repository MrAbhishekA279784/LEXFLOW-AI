import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  ArrowDownUp, 
  Layers, 
  AlertTriangle, 
  Check, 
  PlusCircle, 
  MinusCircle, 
  RefreshCw,
  ChevronDown,
  Scale,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { getAuthToken } from '../../utils/apiAuth';

export const CompareScreen: React.FC = () => {
  const { documents, openEvidence } = useApp();
  
  const [selectedDocAId, setSelectedDocAId] = useState<string>(documents[0]?.id || 'doc-rental');
  const [selectedDocBId, setSelectedDocBId] = useState<string>(documents[1]?.id || documents[0]?.id || 'doc-rental');
  
  const [isComparing, setIsComparing] = useState(false);
  const [hasCompared, setHasCompared] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'modified' | 'added' | 'removed'>('all');

  useEffect(() => {
    if (documents.length > 1) {
      setSelectedDocAId(documents[0].id);
      setSelectedDocBId(documents[1].id);
    } else if (documents.length === 1) {
      setSelectedDocAId(documents[0].id);
      setSelectedDocBId(documents[0].id);
    }
  }, [documents]);

  const handleSwap = () => {
    const temp = selectedDocAId;
    setSelectedDocAId(selectedDocBId);
    setSelectedDocBId(temp);
  };

  const handleCompare = async () => {
    try {
      setIsComparing(true);
      setError(null);

      const token = await getAuthToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/v1/comparisons', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          documentAId: selectedDocAId,
          documentBId: selectedDocBId,
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || `Comparison failed with HTTP ${res.status}`);
      }

      const json = await res.json();
      setComparisonResult(json.data);
      setHasCompared(true);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setError(err.message || 'Failed to compare documents. Please verify both documents exist.');
    } finally {
      setIsComparing(false);
    }
  };

  const docAItem = documents.find(d => d.id === selectedDocAId) || documents[0];
  const docBItem = documents.find(d => d.id === selectedDocBId) || documents[1] || documents[0];

  const diffs = (comparisonResult?.diffs || []).filter((d: any) => 
    filterStatus === 'all' ? true : d.status === filterStatus
  );

  return (
    <div className="min-h-screen pb-28 max-w-xl mx-auto flex flex-col justify-between">
      <div>
        <AppHeader title="Forensic Document Comparison" />

        <div className="px-4 pt-3 space-y-4 text-left">
          {/* Document Selector & Stacked Workspace */}
          <div className="space-y-2 relative">
            {/* Doc A Card */}
            <motion.div
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-card p-4 rounded-2xl border border-white/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-stone-400" />
                  Base Document (Doc A)
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {docAItem?.size || '1.2 MB'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <select
                    value={selectedDocAId}
                    onChange={(e) => setSelectedDocAId(e.target.value)}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent border-b border-stone-200 focus:outline-none focus:border-[#FF6B22] py-1 cursor-pointer"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.clauseCount || 12} clauses)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Swap Button Circle in between */}
            <div className="flex justify-center -my-2 relative z-10">
              <button
                onClick={handleSwap}
                aria-label="Swap documents"
                className="w-9 h-9 rounded-full bg-white shadow-md border border-stone-200 flex items-center justify-center text-stone-700 hover:text-[#FF6B22] hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowDownUp className="w-4 h-4" />
              </button>
            </div>

            {/* Doc B Card */}
            <motion.div
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-4 rounded-2xl border border-white/80 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B22] flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#FF6B22]" />
                  Comparison Target (Doc B)
                </span>
                <span className="text-[11px] text-stone-500 font-medium">
                  {docBItem?.size || '1.1 MB'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B22] border border-orange-200/60 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <select
                    value={selectedDocBId}
                    onChange={(e) => setSelectedDocBId(e.target.value)}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent border-b border-stone-200 focus:outline-none focus:border-[#FF6B22] py-1 cursor-pointer"
                  >
                    {documents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.clauseCount || 12} clauses)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Primary Orange Compare Button */}
          <GlassButton
            fullWidth
            size="lg"
            variant="primary"
            loading={isComparing}
            onClick={handleCompare}
          >
            {isComparing ? 'Analyzing Clause Differences...' : 'Run Forensic Comparison'}
          </GlassButton>

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Comparison Results Area */}
          <AnimatePresence>
            {hasCompared && comparisonResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-2 space-y-4"
              >
                {/* Executive Summary Card */}
                <div className="glass-card p-4 rounded-2xl border border-white/80 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-900 uppercase tracking-wider">
                    <Scale className="w-4 h-4 text-[#FF6B22]" />
                    Comparative Synthesis & Delta
                  </div>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    {comparisonResult.summary}
                  </p>

                  {/* Risk Delta Callout */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                    <div className="p-2.5 rounded-xl bg-red-50/80 border border-red-200 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-red-900 text-[11px]">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        Risk Delta
                      </div>
                      <span className="text-[11px] font-bold text-red-700 block">
                        {comparisonResult.riskDelta?.overallRiskScoreDiff || 'Elevated Risk'}
                      </span>
                      <p className="text-[10px] text-red-600/90 leading-tight">
                        {comparisonResult.riskDelta?.increasedRisks?.[0] || 'Liability shifts to tenant'}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-emerald-900 text-[11px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Protection Delta
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 block">
                        {comparisonResult.protectionDelta?.addedProtections?.length || 1} Added Terms
                      </span>
                      <p className="text-[10px] text-emerald-700/90 leading-tight">
                        {comparisonResult.protectionDelta?.addedProtections?.[0] || 'Clarified notice cure period'}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Counsel Guidance:</span>
                      <span>{comparisonResult.recommendation}</span>
                    </div>
                  </div>
                </div>

                {/* Filter Toolbar & Count */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
                    Detailed Clause Variations ({diffs.length})
                  </h3>
                  
                  <div className="flex gap-1 text-[11px]">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'modified', label: 'Modified' },
                      { id: 'added', label: 'Added' },
                      { id: 'removed', label: 'Removed' },
                    ].map((tab: { id: 'all' | 'modified' | 'added' | 'removed'; label: string }) => (
                      <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer transition-all ${
                          filterStatus === tab.id
                            ? 'bg-[#151515] text-white'
                            : 'bg-stone-100 text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Diff Cards */}
                <div className="space-y-3">
                  {diffs.map((diff: any, idx: number) => {
                    const isRestrictive = diff.changeType === 'more_restrictive';
                    const isProtective = diff.changeType === 'more_protective';

                    return (
                      <div
                        key={diff.id || idx}
                        className="glass-card p-4 rounded-2xl border border-white/80 space-y-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-[#151515]">
                            {diff.status === 'modified' && <RefreshCw className="w-3.5 h-3.5 text-amber-600" />}
                            {diff.status === 'removed' && <MinusCircle className="w-3.5 h-3.5 text-rose-600" />}
                            {diff.status === 'added' && <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />}
                            <span>{diff.clauseName}</span>
                          </div>

                          <GlassBadge
                            variant={isRestrictive ? 'warning' : isProtective ? 'success' : 'neutral'}
                          >
                            {isRestrictive ? 'More Restrictive' : isProtective ? 'More Protective' : 'Neutral Shift'}
                          </GlassBadge>
                        </div>

                        {/* Side-by-Side Comparison */}
                        <div className="space-y-1.5 pt-1">
                          {diff.docAValue && (
                            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase text-stone-500">Doc A (Original)</span>
                                {diff.docAPage && <span className="text-[10px] text-stone-400 font-mono">Page {diff.docAPage}</span>}
                              </div>
                              <p className="text-stone-700 italic">"{diff.docAValue}"</p>
                            </div>
                          )}

                          {diff.docBValue && (
                            <div className="p-2.5 rounded-xl bg-[#FFF8F3] border border-[#FF6B22]/20 space-y-1">
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase text-[#FF6B22]">Doc B (Revised)</span>
                                {diff.docBPage && <span className="text-[10px] text-[#FF6B22]/70 font-mono">Page {diff.docBPage}</span>}
                              </div>
                              <p className="text-stone-900 font-medium italic">"{diff.docBValue}"</p>
                            </div>
                          )}
                        </div>

                        {/* Impact & Statutory Considerations */}
                        <div className="pt-1.5 border-t border-stone-200/60 space-y-1 text-[11px]">
                          <p className="text-stone-700">
                            <span className="font-bold text-stone-900">Legal Impact: </span>
                            {diff.impactSummary}
                          </p>

                          {diff.statutoryConsideration && (
                            <p className="text-[#C2410C] font-semibold flex items-center gap-1">
                              <span>§ Statutory Principle: {diff.statutoryConsideration}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
