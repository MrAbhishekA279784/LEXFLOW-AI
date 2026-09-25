import React, { useState } from 'react';
import { 
  FileText, 
  ChevronDown, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Scale, 
  SlidersHorizontal,
  Bot,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ComplianceAuditRecord } from '../../types/complianceAuditTypes';
import { formatSafeDate } from '../../utils/dateUtils';

interface ComplianceAuditLeftSidebarProps {
  audit: ComplianceAuditRecord | null;
  activeFilter: string;
  selectedCategory: string;
  onFilterSelect: (filter: string) => void;
  onCategorySelect: (category: string) => void;
}

export const ComplianceAuditLeftSidebar: React.FC<ComplianceAuditLeftSidebarProps> = ({
  audit,
  activeFilter,
  selectedCategory,
  onFilterSelect,
  onCategorySelect,
}) => {
  const { activeDocument, documents, setActiveDocument } = useApp();
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState(false);

  const summary = audit?.summary || audit?.summaryMetrics;
  const humanReviewCount = summary?.humanReviewCount ?? summary?.humanReviewRecommendedCount ?? (audit?.findings ? audit.findings.filter(f => f.humanReviewRecommended).length : 0);
  const totalFindings = summary?.totalFindings ?? audit?.findings?.length ?? 0;
  const highRiskCount = (summary?.highPriorityCount ?? 0) || ((summary?.criticalFindings ?? 0) + (summary?.highFindings ?? 0));
  const disputedCount = summary?.disputedFindingsCount ?? (audit?.findings ? audit.findings.filter(f => f.consensusStatus === 'DISPUTED').length : 0);
  const confirmedCount = summary?.confirmedFindingsCount ?? (audit?.findings ? audit.findings.filter(f => f.consensusStatus === 'CONFIRMED').length : 0);

  // Calibrated consensus health percentage
  const consensusPercentage = totalFindings > 0 
    ? Math.round((confirmedCount / totalFindings) * 100) 
    : 85;

  return (
    <aside aria-label="Audit summary and filters" className="space-y-4 text-left">
      {/* 1. Target Document Profile Card */}
      <div className="glass-card p-4 rounded-3xl border border-white/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
            Target Document
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-[#FF6B22]/10 text-[#FF6B22] border border-[#FF6B22]/20">
            {activeDocument.type.toUpperCase()}
          </span>
        </div>

        {/* Document Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white/90 hover:bg-white border border-stone-200/80 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-xl bg-orange-100 text-[#FF6B22] flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0 text-left">
                <h4 className="text-xs font-bold text-stone-900 group-hover:text-[#FF6B22] transition-colors truncate">
                  {activeDocument.name}
                </h4>
                <p className="text-[10px] text-stone-400">
                  {activeDocument.size} • {activeDocument.clauseCount || 14} Clauses
                </p>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#FF6B22] shrink-0" />
          </button>

          {isDocDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-full glass-panel p-2 rounded-2xl border border-white shadow-xl z-30 space-y-1">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 block py-1">
                Select Document to Audit:
              </span>
              {documents.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setActiveDocument(d);
                    setIsDocDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                    d.id === activeDocument.id
                      ? 'bg-[#FF6B22]/10 text-[#FF6B22] font-bold'
                      : 'hover:bg-white/80 text-stone-700'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{d.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Document Stats Overview */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/60">
            <span className="text-[10px] text-stone-500 block">Clauses Analyzed</span>
            <strong className="text-xs font-bold text-stone-800">
              {activeDocument.clauseCount || 14} Clauses
            </strong>
          </div>
          <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/60">
            <span className="text-[10px] text-stone-500 block">Audit Date</span>
            <strong className="text-xs font-bold text-stone-800 truncate block">
              {formatSafeDate(audit?.createdAt, 'Active')}
            </strong>
          </div>
        </div>
      </div>

      {/* 2. Audit Health & Consensus Meter Card */}
      <div className="glass-card p-4 rounded-3xl border border-white/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B22]" /> Consensus Meter
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
            Dual-Verified
          </span>
        </div>

        {/* Progress bar and score */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-stone-500">Consensus Convergence</span>
            <strong className="text-stone-900">{consensusPercentage}%</strong>
          </div>
          <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#FF6B22] to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${consensusPercentage}%` }}
            />
          </div>
        </div>

        {/* Metric breakdown list */}
        <div className="space-y-1.5 pt-1">
          <button
            type="button"
            onClick={() => onFilterSelect(activeFilter === 'all' ? 'all' : 'all')}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'all' ? 'bg-orange-50/80 text-[#FF6B22]' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-stone-400" /> Total Findings
            </span>
            <strong className="text-stone-900">{totalFindings}</strong>
          </button>

          <button
            type="button"
            onClick={() => onFilterSelect(activeFilter === 'high-risk' ? 'all' : 'high-risk')}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'high-risk' ? 'bg-red-50 text-red-700 font-bold' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Critical / High Risk
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
              {highRiskCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterSelect(activeFilter === 'disputed' ? 'all' : 'disputed')}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'disputed' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-purple-500" /> Skeptic Disputed
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
              {disputedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onFilterSelect(activeFilter === 'human-review' ? 'all' : 'human-review')}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeFilter === 'human-review' ? 'bg-amber-50 text-amber-800 font-bold' : 'hover:bg-stone-50 text-stone-700'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Lawyer Escalations
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
              {humanReviewCount}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Category Filter Quick Switcher */}
      <div className="glass-card p-4 rounded-3xl border border-white/80 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF6B22]" /> Exposure Categories
          </span>
        </div>

        <div className="space-y-1">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'penalty_exposure', label: 'Late Fees & Penalties' },
            { id: 'termination_exposure', label: 'Lock-in & Forfeitures' },
            { id: 'unfavorable_provision', label: 'Deposit Deductions' },
            { id: 'compliance_risk', label: 'Statutory Compliance' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategorySelect(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-between ${
                selectedCategory === cat.id
                  ? 'bg-[#FF6B22] text-white font-bold shadow-2xs'
                  : 'hover:bg-white text-stone-700'
              }`}
            >
              <span>{cat.label}</span>
              {selectedCategory === cat.id && (
                <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Multi-Agent Engine Spec Box */}
      <div className="p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200/70 text-[11px] text-stone-500 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-stone-800">
          <Bot className="w-3.5 h-3.5 text-[#FF6B22]" />
          <span>Active Audit Engine</span>
        </div>
        <p className="leading-snug text-stone-500">
          Reviewer & Skeptic agents evaluate clauses independently under the Indian Contract Act 1872 & Model Tenancy Act.
        </p>
      </div>
    </aside>
  );
};
