import React from 'react';
import { HelpCircle } from 'lucide-react';

interface LawyerKitQuestionsProps {
  questionsToAskCounsel?: string[];
}

export const LawyerKitQuestions: React.FC<LawyerKitQuestionsProps> = ({
  questionsToAskCounsel,
}) => {
  const defaultQuestions = [
    'Can the landlord legally forfeit the entire ₹75,000 security deposit without proving actual financial loss under Section 74 ICA?',
    'Is the ₹500/day late payment penalty considered an illegal penal clause or a valid liquidated damage?',
    'What specific written notice must be served to terminate the lease during the lock-in period while mitigating exposure?',
    'Can we demand an itemized deduction statement for the security deposit before surrendering physical possession?',
  ];

  const questionsToDisplay = questionsToAskCounsel || defaultQuestions;

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-800 uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-[#FF6B22]" />
          Recommended Questions for Your Advocate
        </div>
        <p className="text-xs text-stone-600">
          Bring these specific strategic questions to your legal consultation:
        </p>
        <div className="space-y-2">
          {questionsToDisplay.map((q, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs text-stone-800 flex items-start gap-2 font-medium"
            >
              <span className="w-4 h-4 rounded-full bg-[#FF6B22] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{q}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
