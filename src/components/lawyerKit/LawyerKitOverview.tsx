import React from 'react';
import { FileText } from 'lucide-react';

interface KeyFactItem {
  label: string;
  value: string;
}

interface LawyerKitOverviewProps {
  executiveSummary?: string;
  keyFacts?: KeyFactItem[];
}

export const LawyerKitOverview: React.FC<LawyerKitOverviewProps> = ({
  executiveSummary,
  keyFacts,
}) => {
  const defaultFacts: KeyFactItem[] = [
    { label: 'Document Type', value: 'Residential Tenancy Agreement' },
    { label: 'Parties', value: 'Tenant vs Landlord' },
    { label: 'Financial Consideration', value: 'Rent: ₹25,000/mo | Deposit: ₹75,000' },
    { label: 'Late Penalty', value: '₹500/day after 3-day grace period' },
    { label: 'Termination Notice', value: '30 Days written notice (6 Mo Lock-in)' },
  ];

  const factsToDisplay = keyFacts || defaultFacts;

  return (
    <div className="space-y-3">
      {/* Executive Summary */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
          <FileText className="w-4 h-4 text-[#FF6B22]" />
          Executive Consultation Summary
        </div>
        <p className="text-xs text-stone-700 leading-relaxed">
          {executiveSummary ||
            'Comprehensive legal consultation brief. The agreement establishes a monthly consideration of ₹25,000 with a ₹75,000 security deposit. Primary legal vulnerabilities include a ₹500/day late payment surcharge and total deposit forfeiture upon early exit.'}
        </p>
      </div>

      {/* Key Facts Grid */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-2.5">
        <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
          Key Contractual Parameters
        </div>
        <div className="space-y-2 text-xs">
          {factsToDisplay.map((f, idx) => (
            <div key={idx} className="flex justify-between items-start py-1 border-b border-stone-100 last:border-none">
              <span className="text-stone-500 font-medium">{f.label}</span>
              <span className="text-stone-900 font-bold text-right ml-2">{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
