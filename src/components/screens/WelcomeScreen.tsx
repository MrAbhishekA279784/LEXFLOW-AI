import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WelcomeScreen: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between items-center px-6 py-10 max-w-md mx-auto text-center select-none">
      {/* Top Visual: Glowing Glass Sphere / Legal Orb */}
      <div className="w-full flex-1 flex flex-col items-center justify-center pt-6">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center mb-8"
        >
          {/* Subtle outer amber radiant swirl */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FF6B22]/25 via-[#FFA868]/35 to-transparent blur-2xl animate-pulse" />
          
          {/* 3D Glass Sphere rendering with CSS gradients */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full p-[2px] bg-gradient-to-b from-white/80 via-white/30 to-transparent shadow-2xl shadow-[#FF6B22]/20">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FFA266]/70 via-[#FF6B22]/85 to-[#D64E0E] flex items-center justify-center overflow-hidden relative border border-white/40">
              {/* Inner glass refraction highlight */}
              <div className="absolute -top-12 -left-8 w-36 h-36 rounded-full bg-gradient-to-br from-white/80 via-white/20 to-transparent blur-md transform -rotate-12" />
              
              {/* Ambient inner soft curve */}
              <div className="w-40 h-40 rounded-full border border-white/30 bg-gradient-to-tr from-white/10 to-white/30 backdrop-blur-md flex items-center justify-center shadow-inner">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-xl border border-white/50" />
              </div>

              {/* Gentle floating light particle */}
              <div className="absolute bottom-6 right-8 w-12 h-12 rounded-full bg-white/40 blur-sm" />
            </div>
          </div>

          {/* Ribbon arc */}
          <div className="absolute -inset-2 rounded-full border border-[#FF6B22]/20 scale-105 pointer-events-none" />
        </motion.div>

        {/* Brand Logo & Typography */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-center">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#151515]">LEX</span>
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#FF6B22]">FLOW</span>
          </div>

          <p className="text-lg sm:text-xl font-medium text-[#151515] max-w-xs mx-auto leading-snug">
            Turn Legal Complexity Into Clear Next Steps.
          </p>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="w-full space-y-6 pt-6"
      >
        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-6 h-2 rounded-full bg-[#FF6B22]" />
          <div className="w-2 h-2 rounded-full bg-stone-300" />
          <div className="w-2 h-2 rounded-full bg-stone-300" />
        </div>

        {/* Steps subtext */}
        <p className="text-xs tracking-wider text-[#6F6A64] font-medium uppercase">
          Understand · Analyze · Plan
        </p>

        {/* Get Started Button */}
        <button
          onClick={() => navigateTo('auth')}
          className="w-full py-4 rounded-2xl bg-[#151515] hover:bg-[#252525] text-white text-base font-semibold shadow-xl shadow-black/15 flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.99] cursor-pointer"
        >
          <span>Get Started</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Legal Disclaimer */}
        <p className="text-[11px] text-[#6F6A64] pt-1">
          Inform · Empower · Not a substitute for legal advice.
        </p>
      </motion.div>
    </div>
  );
};
