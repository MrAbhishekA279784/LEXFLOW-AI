import React from 'react';
import { IndianRupee } from 'lucide-react';
import { FinancialBreakdownItem } from '../../backend/types/backendTypes';

interface ScenarioFinancialBreakdownProps {
  financialBreakdown: FinancialBreakdownItem[];
  totalFinancialImpact: string;
}

export const ScenarioFinancialBreakdown: React.FC<ScenarioFinancialBreakdownProps> = ({
  financialBreakdown,
  totalFinancialImpact,
}) => {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#151515] to-[#2a2a2a] text-white shadow-md space-y-1">
        <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
          Total Quantified Exposure
        </span>
        <div className="text-2xl font-black text-[#FF6B22] flex items-center gap-1">
          <span>{totalFinancialImpact}</span>
        </div>
      </div>

      <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider pt-1">
        Deterministic Exposure Breakdown
      </h4>

      <div className="space-y-2">
        {financialBreakdown.map((item, idx) => (
          <div
            key={idx}
            className="glass-card p-3 rounded-2xl flex items-center justify-between border border-white/80"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-[#151515] block">
                {item.label}
              </span>
              {item.note && (
                <span className="text-[11px] text-stone-500 block font-medium">
                  {item.note}
                </span>
              )}
            </div>
            <span className="text-xs font-extrabold text-[#FF6B22] shrink-0">
              {item.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
