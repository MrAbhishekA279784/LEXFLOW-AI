import React from 'react';
import { motion } from 'motion/react';
import { FileText, ChevronRight, Loader2, History, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentItem } from '../../types';

export const DesktopRecentDocuments: React.FC = () => {
  const { documents, setActiveDocument, navigateTo } = useApp();

  const handleSelectDoc = (doc: DocumentItem) => {
    setActiveDocument(doc);
    if (doc.status === 'analyzing') {
      navigateTo('analyzing');
    } else {
      navigateTo('legal-graph');
    }
  };

  return (
    <div className="glass-card p-5 rounded-3xl border border-white/90 shadow-md shadow-[#46321e]/5 flex flex-col justify-between h-full min-h-[380px] text-left relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/60">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#151515]">Your Recent Documents</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B22]/10 text-[#FF6B22] border border-[#FF6B22]/20">
            {documents.length}
          </span>
        </div>
        <button
          onClick={() => navigateTo('upload')}
          className="text-xs font-bold text-[#FF6B22] hover:text-[#E0530E] hover:underline cursor-pointer flex items-center gap-1 transition-colors"
        >
          <span>See all</span>
          <span>→</span>
        </button>
      </div>

      {/* List of Documents */}
      <div className="space-y-2 py-2">
        {documents.slice(0, 5).map((doc) => {
          const isDocx = doc.type === 'docx';
          const isProcessing = doc.status === 'analyzing';

          return (
            <motion.div
              key={doc.id}
              whileHover={{ x: 3, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleSelectDoc(doc)}
              className="px-3.5 py-2.5 rounded-2xl bg-white/50 hover:bg-white/90 border border-white/60 hover:border-white shadow-2xs hover:shadow-xs transition-all duration-150 flex items-center justify-between cursor-pointer group"
            >
              {/* Left file icon & title */}
              <div className="flex items-center gap-3 min-w-0">
                <div 
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs ${
                    isDocx
                      ? 'bg-blue-50 text-blue-600 border-blue-200/70'
                      : 'bg-red-50 text-red-600 border-red-200/70'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[#151515] truncate group-hover:text-[#FF6B22] transition-colors">
                    {doc.name}
                  </h4>
                  <p className="text-[10px] text-[#6F6A64]">
                    <span className="uppercase font-bold tracking-wider">{doc.type}</span> · {doc.uploadedAt}
                  </p>
                </div>
              </div>

              {/* Right badge & chevron */}
              <div className="flex items-center gap-2 shrink-0">
                {isProcessing ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1 shadow-2xs">
                    <span>Processing</span>
                    <Loader2 className="w-3 h-3 animate-spin" />
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
                    Analysis Complete
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDocument(doc);
                    navigateTo('compliance-audit');
                  }}
                  title="Run Multi-Agent Compliance Audit"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveDocument(doc);
                    navigateTo('document-history');
                  }}
                  title="View Revision History & Revert"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-[#FF6B22] hover:bg-orange-50 transition-colors cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-[#FF6B22] group-hover:translate-x-0.5 transition-all" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Subtle bottom note */}
      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-[#6F6A64]">
        <span>5 total active agreements</span>
        <button 
          onClick={() => navigateTo('upload')}
          className="font-bold text-[#FF6B22] hover:underline cursor-pointer"
        >
          + Add New
        </button>
      </div>
    </div>
  );
};

