import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  Play, 
  Loader2, 
  AlertTriangle, 
  Search, 
  FileText, 
  ChevronDown, 
  RefreshCw,
  Briefcase,
  Filter
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ComplianceAuditStats } from './ComplianceAuditStats';
import { ComplianceAuditHorizontalPipeline } from './ComplianceAuditHorizontalPipeline';
import { ComplianceAuditDebateProgress } from './ComplianceAuditDebateProgress';
import { ComplianceAuditDebatePreview } from './ComplianceAuditDebatePreview';
import { ComplianceAuditFindingRow } from './ComplianceAuditFindingRow';
import { ComplianceAuditFindingDrawer } from './ComplianceAuditFindingDrawer';
import { ComplianceAuditRightPanel } from './ComplianceAuditRightPanel';
import { ComplianceFinding } from '../../types/complianceAuditTypes';
import { formatSafeDate } from '../../utils/dateUtils';

interface ComplianceAuditWorkspaceProps {
  embeddedInTab?: boolean;
}

export const ComplianceAuditWorkspace: React.FC<ComplianceAuditWorkspaceProps> = ({
  embeddedInTab = false
}) => {
  const { 
    activeDocument, 
    documents, 
    setActiveDocument, 
    activeComplianceAudit, 
    isAuditRunning, 
    startComplianceAudit,
    fetchComplianceAudits,
    navigateTo 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState<boolean>(false);
  const [selectedFindingForDrawer, setSelectedFindingForDrawer] = useState<ComplianceFinding | null>(null);

  useEffect(() => {
    fetchComplianceAudits(activeDocument.id);
  }, [activeDocument.id]);

  const audit = activeComplianceAudit;

  // Safe summary derivation
  const summary = audit?.summary || audit?.summaryMetrics;
  const humanReviewCount = summary?.humanReviewCount ?? summary?.humanReviewRecommendedCount ?? (audit?.findings ? audit.findings.filter(f => f.humanReviewRecommended).length : 0);
  const totalFindings = summary?.totalFindings ?? audit?.findings?.length ?? 0;

  // Filter and search findings
  const filteredFindings = useMemo(() => {
    if (!audit || !audit.findings) return [];

    return audit.findings.filter((f) => {
      // 1. Stats filter
      if (activeFilter === 'high-risk') {
        if (f.severity !== 'critical' && f.severity !== 'high') return false;
      } else if (activeFilter === 'disputed') {
        if (f.consensusStatus !== 'DISPUTED') return false;
      } else if (activeFilter === 'human-review') {
        if (!f.humanReviewRecommended) return false;
      } else if (activeFilter === 'confirmed') {
        if (f.consensusStatus !== 'CONFIRMED') return false;
      }

      // 2. Category filter
      if (selectedCategory !== 'all') {
        if (f.category !== selectedCategory) return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (f.title || '').toLowerCase().includes(q);
        const claimText = f.claim || f.reviewerClaim || f.reviewerPosition?.argument || '';
        const matchesClaim = claimText.toLowerCase().includes(q);
        const skepticText = typeof f.skepticChallenge === 'string' 
          ? f.skepticChallenge 
          : f.skepticChallenge?.challenge || '';
        const matchesSkeptic = skepticText.toLowerCase().includes(q);
        const sectionText = f.affectedClauseRefs?.join(' ') || f.clauseReference?.section || '';
        const matchesSection = sectionText.toLowerCase().includes(q);
        const authorities = f.legalAuthorities || f.statutoryAuthorities || [];
        const matchesStatute = authorities.some(a => 
          (a.actOrCourt || '').toLowerCase().includes(q) || 
          (a.sectionOrArticle || '').toLowerCase().includes(q) ||
          (a.title || '').toLowerCase().includes(q)
        );
        if (!matchesTitle && !matchesClaim && !matchesSkeptic && !matchesSection && !matchesStatute) {
          return false;
        }
      }

      return true;
    });
  }, [audit, activeFilter, selectedCategory, searchQuery]);

  const handleRunAudit = async () => {
    if (isAuditRunning) return;
    await startComplianceAudit(activeDocument.id);
  };

  return (
    <div className={`w-full max-w-6xl mx-auto text-left ${embeddedInTab ? 'py-1' : 'py-2 pb-16'}`}>
      {/* Responsive Workspace Grid: Main Workspace (Left/Center) + Contextual Panel (Right on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-5 items-start">
        {/* Main Center Area */}
        <div className="space-y-4 min-w-0">
          {/* Top Workspace Header */}
          <div className="glass-card p-4 sm:p-5 rounded-3xl border border-white/80 shadow-md shadow-[#46321e]/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Document Picker & Title */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FF6B22]/10 text-[#FF6B22] border border-[#FF6B22]/20 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Compliance Audit
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium hidden sm:inline">
                    Dual-Agent Adversarial Protocol
                  </span>
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
                    className="flex items-center gap-2 group cursor-pointer text-left max-w-full"
                  >
                    <h1 className="text-lg sm:text-xl font-extrabold text-[#151515] tracking-tight group-hover:text-[#FF6B22] transition-colors truncate">
                      {activeDocument.name}
                    </h1>
                    <ChevronDown className="w-4 h-4 text-stone-400 group-hover:text-[#FF6B22] transition-colors shrink-0" />
                  </button>

                  {isDocDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-72 glass-panel p-2 rounded-2xl border border-white shadow-xl z-30 space-y-1">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2 block py-1">
                        Select Target Document:
                      </span>
                      {documents.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setActiveDocument(d);
                            setIsDocDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                            d.id === activeDocument.id
                              ? 'bg-[#FF6B22]/10 text-[#FF6B22] font-bold'
                              : 'hover:bg-white/80 text-stone-700'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{d.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  onClick={handleRunAudit}
                  disabled={isAuditRunning}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold text-white shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                    isAuditRunning
                      ? 'bg-stone-400 cursor-not-allowed'
                      : 'bg-[#FF6B22] hover:bg-[#E0530E] active:scale-98 shadow-[#FF6B22]/25'
                  }`}
                >
                  {isAuditRunning ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Auditing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{audit ? 'Re-Run Audit' : 'Run Multi-Agent Audit'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Audit Meta Bar with Safe Date Display */}
            {audit && (
              <div className="pt-2.5 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="font-mono">
                    Audit ID: <strong className="text-stone-700">{audit.id}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Engine: <strong className="text-stone-700">Reviewer + Skeptic v5.0</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Status: <strong className="text-emerald-700 uppercase">{audit.status}</strong>
                  </span>
                </div>

                <div className="text-stone-400">
                  {formatSafeDate(audit.createdAt, 'Active Audit')}
                </div>
              </div>
            )}
          </div>

          {/* Human Review Escalation Banner */}
          {audit && humanReviewCount > 0 && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-purple-50/95 border border-purple-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-xl bg-purple-600 text-white shrink-0 mt-0.5 shadow-2xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-purple-950">
                    {humanReviewCount} Finding{humanReviewCount > 1 ? 's' : ''} Escalated for Human Legal Review
                  </h3>
                  <p className="text-[11px] text-purple-800 mt-0.5">
                    Contested interpretations on severe exposure provisions flagged for lawyer verification.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('lawyer-kit')}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer self-end sm:self-center"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>Open Lawyer Kit</span>
              </button>
            </div>
          )}

          {/* Horizontal 'Audit Pipeline' Progress Tracker */}
          <ComplianceAuditHorizontalPipeline 
            status={audit?.status || 'completed'} 
            roundCount={2}
            findingCount={totalFindings}
            disputedCount={audit?.summaryMetrics?.disputedFindingsCount ?? (audit?.findings ? audit.findings.filter(f => f.consensusStatus === 'DISPUTED').length : 0)}
          />

          {/* Summary Statistics with Interactive Filter Selection */}
          <ComplianceAuditStats
            audit={audit}
            activeFilter={activeFilter}
            onFilterSelect={(f) => setActiveFilter(f)}
          />

          {/* Compact Adversarial Agent Debate Section */}
          {audit && audit.findings && audit.findings.length > 0 && (
            <ComplianceAuditDebatePreview 
              findings={audit.findings} 
              activeFinding={selectedFindingForDrawer}
            />
          )}

          {/* Filter and Search Bar */}
          <div className="glass-card p-2.5 sm:p-3 rounded-2xl border border-white/80 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              {[
                { id: 'all', label: 'All Categories' },
                { id: 'penalty_exposure', label: 'Penalties' },
                { id: 'termination_exposure', label: 'Lock-in & Termination' },
                { id: 'unfavorable_provision', label: 'Deductions' },
                { id: 'compliance_risk', label: 'Statutory Compliance' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                    selectedCategory === cat.id
                      ? 'bg-[#FF6B22] text-white shadow-xs'
                      : 'bg-white/80 hover:bg-white text-stone-600 border border-stone-200/70'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search findings, statutes..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/90 border border-stone-200/80 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#FF6B22]/30"
              />
            </div>
          </div>

          {/* Active Filter Indicators */}
          {(activeFilter !== 'all' || selectedCategory !== 'all' || searchQuery) && (
            <div className="flex items-center justify-between text-xs text-stone-500 px-1">
              <span>
                Showing <strong>{filteredFindings.length}</strong> of {totalFindings} findings
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveFilter('all');
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-[11px] font-bold text-[#FF6B22] hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Findings List (Compact Data-Driven Layout) */}
          <div className="space-y-2.5">
            {filteredFindings.length > 0 ? (
              filteredFindings.map((finding) => (
                <ComplianceAuditFindingRow
                  key={finding.findingId || finding.id}
                  finding={finding}
                  isSelected={selectedFindingForDrawer?.findingId === finding.findingId || selectedFindingForDrawer?.id === finding.id}
                  onSelectFinding={(f) => setSelectedFindingForDrawer(f)}
                />
              ))
            ) : (
              <div className="glass-card p-8 rounded-3xl border border-white/80 shadow-xs text-center space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#FF6B22] mx-auto flex items-center justify-center">
                  <Filter className="w-5 h-5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-stone-800">
                  No matching compliance findings
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  No findings match your current filter criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#FF6B22] shadow-2xs hover:bg-stone-50 cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Contextual Right Panel */}
        <div className="hidden lg:block shrink-0 sticky top-6">
          <ComplianceAuditRightPanel audit={audit} />
        </div>
      </div>

      {/* Slide-Over / Modal Finding Detail Panel */}
      <ComplianceAuditFindingDrawer
        finding={selectedFindingForDrawer}
        isOpen={Boolean(selectedFindingForDrawer)}
        onClose={() => setSelectedFindingForDrawer(null)}
      />
    </div>
  );
};
