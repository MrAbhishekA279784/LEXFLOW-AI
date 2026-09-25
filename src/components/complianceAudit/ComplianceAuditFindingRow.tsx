import React from 'react';
import { 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle, 
  ArrowRight, 
  FileText,
  Scale,
  Bot,
  UserCheck
} from 'lucide-react';
import { ComplianceFinding } from '../../types/complianceAuditTypes';

interface ComplianceAuditFindingRowProps {
  finding: ComplianceFinding;
  isSelected?: boolean;
  onSelectFinding: (finding: ComplianceFinding) => void;
}

export const ComplianceAuditFindingRow: React.FC<ComplianceAuditFindingRowProps> = ({
  finding,
  isSelected = false,
  onSelectFinding
}) => {
  const findingId = finding.findingId || finding.id || 'AUDIT-FINDING';
  const sectionRef = finding.affectedClauseRefs?.[0] || finding.clauseReference?.section || 'Clause';
  const clausePage = finding.evidence?.find(e => e.type === 'document')?.page || finding.clauseReference?.pageNumber;
  const synthesisText = finding.lexflowSynthesis || finding.synthesis || finding.reasoning || finding.claim;
  const authorities = finding.legalAuthorities || finding.statutoryAuthorities || [];

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-100 text-red-700 border border-red-200">
            Critical
          </span>
        );
      case 'high':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-orange-100 text-orange-700 border border-orange-200">
            High
          </span>
        );
      case 'medium':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700 border border-amber-200">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-stone-100 text-stone-600 border border-stone-200">
            Low
          </span>
        );
    }
  };

  const getConsensusBadge = (status: string) => {
    switch (status) {
      case 'DISPUTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1 shrink-0">
            <HelpCircle className="w-2.5 h-2.5" /> Disputed
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-2.5 h-2.5" /> Confirmed
          </span>
        );
      case 'INSUFFICIENT_EVIDENCE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1 shrink-0">
            <AlertTriangle className="w-2.5 h-2.5" /> Factual Gaps
          </span>
        );
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-2.5 h-2.5" /> Partial
          </span>
        );
      case 'NEUTRALIZED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1 shrink-0">
            <CheckCircle2 className="w-2.5 h-2.5" /> Neutralized
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => onSelectFinding(finding)}
      className={`glass-card p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left group ${
        isSelected
          ? 'bg-orange-50/70 border-[#FF6B22] ring-2 ring-[#FF6B22]/20 shadow-sm'
          : 'border-white/80 hover:border-[#FF6B22]/40 hover:bg-white/95 shadow-xs'
      }`}
    >
      {/* Left Info & Title */}
      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {getSeverityBadge(finding.severity)}
          <span className="text-[11px] font-semibold text-stone-500 font-mono">
            {sectionRef} {clausePage ? `• Page ${clausePage}` : ''}
          </span>
          {getConsensusBadge(finding.consensusStatus)}
          {finding.humanReviewRecommended && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-0.5">
              <UserCheck className="w-2.5 h-2.5" /> Human Review
            </span>
          )}
        </div>

        <h4 className="text-xs sm:text-sm font-bold text-[#151515] group-hover:text-[#FF6B22] transition-colors line-clamp-1">
          {finding.title}
        </h4>

        <p className="text-[11px] text-[#6F6A64] line-clamp-1">
          {synthesisText}
        </p>

        {/* Compact Agent Consensus Indicators */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-stone-500 font-medium">
          <span className="flex items-center gap-1 text-purple-700">
            <Bot className="w-3 h-3 text-purple-600" /> Reviewer ✓
          </span>
          <span className="flex items-center gap-1 text-amber-700">
            <HelpCircle className="w-3 h-3 text-amber-600" /> Skeptic ✓
          </span>
          {authorities.length > 0 && (
            <span className="flex items-center gap-1 text-emerald-700">
              <Scale className="w-3 h-3 text-emerald-600" /> {authorities.length} Legal Source{authorities.length > 1 ? 's' : ''} ✓
            </span>
          )}
        </div>
      </div>

      {/* Right Action Trigger */}
      <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/50 shrink-0">
        <span className="sm:hidden text-[10px] font-mono text-stone-400">
          {findingId}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectFinding(finding);
          }}
          className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-[#FF6B22] text-[#FF6B22] hover:text-white border border-[#FF6B22]/30 hover:border-[#FF6B22] text-xs font-bold transition-all flex items-center gap-1 shadow-2xs group-hover:bg-[#FF6B22] group-hover:text-white group-hover:border-[#FF6B22]"
        >
          <span>View Finding</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
