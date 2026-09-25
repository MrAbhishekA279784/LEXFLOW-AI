import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  AlertTriangle, 
  FileText, 
  ExternalLink,
  Briefcase,
  Scale,
  GitBranch,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';
import { GlassBadge } from '../common/GlassBadge';
import { GlassButton } from '../common/GlassButton';
import { RENTAL_CLAUSES } from '../../data/initialData';
import { ScenarioFinancialBreakdown } from '../scenario/ScenarioFinancialBreakdown';
import { ScenarioTimelineCard } from '../scenario/ScenarioTimelineCard';
import { ScenarioLegalChainCard } from '../scenario/ScenarioLegalChainCard';

export const ScenarioResultScreen: React.FC = () => {
  const { 
    activeScenario, 
    navigateTo, 
    openEvidence,
    documents
  } = useApp();

  const [activeTab, setActiveTab] = useState<'Summary' | 'Legal Chain' | 'Timeline' | 'Financial' | 'Clauses' | 'Law'>('Summary');

  if (!activeScenario) {
    return (
      <div className="min-h-screen pb-28 max-w-md mx-auto p-8 text-center space-y-4">
        <p className="text-stone-500 font-semibold text-sm">No active scenario simulation found.</p>
        <GlassButton variant="primary" onClick={() => navigateTo('scenario-input')}>
          Run a What-If Scenario
        </GlassButton>
      </div>
    );
  }

  const handleOpenClauseEvidence = (rc: { section: string; title: string; excerpt: string; page: number; clauseId?: string }) => {
    openEvidence({
      id: rc.clauseId || `cl-${Date.now()}`,
      section: rc.section,
      title: rc.title,
      summary: rc.excerpt,
      fullText: rc.excerpt,
      pageNumber: rc.page || 1,
      riskLevel: 'medium',
      party: 'tenant'
    });
  };

  return (
    <div className="min-h-screen pb-28 max-w-md mx-auto">
      <AppHeader title="Scenario Result" />

      <div className="px-4 pt-2 space-y-4 text-left">
        {/* Top Priority Warning Alert Card */}
        <motion.div
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FFF2EA] to-white border border-[#FF6B22]/30 flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3">
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
          </div>
          {activeScenario.targetNodeIds && activeScenario.targetNodeIds.length > 0 && (
            <button
              onClick={() => navigateTo('action-graph')}
              className="flex items-center gap-1 text-[10px] font-bold text-[#FF6B22] bg-white hover:bg-[#FFEADA] px-2 py-1 rounded-lg border border-[#FF6B22]/30 transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <GitBranch className="w-3 h-3" />
              <span>Graph</span>
            </button>
          )}
        </motion.div>

        {/* Tab Navigation */}
        <div className="glass-panel p-1 rounded-2xl flex items-center justify-between border border-white/80 overflow-x-auto no-scrollbar gap-1">
          {(['Summary', 'Legal Chain', 'Timeline', 'Financial', 'Clauses', 'Law'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[56px] py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer text-center ${
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

        {/* TAB 1: SUMMARY */}
        {activeTab === 'Summary' && (
          <div className="space-y-4">
            {/* Main Result Card */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="glass-card p-5 rounded-3xl border border-white/80 shadow-md space-y-3"
            >
              <span className="text-xs font-semibold text-[#6F6A64]">
                Estimated Financial Impact:
              </span>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#FF6B22] tracking-tight">
                  {activeScenario.totalFinancialImpact}
                </span>
                <span className="text-xs text-[#6F6A64] font-medium">
                  (Total Contractual Exposure)
                </span>
              </div>

              {/* Sub warning badge */}
              <div className="p-3 rounded-2xl bg-[#FFF8F2] border border-[#FF6B22]/20 flex items-start gap-2 text-xs text-[#151515]">
                <FileText className="w-4 h-4 text-[#FF6B22] shrink-0 mt-0.5" />
                <span>
                  Penalties and contractual consequences derived deterministically from source agreement clauses.
                </span>
              </div>
            </motion.div>

            {/* THREE-TIER GROUNDED REASONING */}
            <div className="space-y-3">
              {activeScenario.documentSays && (
                <div className="glass-card p-4 rounded-2xl border border-blue-100 bg-blue-50/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
                    <FileText className="w-3.5 h-3.5 text-blue-700" />
                    <span>Document Says</span>
                  </div>
                  <p className="text-xs text-blue-950 font-medium leading-relaxed">
                    {activeScenario.documentSays}
                  </p>
                </div>
              )}

              {activeScenario.lawSays && (
                <div className="glass-card p-4 rounded-2xl border border-emerald-100 bg-emerald-50/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    <Scale className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Statutory Law / Precedents</span>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                    {activeScenario.lawSays}
                  </p>
                </div>
              )}

              {activeScenario.lexflowAnalysis && (
                <div className="glass-card p-4 rounded-2xl border border-amber-100 bg-amber-50/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>LexFlow Stress-Test Synthesis</span>
                  </div>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {activeScenario.lexflowAnalysis}
                  </p>
                </div>
              )}
            </div>

            {/* Key Points Section */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
                Key Findings
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

            {/* Suggested Next Steps */}
            {activeScenario.suggestedNextSteps && activeScenario.suggestedNextSteps.length > 0 && (
              <div className="space-y-2 pt-1">
                <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
                  Recommended Practical Next Steps
                </h4>
                <div className="space-y-1.5">
                  {activeScenario.suggestedNextSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-stone-700 bg-white/70 p-2.5 rounded-xl border border-stone-200/60 font-medium">
                      <span className="w-4 h-4 rounded-full bg-stone-200 text-stone-800 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal Safety Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-stone-100/80 border border-stone-200 flex items-start gap-2.5 text-[11px] text-stone-600">
              <Info className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
              <p>
                {activeScenario.disclaimer || 'This stress test is an informational scenario analysis based on deterministic contract rules and statutory retrieval. It does not constitute formal legal advice.'}
              </p>
            </div>

            {/* Action CTAs */}
            <div className="pt-2 flex flex-col gap-2">
              {activeScenario.targetNodeIds && activeScenario.targetNodeIds.length > 0 && (
                <GlassButton
                  fullWidth
                  size="md"
                  variant="secondary"
                  icon={<GitBranch className="w-4 h-4" />}
                  onClick={() => navigateTo('action-graph')}
                >
                  Highlight Affected Path in Legal Graph
                </GlassButton>
              )}
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

        {/* TAB 2: LEGAL CHAIN */}
        {activeTab === 'Legal Chain' && (
          <ScenarioLegalChainCard
            normalizedInterpretation={activeScenario.normalizedInterpretation}
            risks={activeScenario.risks}
            protections={activeScenario.protections}
          />
        )}

        {/* TAB 3: TIMELINE */}
        {activeTab === 'Timeline' && (
          <ScenarioTimelineCard
            timeline={activeScenario.timeline}
            onOpenClauseEvidence={(ref) => handleOpenClauseEvidence({ section: ref, title: 'Timeline Clause Ref', excerpt: ref, page: 1 })}
          />
        )}

        {/* TAB 4: FINANCIAL */}
        {activeTab === 'Financial' && (
          <ScenarioFinancialBreakdown
            financialBreakdown={activeScenario.financialBreakdown}
            totalFinancialImpact={activeScenario.totalFinancialImpact}
          />
        )}

        {/* TAB 5: CLAUSES */}
        {activeTab === 'Clauses' && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
              Relevant Extracted Clauses
            </h4>
            {activeScenario.relevantClauses.map((rc, idx) => (
              <div
                key={idx}
                onClick={() => handleOpenClauseEvidence(rc)}
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
                  <span>Inspect Full Clause Evidence</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: APPLICABLE LAW */}
        {activeTab === 'Law' && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
              Applicable Statutory Authorities
            </h4>
            {activeScenario.applicableLaw && activeScenario.applicableLaw.length > 0 ? (
              activeScenario.applicableLaw.map((law, idx) => (
                <div key={idx} className="glass-card p-3.5 rounded-2xl border border-stone-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">{law.actOrCourt}</span>
                    <GlassBadge variant="success" size="sm">{law.sectionOrArticle}</GlassBadge>
                  </div>
                  <h5 className="text-xs font-bold text-[#151515]">{law.title}</h5>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {law.summary}
                  </p>
                  {law.officialSourceUrl && (
                    <a
                      href={law.officialSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-[#FF6B22] font-semibold hover:underline pt-1 flex items-center gap-1"
                    >
                      <span>Official Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-500 text-center">
                No external statutory conflicts triggered for this specific scenario.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
