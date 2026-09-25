import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Bot, Shield, FileText, Sparkles, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';
import { RENTAL_CLAUSES } from '../../data/initialData';

export const AssistantScreen: React.FC = () => {
  const { 
    chatMessages, 
    sendChatMessage, 
    openEvidence, 
    activeDocument 
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendChatMessage(inputVal);
    setInputVal('');
  };

  const handleChipClick = (chip: string) => {
    if (chip === 'Show clause') {
      const clause = RENTAL_CLAUSES.find(c => c.section === 'Section 8.2') || RENTAL_CLAUSES[0];
      openEvidence(clause);
    } else {
      sendChatMessage(chip);
    }
  };

  return (
    <div className="min-h-screen pb-24 max-w-md mx-auto flex flex-col justify-between">
      {/* Header */}
      <AppHeader title="AI Legal Assistant" subtitle={`Context: ${activeDocument.name}`} />

      {/* Messages Scroll Area */}
      <div className="flex-1 px-4 py-4 space-y-4 overflow-y-auto">
        {chatMessages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {msg.sender === 'user' ? (
              <div className="max-w-[82%] px-4 py-3 rounded-2xl rounded-tr-xs bg-white text-[#151515] font-medium text-xs shadow-sm border border-stone-200/80 text-left">
                {msg.text}
              </div>
            ) : (
              <div className="max-w-[94%] flex items-start gap-2.5 text-left">
                {/* AI Avatar */}
                <div className="w-8 h-8 rounded-xl bg-[#FFF2EA] border border-[#FF6B22]/25 flex items-center justify-center text-[#FF6B22] shrink-0 mt-1 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>

                {/* AI Response Card */}
                <div className="space-y-2.5 flex-1">
                  <div className="glass-panel p-4 rounded-2xl rounded-tl-xs border border-white/90 text-xs space-y-2.5 text-[#151515]" role="status" aria-live="polite">
                    <p className="leading-relaxed font-normal">
                      {msg.text.split('Note:')[0]}
                    </p>

                    {msg.text.includes('Note:') && (
                      <div className="pt-2 border-t border-stone-200/60 text-[11px] text-[#6F6A64]">
                        <span className="font-semibold text-stone-700">Note: </span>
                        {msg.text.split('Note:')[1]}
                      </div>
                    )}
                  </div>

                  {/* Action Chips */}
                  {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestedPrompts.map((chip, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleChipClick(chip)}
                          className="px-3 py-1.5 rounded-full glass-panel hover:bg-white text-[11px] font-medium text-[#FF6B22] border border-[#FF6B22]/30 transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Glass Input Field */}
      <div className="px-4 pb-2 pt-2 mb-20 bg-gradient-to-t from-[#F7F2EC] via-[#F7F2EC] to-transparent">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask anything about this document..."
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl glass-panel text-xs sm:text-sm text-[#151515] placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B22]/30 border border-white/90 shadow-md shadow-[#46321e]/5"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#FF6B22] hover:bg-[#F25E12] text-white flex items-center justify-center shadow-md shadow-[#FF6B22]/20 active:scale-95 cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
