import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Maximize2,
  IndianRupee,
  Download,
  RefreshCw,
  Scale,
  GitBranch,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GraphNode, GraphNodeType } from '../../backend/types/backendTypes';

export const DesktopActionGraph: React.FC = () => {
  const { 
    navigateTo, 
    openEvidence, 
    setIsGraphExportModalOpen,
    currentGraph,
    isGraphLoading,
    activeDocument,
    regenerateDocumentGraph
  } = useApp();

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const handleNodeClick = (node: GraphNode) => {
    // If node has source clause, synthesize or open evidence
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

  const getNodeIcon = (type: GraphNodeType) => {
    switch (type) {
      case 'Party':
        return <User className="w-3.5 h-3.5 text-[#FF6B22]" />;
      case 'Obligation':
        return <FileText className="w-3.5 h-3.5 text-blue-600" />;
      case 'Payment':
        return <IndianRupee className="w-3.5 h-3.5 text-amber-600" />;
      case 'Penalty':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />;
      case 'Condition':
        return <GitBranch className="w-3.5 h-3.5 text-purple-600" />;
      case 'Deadline':
        return <Calendar className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Statute':
      case 'Judgment':
        return <Scale className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-stone-600" />;
    }
  };

  const getNodeBadgeClass = (type: GraphNodeType) => {
    switch (type) {
      case 'Party':
        return 'bg-amber-50 text-[#FF6B22] border-amber-200';
      case 'Obligation':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Payment':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Penalty':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Condition':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Deadline':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Statute':
      case 'Judgment':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  const nodes = currentGraph?.nodes || [];
  const edges = currentGraph?.edges || [];

  return (
    <div className="glass-card p-5 rounded-3xl border border-white/80 shadow-md shadow-[#46321e]/5 flex flex-col justify-between relative overflow-hidden h-full min-h-[380px]">
      {/* Header */}
      <div className="flex items-start justify-between pb-2 border-b border-stone-100/80">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-[#151515]">Legal Action Graph</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF6B22]/10 text-[#FF6B22] border border-[#FF6B22]/20">
              {nodes.length} Nodes · {edges.length} Edges
            </span>
          </div>
          <p className="text-[11px] text-[#6F6A64]">
            Traceable legal obligations, conditions, and Indian statutory grounding.
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
            onClick={() => regenerateDocumentGraph()}
            disabled={isGraphLoading}
            aria-label="Regenerate graph"
            title="Refresh action graph"
            className="w-7 h-7 rounded-xl hover:bg-white flex items-center justify-center text-stone-500 hover:text-[#FF6B22] transition-colors cursor-pointer border border-transparent hover:border-stone-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGraphLoading ? 'animate-spin text-[#FF6B22]' : ''}`} />
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

      {/* Main Mini Graph Canvas */}
      <div className="relative flex-1 flex flex-col justify-center py-2 select-none overflow-hidden">
        {isGraphLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#FF6B22]" />
            <p className="text-xs font-semibold text-stone-600">Synthesizing Legal Action Graph...</p>
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <GitBranch className="w-8 h-8 text-stone-300" />
            <p className="text-xs text-stone-500 max-w-xs">
              No graph relationships computed yet for this document.
            </p>
            <button
              onClick={() => regenerateDocumentGraph()}
              className="px-3 py-1.5 rounded-xl bg-[#FF6B22] text-white text-xs font-bold shadow-xs hover:bg-[#E55A16] cursor-pointer"
            >
              Generate Graph
            </button>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[260px] pr-1 py-1">
            {nodes.slice(0, 6).map((node) => {
              const outgoing = edges.filter(e => e.source === node.id);
              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className={`p-2.5 rounded-2xl bg-white/80 hover:bg-white border transition-all cursor-pointer flex items-center justify-between group shadow-2xs hover:shadow-sm ${
                    hoveredNodeId === node.id ? 'border-[#FF6B22] shadow-sm' : 'border-stone-200/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center justify-center shrink-0">
                      {getNodeIcon(node.type)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold border uppercase ${getNodeBadgeClass(node.type)}`}>
                          {node.type}
                        </span>
                        <h4 className="text-xs font-bold text-[#151515] truncate max-w-[180px]">
                          {node.label}
                        </h4>
                      </div>
                      <p className="text-[10px] text-stone-500 truncate max-w-[220px]">
                        {node.description || 'Verified contractual node'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 text-stone-400 group-hover:text-[#FF6B22] transition-colors">
                    {outgoing.length > 0 && (
                      <span className="text-[10px] font-bold text-stone-500 hidden sm:inline mr-1">
                        → {outgoing[0].relationship}
                      </span>
                    )}
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Info & Quick Link */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-[#6F6A64]">
        <span className="truncate max-w-[200px]">
          Source: <strong className="text-[#151515]">{activeDocument?.name}</strong>
        </span>
        <button
          onClick={() => navigateTo('legal-graph')}
          className="text-[#FF6B22] hover:text-[#E55A16] font-bold cursor-pointer hover:underline flex items-center gap-1"
        >
          <span>Open Full Interactive Graph</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
