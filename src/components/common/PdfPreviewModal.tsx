import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, Printer, CheckCircle2, Shield, Scale, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { GlassButton } from './GlassButton';

export const PdfPreviewModal: React.FC = () => {
  const { isBriefModalOpen, setIsBriefModalOpen, activeDocument, activeScenario, user } = useApp();

  if (!isBriefModalOpen) return null;

  const handleDownload = () => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#FF6B22', '#FFA868', '#151515']
    });
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsBriefModalOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative z-10 w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-stone-200 text-[#151515] max-h-[90vh] overflow-y-auto"
        >
          {/* Action Bar */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100 print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#FF6B22] uppercase tracking-wider">
                1-Page Legal Brief Preview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <GlassButton size="sm" variant="secondary" icon={<Printer className="w-4 h-4" />} onClick={handleDownload}>
                Print
              </GlassButton>
              <GlassButton size="sm" variant="primary" icon={<Download className="w-4 h-4" />} onClick={handleDownload}>
                Download PDF
              </GlassButton>
              <button
                onClick={() => setIsBriefModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Actual Printable 1-Page Brief */}
          <div className="space-y-6 text-left border p-6 rounded-2xl bg-[#FCFAF7] border-stone-200 print:border-none print:p-0">
            {/* Header Document Brand */}
            <div className="flex justify-between items-start border-b border-stone-300 pb-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xl font-extrabold text-[#151515] tracking-tight">LEX</span>
                  <span className="text-xl font-extrabold text-[#FF6B22] tracking-tight">FLOW</span>
                  <span className="text-xs bg-stone-200 text-stone-700 px-2 py-0.5 rounded-full ml-2 font-mono">
                    LEGAL PREP-KIT
                  </span>
                </div>
                <h2 className="text-lg font-bold text-stone-900">
                  Client Discussion Brief: {activeDocument.name}
                </h2>
                <p className="text-xs text-stone-500">
                  Generated for: {user.name} ({user.email}) · Date: {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B22]/10 border border-[#FF6B22]/20 flex items-center justify-center text-[#FF6B22]">
                <Scale className="w-6 h-6" />
              </div>
            </div>

            {/* 1. Executive Summary */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#FF6B22]" />
                1. Executive Summary & Core Obligations
              </h3>
              <p className="text-xs text-stone-700 leading-relaxed bg-white p-3 rounded-xl border border-stone-200">
                Residential tenancy agreement for Flat 402, Lotus Heights. Active tenure 11 months with ₹25,000 monthly rent and ₹75,000 security deposit. Core operational risks revolve around premature exit lock-in and asymmetric painting wear-and-tear deductions.
              </p>
            </div>

            {/* 2. Key High-Impact Clauses */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#FF6B22]" />
                2. Identified High-Impact Clauses
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <div className="font-bold text-stone-900">Section 12.1 — Notice & Early Exit</div>
                  <p className="text-stone-600 mt-1">Requires 30 days notice. Landlord claims right to forfeit full ₹75,000 security deposit if lock-in period breached.</p>
                </div>
                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <div className="font-bold text-stone-900">Section 4.3 — Late Payment Penalty</div>
                  <p className="text-stone-600 mt-1">₹500/day late fee activates after only 3 grace days. Breach deemed material after 30 days arrears.</p>
                </div>
              </div>
            </div>

            {/* 3. What-If Scenario Stress-Test Result */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1.5">
                <AlertCircleIcon className="w-3.5 h-3.5 text-[#FF6B22]" />
                3. Scenario Simulation: Early Termination Exposure
              </h3>
              <div className="p-3 bg-white rounded-xl border border-[#FF6B22]/30 space-y-1.5 text-xs">
                <div className="flex justify-between font-bold text-stone-900">
                  <span>Estimated Total Liability:</span>
                  <span className="text-[#FF6B22] text-sm">{activeScenario.totalFinancialImpact}</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-stone-600">
                  {activeScenario.keyPoints.slice(0, 3).map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 4. Target Questions for Legal Counsel */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                4. Recommended Questions for Your Lawyer
              </h3>
              <div className="space-y-1.5 text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200">
                <p>1. "Is the total forfeiture of the ₹75,000 deposit enforceable if the landlord immediately secures an alternate tenant?"</p>
                <p>2. "Can we draft an addendum specifying that deposit deductions are capped at itemized repainting receipts?"</p>
                <p>3. "How can we increase the late fee grace window from 3 to 7 business days?"</p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="pt-3 border-t border-stone-200 text-[10px] text-stone-500 text-center">
              LEXFLOW Prep-Kit is an AI-assisted information summary based on user-provided document text. It does not constitute legal advice or formal representation. Consult a licensed advocate before signing.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const AlertCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
  </svg>
);
