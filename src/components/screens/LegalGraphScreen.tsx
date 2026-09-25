import React, { useState } from 'react';
import { 
  ArrowRight, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Download,
  Info,
  GitBranch,
  FileSearch,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';
import { GlassCard } from '../common/GlassCard';
import { GlassBadge } from '../common/GlassBadge';
import { GlassButton } from '../common/GlassButton';
import { RENTAL_CLAUSES, RENTAL_RISKS } from '../../data/initialData';
import { DocumentHistoryView } from '../history/DocumentHistoryView';
import { ComplianceAuditWorkspace } from '../complianceAudit/ComplianceAuditWorkspace';
import { InteractiveLegalGraph } from '../graph/InteractiveLegalGraph';
import { GraphNode } from '../../backend/types/backendTypes';

export const LegalGraphScreen: React.FC = () => {
  const { 
    activeDocument, 
    activeDocTab, 
    setActiveDocTab, 
    openEvidence,
    navigateTo,
    setIsGraphExportModalOpen,
    currentGraph,
    isGraphLoading,
    regenerateDocumentGraph,
    activeScenario
  } = useApp();

  const [clauseSearch, setClauseSearch] = useState<string>('');

  const handleOpenEvidenceFromNode = (node: GraphNode) => {
    openEvidence({
      id: node.sourceClauseId || node.id,
      section: node.sourceClauseId || `Clause p.${node.sourcePage || 1}`,
      title: node.label,
      summary: node.description || `${node.type} extracted from ${activeDocument.name}`,
      fullText: node.description || node.label,
      riskLevel: node.type === 'Penalty' ? 'high' : (node.type === 'Obligation' ? 'medium' : 'low'),
      party: (node.data?.actor?.toLowerCase() === 'landlord' || node.label.toLowerCase().includes('landlord')) 
        ? 'landlord' 
        : (node.data?.actor?.toLowerCase() === 'tenant' || node.label.toLowerCase().includes('tenant')) 
          ? 'tenant' 
          : 'mutual',
      pageNumber: node.sourcePage || 1
    });
  };

  return (
    <div className="min-h-screen pb-24 text-center">
      {/* App Header */}
      <AppHeader
        title={activeDocument.name}
        showBack
        onBack={() => navigateTo('home')}
        rightElement={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsGraphExportModalOpen(true)}
              className="px-2.5 py-1 rounded-xl bg-white/90 hover:bg-white text-xs font-bold text-[#FF6B22] border border-[#FF6B22]/30 shadow-2xs cursor-pointer transition-all flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 text-[#FF6B22]" />
              <span>Export</span>
            </button>
            <GlassBadge variant="neutral">
              {activeDocument.type.toUpperCase()}
            </GlassBadge>
          </div>
        }
      />

      {/* Tabs Navigation Bar */}
      <div className="px-4 pt-2">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 glass-panel rounded-2xl border border-white/80">
          {[
            { id: 'Graph', label: 'Action Graph', icon: GitBranch, count: currentGraph?.nodes.length },
            { id: 'Overview', label: 'Overview', icon: FileText },
            { id: 'Clauses', label: 'Clauses', icon: FileSearch, count: RENTAL_CLAUSES.length },
            { id: 'Risks', label: 'Risks', icon: AlertTriangle, count: RENTAL_RISKS.length },
            { id: 'Audit', label: 'Multi-Agent Audit', icon: ShieldCheck },
            { id: 'History', label: 'History', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeDocTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDocTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#FF6B22] text-white shadow-sm shadow-[#FF6B22]/20'
                    : 'text-[#6F6A64] hover:text-[#151515] hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-200/80 text-stone-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="px-4 pt-4">
        {/* TAB 1: GRAPH VIEW */}
        {activeDocTab === 'Graph' && (
          <div className="space-y-4">
            {/* Interactive XYFlow Graph Component */}
            <InteractiveLegalGraph
              nodes={currentGraph?.nodes || []}
              edges={currentGraph?.edges || []}
              highlightNodeIds={activeScenario?.targetNodeIds || []}
              isLoading={isGraphLoading}
              onOpenEvidence={handleOpenEvidenceFromNode}
              onRegenerate={() => regenerateDocumentGraph()}
              onExport={() => setIsGraphExportModalOpen(true)}
            />

            {/* Quick Action Buttons Below Graph */}
            <div className="flex gap-2">
              <GlassButton
                fullWidth
                size="md"
                variant="primary"
                onClick={() => navigateTo('scenario-input')}
              >
                Stress-Test with Scenario
              </GlassButton>
              <GlassButton
                size="md"
                variant="secondary"
                onClick={() => setIsGraphExportModalOpen(true)}
              >
                <div className="flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#FF6B22]" />
                  <span>Export</span>
                </div>
              </GlassButton>
              <GlassButton
                size="md"
                variant="secondary"
                onClick={() => navigateTo('lawyer-kit')}
              >
                Prep-Kit
              </GlassButton>
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW */}
        {activeDocTab === 'Overview' && (
          <div className="space-y-4 text-left">
            <GlassCard>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF6B22]">
                  Document Synthesis
                </span>
                <GlassBadge variant="success">Statutory Traceability Verified</GlassBadge>
              </div>
              <h3 className="text-base font-bold text-[#151515] mb-2">
                {activeDocument.name}
              </h3>
              <p className="text-xs text-[#6F6A64] leading-relaxed">
                {activeDocument.summary}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-200/60 text-xs">
                <div>
                  <span className="text-stone-400">Monthly Rent</span>
                  <p className="font-bold text-[#151515] text-sm">₹25,000</p>
                </div>
                <div>
                  <span className="text-stone-400">Security Deposit</span>
                  <p className="font-bold text-[#151515] text-sm">₹75,000</p>
                </div>
                <div>
                  <span className="text-stone-400">Notice Period</span>
                  <p className="font-bold text-[#151515] text-sm">30 Days</p>
                </div>
                <div>
                  <span className="text-stone-400">Lock-in Window</span>
                  <p className="font-bold text-[#151515] text-sm">6 Months</p>
                </div>
              </div>
            </GlassCard>

            {/* Compliance Audit Highlight Action Card */}
            <div 
              onClick={() => setActiveDocTab('Audit')}
              className="glass-card p-4 rounded-3xl border border-[#FF6B22]/30 bg-gradient-to-r from-orange-50/70 via-white to-purple-50/70 shadow-sm cursor-pointer hover:shadow-md transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FF6B22] text-white flex items-center justify-center shadow-md shadow-[#FF6B22]/25 shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF6B22] bg-orange-100/80 px-1.5 py-0.5 rounded">
                      Core Capability
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium">Dual-Agent Protocol</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-[#151515] group-hover:text-[#FF6B22] transition-colors mt-0.5">
                    Run Compliance Audit
                  </h4>
                  <p className="text-[11px] text-[#6F6A64]">
                    Adversarial Reviewer & Skeptic audit under statutory laws
                  </p>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#FF6B22] group-hover:bg-[#FF6B22] group-hover:text-white group-hover:border-[#FF6B22] transition-all shrink-0 flex items-center gap-1 shadow-2xs">
                <span>Audit</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card p-4 rounded-2xl">
                <span className="text-xs text-[#6F6A64]">Identified Clauses</span>
                <p className="text-2xl font-bold text-[#151515] mt-1">{RENTAL_CLAUSES.length}</p>
              </div>
              <div className="glass-card p-4 rounded-2xl">
                <span className="text-xs text-[#6F6A64]">Review Flags</span>
                <p className="text-2xl font-bold text-[#FF6B22] mt-1">{RENTAL_RISKS.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CLAUSES */}
        {activeDocTab === 'Clauses' && (
          <div className="space-y-3 text-left">
            <input
              type="text"
              value={clauseSearch}
              onChange={(e) => setClauseSearch(e.target.value)}
              placeholder="Search extracted clauses..."
              className="w-full px-4 py-2.5 rounded-2xl glass-input text-xs text-[#151515]"
            />

            <div className="space-y-2.5">
              {RENTAL_CLAUSES.filter(c => 
                c.title.toLowerCase().includes(clauseSearch.toLowerCase()) || 
                c.section.toLowerCase().includes(clauseSearch.toLowerCase()) ||
                c.summary.toLowerCase().includes(clauseSearch.toLowerCase())
              ).map((clause) => (
                <div
                  key={clause.id}
                  onClick={() => openEvidence(clause)}
                  className="glass-card glass-card-hover p-3.5 rounded-2xl cursor-pointer border border-white/80"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#FF6B22]">
                      {clause.section}
                    </span>
                    <GlassBadge 
                      variant={clause.riskLevel === 'high' ? 'warning' : 'neutral'}
                    >
                      {clause.riskLevel === 'high' ? 'High Impact' : 'Standard'}
                    </GlassBadge>
                  </div>
                  <h4 className="text-xs font-bold text-[#151515]">
                    {clause.title}
                  </h4>
                  <p className="text-[11px] text-[#6F6A64] mt-1 line-clamp-2 leading-relaxed">
                    {clause.summary}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[#FF6B22] font-semibold pt-2 border-t border-stone-200/50">
                    <span>Page {clause.pageNumber}</span>
                    <span className="flex items-center gap-0.5 hover:underline">
                      View Clause Excerpt →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RISKS */}
        {activeDocTab === 'Risks' && (
          <div className="space-y-3 text-left">
            <div className="p-3 rounded-2xl bg-[#FFF5EE] border border-[#FF6B22]/25 text-xs text-[#151515] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#FF6B22] shrink-0 mt-0.5" />
              <span>
                Clauses analyzed from both adversarial landlord exposure and tenant protection perspectives.
              </span>
            </div>

            <div className="space-y-3">
              {RENTAL_RISKS.map((risk) => (
                <div
                  key={risk.id}
                  className="glass-card p-4 rounded-2xl border border-white/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-[#FF6B22]">
                      {risk.clauseRef}
                    </span>
                    <GlassBadge 
                      variant={risk.level === 'critical' ? 'warning' : 'neutral'}
                    >
                      {risk.level === 'critical' ? 'Priority Flag' : 'Caution'}
                    </GlassBadge>
                  </div>

                  <h4 className="text-xs font-bold text-[#151515]">
                    {risk.title}
                  </h4>

                  <p className="text-xs text-[#6F6A64] leading-relaxed">
                    {risk.description}
                  </p>

                  <div className="p-2.5 rounded-xl bg-white/80 border border-stone-200 text-xs">
                    <span className="font-semibold text-emerald-800">Recommendation: </span>
                    <span className="text-stone-700">{risk.recommendation}</span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-stone-500 font-medium">
                      Impact: {risk.potentialImpact}
                    </span>
                    <button
                      onClick={() => {
                        const cl = RENTAL_CLAUSES.find(c => c.section === risk.clauseRef);
                        if (cl) openEvidence(cl);
                      }}
                      className="text-[#FF6B22] font-semibold hover:underline cursor-pointer"
                    >
                      Inspect Source
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: COMPLIANCE AUDIT */}
        {activeDocTab === 'Audit' && (
          <ComplianceAuditWorkspace embeddedInTab />
        )}

        {/* TAB 6: DOCUMENT HISTORY */}
        {activeDocTab === 'History' && (
          <DocumentHistoryView />
        )}
      </div>
    </div>
  );
};
