import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  HelpCircle, 
  Scale, 
  AlertTriangle 
} from 'lucide-react';
import { ComplianceAuditRecord } from '../../types/complianceAuditTypes';

interface ComplianceAuditStatsProps {
  audit: ComplianceAuditRecord | null;
  onFilterSelect?: (filter: string) => void;
  activeFilter?: string;
}

export const ComplianceAuditStats: React.FC<ComplianceAuditStatsProps> = ({
  audit,
  onFilterSelect,
  activeFilter = 'all'
}) => {
  if (!audit) return null;

  const summary = audit.summary || audit.summaryMetrics || {
    totalFindings: audit.findings?.length || 0,
    highPriorityCount: 0,
    mediumPriorityCount: 0,
    protectionCount: 0,
    disputedCount: 0,
    humanReviewCount: 0
  };

  const total = summary.totalFindings ?? audit.findings?.length ?? 0;
  const highRisk = (summary.highPriorityCount ?? 0) || ((summary.criticalFindings ?? 0) + (summary.highFindings ?? 0));
  const disputed = summary.disputedCount ?? summary.disputedFindings ?? 0;
  const humanReview = summary.humanReviewCount ?? summary.humanReviewRecommendedCount ?? 0;
  const confirmed = summary.confirmedFindings ?? summary.protectionCount ?? 0;

  const stats = [
    {
      id: 'all',
      label: 'Total Findings',
      value: total,
      subtext: 'Audited across clauses',
      icon: <Scale className="w-4 h-4 text-[#FF6B22]" />,
      bg: 'bg-white/80 border-stone-200/80',
      activeBorder: 'border-[#FF6B22]'
    },
    {
      id: 'high-risk',
      label: 'High & Critical Risk',
      value: highRisk,
      subtext: 'Severe exposure items',
      icon: <ShieldAlert className="w-4 h-4 text-red-500" />,
      bg: 'bg-red-50/50 border-red-200/60',
      activeBorder: 'border-red-400'
    },
    {
      id: 'disputed',
      label: 'Disputed Findings',
      value: disputed,
      subtext: 'Challenged by Skeptic',
      icon: <HelpCircle className="w-4 h-4 text-amber-500" />,
      bg: 'bg-amber-50/50 border-amber-200/60',
      activeBorder: 'border-amber-400'
    },
    {
      id: 'human-review',
      label: 'Human Legal Review',
      value: humanReview,
      subtext: 'Escalation required',
      icon: <AlertTriangle className="w-4 h-4 text-purple-600" />,
      bg: 'bg-purple-50/50 border-purple-200/60',
      activeBorder: 'border-purple-400'
    },
    {
      id: 'confirmed',
      label: 'Confirmed Consensus',
      value: confirmed,
      subtext: 'Multi-agent agreement',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50/50 border-emerald-200/60',
      activeBorder: 'border-emerald-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-left">
      {stats.map((s) => {
        const isSelected = activeFilter === s.id;
        return (
          <div
            key={s.id}
            onClick={() => onFilterSelect && onFilterSelect(s.id)}
            className={`p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${s.bg} ${
              isSelected ? `ring-2 ring-offset-1 ring-[#FF6B22] ${s.activeBorder}` : 'hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-stone-600 truncate">{s.label}</span>
              <div className="p-1 rounded-lg bg-white/90 shadow-2xs">
                {s.icon}
              </div>
            </div>
            <div className="text-xl font-extrabold text-[#151515] tracking-tight">{s.value}</div>
            <div className="text-[10px] text-stone-500 mt-0.5 truncate">{s.subtext}</div>
          </div>
        );
      })}
    </div>
  );
};
