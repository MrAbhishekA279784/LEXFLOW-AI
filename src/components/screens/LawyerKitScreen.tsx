import React from 'react';
import { motion } from 'motion/react';
import { 
  FileCheck2, 
  CheckCircle2, 
  Download, 
  Printer, 
  Eye, 
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';
import { GlassButton } from '../common/GlassButton';

const CHECKLIST_ITEMS = [
  'Executive summary',
  'Key clauses & risks',
  'Your questions for the lawyer',
  'Relevant document excerpts',
  'Scenario analysis results'
];

export const LawyerKitScreen: React.FC = () => {
  const { 
    activeDocument, 
    setIsBriefModalOpen,
    setIsGraphExportModalOpen
  } = useApp();

  return (
    <div className="min-h-screen pb-28 max-w-md mx-auto flex flex-col justify-between">
      <div>
        <AppHeader title="Your Lawyer Prep-Kit" />

        <div className="px-5 pt-4 space-y-5 text-left">
          {/* Hero Glass Card */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card p-6 rounded-3xl border border-white/80 shadow-lg shadow-[#46321e]/5 space-y-4"
          >
            {/* Document Icon in circular container */}
            <div className="w-14 h-14 rounded-2xl bg-[#FFF2EA] border border-[#FF6B22]/20 flex items-center justify-center text-[#FF6B22] shadow-sm">
              <FileCheck2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#151515] tracking-tight">
                Your 1-Page Brief is ready!
              </h2>
              <p className="text-xs text-[#6F6A64] leading-relaxed">
                A concise overview to help you discuss with a legal professional.
              </p>
            </div>

            {/* Checklist Section */}
            <div className="pt-2 space-y-3">
              <span className="text-xs font-bold text-[#151515] uppercase tracking-wider block">
                Includes:
              </span>

              <div className="space-y-2.5">
                {CHECKLIST_ITEMS.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-[#8C3A00] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className="text-xs font-semibold text-[#151515]">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Value callout */}
          <div className="p-4 rounded-2xl bg-white/60 border border-white/80 text-xs text-[#6F6A64] space-y-1">
            <span className="font-bold text-[#151515] block">Save 45+ minutes in lawyer billing</span>
            <p>
              Lawyers charge per hour. Handing them this structured 1-page briefing ensures you address high-risk clauses immediately.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA & Legal Disclaimer */}
      <div className="px-5 pt-6 space-y-3">
        <GlassButton
          fullWidth
          size="lg"
          variant="primary"
          icon={<Download className="w-5 h-5" />}
          onClick={() => setIsBriefModalOpen(true)}
        >
          Download PDF Brief
        </GlassButton>

        <GlassButton
          fullWidth
          size="md"
          variant="secondary"
          icon={<Download className="w-4 h-4 text-[#FF6B22]" />}
          onClick={() => setIsGraphExportModalOpen(true)}
        >
          Export Action Graph (SVG / PNG)
        </GlassButton>

        <p className="text-[11px] text-[#6F6A64] text-center px-4 leading-relaxed">
          This is for information purposes only. Not a substitute for legal advice.
        </p>
      </div>
    </div>
  );
};
