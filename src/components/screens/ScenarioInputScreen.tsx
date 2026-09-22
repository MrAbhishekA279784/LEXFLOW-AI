import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Check, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';

const SCENARIO_PRESETS = [
  'Miss a Payment',
  'Leave Early',
  'Miss a Deadline',
  'Break an Obligation',
  'Trigger a Penalty'
];

export const ScenarioInputScreen: React.FC = () => {
  const { 
    scenarioInputText, 
    setScenarioInputText, 
    runScenario, 
    isSimulating 
  } = useApp();

  const [inputVal, setInputVal] = useState(scenarioInputText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setScenarioInputText(inputVal);
    runScenario(inputVal);
  };

  const handleSelectPreset = (preset: string) => {
    let customPrompt = inputVal;
    if (preset === 'Miss a Payment') {
      customPrompt = 'What happens if I miss rent payment on the 5th and pay on the 15th?';
    } else if (preset === 'Leave Early') {
      customPrompt = 'Agar main 3 mahine rent nahi du aur phir ghar chhod du toh kya hoga?';
    } else if (preset === 'Miss a Deadline') {
      customPrompt = 'What if I give only 15 days notice instead of the required 30 days?';
    } else if (preset === 'Break an Obligation') {
      customPrompt = 'Can the landlord evict me if a guest stays for more than 2 weeks?';
    } else if (preset === 'Trigger a Penalty') {
      customPrompt = 'What is the exact per-day late penalty surcharge rate?';
    }
    setInputVal(customPrompt);
    setScenarioInputText(customPrompt);
  };

  return (
    <div className="min-h-screen pb-28 max-w-md mx-auto flex flex-col justify-between">
      <div>
        <AppHeader title="Scenario Simulator" />

        <div className="px-5 pt-4 space-y-5">
          {/* Main Glass Input Card */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="relative glass-card p-4 rounded-3xl border border-white/80 shadow-md text-left"
          >
            <label className="text-[11px] font-semibold text-[#6F6A64] uppercase tracking-wider block mb-1">
              Ask Any "What-If" Scenario (English / Hinglish)
            </label>
            <textarea
              rows={3}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="e.g. Agar main 3 mahine rent nahi du aur phir ghar chhod du toh kya hoga?"
              className="w-full text-sm font-medium text-[#151515] bg-transparent border-none resize-none focus:outline-none placeholder-stone-400 leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2 border-t border-stone-200/50">
              <span className="text-[11px] text-stone-400">
                Supports casual phrased questions
              </span>
              <button
                type="submit"
                disabled={isSimulating}
                className="w-10 h-10 rounded-full bg-[#FF6B22] hover:bg-[#F25E12] text-white flex items-center justify-center shadow-md shadow-[#FF6B22]/25 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.form>

          {/* Preset Shortcut Chips */}
          <div className="space-y-2 text-left">
            <span className="text-[11px] font-bold text-[#6F6A64] uppercase tracking-wider">
              Common Scenario Triggers
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SCENARIO_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="text-xs px-3 py-1.5 rounded-full glass-card hover:bg-white text-stone-700 font-medium border border-white/80 transition-all cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* AI Understanding Progress Card */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-2 text-left space-y-4"
          >
            <h3 className="text-sm font-bold text-[#151515]">
              AI is understanding your scenario...
            </h3>

            <div className="space-y-3.5 pl-1">
              {/* Step 1: Understanding question */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-semibold text-[#151515]">
                  Understanding your question
                </span>
              </div>

              {/* Step 2: Finding relevant clauses */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-semibold text-[#151515]">
                  Finding relevant clauses
                </span>
              </div>

              {/* Step 3: Running scenario simulation */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-[#FF6B22] flex items-center justify-center shrink-0 shadow-sm shadow-[#FF6B22]/20">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B22] animate-ping" />
                </div>
                <span className="text-xs font-bold text-[#FF6B22]">
                  Running scenario simulation
                </span>
              </div>

              {/* Step 4: Calculating financial impact */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                </div>
                <span className="text-xs text-stone-400">
                  Calculating financial impact
                </span>
              </div>

              {/* Step 5: Preparing explanation */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white border-2 border-stone-200 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                </div>
                <span className="text-xs text-stone-400">
                  Preparing explanation
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wait Card */}
      <div className="px-5 pt-6">
        <div className="glass-card p-3.5 rounded-2xl flex items-center gap-3 border border-white/80">
          <div className="w-8 h-8 rounded-xl bg-[#FFF2EA] border border-[#FF6B22]/20 flex items-center justify-center text-[#FF6B22] shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-xs text-[#6F6A64] text-left">
            This may take a few moments. We cross-reference liability caps and grace windows.
          </p>
        </div>
      </div>
    </div>
  );
};
