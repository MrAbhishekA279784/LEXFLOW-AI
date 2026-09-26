import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, ArrowRight, Bell, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DesktopTopBar: React.FC = () => {
  const { 
    user, 
    navigateTo, 
    sendChatMessage, 
    setScenarioInputText, 
    runScenario 
  } = useApp();

  const [searchVal, setSearchVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchVal.trim()) return;

    // If query starts with "what if", "agar", "kya", route to simulator; otherwise assistant
    const lower = searchVal.toLowerCase();
    if (lower.includes('what if') || lower.includes('agar') || lower.includes('agar main') || lower.includes('default') || lower.includes('leave')) {
      setScenarioInputText(searchVal);
      runScenario(searchVal);
    } else {
      sendChatMessage(searchVal);
      navigateTo('assistant');
    }
  };

  return (
    <header className="w-full flex items-center justify-between gap-6 py-2">
      {/* Large Glass Search / Command Bar */}
      <form onSubmit={handleSubmit} className="flex-1 max-w-2xl">
        <div className="relative glass-panel rounded-2xl p-1.5 pl-4 pr-2 flex items-center gap-3 border border-white/90 shadow-xs focus-within:ring-2 focus-within:ring-[#FF6B22]/30 transition-all">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Ask a legal question about your document..."
            className="w-full bg-transparent text-xs text-[#151515] placeholder-stone-400 focus:outline-none font-medium"
          />
          <div className="flex items-center gap-2 shrink-0">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100/80 border border-stone-200 text-[10px] text-stone-500 font-mono">
              ⌘ K
            </kbd>
            <button
              type="submit"
              aria-label="Submit search"
              className="w-8 h-8 rounded-full bg-[#FF6B22] hover:bg-[#F25E12] text-white flex items-center justify-center shadow-md shadow-[#FF6B22]/25 shrink-0 transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Right Controls: Notification Bell & User Account Pill */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Notification Bell */}
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Notifications"
          onClick={() => {}}
          className="relative w-10 h-10 rounded-2xl glass-panel border border-white/95 flex items-center justify-center text-stone-700 hover:bg-white transition-all cursor-pointer shadow-xs hover:border-[#FF6B22]/30"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#FF6B22] ring-2 ring-white animate-pulse" />
        </motion.button>

        {/* User Account Card */}
        <motion.div 
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigateTo('settings')}
          className="glass-panel p-1.5 pr-3 rounded-2xl border border-white/95 flex items-center gap-2.5 cursor-pointer hover:bg-white transition-all shadow-xs group hover:border-[#FF6B22]/30"
        >
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-white shadow-2xs group-hover:scale-105 transition-transform"
            referrerPolicy="no-referrer"
          />
          <div className="text-left leading-none">
            <h4 className="text-xs font-bold text-[#151515] group-hover:text-[#FF6B22] transition-colors">
              {user.name}
            </h4>
            <span className="text-[10px] text-stone-400 font-medium">
              {user.email}
            </span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
        </motion.div>
      </div>
    </header>
  );
};
