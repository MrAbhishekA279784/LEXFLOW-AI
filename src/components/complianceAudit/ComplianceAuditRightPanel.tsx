import React from 'react';
import { 
  Scale, 
  Bot, 
  Briefcase, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert,
  AlertTriangle,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ComplianceAuditRecord } from '../../types/complianceAuditTypes';

interface ComplianceAuditRightPanelProps {
  audit: ComplianceAuditRecord | null;
}

export const ComplianceAuditRightPanel: React.FC<ComplianceAuditRightPanelProps> = ({ audit }) => {
  const { navigateTo, setScenarioInputText, setActiveDocTab } = useApp();

  const summary = audit?.summary || audit?.summaryMetrics;
  const humanReviewCount = summary?.humanReviewCount ?? summary?.humanReviewRecommendedCount ?? (audit?.findings ? audit.findings.filter(f => f.humanReviewRecommended).length : 0);
  const totalFindings = summary?.totalFindings ?? audit?.findings?.length ?? 0;
  const highRiskCount = (summary?.highPriorityCount ?? 0) || ((summary?.criticalFindings ?? 0) + (summary?.highFindings ?? 0));

  const quickScenarios = [
    {
      title: 'Contested 2-Month Penalty',
      prompt: 'What happens if landlord demands full 2-month penalty during 6-month lock-in under Indian Contract Act Section 74?'
    },
    {
      title: 'Deposit Forfeiture Dispute',
      prompt: 'Can landlord forfeit entire ₹75,000 security deposit without itemized repair bills under Model Tenancy Act?'
    },
    {
      title: 'Jurisdiction & Arbitral Seat',
      prompt: 'Can dispute resolution clause force Bangalore jurisdiction if rental property is in Mumbai?'
    }
  ];

  const handleLaunchScenario = (promptText: string) => {
    setScenarioInputText(promptText);
    navigateTo('scenario-input');
  };

  const handleLaunchAssistant = (query: string) => {
    navigateTo('assistant');
  };

  return (
    <div className="space-y-4 text-left">
      {/* 1. Audit Health & Risk Status */}
      <div className="glass-card p-4 rounded-3xl border border-white/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-800">Compliance Health</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
            Active
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/70 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">Audited Clauses:</span>
            <strong className="text-stone-900">{totalFindings} findings</strong>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">Critical / High:</span>
            <strong className="text-red-600">{highRiskCount} items</strong>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">Human Escalation:</span>
            <strong className="text-purple-700">{humanReviewCount} items</strong>
          </div>
        </div>

        {humanReviewCount > 0 ? (
          <button
            onClick={() => navigateTo('lawyer-kit')}
            className="w-full py-2.5 px-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Open Lawyer Prep-Kit</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setActiveDocTab('Clauses');
              navigateTo('legal-graph');
            }}
            className="w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileCheck className="w-3.5 h-3.5 text-[#FF6B22]" />
            <span>View All Clauses</span>
          </button>
        )}
      </div>

      {/* 2. Quick What-If Stress Tests */}
      <div className="glass-card p-4 rounded-3xl border border-white/80 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xl bg-orange-100 text-[#FF6B22] flex items-center justify-center">
            <Scale className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-bold text-stone-800">
            Quick What-If Tests
          </h4>
        </div>

        <p className="text-[11px] text-stone-500">
          Simulate statutory defense outcomes on audited provisions:
        </p>

        <div className="space-y-2">
          {quickScenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => handleLaunchScenario(sc.prompt)}
              className="w-full p-2.5 rounded-2xl bg-white hover:bg-orange-50/70 border border-stone-200/80 hover:border-[#FF6B22]/40 text-left transition-all shadow-2xs group cursor-pointer flex items-center justify-between gap-2"
            >
              <div className="min-w-0 flex-1">
                <h5 className="text-[11px] font-bold text-stone-800 group-hover:text-[#FF6B22] truncate">
                  {sc.title}
                </h5>
                <p className="text-[10px] text-stone-400 line-clamp-1">
                  {sc.prompt}
                </p>
              </div>
              <ArrowRight className="w-3 h-3 text-stone-400 group-hover:text-[#FF6B22] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. AI Legal Assistant Shortcut */}
      <div className="glass-card p-4 rounded-3xl border border-white/80 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <h4 className="text-xs font-bold text-stone-800">
            AI Legal Assistant
          </h4>
        </div>

        <p className="text-[11px] text-stone-500">
          Have questions regarding how the Reviewer & Skeptic agents reached consensus?
        </p>

        <button
          onClick={() => handleLaunchAssistant('Explain the compliance audit findings in plain language')}
          className="w-full py-2 px-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Legal Assistant</span>
        </button>
      </div>
    </div>
  );
};
