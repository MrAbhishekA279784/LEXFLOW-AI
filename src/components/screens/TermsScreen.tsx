import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TermsScreen: React.FC = () => {
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
        <h1 className="text-xl font-bold text-[#151515]">Terms & Privacy</h1>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-8 pb-20"
      >
        <div className="bg-orange-50 border border-orange-200 p-5 rounded-2xl">
          <h2 className="text-lg font-bold text-orange-900 mb-2">Important: Understand Before You Rely</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm text-orange-800">
            <li>AI can make mistakes.</li>
            <li>Legal rules can depend on jurisdiction and facts.</li>
            <li>A contract may contain terms that require professional interpretation.</li>
            <li>LEXFLOW shows the sources used for material findings where available.</li>
            <li>Users should open and verify cited clauses and legal authorities.</li>
            <li>LEXFLOW cannot guarantee that an outcome will occur.</li>
            <li>LEXFLOW does not replace professional legal advice.</li>
          </ul>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#151515]">1. About LEXFLOW</h2>
          <p className="text-sm text-[#6F6A64] leading-relaxed">
            LEXFLOW is an AI-powered legal information and document-analysis application.
            LEXFLOW does not provide legal representation and is not a substitute for a lawyer, advocate, attorney, or other qualified legal professional.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#151515]">2. Informational Legal Assistance</h2>
          <p className="text-sm text-[#6F6A64] leading-relaxed">
            The information provided by LEXFLOW is for informational purposes only. It is not intended to be legal advice. Users should not act or refrain from acting on the basis of any content included in this application without seeking legal or other professional advice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#151515]">3. AI Limitations & Accuracy</h2>
          <p className="text-sm text-[#6F6A64] leading-relaxed">
            AI-generated outputs may contain mistakes, omissions, or incomplete interpretations. Users should review the cited clauses and legal sources before relying on an analysis. Do not represent AI output as guaranteed legal advice or a guaranteed legal outcome.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#151515]">4. Uploaded Documents & Data Processing</h2>
          <p className="text-sm text-[#6F6A64] leading-relaxed">
            When you upload a document, we process it to extract relevant clauses, analyze risks, and provide you with a lawyer prep-kit. We use AI services to perform this analysis. Your documents are stored securely in Supabase Storage and are only accessible by you. We do not use your documents to train general AI models.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#151515]">5. User Control & Privacy</h2>
          <p className="text-sm text-[#6F6A64] leading-relaxed">
            Your account information (name, email, profile photo) and personalization settings (language, response style) are stored securely in Supabase to provide a tailored experience. You have control over your data and can update your preferences at any time. We do not infer sensitive personal attributes (such as religion or political beliefs) from your usage.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#151515]">6. Authentication & Security</h2>
          <p className="text-sm text-[#6F6A64] leading-relaxed">
            We use Firebase Authentication to securely manage your login credentials. Your password is encrypted and never visible to us. We employ industry-standard security measures to protect your data, but no electronic transmission or storage is 100% secure.
          </p>
        </section>
        
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-[#151515]">7. Contact</h2>
          <p className="text-sm text-[#6F6A64] leading-relaxed">
            If you have any questions about these terms or our privacy practices, please contact the developer at:{' '}
            <a href="mailto:abhishekgupta8arollno29@gmail.com" className="text-[#FF6B22] hover:underline">
              abhishekgupta8arollno29@gmail.com
            </a>
          </p>
        </section>
      </motion.div>
    </div>
  );
};
