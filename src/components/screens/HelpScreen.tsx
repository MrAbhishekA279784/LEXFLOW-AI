import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Search, Activity, ShieldAlert, Cpu, LifeBuoy } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const HelpScreen: React.FC = () => {
  const { goBack } = useApp();

  return (
    <div className="relative min-h-[92vh] flex flex-col px-6 py-6 max-w-2xl mx-auto">
      {/* Top Bar with Back Arrow */}
      <div className="flex items-center mb-8 sticky top-6 bg-[#F7F2EC]/80 backdrop-blur-md z-10 py-2 rounded-2xl">
        <button
          onClick={goBack}
          aria-label="Go back"
          className="w-10 h-10 rounded-full bg-white/70 border border-white/80 flex items-center justify-center text-[#151515] hover:bg-white shadow-sm cursor-pointer active:scale-95 transition-all mr-4"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-xl font-bold text-[#151515]">Help & Support</h1>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 pb-20"
      >
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#151515] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#FF6B22]" /> How LEXFLOW Works
          </h2>
          <ul className="space-y-3 text-sm text-[#6F6A64]">
            <li className="flex items-start gap-3 bg-white/50 p-4 rounded-xl border border-white/60">
              <span className="font-bold text-[#151515]">1.</span>
              Upload a legal document securely.
            </li>
            <li className="flex items-start gap-3 bg-white/50 p-4 rounded-xl border border-white/60">
              <span className="font-bold text-[#151515]">2.</span>
              LEXFLOW extracts important clauses and builds a Legal Action Graph.
            </li>
            <li className="flex items-start gap-3 bg-white/50 p-4 rounded-xl border border-white/60">
              <span className="font-bold text-[#151515]">3.</span>
              Test What-If scenarios and retrieve applicable legal sources.
            </li>
            <li className="flex items-start gap-3 bg-white/50 p-4 rounded-xl border border-white/60">
              <span className="font-bold text-[#151515]">4.</span>
              Review evidence-backed analysis and generate a Lawyer Prep-Kit.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#151515] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#FF6B22]" /> Using LEXFLOW
          </h2>
          <div className="grid gap-3 text-sm">
            <div className="bg-white/50 p-4 rounded-xl border border-white/60">
              <h3 className="font-bold text-[#151515] mb-1">Upload & Analyze</h3>
              <p className="text-[#6F6A64]">Click "New Document" on the home screen. We support PDF and standard document formats.</p>
            </div>
            <div className="bg-white/50 p-4 rounded-xl border border-white/60">
              <h3 className="font-bold text-[#151515] mb-1">What-If Scenarios</h3>
              <p className="text-[#6F6A64]">Navigate to the Scenarios tab to test hypothetical situations like missed payments or early termination.</p>
            </div>
            <div className="bg-white/50 p-4 rounded-xl border border-white/60">
              <h3 className="font-bold text-[#151515] mb-1">Lawyer Prep-Kit</h3>
              <p className="text-[#6F6A64]">Use the Lawyer Kit tab to generate a structured brief of risks, conflicts, and questions for your attorney.</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#151515] flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-600" /> AI & Legal Analysis
          </h2>
          <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl space-y-3">
            <p className="text-sm text-orange-900 font-medium">LEXFLOW provides informational legal assistance. It does not replace a lawyer or qualified legal professional.</p>
            <p className="text-sm text-orange-800">AI-generated analysis can be incomplete or incorrect. Users should verify important conclusions against the cited document clauses and legal sources.</p>
            <p className="text-sm text-orange-800 font-medium">For important, disputed, urgent, or high-risk legal matters, consult a qualified legal professional.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#151515] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#FF6B22]" /> Troubleshooting
          </h2>
          <div className="space-y-3 text-sm">
            <details className="bg-white/50 p-4 rounded-xl border border-white/60 cursor-pointer">
              <summary className="font-bold text-[#151515] outline-none">Upload failure or Document not loading</summary>
              <p className="text-[#6F6A64] mt-2 pl-4 border-l-2 border-[#FF6B22]/30">Ensure your document is a supported format and under 10MB. Check your internet connection and try again.</p>
            </details>
            <details className="bg-white/50 p-4 rounded-xl border border-white/60 cursor-pointer">
              <summary className="font-bold text-[#151515] outline-none">Analysis taking time</summary>
              <p className="text-[#6F6A64] mt-2 pl-4 border-l-2 border-[#FF6B22]/30">Complex legal documents take time to process. Please wait up to a minute for the graph and evidence engines to complete.</p>
            </details>
            <details className="bg-white/50 p-4 rounded-xl border border-white/60 cursor-pointer">
              <summary className="font-bold text-[#151515] outline-none">Login issues</summary>
              <p className="text-[#6F6A64] mt-2 pl-4 border-l-2 border-[#FF6B22]/30">Verify your email and password. If you used Google to sign up, ensure you continue with Google.</p>
            </details>
          </div>
        </section>

        <section className="space-y-4 mt-8 pt-8 border-t border-stone-200">
          <h2 className="text-lg font-bold text-[#151515] flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-[#FF6B22]" /> Need more help?
          </h2>
          <p className="text-sm text-[#6F6A64]">
            Contact the developer:
          </p>
          <a 
            href="mailto:abhishekgupta8arollno29@gmail.com" 
            className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl bg-[#FF6B22]/10 hover:bg-[#FF6B22]/20 text-[#FF6B22] font-semibold transition-colors mt-2"
          >
            Developer Contact
          </a>
        </section>
      </motion.div>
    </div>
  );
};
