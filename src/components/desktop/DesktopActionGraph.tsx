import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Building2, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Wrench, 
  ShieldCheck, 
  Maximize2,
  IndianRupee,
  Shield,
  FileCheck,
  Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RENTAL_CLAUSES } from '../../data/initialData';

export const DesktopActionGraph: React.FC = () => {
  const { navigateTo, openEvidence, setIsGraphExportModalOpen } = useApp();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const handleNodeClick = (clauseSection: string) => {
    const clause = RENTAL_CLAUSES.find(c => c.section.includes(clauseSection)) || RENTAL_CLAUSES[0];
    openEvidence(clause);
  };

  return (
    <div className="glass-card p-5 rounded-3xl border border-white/80 shadow-md shadow-[#46321e]/5 flex flex-col justify-between relative overflow-hidden h-full min-h-[380px]">
      {/* Header */}
      <div className="flex items-start justify-between pb-2 border-b border-stone-100/80">
        <div>
          <h3 className="text-sm font-bold text-[#151515]">Legal Action Graph</h3>
          <p className="text-[11px] text-[#6F6A64]">
            Visualize obligations, rights and consequences.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsGraphExportModalOpen(true)}
            aria-label="Export graph as SVG or High-Res Image"
            title="Export Graph (SVG / High-Res PNG)"
            className="px-2 py-1 rounded-xl bg-white/80 hover:bg-white flex items-center gap-1 text-[11px] font-bold text-[#FF6B22] border border-[#FF6B22]/30 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#FF6B22]" />
            <span>Export</span>
          </button>
          <button
            onClick={() => navigateTo('legal-graph')}
            aria-label="Expand graph to full screen"
            title="Open interactive action graph workspace"
            className="w-7 h-7 rounded-xl hover:bg-white flex items-center justify-center text-stone-500 hover:text-[#FF6B22] transition-colors cursor-pointer border border-transparent hover:border-stone-200"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visual Action Graph Canvas with 3D perspective and glass styling */}
      <div 
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
        className="relative flex-1 flex flex-col items-center justify-center py-3 select-none"
      >
        {/* SVG Connectors Layer with Animated Flow Energy */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
          viewBox="0 0 380 260"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="flowOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B22" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFA868" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="flowBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.3" />
            </linearGradient>
            <filter id="glowSubtle" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Base Structural Connectors */}
          <path d="M 190 32 L 190 52 L 110 52 L 110 70" stroke="#DDD6CE" strokeWidth="2" fill="none" />
          <path d="M 190 32 L 190 52 L 270 52 L 270 70" stroke="#DDD6CE" strokeWidth="2" fill="none" />
          <path d="M 110 98 L 110 118" stroke="#DDD6CE" strokeWidth="2" fill="none" />
          <path d="M 270 98 L 270 118" stroke="#DDD6CE" strokeWidth="2" fill="none" />
          <path d="M 110 148 L 110 162 L 72 162 L 72 176" stroke="#DDD6CE" strokeWidth="2" fill="none" />
          <path d="M 110 148 L 110 162 L 148 162 L 148 176" stroke="#DDD6CE" strokeWidth="2" fill="none" />
          <path d="M 110 206 L 110 220 L 80 220 L 80 228" stroke="#DDD6CE" strokeWidth="2" fill="none" />
          <path d="M 270 148 L 270 220 L 270 228" stroke="#DDD6CE" strokeWidth="2" fill="none" />

          {/* Animated Flow Beams Over Connectors */}
          <path d="M 190 32 L 190 52 L 110 52 L 110 70" stroke="url(#flowOrange)" strokeWidth="1.8" fill="none" className="connector-flow" filter="url(#glowSubtle)" />
          <path d="M 190 32 L 190 52 L 270 52 L 270 70" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.75" fill="none" className="connector-flow" />
          <path d="M 110 98 L 110 118" stroke="url(#flowOrange)" strokeWidth="1.8" fill="none" className="connector-flow" />
          <path d="M 270 98 L 270 118" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.75" fill="none" className="connector-flow" />
          <path d="M 110 148 L 110 162 L 72 162 L 72 176" stroke="url(#flowBlue)" strokeWidth="1.6" fill="none" className="connector-flow" />
          <path d="M 110 148 L 110 162 L 148 162 L 148 176" stroke="#F59E0B" strokeWidth="1.6" fill="none" className="connector-flow" />
        </svg>

        {/* 1. ROOT NODE: Rental Agreement with 3D Elevation */}
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleNodeClick('4.1')}
          onMouseEnter={() => setHoveredNode('root')}
          onMouseLeave={() => setHoveredNode(null)}
          className="relative z-10 node-3d px-5 py-2 rounded-2xl bg-gradient-to-br from-[#FFF3EB] to-[#FFE5D3] border border-[#FF6B22]/35 text-[#151515] font-extrabold text-xs shadow-md shadow-[#FF6B22]/10 cursor-pointer flex items-center gap-2 transition-all"
        >
          <div className="w-2 h-2 rounded-full bg-[#FF6B22] animate-ping opacity-75" />
          <span className="tracking-tight">Rental Agreement</span>
        </motion.div>

        {/* 2. PARTIES ROW: Tenant & Landlord with 3D Depth */}
        <div className="relative z-10 w-full flex justify-around mt-5 px-6">
          {/* Tenant */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNodeClick('4.1')}
            className="node-3d px-4 py-2 rounded-xl bg-white/85 backdrop-blur-md border border-white/95 shadow-xs flex items-center gap-2 cursor-pointer hover:border-[#FF6B22]/50 hover:bg-white transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-[#151515] text-white flex items-center justify-center text-[10px] shadow-2xs">
              <User className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-[#151515]">Tenant</span>
          </motion.div>

          {/* Landlord */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNodeClick('9.1')}
            className="node-3d px-4 py-2 rounded-xl bg-white/85 backdrop-blur-md border border-white/95 shadow-xs flex items-center gap-2 cursor-pointer hover:border-emerald-500/50 hover:bg-white transition-all"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow-2xs">
              <ShieldCheck className="w-3 h-3" />
            </div>
            <span className="text-xs font-bold text-[#151515]">Landlord</span>
          </motion.div>
        </div>

        {/* 3. PRIMARY OBLIGATIONS ROW with 3D Badges */}
        <div className="relative z-10 w-full flex justify-around mt-4 px-4">
          {/* Pay ₹25,000/month */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNodeClick('4.1')}
            className="node-3d px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FFF9F4] to-white/90 backdrop-blur-md border border-[#FF6B22]/30 shadow-xs flex items-center gap-1.5 cursor-pointer text-xs font-bold text-[#151515]"
          >
            <span className="text-[#FF6B22] font-extrabold">₹</span>
            <span>Pay ₹25,000/month</span>
          </motion.div>

          {/* Maintain premises */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNodeClick('9.1')}
            className="node-3d px-3.5 py-2 rounded-xl bg-white/85 backdrop-blur-md border border-white/95 shadow-xs flex items-center gap-1.5 cursor-pointer text-xs font-bold text-[#151515] hover:border-stone-300"
          >
            <Wrench className="w-3.5 h-3.5 text-stone-600" />
            <span>Maintain premises</span>
          </motion.div>
        </div>

        {/* 4. SUB OBLIGATIONS / CONDITIONS with 3D Depth */}
        <div className="relative z-10 w-full flex justify-between gap-2 mt-4 px-2">
          {/* Due: 5th */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNodeClick('4.1')}
            className="node-3d p-2 px-3 rounded-xl bg-blue-50/85 backdrop-blur-md border border-blue-200/70 shadow-2xs flex items-center gap-2 cursor-pointer text-[10px] text-left hover:bg-blue-50"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <div>
              <span className="text-stone-500 font-medium">Due: </span>
              <span className="font-bold text-[#151515]">5th of every month</span>
            </div>
          </motion.div>

          {/* If missed: Late penalty */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNodeClick('4.3')}
            className="node-3d p-2 px-3 rounded-xl bg-amber-50/85 backdrop-blur-md border border-amber-200/70 shadow-2xs flex items-center gap-2 cursor-pointer text-[10px] text-left hover:bg-amber-50"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <div>
              <span className="text-stone-500 font-medium">If missed</span>
              <p className="font-bold text-[#151515]">Late penalty</p>
            </div>
          </motion.div>
        </div>

        {/* 5. BOTTOM ROW: Security Deposit & Termination */}
        <div className="relative z-10 w-full flex justify-around mt-4 px-4">
          {/* Security Deposit */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNodeClick('5.1')}
            className="node-3d px-3.5 py-2 rounded-xl bg-white/85 backdrop-blur-md border border-stone-200/90 shadow-2xs flex items-center gap-2 cursor-pointer text-[11px] text-left hover:border-[#FF6B22]/40"
          >
            <Shield className="w-3.5 h-3.5 text-[#FF6B22] shrink-0" />
            <div>
              <span className="text-stone-500 text-[9px] block uppercase font-bold">Security Deposit</span>
              <span className="font-bold text-[#151515]">₹75,000</span>
            </div>
          </motion.div>

          {/* Termination Notice Period */}
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNodeClick('12.1')}
            className="node-3d px-3.5 py-2 rounded-xl bg-white/85 backdrop-blur-md border border-stone-200/90 shadow-2xs flex items-center gap-2 cursor-pointer text-[11px] text-left hover:border-blue-300"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <div>
              <span className="text-stone-500 text-[9px] block uppercase font-bold">Termination</span>
              <span className="font-bold text-[#151515]">Notice period</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
