import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ClauseItem } from '../../types';

interface KeyClauseItem {
  section: string;
  title: string;
  excerpt: string;
  page: number;
  importance: string;
  clauseId?: string;
}

interface LawyerKitClausesProps {
  keyClauses?: KeyClauseItem[];
  onOpenEvidence: (clause: ClauseItem) => void;
}

export const LawyerKitClauses: React.FC<LawyerKitClausesProps> = ({
  keyClauses,
  onOpenEvidence,
}) => {
  const defaultClauses: KeyClauseItem[] = [
    {
      section: 'Section 4.1',
      title: 'Monthly Rent Payment Obligation',
      excerpt: 'The Tenant agrees to pay ₹25,000 on or before the 5th day of every calendar month without deduction.',
      page: 2,
      importance: 'Primary payment obligation',
    },
    {
      section: 'Section 4.3',
      title: 'Late Payment Penalty Surcharge',
      excerpt: 'A delayed payment fee of ₹500 per day shall accrue starting on the 8th day of the month until full arrears are cleared.',
      page: 2,
      importance: 'High Risk / Unreasonable Penalty',
    },
    {
      section: 'Section 12.1',
      title: 'Early Termination & Deposit Forfeiture',
      excerpt: 'Premature departure prior to lock-in expiration results in total forfeiture of the ₹75,000 security deposit.',
      page: 6,
      importance: 'High Financial Exposure',
    },
  ];

  const clausesToDisplay = keyClauses || defaultClauses;

  return (
    <div className="space-y-3">
      {clausesToDisplay.map((c, idx) => (
        <div key={idx} className="p-4 rounded-2xl bg-white border border-stone-200 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-900">{c.section}: {c.title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-mono">
              Page {c.page}
            </span>
          </div>
          <p className="text-xs text-stone-600 italic bg-stone-50 p-2.5 rounded-xl border border-stone-100">
            "{c.excerpt}"
          </p>
          <div className="flex justify-between items-center pt-1 text-[11px]">
            <span className="text-amber-700 font-semibold">{c.importance}</span>
            <button
              onClick={() =>
                onOpenEvidence({
                  id: c.clauseId || `cl-${idx}`,
                  section: c.section,
                  title: c.title,
                  fullText: c.excerpt,
                  summary: c.excerpt,
                  pageNumber: c.page,
                  riskLevel: 'high',
                  party: 'tenant',
                })
              }
              className="text-[#FF6B22] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              Inspect Evidence <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
