import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowRight, 
  Upload, 
  FileText, 
  Layers, 
  Scale, 
  Lightbulb, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useHapticFeedback } from '../../hooks/useHapticFeedback';
import { AppHeader } from '../common/AppHeader';
import { DocumentItem } from '../../types';

export const HomeScreen: React.FC = () => {
  const { 
    user, 
    documents, 
    navigateTo, 
    setActiveDocument, 
    setScenarioInputText,
    runScenario
  } = useApp();

  const [questionInput, setQuestionInput] = useState('');
  const [showTipsModal, setShowTipsModal] = useState(false);
  const { triggerHaptic } = useHapticFeedback();

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    triggerHaptic('light');
    setScenarioInputText(questionInput);
    runScenario(questionInput);
  };

  const handleOpenDocument = (doc: DocumentItem) => {
    triggerHaptic('light');
    setActiveDocument(doc);
    navigateTo('legal-graph');
  };

  return (
    <div className="min-h-screen pb-28 max-w-md mx-auto">
      {/* Header with LEXFLOW and User Avatar */}
      <AppHeader showBack={false} showLogo={true} />

      <div className="px-5 pt-4 space-y-6">
        {/* User Greeting */}
        <motion.div 
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-0.5 text-left"
        >
          <h2 className="text-2xl font-bold text-[#151515] tracking-tight">
            Good morning, {user.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-sm text-[#6F6A64]">
            Let's make legal simple.
          </p>
        </motion.div>

        {/* Ask Question / AI Search Bar */}
        <motion.form 
          onSubmit={handleAskQuestion}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <input
            type="text"
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            placeholder="Ask a legal question..."
            className="w-full pl-4 pr-13 py-3.5 rounded-2xl glass-panel text-sm text-[#151515] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B22]/30 border border-white/90 shadow-md shadow-[#46321e]/5"
          />
          <button
            type="submit"
            aria-label="Submit Question"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#FF6B22] hover:bg-[#F25E12] text-white flex items-center justify-center transition-all shadow-md shadow-[#FF6B22]/25 active:scale-95 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.form>

        {/* 5 Feature Action Cards Grid */}
        <motion.div 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            {/* 1. Upload Document */}
            <button
              onClick={() => {
                triggerHaptic('light');
                navigateTo('upload');
              }}
              className="text-left glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between h-28 cursor-pointer border border-white/80 transition-all hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FFF1E8] border border-[#FF6B22]/20 flex items-center justify-center text-[#FF6B22]">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#151515]">Upload Document</h3>
                <p className="text-[10px] text-[#6F6A64]">Analyze with AI</p>
              </div>
            </button>

            {/* 2. Compare Documents */}
            <button
              onClick={() => {
                triggerHaptic('light');
                navigateTo('compare');
              }}
              className="text-left glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between h-28 cursor-pointer border border-white/80 transition-all hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-blue-500/20 flex items-center justify-center text-blue-600">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#151515]">Compare</h3>
                <p className="text-[10px] text-[#6F6A64]">Two documents</p>
              </div>
            </button>

            {/* 3. Try a Scenario */}
            <button
              onClick={() => {
                triggerHaptic('light');
                navigateTo('scenario-input');
              }}
              className="text-left glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between h-28 cursor-pointer border border-white/80 transition-all hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-xl bg-[#F0FDF4] border border-emerald-500/20 flex items-center justify-center text-emerald-700">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#151515]">Try a Scenario</h3>
                <p className="text-[10px] text-[#6F6A64]">What could happen?</p>
              </div>
            </button>

            {/* 4. Compliance Audit (Core Feature Prominence) */}
            <button
              onClick={() => {
                triggerHaptic('light');
                navigateTo('compliance-audit');
              }}
              className="text-left glass-card glass-card-hover p-4 rounded-2xl flex flex-col justify-between h-28 cursor-pointer border border-[#FF6B22]/30 bg-gradient-to-br from-white/90 to-orange-50/50 transition-all hover:scale-[1.02] shadow-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-[#FF6B22]/10 border border-[#FF6B22]/30 flex items-center justify-center text-[#FF6B22]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-[#151515]">Compliance Audit</h3>
                <p className="text-[10px] text-[#6F6A64]">Dual-agent audit</p>
              </div>
            </button>
          </div>

          {/* 5. Tips & Guides (Full width card) */}
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowTipsModal(true);
            }}
            className="w-full text-left glass-card glass-card-hover p-3 rounded-2xl flex items-center justify-between cursor-pointer border border-white/80 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FFFBEB] border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#151515]">Tips & Legal Guides</h3>
                <p className="text-[10px] text-[#6F6A64]">Tenant rights & negotiation checklists</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-stone-400" />
          </button>
        </motion.div>

        {/* Recent Documents Section */}
        <motion.div
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-3 pt-1"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#151515]">Recent Documents</h3>
            <button
              onClick={() => navigateTo('upload')}
              className="text-xs font-semibold text-[#FF6B22] hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>

          <div className="space-y-2.5">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleOpenDocument(doc)}
                className="glass-card glass-card-hover p-3.5 rounded-2xl flex items-center justify-between cursor-pointer border border-white/80"
              >
                <div className="flex items-center gap-3">
                  {/* Document Type Badge */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      doc.type === 'pdf'
                        ? 'bg-red-50 text-red-600 border border-red-200/60'
                        : 'bg-blue-50 text-blue-600 border border-blue-200/60'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>

                  <div className="text-left">
                    <h4 className="text-sm font-semibold text-[#151515] line-clamp-1">
                      {doc.name}
                    </h4>
                    <p className="text-xs text-[#6F6A64]">
                      {doc.status === 'analyzed' ? 'Analyzed' : 'Uploaded'} · {doc.uploadedAt}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Tips & Guides Modal */}
      {showTipsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setShowTipsModal(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
          />
          <div className="relative z-10 glass-panel bg-white/95 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/80 text-left space-y-4">
            <div className="flex items-center gap-2 text-[#FF6B22]">
              <Lightbulb className="w-5 h-5" />
              <h3 className="text-base font-bold text-[#151515]">Tenant Rights & Tips</h3>
            </div>
            <p className="text-xs text-[#6F6A64]">
              Essential safeguards to look for in Indian tenancy & residential agreements:
            </p>
            <div className="space-y-2.5 text-xs text-[#151515]">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="font-bold">1. Security Deposit Cap:</span> Model Tenancy Act recommends max 2 months rent for residential premises.
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="font-bold">2. Written Notice:</span> Minimum 30 days notice is customary before any rent revision or eviction.
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="font-bold">3. Wear & Tear Exclusion:</span> Always clarify that structural paint wear and tear is not deducted from deposit.
              </div>
            </div>
            <button
              onClick={() => setShowTipsModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#151515] text-white text-xs font-semibold cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
