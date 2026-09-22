import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileUp, 
  Scale, 
  Layers, 
  Lightbulb, 
  ArrowRight,
  ShieldCheck,
  X,
  FileCheck2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TiltCard } from '../common/TiltCard';

export const DesktopQuickActions: React.FC = () => {
  const { navigateTo } = useApp();
  const [showTipsModal, setShowTipsModal] = useState(false);

  const actions = [
    {
      id: 'upload',
      title: 'Upload Document',
      subtitle: 'Analyze with AI',
      icon: <FileUp className="w-5 h-5 text-[#FF6B22]" />,
      iconBg: 'bg-orange-100/80 border-orange-200/60',
      action: () => navigateTo('upload'),
    },
    {
      id: 'scenario',
      title: 'Try a Scenario',
      subtitle: 'What could happen?',
      icon: <Scale className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-100/80 border-emerald-200/60',
      action: () => navigateTo('scenario-input'),
    },
    {
      id: 'compare',
      title: 'Compare Documents',
      subtitle: 'Two documents',
      icon: <Layers className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-100/80 border-blue-200/60',
      action: () => navigateTo('compare'),
    },
    {
      id: 'compliance-audit',
      title: 'Compliance Audit',
      subtitle: 'Multi-Agent Auditor',
      icon: <ShieldCheck className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-100/80 border-purple-200/60',
      action: () => navigateTo('compliance-audit'),
    },
    {
      id: 'tips',
      title: 'Tips & Guides',
      subtitle: 'Know your rights',
      icon: <Lightbulb className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-100/80 border-amber-200/60',
      action: () => setShowTipsModal(true),
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {actions.map((act) => (
          <TiltCard
            key={act.id}
            maxTilt={8}
            scale={1.02}
            onClick={act.action}
            className="glass-card p-4 rounded-3xl border border-white/90 shadow-md shadow-[#46321e]/5 flex items-center justify-between cursor-pointer hover:border-[#FF6B22]/35 transition-colors text-left group"
          >
            <div className="flex items-center gap-3">
              <div 
                style={{ transform: 'translateZ(16px)' }}
                className={`w-10 h-10 rounded-2xl ${act.iconBg} border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-108 transition-transform`}
              >
                {act.icon}
              </div>
              <div style={{ transform: 'translateZ(10px)' }}>
                <h4 className="text-xs font-bold text-[#151515] group-hover:text-[#FF6B22] transition-colors">
                  {act.title}
                </h4>
                <p className="text-[11px] text-[#6F6A64]">
                  {act.subtitle}
                </p>
              </div>
            </div>

            <div 
              style={{ transform: 'translateZ(14px)' }}
              className="w-7 h-7 rounded-full bg-white/90 border border-stone-200/70 flex items-center justify-center text-stone-400 group-hover:text-white group-hover:bg-[#FF6B22] group-hover:border-[#FF6B22] transition-all shrink-0 shadow-2xs"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </TiltCard>
        ))}
      </div>

      {/* Tips & Guides Modal */}
      {showTipsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-xs">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-white shadow-xl space-y-4 text-left relative"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#151515]">Tenant Legal Rights & Guide</h3>
                  <p className="text-[11px] text-[#6F6A64]">Key principles before signing rental contracts</p>
                </div>
              </div>
              <button
                onClick={() => setShowTipsModal(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-stone-700 max-h-96 overflow-y-auto pr-1">
              <div className="p-3 rounded-2xl bg-white/80 border border-stone-200/80 space-y-1">
                <span className="font-bold text-[#151515] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  1. Lock-in Period Fairness
                </span>
                <p className="text-[11px] text-[#6F6A64]">
                  Standard lock-in periods should not exceed 3–6 months. Ensure forfeiture penalties do not exceed 1 month's actual rent loss.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-stone-200/80 space-y-1">
                <span className="font-bold text-[#151515] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  2. Security Deposit Refund Clause
                </span>
                <p className="text-[11px] text-[#6F6A64]">
                  Always verify a strict timebound clause (14–21 days) for security deposit refund after handover, excluding normal wear and tear.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/80 border border-stone-200/80 space-y-1">
                <span className="font-bold text-[#151515] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  3. Escalation Caps
                </span>
                <p className="text-[11px] text-[#6F6A64]">
                  Annual rent escalation should be clearly capped (typically 5% to 7%) and require 30 days prior written notice.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowTipsModal(false)}
                className="px-4 py-2 rounded-xl bg-[#151515] text-white text-xs font-semibold cursor-pointer hover:bg-black transition-colors"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};
