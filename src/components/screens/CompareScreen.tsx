import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';
import { GlassButton } from '../common/GlassButton';
import { GlassBadge } from '../common/GlassBadge';
import { COMPARISON_DATA } from '../../data/initialData';

export const CompareScreen: React.FC = () => {
  const { documents } = useApp();
  const [docA, setDocA] = useState('Rental Agreement.pdf');
  const [docB, setDocB] = useState('New Agreement.pdf');
  const [hasCompared, setHasCompared] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | 'modified' | 'removed' | 'added'>('all');

  const handleSwap = () => {
    const temp = docA;
    setDocA(docB);
    setDocB(temp);
  };

  const handleCompare = () => {
    setHasCompared(true);
  };

  const diffs = COMPARISON_DATA.diffs.filter(d => 
    filterCategory === 'all' ? true : d.category === filterCategory
  );

  return (
    <div className="min-h-screen pb-28 max-w-md mx-auto flex flex-col justify-between">
      <div>
        <AppHeader title="Compare Documents" />

        <div className="px-5 pt-4 space-y-5 text-left">
          {/* Two Stacked Glass Document Cards with Swap Icon */}
          <div className="space-y-2 relative">
            {/* Doc A Card */}
            <motion.div
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-card p-4 rounded-2xl border border-white/80 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200/60 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Original Document
                  </span>
                  <h4 className="text-xs font-bold text-[#151515]">
                    {docA}
                  </h4>
                  <p className="text-[11px] text-[#6F6A64]">2.4 MB</p>
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
              className="glass-card p-4 rounded-2xl border border-white/80 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#FF6B22] border border-orange-200/60 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B22]">
                    Revised Version
                  </span>
                  <h4 className="text-xs font-bold text-[#151515]">
                    {docB}
                  </h4>
                  <p className="text-[11px] text-[#6F6A64]">2.1 MB</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Primary Orange Compare Button */}
          <GlassButton
            fullWidth
            size="lg"
            variant="primary"
            onClick={handleCompare}
          >
            Compare
          </GlassButton>

          {/* Prompt Explanatory Subtitle */}
          <p className="text-xs text-[#6F6A64] text-center px-4 leading-relaxed">
            We'll highlight differences, missing clauses, and potential risks.
          </p>

          {/* Comparison Results Area */}
          <AnimatePresence>
            {hasCompared && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#151515]">
                    Detected Variations ({COMPARISON_DATA.diffs.length})
                  </h3>
                  
                  {/* Category filters */}
                  <div className="flex gap-1 text-[11px]">
                    <button
                      onClick={() => setFilterCategory('all')}
                      className={`px-2 py-0.5 rounded-full cursor-pointer ${filterCategory === 'all' ? 'bg-[#151515] text-white' : 'text-stone-500'}`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterCategory('modified')}
                      className={`px-2 py-0.5 rounded-full cursor-pointer ${filterCategory === 'modified' ? 'bg-[#FF6B22] text-white' : 'text-stone-500'}`}
                    >
                      Modified
                    </button>
                    <button
                      onClick={() => setFilterCategory('removed')}
                      className={`px-2 py-0.5 rounded-full cursor-pointer ${filterCategory === 'removed' ? 'bg-rose-600 text-white' : 'text-stone-500'}`}
                    >
                      Removed
                    </button>
                  </div>
                </div>

                {/* Diff Cards */}
                <div className="space-y-3">
                  {diffs.map((diff, idx) => (
                    <div
                      key={idx}
                      className="glass-card p-4 rounded-2xl border border-white/80 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-[#151515]">
                          {diff.category === 'modified' && <RefreshCw className="w-3.5 h-3.5 text-amber-600" />}
                          {diff.category === 'removed' && <MinusCircle className="w-3.5 h-3.5 text-rose-600" />}
                          {diff.category === 'added' && <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />}
                          <span>{diff.title}</span>
                        </div>
                        <GlassBadge
                          variant={diff.riskImpact === 'higher' ? 'warning' : 'neutral'}
                        >
                          {diff.riskImpact === 'higher' ? 'Higher Risk' : 'Neutral'}
                        </GlassBadge>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        {diff.docAValue && (
                          <div className="p-2 rounded-xl bg-white/70 border border-stone-200/80">
                            <span className="text-[10px] font-bold uppercase text-stone-400 block">Original</span>
                            <p className="text-stone-700">{diff.docAValue}</p>
                          </div>
                        )}
                        {diff.docBValue && (
                          <div className="p-2 rounded-xl bg-[#FFF8F3] border border-[#FF6B22]/20">
                            <span className="text-[10px] font-bold uppercase text-[#FF6B22] block">Revised</span>
                            <p className="text-[#151515] font-medium">{diff.docBValue}</p>
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-stone-600 pt-1 border-t border-stone-200/50">
                        <span className="font-semibold text-stone-800">Impact: </span>
                        {diff.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
