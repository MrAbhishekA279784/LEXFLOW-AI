import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Play, 
  Loader2, 
  AlertTriangle, 
  Search, 
  FileText, 
  ChevronDown, 
  RefreshCw,
  Scale,
  Briefcase,
  HelpCircle,
  CheckCircle2,
  Filter,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ComplianceAuditStats } from './ComplianceAuditStats';
import { ComplianceAuditDebateProgress } from './ComplianceAuditDebateProgress';
import { ComplianceAuditFindingCard } from './ComplianceAuditFindingCard';
import { ComplianceAuditRecord } from '../../types/complianceAuditTypes';

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
    complianceAudits,
    isAuditRunning, 
    startComplianceAudit,
    fetchComplianceAudits,
    selectComplianceAudit,
    navigateTo 
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDocDropdownOpen, setIsDocDropdownOpen] = useState<boolean>(false);

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
          (a.actOrCourt || (a as any).actOrStatute || '').toLowerCase().includes(q) || 
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
    <div className={`w-full max-w-5xl mx-auto space-y-5 text-left ${embeddedInTab ? 'py-1' : 'py-2 pb-16'}`}>
      {/* Top Workspace Header */}
      <div className="glass-card p-5 rounded-3xl border border-white/80 shadow-md shadow-[#46321e]/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Document Picker & Title */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FF6B22]/10 text-[#FF6B22] border border-[#FF6B22]/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> PS #5 Compliance Auditor
              </span>
              <span className="text-[11px] text-stone-400 font-medium">
                Dual-Agent Adversarial Protocol
              </span>
            </div>

            <div className="relative">
              <button
                onClick={() => setIsDocDropdownOpen(!isDocDropdownOpen)}
                className="flex items-center gap-2 group cursor-pointer text-left"
              >
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#151515] tracking-tight group-hover:text-[#FF6B22] transition-colors truncate">
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

            <p className="text-xs text-[#6F6A64]">
              Reviewer Agent audits contractual provisions · Skeptic Agent mounts adversarial legal challenges · Consensus synthesized with statutory evidence.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
            <button
              onClick={handleRunAudit}
              disabled={isAuditRunning}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md flex items-center gap-2 transition-all cursor-pointer ${
                isAuditRunning
                  ? 'bg-stone-400 cursor-not-allowed'
                  : 'bg-[#FF6B22] hover:bg-[#E0530E] active:scale-98 shadow-[#FF6B22]/25'
              }`}
            >
              {isAuditRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Agents Debating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Multi-Agent Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Audit Meta Bar */}
        {audit && (
          <div className="pt-3 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-500">
            <div className="flex flex-wrap items-center gap-3">
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
              Generated {new Date(audit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )}
      </div>

      {/* Human Review Escalation Banner */}
      {audit && humanReviewCount > 0 && (
        <div className="p-4 rounded-3xl bg-purple-50/95 border border-purple-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-left">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-purple-600 text-white shrink-0 mt-0.5 shadow-2xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-purple-950">
                {humanReviewCount} Finding{humanReviewCount > 1 ? 's' : ''} Escalated for Human Legal Review
              </h3>
              <p className="text-xs text-purple-800 mt-0.5">
                The Skeptic Agent has identified critical evidentiary gaps or contested interpretations on severe exposure provisions. Unresolved high-risk findings have been flagged for lawyer verification.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigateTo('lawyer-kit')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer self-end sm:self-center"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Open Lawyer Prep-Kit</span>
          </button>
        </div>
      )}

      {/* Multi-Agent Live Pipeline Tracker */}
      <ComplianceAuditDebateProgress 
        status={audit?.status || 'completed'} 
        roundCount={2} 
      />

      {/* Summary Statistics with Interactive Filter Selection */}
      <ComplianceAuditStats
        audit={audit}
        activeFilter={activeFilter}
        onFilterSelect={(f) => setActiveFilter(f)}
      />

      {/* Filter and Search Bar */}
      <div className="glass-card p-3 rounded-2xl border border-white/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'penalty_exposure', label: 'Penalties' },
            { id: 'termination_exposure', label: 'Lock-in & Termination' },
            { id: 'unfavorable_provision', label: 'Deductions & Covenants' },
            { id: 'compliance_risk', label: 'Statutory Compliance' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
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
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search findings, clauses, statutes..."
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

      {/* Findings List */}
      <div className="space-y-4">
        {filteredFindings.length > 0 ? (
          filteredFindings.map((finding) => (
            <ComplianceAuditFindingCard 
              key={finding.findingId || finding.id} 
              finding={finding} 
            />
          ))
        ) : (
          <div className="glass-card p-10 rounded-3xl border border-white/80 shadow-sm text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#FF6B22] mx-auto flex items-center justify-center">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800">
              No matching compliance findings
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              No findings match your current filter criteria. Try resetting the filters or run a new audit.
            </p>
            <button
              onClick={() => {
                setActiveFilter('all');
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-[#FF6B22] shadow-2xs hover:bg-stone-50 cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
