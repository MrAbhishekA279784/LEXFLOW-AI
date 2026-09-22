import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  Info, 
  ChevronRight,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TiltCard } from '../common/TiltCard';

export const DesktopKeyInsights: React.FC = () => {
  const { navigateTo, setActiveDocTab } = useApp();
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  const handleOpenRisks = () => {
    setActiveDocTab('Risks');
    navigateTo('legal-graph');
  };

  const handleOpenClauses = () => {
    setActiveDocTab('Clauses');
    navigateTo('legal-graph');
  };

  return (
    <div className="space-y-3 text-left">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#151515] flex items-center gap-2">
          <span>Key Insights</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B22] animate-pulse" />
        </h3>
        <span className="text-[11px] font-medium text-stone-400">Interactive 3D Cards • Live Review</span>
      </div>

      <div className="grid grid-cols-5 gap-3.5">
        {/* Metric 1: 2 High Priority Risks */}
        <TiltCard
          maxTilt={10}
          scale={1.02}
          onClick={handleOpenRisks}
          className="glass-card rounded-2xl border border-white/90 shadow-xs cursor-pointer hover:border-red-300/80 transition-colors p-4 flex items-center gap-3 group"
        >
          <div 
            style={{ transform: 'translateZ(16px)' }}
            className="w-8 h-8 rounded-xl bg-red-50/90 text-red-600 border border-red-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
          >
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div style={{ transform: 'translateZ(12px)' }}>
            <span className="text-xl font-extrabold text-[#151515] group-hover:text-red-600 transition-colors block leading-tight">
              2
            </span>
            <p className="text-[11px] text-[#6F6A64] font-medium leading-tight">
              High Priority Risks
            </p>
          </div>
        </TiltCard>

        {/* Metric 2: 5 Review Items */}
        <TiltCard
          maxTilt={10}
          scale={1.02}
          onClick={handleOpenRisks}
          className="glass-card rounded-2xl border border-white/90 shadow-xs cursor-pointer hover:border-amber-300/80 transition-colors p-4 flex items-center gap-3 group"
        >
          <div 
            style={{ transform: 'translateZ(16px)' }}
            className="w-8 h-8 rounded-xl bg-amber-50/90 text-amber-600 border border-amber-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
          >
            <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div style={{ transform: 'translateZ(12px)' }}>
            <span className="text-xl font-extrabold text-[#151515] group-hover:text-amber-600 transition-colors block leading-tight">
              5
            </span>
            <p className="text-[11px] text-[#6F6A64] font-medium leading-tight">
              Review Items
            </p>
          </div>
        </TiltCard>

        {/* Metric 3: 3 Potential Protections */}
        <TiltCard
          maxTilt={10}
          scale={1.02}
          onClick={handleOpenClauses}
          className="glass-card rounded-2xl border border-white/90 shadow-xs cursor-pointer hover:border-emerald-300/80 transition-colors p-4 flex items-center gap-3 group"
        >
          <div 
            style={{ transform: 'translateZ(16px)' }}
            className="w-8 h-8 rounded-xl bg-emerald-50/90 text-emerald-600 border border-emerald-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
          >
            <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div style={{ transform: 'translateZ(12px)' }}>
            <span className="text-xl font-extrabold text-[#151515] group-hover:text-emerald-600 transition-colors block leading-tight">
              3
            </span>
            <p className="text-[11px] text-[#6F6A64] font-medium leading-tight">
              Potential Protections
            </p>
          </div>
        </TiltCard>

        {/* Metric 4: 1 Clause Conflict */}
        <TiltCard
          maxTilt={10}
          scale={1.02}
          onClick={() => navigateTo('compare')}
          className="glass-card rounded-2xl border border-white/90 shadow-xs cursor-pointer hover:border-blue-300/80 transition-colors p-4 flex items-center gap-3 group"
        >
          <div 
            style={{ transform: 'translateZ(16px)' }}
            className="w-8 h-8 rounded-xl bg-blue-50/90 text-blue-600 border border-blue-200/80 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
          >
            <FileText className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div style={{ transform: 'translateZ(12px)' }}>
            <span className="text-xl font-extrabold text-[#151515] group-hover:text-blue-600 transition-colors block leading-tight">
              1
            </span>
            <p className="text-[11px] text-[#6F6A64] font-medium leading-tight">
              Clause Conflict
            </p>
          </div>
        </TiltCard>

        {/* Metric 5: Overall Document Score (Circular Gauge with 3D Depth) */}
        <TiltCard
          maxTilt={10}
          scale={1.02}
          onClick={() => setShowScoreInfo(!showScoreInfo)}
          className="glass-card rounded-2xl border border-white/90 shadow-xs cursor-pointer hover:border-[#FF6B22]/40 transition-colors p-3.5 flex items-center justify-between gap-2 relative group"
        >
          <div style={{ transform: 'translateZ(12px)' }} className="space-y-0.5">
            <span className="text-[10px] text-[#6F6A64] font-bold block uppercase tracking-wider">
              Overall Document Score
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-[#FF6B22]">
                Moderate Risk
              </span>
              <Info className="w-3 h-3 text-stone-400 group-hover:text-stone-600 transition-colors" />
              <ChevronRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Circular SVG Gauge with 3D shadow */}
          <div 
            style={{ transform: 'translateZ(20px)' }}
            className="relative w-12 h-12 flex items-center justify-center shrink-0 drop-shadow-xs"
          >
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#EFE9E1"
                strokeWidth="3.2"
              />
              {/* Progress circle */}
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="#FF8A3D"
                strokeWidth="3.2"
                strokeDasharray="94.2"
                strokeDashoffset="26.37" // 72%
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <span className="absolute text-[10px] font-extrabold text-[#151515]">
              72/100
            </span>
          </div>
        </TiltCard>
      </div>

      {/* Info popover for Score Methodology */}
      <AnimatePresence>
        {showScoreInfo && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="p-4 rounded-2xl glass-panel border border-white shadow-xl text-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#151515]">About Document Review Score</span>
              <button 
                onClick={() => setShowScoreInfo(false)}
                className="w-5 h-5 rounded-full hover:bg-stone-100/80 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[11px] text-[#6F6A64] leading-relaxed">
              This score is an objective document review indicator based on clause clarity, balance of obligations, and ambiguity detection. It is <strong className="text-stone-800">not</strong> a prediction of legal outcome or judicial ruling.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

