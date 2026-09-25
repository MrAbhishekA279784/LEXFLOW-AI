import React from 'react';
import { Clock } from 'lucide-react';

export interface TimelineStepItem {
  step: number;
  time: string;
  event: string;
  status: 'past' | 'trigger' | 'consequence';
  clauseRef?: string;
}

interface ScenarioTimelineCardProps {
  timeline: TimelineStepItem[];
  onOpenClauseEvidence?: (clauseRef: string) => void;
}

export const ScenarioTimelineCard: React.FC<ScenarioTimelineCardProps> = ({
  timeline,
  onOpenClauseEvidence,
}) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
        Sequential Risk Progression Timeline
      </h4>

      <div className="relative pl-4 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
        {timeline.map((step) => {
          const isTrigger = step.status === 'trigger';
          const isPast = step.status === 'past';

          return (
            <div key={step.step} className="relative flex items-start gap-3">
              <div
                className={`w-4 h-4 rounded-full border-2 absolute -left-4 top-1 flex items-center justify-center shrink-0 ${
                  isTrigger
                    ? 'bg-[#FF6B22] border-orange-300 ring-2 ring-[#FF6B22]/20'
                    : isPast
                    ? 'bg-stone-400 border-stone-200'
                    : 'bg-amber-500 border-amber-200'
                }`}
              />

              <div className="glass-card p-3 rounded-2xl flex-1 border border-white/80 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#151515] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#FF6B22]" />
                    {step.time}
                  </span>
                  {step.clauseRef && (
                    <button
                      type="button"
                      onClick={() => onOpenClauseEvidence?.(step.clauseRef!)}
                      className="text-[10px] font-extrabold text-[#FF6B22] bg-orange-50 px-2 py-0.5 rounded-md hover:underline cursor-pointer"
                    >
                      {step.clauseRef}
                    </button>
                  )}
                </div>
                <p className="text-xs text-stone-700 font-medium">
                  {step.event}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
