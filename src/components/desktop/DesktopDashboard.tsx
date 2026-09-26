import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { DesktopQuickActions } from './DesktopQuickActions';
import { DesktopRecentDocuments } from './DesktopRecentDocuments';
import { DesktopActionGraph } from './DesktopActionGraph';
import { DesktopKeyInsights } from './DesktopKeyInsights';
import { GeminiBadge } from '../common/GeminiBadge';

export const DesktopDashboard: React.FC = () => {
  const { user } = useApp();

  return (
    <div className="space-y-6 text-left">
      {/* Persistent Legal Aid Disclaimer */}
      <div
        role="note"
        aria-label="Legal assistance disclaimer"
        className="w-full px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between shadow-2xs"
      >
        <div className="flex items-center gap-3">
          <span className="text-amber-600 text-xl shrink-0" aria-hidden="true">⚖️</span>
          <p className="text-xs text-amber-900 leading-relaxed">
            <strong>LEXFLOW</strong> provides AI-powered informational legal assistance for document understanding,
            plain-language explanations, and What-If scenario modeling.
            It does not constitute formal legal advice and does not replace a qualified attorney.
          </p>
        </div>
        <GeminiBadge agentName="4-Agent Legal Review" />
      </div>

      {/* Hero Greeting & Quote matching Reference B */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <motion.h1 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl lg:text-3xl font-extrabold text-[#151515] tracking-tight"
          >
            Good morning, {user.name ? user.name.split(' ')[0] : 'Visitor'}! 👋
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-xs text-[#6F6A64]"
          >
            Your legal documents. Clear insights. Smarter decisions.
          </motion.p>
        </div>

        {/* Date and Inspiring Legal Quote */}
        <div className="text-right hidden sm:block">
          <span className="text-xs font-semibold text-stone-400 block">
            Thu, 24 Apr 2025
          </span>
          <p className="text-xs text-stone-600 italic font-serif mt-1">
            “Understand today.<br />
            Negotiate stronger tomorrow.”
          </p>
        </div>
      </div>

      {/* 4 Quick Action Cards */}
      <DesktopQuickActions />

      {/* Main Content Grid: Recent Documents (Left) + Legal Action Graph (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-stretch">
        <DesktopRecentDocuments />
        <DesktopActionGraph />
      </div>

      {/* Key Insights (Bottom Metrics & Overall Document Score) */}
      <DesktopKeyInsights />
    </div>
  );
};
