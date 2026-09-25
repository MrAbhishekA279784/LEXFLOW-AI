import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  HelpCircle,
  Scale,
  FileText,
  ShieldAlert,
  BookOpen,
  Layers,
  Sparkles,
  Printer
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';
import { GlassButton } from '../common/GlassButton';
import { LawyerKitOverview } from '../lawyerKit/LawyerKitOverview';
import { LawyerKitClauses } from '../lawyerKit/LawyerKitClauses';
import { LawyerKitRisks } from '../lawyerKit/LawyerKitRisks';
import { LawyerKitQuestions } from '../lawyerKit/LawyerKitQuestions';

type TabType = 'overview' | 'clauses' | 'risks' | 'scenario' | 'counsel';

export const LawyerKitScreen: React.FC = () => {
  const { 
    activeDocument, 
    activeLawyerKit,
    isLawyerKitLoading,
    fetchLawyerKit,
    generateLawyerKit,
    downloadLawyerKitPdf,
    setIsBriefModalOpen,
    setIsGraphExportModalOpen,
    openEvidence
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  useEffect(() => {
    if (activeDocument?.id) {
      fetchLawyerKit(activeDocument.id);
    }
  }, [activeDocument?.id]);

  const kit = activeLawyerKit;

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      await downloadLawyerKitPdf(activeDocument?.id);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRegenerate = async () => {
    await generateLawyerKit(activeDocument?.id);
  };

  return (
    <div className="min-h-screen pb-28 max-w-lg mx-auto flex flex-col justify-between">
      <div>
        <AppHeader title="Lawyer Prep-Kit" />

        <div className="px-4 pt-3 space-y-4 text-left">
          {/* Hero Banner */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass-card p-5 rounded-3xl border border-white/80 shadow-lg shadow-[#46321e]/5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF2EA] border border-[#FF6B22]/20 flex items-center justify-center text-[#FF6B22] shadow-sm">
                <Scale className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                Counsel Ready
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-[#151515] tracking-tight">
                {activeDocument?.name || 'Commercial & Tenancy Agreement'}
              </h2>
              <p className="text-xs text-[#6F6A64] mt-0.5">
                Structured legal consultation briefing package grounded in Indian statutory law & forensic clause extraction.
              </p>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-2xl bg-white/70 border border-stone-200/70 text-center">
                <span className="text-[10px] text-stone-500 font-semibold block uppercase">Clauses</span>
                <span className="text-sm font-extrabold text-stone-900">{kit?.keyClauses?.length || 4} Critical</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/70 border border-stone-200/70 text-center">
                <span className="text-[10px] text-stone-500 font-semibold block uppercase">Risks</span>
                <span className="text-sm font-extrabold text-red-600">{kit?.potentialRisks?.length || 2} Red Flags</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white/70 border border-stone-200/70 text-center">
                <span className="text-[10px] text-stone-500 font-semibold block uppercase">Authorities</span>
                <span className="text-sm font-extrabold text-[#FF6B22]">{kit?.authoritativeLegalSources?.length || 3} Acts</span>
              </div>
            </div>
          </motion.div>

          {/* Segmented Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-2xl overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'clauses', label: 'Clauses', icon: BookOpen },
              { id: 'risks', label: 'Risks & Law', icon: ShieldAlert },
              { id: 'scenario', label: 'Scenario', icon: Layers },
              { id: 'counsel', label: 'Counsel Q&A', icon: HelpCircle },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#FF6B22]' : 'text-stone-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <LawyerKitOverview
                  executiveSummary={kit?.executiveSummary}
                  keyFacts={kit?.keyFacts}
                />
              </motion.div>
            )}

            {activeTab === 'clauses' && (
              <motion.div
                key="clauses"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <LawyerKitClauses
                  keyClauses={kit?.keyClauses}
                  onOpenEvidence={openEvidence}
                />
              </motion.div>
            )}

            {activeTab === 'risks' && (
              <motion.div
                key="risks"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <LawyerKitRisks
                  potentialRisks={kit?.potentialRisks}
                  authoritativeLegalSources={kit?.authoritativeLegalSources}
                />
              </motion.div>
            )}

            {activeTab === 'scenario' && (
              <motion.div
                key="scenario"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="space-y-3"
              >
                <div className="p-4 rounded-2xl bg-white border border-stone-200 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-stone-500 uppercase">Tested What-If Scenario</span>
                      <h4 className="text-xs font-bold text-stone-900 mt-0.5">
                        "{kit?.scenarioTested || 'Withholding 3 months rent and vacating without 30-day notice'}"
                      </h4>
                    </div>
                    <span className="text-xs font-extrabold text-[#FF6B22] px-2.5 py-1 bg-[#FFF2EA] rounded-xl border border-[#FF6B22]/20">
                      {kit?.potentialFinancialExposure || '₹75,000 Exposure'}
                    </span>
                  </div>

                  {/* Timeline preview */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-bold text-stone-800 uppercase block">Chronological Timeline</span>
                    {(kit?.timeline || [
                      { dateOrRelative: 'Day 1–5', event: 'Rent Payment Due (₹25,000)', source: 'Sec 4.1' },
                      { dateOrRelative: 'Day 8', event: 'Late Surcharge Starts (₹500/day)', source: 'Sec 4.3' },
                      { dateOrRelative: 'Day 90', event: 'Security Deposit Offset (₹75,000)', source: 'Sec 12.1' },
                    ]).map((t: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <div className="w-2 h-2 rounded-full bg-[#FF6B22] shrink-0" />
                        <span className="font-bold text-stone-900 w-20 shrink-0">{t.dateOrRelative}</span>
                        <span className="text-stone-600 flex-1">{t.event}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{t.source}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'counsel' && (
              <motion.div
                key="counsel"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                <LawyerKitQuestions
                  questionsToAskCounsel={kit?.questionsToAskCounsel || kit?.questionsForLegalProfessional}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom CTA & Export Action Bar */}
      <div className="px-4 pt-4 space-y-2.5">
        <GlassButton
          fullWidth
          size="lg"
          variant="primary"
          icon={<Download className="w-5 h-5" />}
          loading={isDownloading}
          onClick={handleDownloadPdf}
        >
          {isDownloading ? 'Generating PDF Brief...' : 'Download Official PDF Prep-Kit'}
        </GlassButton>

        <div className="grid grid-cols-2 gap-2">
          <GlassButton
            fullWidth
            size="md"
            variant="secondary"
            icon={<Printer className="w-4 h-4 text-stone-600" />}
            onClick={() => setIsBriefModalOpen(true)}
          >
            Printable 1-Page
          </GlassButton>

          <GlassButton
            fullWidth
            size="md"
            variant="secondary"
            icon={<Download className="w-4 h-4 text-[#FF6B22]" />}
            onClick={() => setIsGraphExportModalOpen(true)}
          >
            Export Graph
          </GlassButton>
        </div>

        <p className="text-[10px] text-[#6F6A64] text-center px-4 leading-relaxed">
          {kit?.disclaimer || 'Informational client consultation package. Not a substitute for professional legal advice.'}
        </p>
      </div>
    </div>
  );
};
