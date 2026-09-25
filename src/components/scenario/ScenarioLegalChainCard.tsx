import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface RiskItem {
  title: string;
  description: string;
  level: 'low' | 'medium' | 'high' | 'critical';
}

interface ProtectionItem {
  title: string;
  description: string;
}

interface ScenarioLegalChainCardProps {
  normalizedInterpretation: string;
  risks?: RiskItem[];
  protections?: ProtectionItem[];
}

export const ScenarioLegalChainCard: React.FC<ScenarioLegalChainCardProps> = ({
  normalizedInterpretation,
  risks,
  protections,
}) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-[#151515] uppercase tracking-wider">
        Causal Graph Traversal Path
      </h4>
      <p className="text-[11px] text-stone-600">
        Deterministic dependency chain traversed across the document's legal action graph:
      </p>
      <div className="space-y-2">
        <div className="p-3.5 bg-white/90 rounded-2xl border border-stone-200 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700">
            <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-[10px] uppercase font-black">Trigger Node</span>
            <span>Scenario Trigger</span>
          </div>
          <p className="text-xs text-stone-800 font-medium pl-2 border-l-2 border-amber-400">
            {normalizedInterpretation}
          </p>
        </div>

        {risks && risks.length > 0 && (
          <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-800">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Consequential Risks & Penalties</span>
            </div>
            {risks.map((risk, idx) => (
              <div key={idx} className="text-xs text-rose-950 font-medium pl-2 border-l-2 border-rose-400">
                <span className="font-bold">{risk.title}:</span> {risk.description}
              </div>
            ))}
          </div>
        )}

        {protections && protections.length > 0 && (
          <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Counter-Protections & Safe Harbors</span>
            </div>
            {protections.map((protection, idx) => (
              <div key={idx} className="text-xs text-emerald-950 font-medium pl-2 border-l-2 border-emerald-400">
                <span className="font-bold">{protection.title}:</span> {protection.description}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
