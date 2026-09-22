import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ChevronRight, 
  ShieldCheck, 
  Flame, 
  Clock, 
  RotateCcw,
  AlertOctagon,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TiltCard } from '../common/TiltCard';

export const DesktopRightPanel: React.FC = () => {
  const { 
    sendChatMessage, 
    navigateTo, 
    runScenario, 
    setScenarioInputText,
    setIsBriefModalOpen 
  } = useApp();

  const [aiQuestion, setAiQuestion] = useState('Can the landlord increase rent anytime?');

  const handleAskAssistant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    sendChatMessage(aiQuestion);
    navigateTo('assistant');
  };

  const handleScenarioClick = (scenarioTitle: string) => {
    const promptMap: Record<string, string> = {
      'Miss a Payment': 'What happens if I miss the rent payment on the 5th of this month?',
      'Leave Early': 'Agar main 3 mahine rent nahi du aur phir ghar chhod du toh kya hoga?',
      'Break a Notice Period': 'What happens if I vacate immediately without giving 30 days notice?',
      'Trigger a Penalty': 'How does the late fee penalty compound under Section 4.3?',
      'Auto-Renewal': 'Does the agreement auto-renew after 11 months and can rent escalate?'
    };
    const prompt = promptMap[scenarioTitle] || scenarioTitle;
    setScenarioInputText(prompt);
    runScenario(prompt);
  };

  return (
    <div className="w-80 shrink-0 space-y-4 select-none">
      {/* CARD 1: AI Legal Assistant with 3D Tilt */}
      <TiltCard
        maxTilt={7}
        scale={1.015}
        className="glass-card p-4.5 rounded-3xl border border-white/90 shadow-md shadow-[#46321e]/5 space-y-3 text-left"
      >
        <div style={{ transform: 'translateZ(14px)' }} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-100/90 flex items-center justify-center text-[#FF6B22] border border-orange-200/60 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-[#151515]">AI Legal Assistant</h3>
        </div>

        <p style={{ transform: 'translateZ(8px)' }} className="text-[11px] text-[#6F6A64] leading-relaxed">
          Get instant answers from your documents.
        </p>

        {/* Input Form */}
        <form onSubmit={handleAskAssistant} style={{ transform: 'translateZ(12px)' }} className="relative">
          <input
            type="text"
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            placeholder="Ask anything..."
            className="w-full pl-3 pr-10 py-2.5 rounded-2xl bg-white/85 border border-stone-200/80 text-[11px] text-[#151515] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B22]/35 shadow-2xs font-medium backdrop-blur-xs"
          />
          <button
            type="submit"
            aria-label="Send to AI Assistant"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#FF6B22] hover:bg-[#F25E12] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-108 active:scale-95 cursor-pointer"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </TiltCard>

      {/* CARD 2: Quick Scenarios */}
      <TiltCard
        maxTilt={7}
        scale={1.015}
        className="glass-card p-4.5 rounded-3xl border border-white/90 shadow-md shadow-[#46321e]/5 space-y-3 text-left"
      >
        <div style={{ transform: 'translateZ(14px)' }} className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-orange-100/90 flex items-center justify-center text-[#FF6B22] border border-orange-200/60 shadow-2xs">
            <Zap className="w-3.5 h-3.5 fill-[#FF6B22]" />
          </div>
          <h3 className="text-xs font-bold text-[#151515]">Quick Scenarios</h3>
        </div>

        <div style={{ transform: 'translateZ(10px)' }} className="space-y-1.5">
          {[
            { label: 'Miss a Payment', icon: <Flame className="w-3.5 h-3.5 text-[#FF6B22]" /> },
            { label: 'Leave Early', icon: <AlertOctagon className="w-3.5 h-3.5 text-[#FF6B22]" /> },
            { label: 'Break a Notice Period', icon: <Clock className="w-3.5 h-3.5 text-[#FF6B22]" /> },
            { label: 'Trigger a Penalty', icon: <AlertCircle className="w-3.5 h-3.5 text-[#FF6B22]" /> },
            { label: 'Auto-Renewal', icon: <RotateCcw className="w-3.5 h-3.5 text-[#FF6B22]" /> },
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleScenarioClick(item.label)}
              className="w-full px-3 py-2 rounded-xl bg-white/70 hover:bg-white border border-stone-200/70 flex items-center justify-between transition-all duration-150 cursor-pointer shadow-2xs group text-left hover:border-[#FF6B22]/30"
            >
              <div className="flex items-center gap-2.5">
                <span className="shrink-0 group-hover:scale-110 transition-transform">{item.icon}</span>
                <span className="text-xs font-medium text-[#151515] group-hover:text-[#FF6B22] transition-colors">
                  {item.label}
                </span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#FF6B22] group-hover:translate-x-0.5 transition-all" />
            </motion.button>
          ))}
        </div>
      </TiltCard>

      {/* CARD 3: Lawyer Prep-Kit CTA with 3D Depth */}
      <TiltCard
        maxTilt={8}
        scale={1.02}
        className="glass-card p-5 rounded-3xl border border-white/90 shadow-md shadow-[#46321e]/5 relative overflow-hidden text-left space-y-2.5 group hover:border-[#FF6B22]/40 transition-colors"
      >
        {/* Warm ambient orange reflection */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-tr from-[#FF6B22]/25 via-[#FF8A3D]/20 to-transparent blur-xl pointer-events-none" />

        <div 
          style={{ transform: 'translateZ(18px)' }}
          className="w-8 h-8 rounded-xl bg-[#FFF2EA] border border-[#FF6B22]/30 flex items-center justify-center text-[#FF6B22] shadow-2xs group-hover:scale-108 transition-transform"
        >
          <ShieldCheck className="w-4 h-4" />
        </div>

        <div style={{ transform: 'translateZ(12px)' }}>
          <h4 className="text-xs font-bold text-[#151515] leading-snug">
            Your Lawyer Prep-Kit is just a click away.
          </h4>
          <p className="text-[11px] text-[#6F6A64] mt-1 leading-relaxed">
            Get a 1-page brief, key questions, and important clauses.
          </p>
        </div>

        <div style={{ transform: 'translateZ(16px)' }} className="pt-1 flex justify-end">
          <button
            onClick={() => setIsBriefModalOpen(true)}
            aria-label="Open Lawyer Prep-Kit Brief"
            className="w-8 h-8 rounded-full bg-[#FF6B22] hover:bg-[#F25E12] text-white flex items-center justify-center shadow-md shadow-[#FF6B22]/30 cursor-pointer transition-transform group-hover:scale-108 active:scale-95"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </TiltCard>
    </div>
  );
};

