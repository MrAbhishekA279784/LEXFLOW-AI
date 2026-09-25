import React from 'react';
import { BookOpen } from 'lucide-react';

interface PotentialRiskItem {
  title: string;
  description: string;
  level?: string;
  clauseRef?: string;
}

interface LegalSourceItem {
  title: string;
  summary: string;
  officialSourceUrl?: string;
}

interface LawyerKitRisksProps {
  potentialRisks?: PotentialRiskItem[];
  authoritativeLegalSources?: LegalSourceItem[];
}

export const LawyerKitRisks: React.FC<LawyerKitRisksProps> = ({
  potentialRisks,
  authoritativeLegalSources,
}) => {
  const defaultRisks: PotentialRiskItem[] = [
    {
      title: 'Total Security Deposit Forfeiture',
      description: 'Landlord claims contractual entitlement to forfeit full ₹75,000 deposit upon early departure.',
      level: 'critical',
      clauseRef: 'Section 12.1',
    },
  ];

  const defaultSources: LegalSourceItem[] = [
    {
      title: 'Indian Contract Act, 1872 — Section 74',
      summary: 'Compensation for breach where penalty stipulated: Forfeitures limited to reasonable compensation for actual damage.',
      officialSourceUrl: 'https://indiacode.nic.in/handle/123456789/2187',
    },
    {
      title: 'Supreme Court: Kailash Nath Associates v. DDA (2015)',
      summary: 'Liquidated damages require proof of genuine pre-estimate of loss. Total deposit forfeiture without proof is invalid.',
    },
  ];

  const risksToDisplay = potentialRisks || defaultRisks;
  const sourcesToDisplay = authoritativeLegalSources || defaultSources;

  return (
    <div className="space-y-3">
      {/* Red Flag Risks */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-red-600 uppercase tracking-wider block">
          Identified Red-Flag Risks
        </span>
        {risksToDisplay.map((r, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200 text-xs space-y-1">
            <div className="flex justify-between items-center font-bold text-red-900">
              <span>⚠ {r.title}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-200/60 uppercase font-mono">
                {r.level || 'critical'}
              </span>
            </div>
            <p className="text-red-800/80">{r.description}</p>
          </div>
        ))}
      </div>

      {/* Statutory Authorities */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-bold text-[#FF6B22] uppercase tracking-wider block">
          Applicable Statutory Authorities (Indian Law)
        </span>
        {sourcesToDisplay.map((a, idx) => (
          <div key={idx} className="p-3 rounded-2xl bg-white border border-stone-200 text-xs space-y-1">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#FF6B22]" />
              <span>{a.title}</span>
            </div>
            <p className="text-stone-600">{a.summary}</p>
            {a.officialSourceUrl && (
              <a
                href={a.officialSourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#FF6B22] font-semibold hover:underline block pt-1"
              >
                View Official Legislation →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
