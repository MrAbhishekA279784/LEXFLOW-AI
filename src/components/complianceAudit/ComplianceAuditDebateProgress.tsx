import React from 'react';
import { motion } from 'motion/react';
import { 
  Bot, 
  HelpCircle, 
  Swords, 
  BookOpen, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { ComplianceAuditRecord } from '../../types/complianceAuditTypes';

interface ComplianceAuditDebateProgressProps {
  status: ComplianceAuditRecord['status'];
  roundCount?: number;
}

export const ComplianceAuditDebateProgress: React.FC<ComplianceAuditDebateProgressProps> = ({
  status,
  roundCount = 2
}) => {
  const steps = [
    {
      id: 'reviewer',
      label: 'Reviewer Agent',
      sublabel: 'Audit & Extract Claims',
      icon: <Bot className="w-4 h-4" />,
      activeOn: ['reviewer_running', 'skeptic_running', 'debating', 'verifying_evidence', 'completed'],
      isRunning: status === 'reviewer_running'
    },
    {
      id: 'skeptic',
      label: 'Skeptic Agent',
      sublabel: 'Stress-Test Findings',
      icon: <HelpCircle className="w-4 h-4" />,
      activeOn: ['skeptic_running', 'debating', 'verifying_evidence', 'completed'],
      isRunning: status === 'skeptic_running'
    },
    {
      id: 'debate',
      label: 'Debate Engine',
      sublabel: `${roundCount} Bounded Rounds`,
      icon: <Swords className="w-4 h-4" />,
      activeOn: ['debating', 'verifying_evidence', 'completed'],
      isRunning: status === 'debating'
    },
    {
      id: 'evidence',
      label: 'Evidence Grounding',
      sublabel: 'Indian Precedents & Statutes',
      icon: <BookOpen className="w-4 h-4" />,
      activeOn: ['verifying_evidence', 'completed'],
      isRunning: status === 'verifying_evidence'
    },
    {
      id: 'consensus',
      label: 'Consensus Engine',
      sublabel: 'Risk Score & Human Triage',
      icon: <CheckCircle2 className="w-4 h-4" />,
      activeOn: ['completed'],
      isRunning: false
    }
  ];

  return (
    <div className="glass-card p-4 rounded-3xl border border-white/80 shadow-sm text-left">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-200/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF6B22] animate-pulse" />
          <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
            Multi-Agent Audit Pipeline
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-stone-500">
          {status === 'completed' ? (
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Pipeline Consensus Finalized
            </span>
          ) : status === 'failed' ? (
            <span className="text-red-500 font-bold">Audit Failed</span>
          ) : (
            <span className="text-[#FF6B22] font-bold flex items-center gap-1">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Live Multi-Agent Execution...
            </span>
          )}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
        {steps.map((step, idx) => {
          const isDone = step.activeOn.includes(status) && !step.isRunning;
          const isCurrent = step.isRunning;

          return (
            <div
              key={step.id}
              className={`p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                isCurrent
                  ? 'bg-orange-50/90 border-[#FF6B22] ring-2 ring-[#FF6B22]/30 shadow-xs'
                  : isDone
                  ? 'bg-white/80 border-emerald-200/80'
                  : 'bg-stone-50/60 border-stone-200/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-2xs ${
                    isCurrent
                      ? 'bg-[#FF6B22] text-white'
                      : isDone
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {isCurrent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : step.icon}
                </div>
                <span className="text-[10px] font-bold text-stone-400">0{idx + 1}</span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-[#151515] leading-snug">{step.label}</h5>
                <p className="text-[10px] text-stone-500 mt-0.5 leading-tight">{step.sublabel}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
