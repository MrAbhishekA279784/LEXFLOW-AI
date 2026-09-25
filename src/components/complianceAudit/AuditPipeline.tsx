import React, { useState } from 'react';
import { 
  Bot, 
  HelpCircle, 
  Swords, 
  FileSearch, 
  CheckCircle2, 
  Loader2, 
  Scale,
  ChevronRight,
  ChevronDown,
  Info,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { ComplianceAuditRecord } from '../../types/complianceAuditTypes';

export type AuditPipelineStageId = 'review' | 'skeptic' | 'debate' | 'evidence' | 'consensus';

export interface AuditPipelineStage {
  id: AuditPipelineStageId;
  stepNumber: string;
  name: string;
  title: string;
  subtitle: string;
  detail: string;
  icon: React.ReactNode;
  activeStatuses: string[];
}

export interface AuditPipelineProps {
  status?: ComplianceAuditRecord['status'] | string;
  currentStageId?: AuditPipelineStageId;
  roundCount?: number;
  findingCount?: number;
  disputedCount?: number;
  evidenceCount?: number;
  onSelectStage?: (stageId: AuditPipelineStageId, index: number) => void;
  className?: string;
  compact?: boolean;
}

export const AuditPipeline: React.FC<AuditPipelineProps> = ({
  status = 'completed',
  currentStageId,
  roundCount = 2,
  findingCount = 4,
  disputedCount = 2,
  evidenceCount = 6,
  onSelectStage,
  className = '',
  compact = false
}) => {
  const [hoveredStageId, setHoveredStageId] = useState<string | null>(null);
  const [expandedMobileStageId, setExpandedMobileStageId] = useState<string | null>(null);

  const stages: AuditPipelineStage[] = [
    {
      id: 'review',
      stepNumber: '01',
      name: 'Review',
      title: 'Reviewer Agent',
      subtitle: 'Exposure Extraction',
      detail: `Identifies potential statutory exposures, penalty liabilities, and uncalibrated clauses (${findingCount} claims).`,
      icon: <Bot className="w-3.5 h-3.5" />,
      activeStatuses: ['reviewer_running', 'skeptic_running', 'debating', 'verifying_evidence', 'completed']
    },
    {
      id: 'skeptic',
      stepNumber: '02',
      name: 'Skeptic',
      title: 'Skeptic Agent',
      subtitle: 'Counter-Examination',
      detail: `Subject findings to 9 standard audit questions, raising counter-interpretations and identifying factual gaps (${disputedCount} disputed).`,
      icon: <HelpCircle className="w-3.5 h-3.5" />,
      activeStatuses: ['skeptic_running', 'debating', 'verifying_evidence', 'completed']
    },
    {
      id: 'debate',
      stepNumber: '03',
      name: 'Debate',
      title: 'Debate Engine',
      subtitle: `${roundCount}-Round Rebuttal`,
      detail: 'Controlled adversarial argumentation protocol with early stopping upon argument convergence.',
      icon: <Swords className="w-3.5 h-3.5" />,
      activeStatuses: ['debating', 'verifying_evidence', 'completed']
    },
    {
      id: 'evidence',
      stepNumber: '04',
      name: 'Evidence',
      title: 'Evidence Verification',
      subtitle: 'Traceability Audit',
      detail: `Verifies exact contract clause excerpts and binds authoritative statutory citations (${evidenceCount} sources).`,
      icon: <Scale className="w-3.5 h-3.5" />,
      activeStatuses: ['verifying_evidence', 'completed']
    },
    {
      id: 'consensus',
      stepNumber: '05',
      name: 'Consensus',
      title: 'Consensus & Synthesis',
      subtitle: 'Final Tripartite Output',
      detail: 'Synthesizes calibrated exposure confidence, tripartite breakdown, and flags high-risk lawyer escalations.',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      activeStatuses: ['completed']
    }
  ];

  // Helper to determine stage execution state
  const getStageState = (stage: AuditPipelineStage, index: number) => {
    const isCurrent = 
      (stage.id === 'review' && status === 'reviewer_running') ||
      (stage.id === 'skeptic' && status === 'skeptic_running') ||
      (stage.id === 'debate' && status === 'debating') ||
      (stage.id === 'evidence' && status === 'verifying_evidence') ||
      (currentStageId === stage.id);

    const isCompleted = status === 'completed' || (stage.activeStatuses.includes(status) && !isCurrent);
    const isPending = !isCurrent && !isCompleted;
    const isFailed = status === 'failed';

    return { isCurrent, isCompleted, isPending, isFailed };
  };

  const getStageTag = (stage: AuditPipelineStage, state: { isCurrent: boolean; isCompleted: boolean; isPending: boolean }) => {
    if (state.isCurrent) return 'Active...';
    if (!state.isCompleted) return 'Pending';
    switch (stage.id) {
      case 'review': return `${findingCount} Found`;
      case 'skeptic': return `${disputedCount} Challenged`;
      case 'debate': return 'Converged';
      case 'evidence': return 'Verified';
      case 'consensus': return 'Consensus';
      default: return 'Done';
    }
  };

  return (
    <div 
      aria-label="Audit pipeline progress"
      className={`glass-card p-3 sm:p-4 rounded-2xl border border-white/90 shadow-sm bg-gradient-to-r from-stone-50/90 via-white/95 to-orange-50/40 text-left ${className}`}
    >
      {/* Pipeline Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-stone-200/60">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FF6B22] animate-pulse" />
          <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B22]" /> Audit Pipeline
          </h3>
          <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">
            5 Stages
          </span>
        </div>

        {/* Global Pipeline Status Pill */}
        <div className="flex items-center gap-2">
          {status === 'completed' ? (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pipeline Consensus Verified
            </span>
          ) : status === 'failed' ? (
            <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Pipeline Interrupted
            </span>
          ) : (
            <span className="text-[11px] font-bold text-[#FF6B22] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Live Pipeline Execution...
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DESKTOP / TABLET HORIZONTAL TRACKER (md:flex / sm:grid)               */}
      {/* ========================================================================= */}
      <div className="hidden sm:block relative">
        <div className="grid grid-cols-5 gap-2 relative z-10" role="list">
          {stages.map((stage, idx) => {
            const state = getStageState(stage, idx);
            const isHovered = hoveredStageId === stage.id;
            const tagText = getStageTag(stage, state);

            return (
              <div
                key={stage.id}
                role="listitem"
                onMouseEnter={() => setHoveredStageId(stage.id)}
                onMouseLeave={() => setHoveredStageId(null)}
                onClick={() => onSelectStage?.(stage.id, idx)}
                className={`group relative p-2.5 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  state.isCurrent
                    ? 'bg-orange-50/95 border-[#FF6B22] ring-2 ring-[#FF6B22]/20 shadow-sm scale-[1.02]'
                    : state.isCompleted
                    ? 'bg-white/95 border-emerald-200/90 hover:border-[#FF6B22]/50 hover:bg-stone-50/90 shadow-2xs'
                    : 'bg-stone-100/60 border-stone-200/60 opacity-65 hover:opacity-100 hover:bg-white/80'
                }`}
              >
                {/* Step Top Bar: Icon + Step # + Connector Arrow */}
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shadow-2xs transition-transform group-hover:scale-110 ${
                      state.isCurrent
                        ? 'bg-[#FF6B22] text-white shadow-xs'
                        : state.isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {state.isCurrent ? <Loader2 className="w-3 h-3 animate-spin" /> : stage.icon}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-bold text-stone-400 font-mono">
                      {stage.stepNumber}
                    </span>
                    {idx < stages.length - 1 && (
                      <ChevronRight className="w-3 h-3 text-stone-300 group-hover:text-stone-400 transition-colors" />
                    )}
                  </div>
                </div>

                {/* Stage Titles */}
                <div>
                  <h4 className="text-[11px] font-bold text-stone-900 group-hover:text-[#FF6B22] transition-colors leading-tight truncate">
                    {stage.name}
                  </h4>
                  <p className="text-[10px] text-stone-500 mt-0.5 leading-tight truncate">
                    {stage.subtitle}
                  </p>
                </div>

                {/* Mini Status Tag */}
                <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between text-[9px]">
                  <span className={`font-semibold ${
                    state.isCurrent 
                      ? 'text-[#FF6B22]' 
                      : state.isCompleted 
                      ? 'text-emerald-700' 
                      : 'text-stone-400'
                  }`}>
                    {tagText}
                  </span>
                  {state.isCompleted && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />}
                </div>

                {/* Tooltip on Hover (Desktop) */}
                {isHovered && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 rounded-xl bg-stone-900 text-white text-[10px] shadow-xl z-30 pointer-events-none transition-all duration-150">
                    <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-stone-700">
                      <span className="font-bold text-orange-300">{stage.title}</span>
                      <span className="text-[9px] text-stone-400 uppercase font-mono">Stage {stage.stepNumber}</span>
                    </div>
                    <p className="text-stone-300 leading-snug">{stage.detail}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE RESPONSIVE VERTICAL STEPPER (< sm:)                            */}
      {/* ========================================================================= */}
      <div className="block sm:hidden space-y-1.5" role="list">
        {stages.map((stage, idx) => {
          const state = getStageState(stage, idx);
          const isExpanded = expandedMobileStageId === stage.id;
          const tagText = getStageTag(stage, state);

          return (
            <div
              key={stage.id}
              role="listitem"
              className={`p-2.5 rounded-xl border transition-all duration-150 ${
                state.isCurrent
                  ? 'bg-orange-50/95 border-[#FF6B22] ring-1 ring-[#FF6B22]/30 shadow-xs'
                  : state.isCompleted
                  ? 'bg-white/95 border-emerald-200/90 shadow-2xs'
                  : 'bg-stone-50/80 border-stone-200/60 opacity-75'
              }`}
            >
              {/* Stepper Node Header */}
              <div 
                onClick={() => {
                  setExpandedMobileStageId(isExpanded ? null : stage.id);
                  onSelectStage?.(stage.id, idx);
                }}
                className="flex items-center justify-between gap-2.5 cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Step Icon Badge */}
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 shadow-2xs ${
                      state.isCurrent
                        ? 'bg-[#FF6B22] text-white'
                        : state.isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-stone-500'
                    }`}
                  >
                    {state.isCurrent ? <Loader2 className="w-3 h-3 animate-spin" /> : stage.icon}
                  </div>

                  {/* Stage Titles */}
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-stone-400 font-bold">
                        {stage.stepNumber}.
                      </span>
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {stage.name} <span className="text-stone-400 font-normal">({stage.title})</span>
                      </h4>
                    </div>
                    <p className="text-[10px] text-stone-500 truncate">
                      {stage.subtitle}
                    </p>
                  </div>
                </div>

                {/* Status Pill & Expand Trigger */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    state.isCurrent
                      ? 'bg-orange-100 text-[#FF6B22]'
                      : state.isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-100 text-stone-500'
                  }`}>
                    {tagText}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isExpanded ? 'rotate-180 text-[#FF6B22]' : ''}`} />
                </div>
              </div>

              {/* Expandable Mobile Stage Detail */}
              {isExpanded && (
                <div className="mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-600 bg-white/60 p-2 rounded-lg space-y-1 animate-fadeIn">
                  <p className="leading-snug">{stage.detail}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AuditPipeline;
