import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Check, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';

interface Step {
  id: number;
  label: string;
}

const STEPS: Step[] = [
  { id: 1, label: 'Extracting text' },
  { id: 2, label: 'Identifying key clauses' },
  { id: 3, label: 'Building legal model' },
  { id: 4, label: 'Detecting risks' },
  { id: 5, label: 'Creating action graph' },
  { id: 6, label: 'Finalizing results' }
];

export const AnalyzingScreen: React.FC = () => {
  const { analysisStep, navigateTo, activeDocument } = useApp();

  return (
    <div className="min-h-screen pb-12 max-w-md mx-auto flex flex-col justify-between">
      <div>
        <AppHeader title="Analyzing Document" />

        <div className="px-6 pt-6 space-y-8">
          {/* Document name indicator */}
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6F6A64]">
              Target Contract
            </span>
            <h2 className="text-base font-bold text-[#151515] mt-0.5">
              {activeDocument.name}
            </h2>
          </div>

          {/* Vertical Progress Timeline */}
          <div className="space-y-6 max-w-xs mx-auto text-left relative pl-2">
            {STEPS.map((step, idx) => {
              const isCompleted = step.id < analysisStep;
              const isInProgress = step.id === analysisStep;
              const isPending = step.id > analysisStep;

              return (
                <div key={step.id} className="relative flex items-start gap-4">
                  {/* Connecting vertical line */}
                  {idx < STEPS.length - 1 && (
                    <div 
                      className={`absolute left-4 top-8 w-0.5 h-8 -translate-x-1/2 transition-colors duration-300 ${
                        step.id < analysisStep ? 'bg-[#FF6B22]' : 'bg-stone-200'
                      }`} 
                    />
                  )}

                  {/* Step Indicator Icon */}
                  <div className="shrink-0 relative z-10">
                    {isCompleted ? (
                      <div className="w-8 h-8 rounded-full bg-[#8C3A00] text-white flex items-center justify-center shadow-sm">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    ) : isInProgress ? (
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-[#FF6B22] flex items-center justify-center shadow-md shadow-[#FF6B22]/20">
                        <div className="w-3.5 h-3.5 rounded-full bg-[#FF6B22] animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-stone-300" />
                      </div>
                    )}
                  </div>

                  {/* Step Label and Status */}
                  <div className="pt-0.5">
                    <h4
                      className={`text-sm font-semibold tracking-tight ${
                        isPending ? 'text-stone-400' : 'text-[#151515]'
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-[#6F6A64]">
                      {isCompleted && 'Completed'}
                      {isInProgress && 'In progress...'}
                      {isPending && 'Pending'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Info Card and Instant View */}
      <div className="px-5 pt-6 space-y-4">
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass-card p-4 rounded-2xl flex items-center gap-3 border border-white/80 bg-white/70"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FFF2EA] border border-[#FF6B22]/20 flex items-center justify-center text-[#FF6B22] shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-left text-xs">
            <p className="font-semibold text-[#151515]">This usually takes 1–2 minutes.</p>
            <p className="text-[#6F6A64]">We'll notify you when it's ready.</p>
          </div>
        </motion.div>

        {/* Quick jump for convenience */}
        <button
          onClick={() => navigateTo('legal-graph')}
          className="w-full py-3 rounded-2xl bg-white/80 hover:bg-white text-xs font-semibold text-[#FF6B22] border border-[#FF6B22]/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <span>View Extracted Action Graph</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
