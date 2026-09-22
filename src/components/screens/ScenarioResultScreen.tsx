import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  FileText, 
  ShieldAlert, 
  Clock, 
  IndianRupee, 
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';
import { GlassCard } from '../common/GlassCard';
import { GlassBadge } from '../common/GlassBadge';
import { GlassButton } from '../common/GlassButton';
import { RENTAL_CLAUSES } from '../../data/initialData';

export const ScenarioResultScreen: React.FC = () => {
  const { 
    activeScenario, 
    navigateTo, 
    openEvidence 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Summary' | 'Timeline' | 'Financial' | 'Clauses'>('Summary');

  return (
    <div className="min-h-screen pb-28 max-w-md mx-auto">
      <AppHeader title="Scenario Result" />

      <div className="px-4 pt-2 space-y-4 text-left">
        {/* Top Priority Warning Alert Card */}
        <motion.div
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FFF2EA] to-white border border-[#FF6B22]/30 flex items-center gap-3 shadow-xs"
        >
          <div className="w-8 h-8 rounded-xl bg-[#FF6B22]/15 flex items-center justify-center text-[#FF6B22] shrink-0">
            <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#FF6B22] uppercase tracking-wider">
              Stress-Test Outcome
            </span>
            <h3 className="text-xs font-bold text-[#151515]">
              {activeScenario.title}
            </h3>
          </div>
        </motion.div>

        {/* Tab Navigation: Summary, Timeline, Financial, Clauses */}
        <div className="glass-panel p-1 rounded-2xl flex items-center justify-between border border-white/80">
          {(['Summary', 'Timeline', 'Financial', 'Clauses'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#FF6B22] shadow-xs font-bold'
                    : 'text-[#6F6A64] hover:text-[#151515]'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* TAB 1: SUMMARY (The primary screen in reference image) */}
        {activeTab === 'Summary' && (
          <div className="space-y-4">
            {/* Main Result Card */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-card p-5 rounded-3xl border border-white/80 shadow-md space-y-3"
            >
              <span className="text-xs font-semibold text-[#6F6A64]">
                You may need to pay:
              </span>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-[#FF6B22] tracking-tight">
                  {activeScenario.totalFinancialImpact}
                </span>
                <span className="text-xs text-[#6F6A64] font-medium">
                  (Unpaid rent for 3 months)
                </span>
              </div>

              {/* Sub warning badge */}
              <div className="p-3 rounded-2xl bg-[#FFF8F2] border border-[#FF6B22]/20 flex items-start gap-2 text-xs text-[#151515]">
                <FileText className="w-4 h-4 text-[#FF6B22] shrink-0 mt-0.5" />
                <span>
                  Plus potential penalties and damages as per the agreement.
                </span>
              </div>
            </motion.div>

            {/* Key Points Section */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
                Key Points
              </h4>

              <div className="space-y-2">
                {activeScenario.keyPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="glass-card p-3 rounded-2xl flex items-start gap-3 border border-white/80"
                  >
                    <div className="w-7 h-7 rounded-xl bg-orange-50 border border-orange-200/50 flex items-center justify-center text-[#FF6B22] shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-xs text-[#151515] font-medium leading-snug pt-1">
                      {point}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Action CTA: Prepare Lawyer Brief */}
            <div className="pt-2">
              <GlassButton
                fullWidth
                size="md"
                variant="primary"
                icon={<Briefcase className="w-4 h-4" />}
                onClick={() => navigateTo('lawyer-kit')}
              >
                Prepare Lawyer Brief
              </GlassButton>
            </div>
          </div>
        )}

        {/* TAB 2: TIMELINE */}
        {activeTab === 'Timeline' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
              Sequence of Contractual Consequences
            </h4>
            <div className="space-y-3 pl-2 relative">
              {activeScenario.timeline.map((item, idx) => (
                <div key={item.step} className="relative flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#FF6B22] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                    {item.step}
                  </div>
                  <div className="glass-card p-3 rounded-2xl border border-white/80 flex-1 text-xs">
                    <span className="text-[10px] font-bold text-[#FF6B22] uppercase block">
                      {item.time}
                    </span>
                    <p className="font-semibold text-[#151515] mt-0.5">
                      {item.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FINANCIAL */}
        {activeTab === 'Financial' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
              Estimated Financial Breakdown
            </h4>
            <div className="space-y-2">
              {activeScenario.financialBreakdown.map((item, idx) => (
                <div key={idx} className="glass-card p-3.5 rounded-2xl border border-white/80 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-[#151515]">{item.label}</h5>
                    <p className="text-[11px] text-[#6F6A64]">{item.note}</p>
                  </div>
                  <span className="font-bold text-[#FF6B22] text-sm shrink-0">
                    {item.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CLAUSES */}
        {activeTab === 'Clauses' && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
              Relevant Extracted Clauses
            </h4>
            {activeScenario.relevantClauses.map((rc, idx) => (
              <div
                key={idx}
                onClick={() => {
                  const match = RENTAL_CLAUSES.find(c => c.section.includes(rc.section.split(' ')[0]));
                  if (match) openEvidence(match);
                }}
                className="glass-card glass-card-hover p-3.5 rounded-2xl border border-white/80 cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FF6B22]">{rc.section}</span>
                  <GlassBadge variant="neutral" size="sm">Page {rc.page}</GlassBadge>
                </div>
                <h5 className="text-xs font-bold text-[#151515]">{rc.title}</h5>
                <p className="text-[11px] text-[#6F6A64] leading-relaxed italic">
                  "{rc.excerpt}"
                </p>
                <div className="text-[11px] text-[#FF6B22] font-semibold hover:underline pt-1 flex items-center gap-1">
                  <span>Inspect Full Clause</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
