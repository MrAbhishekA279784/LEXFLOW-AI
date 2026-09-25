import React, { useState, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  NodeProps,
  Edge,
  Node,
  MarkerType,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange
} from '@xyflow/react';
import { 
  User, 
  FileText, 
  IndianRupee, 
  AlertTriangle, 
  GitBranch, 
  Calendar, 
  Scale, 
  ShieldCheck, 
  ExternalLink,
  Download,
  RefreshCw,
  Search,
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { GraphNode, GraphEdge, GraphNodeType } from '../../backend/types/backendTypes';

interface InteractiveLegalGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  highlightNodeIds?: string[];
  isLoading?: boolean;
  onOpenEvidence?: (node: GraphNode) => void;
  onRegenerate?: () => void;
  onExport?: () => void;
}

// ---------------------------------------------------------------------------
// CUSTOM REACT FLOW NODE COMPONENT
// ---------------------------------------------------------------------------
interface CustomNodeData {
  rawNode?: GraphNode;
  isScenarioHighlighted?: boolean;
}

const CustomLegalNode: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as CustomNodeData;
  const node = nodeData?.rawNode;
  const isScenarioHighlighted = Boolean(nodeData?.isScenarioHighlighted);
  if (!node) return null;

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

  const getThemeStyles = (type: GraphNodeType) => {
    switch (type) {
      case 'Party':
        return {
          bg: 'bg-amber-50/90',
          border: 'border-amber-300',
          badge: 'bg-amber-100 text-amber-900 border-amber-300',
          text: 'text-amber-950'
        };
      case 'Obligation':
        return {
          bg: 'bg-blue-50/90',
          border: 'border-blue-300',
          badge: 'bg-blue-100 text-blue-900 border-blue-300',
          text: 'text-blue-950'
        };
      case 'Payment':
        return {
          bg: 'bg-orange-50/90',
          border: 'border-orange-300',
          badge: 'bg-orange-100 text-orange-900 border-orange-300',
          text: 'text-orange-950'
        };
      case 'Penalty':
        return {
          bg: 'bg-rose-50/90',
          border: 'border-rose-300',
          badge: 'bg-rose-100 text-rose-900 border-rose-300',
          text: 'text-rose-950'
        };
      case 'Condition':
        return {
          bg: 'bg-purple-50/90',
          border: 'border-purple-300',
          badge: 'bg-purple-100 text-purple-900 border-purple-300',
          text: 'text-purple-950'
        };
      case 'Deadline':
        return {
          bg: 'bg-indigo-50/90',
          border: 'border-indigo-300',
          badge: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          text: 'text-indigo-950'
        };
      case 'Statute':
      case 'Judgment':
        return {
          bg: 'bg-emerald-50/90',
          border: 'border-emerald-300',
          badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          text: 'text-emerald-950'
        };
      default:
        return {
          bg: 'bg-stone-50/90',
          border: 'border-stone-300',
          badge: 'bg-stone-100 text-stone-900 border-stone-300',
          text: 'text-stone-950'
        };
    }
  };

  const theme = getThemeStyles(node.type);

  return (
    <div
      className={`relative w-[210px] rounded-2xl p-3 shadow-md backdrop-blur-md transition-all cursor-pointer border ${theme.bg} ${
        isScenarioHighlighted
          ? 'ring-4 ring-[#FF6B22] border-[#FF6B22] shadow-xl scale-[1.04] bg-amber-50/95'
          : selected
          ? 'ring-2 ring-[#FF6B22] shadow-lg scale-[1.02] ' + theme.border
          : 'hover:shadow-md ' + theme.border
      }`}
    >
      {isScenarioHighlighted && (
        <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded-full bg-[#FF6B22] text-white text-[8px] font-black tracking-wider uppercase shadow flex items-center gap-1 z-10 animate-pulse">
          <Sparkles className="w-2.5 h-2.5" />
          AFFECTED
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-[#8C827A] !border-none" />

      {/* Header: Icon, Type Badge & Page */}
      <div className="flex items-center justify-between gap-1 mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-md bg-white/90 border border-stone-200/80 flex items-center justify-center shrink-0">
            {getNodeIcon(node.type)}
          </div>
          <span className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold border uppercase tracking-wider ${theme.badge}`}>
            {node.type}
          </span>
        </div>
        {node.sourcePage && (
          <span className="text-[9px] font-bold text-stone-500">
            p.{node.sourcePage}
          </span>
        )}
      </div>

      {/* Title / Label */}
      <h4 className="text-xs font-bold text-[#151515] leading-snug line-clamp-2">
        {node.label}
      </h4>

      {/* Description Snippet */}
      {node.description && (
        <p className="text-[10px] text-stone-600 mt-1 line-clamp-2 leading-tight">
          {node.description}
        </p>
      )}

      {/* Source Clause Tag */}
      {node.sourceClauseId && (
        <div className="mt-2 pt-1 border-t border-stone-200/60 flex items-center justify-between text-[9px] text-stone-500 font-semibold">
          <span className="truncate max-w-[140px]">Ref: {node.sourceClauseId}</span>
          <span className="text-[#FF6B22] font-bold">Traceable</span>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#8C827A] !border-none" />
    </div>
  );
};

const nodeTypes = {
  legalNode: CustomLegalNode,
};

// ---------------------------------------------------------------------------
// MAIN INTERACTIVE GRAPH COMPONENT
// ---------------------------------------------------------------------------
export const InteractiveLegalGraph: React.FC<InteractiveLegalGraphProps> = ({
  nodes: rawNodes,
  edges: rawEdges,
  highlightNodeIds = [],
  isLoading = false,
  onOpenEvidence,
  onRegenerate,
  onExport,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isAccessibleView, setIsAccessibleView] = useState<boolean>(false);

  const highlightSet = useMemo(() => new Set(highlightNodeIds), [highlightNodeIds]);

  // Filter nodes according to category & search query
  const filteredNodes = useMemo(() => {
    return rawNodes.filter(n => {
      // Category filter
      if (filterType === 'parties' && n.type !== 'Party') return false;
      if (filterType === 'obligations' && n.type !== 'Obligation') return false;
      if (filterType === 'payments' && n.type !== 'Payment') return false;
      if (filterType === 'penalties' && n.type !== 'Penalty') return false;
      if (filterType === 'authorities' && (n.type !== 'Statute' && n.type !== 'Judgment')) return false;

      // Keyword query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchLabel = n.label.toLowerCase().includes(q);
        const matchDesc = (n.description || '').toLowerCase().includes(q);
        const matchType = n.type.toLowerCase().includes(q);
        return matchLabel || matchDesc || matchType;
      }
      return true;
    });
  }, [rawNodes, filterType, searchQuery]);

  const filteredNodeIdSet = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes]);

  // Build XYFlow Node structures
  const rfNodes: Node[] = useMemo(() => {
    return filteredNodes.map(n => ({
      id: n.id,
      type: 'legalNode',
      position: n.position || { x: 100, y: 100 },
      data: { 
        rawNode: n,
        isScenarioHighlighted: highlightSet.has(n.id)
      },
      selected: n.id === selectedNodeId,
    }));
  }, [filteredNodes, selectedNodeId, highlightSet]);

  // Build XYFlow Edge structures
  const rfEdges: Edge[] = useMemo(() => {
    return rawEdges
      .filter(e => filteredNodeIdSet.has(e.source) && filteredNodeIdSet.has(e.target))
      .map(e => {
        const isSelected = e.source === selectedNodeId || e.target === selectedNodeId;
        const isScenarioEdge = highlightSet.has(e.source) && highlightSet.has(e.target);
        const isTrigger = e.relationship === 'TRIGGERS';
        const isProtected = e.relationship === 'PROTECTED_BY' || e.relationship === 'SUPPORTED_BY';

        return {
          id: e.id,
          source: e.source,
          target: e.target,
          type: 'smoothstep',
          animated: isSelected || isTrigger || isScenarioEdge,
          label: e.label || e.relationship,
          labelStyle: {
            fontSize: 9,
            fontWeight: 700,
            fill: isScenarioEdge ? '#FF6B22' : (isTrigger ? '#B42318' : (isProtected ? '#027A48' : '#6F6A64')),
          },
          labelBgStyle: {
            fill: '#FFFFFF',
            fillOpacity: 0.9,
            stroke: isScenarioEdge ? '#FF6B22' : '#E6DFD5',
            strokeWidth: isScenarioEdge ? 1.5 : 0.8,
            rx: 4,
            ry: 4,
          },
          style: {
            stroke: isScenarioEdge ? '#FF6B22' : (isTrigger ? '#F04438' : (isProtected ? '#12B76A' : (isSelected ? '#FF6B22' : '#8C827A'))),
            strokeWidth: isScenarioEdge ? 3 : (isSelected ? 2.5 : 1.6),
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isScenarioEdge ? '#FF6B22' : (isTrigger ? '#F04438' : (isProtected ? '#12B76A' : (isSelected ? '#FF6B22' : '#8C827A'))),
            width: 14,
            height: 14,
          },
        };
      });
  }, [rawEdges, filteredNodeIdSet, selectedNodeId, highlightSet]);

  const [nodes, setNodes] = useState<Node[]>(rfNodes);
  const [edges, setEdges] = useState<Edge[]>(rfEdges);

  // Sync state whenever props/filters change
  React.useEffect(() => {
    setNodes(rfNodes);
  }, [rfNodes]);

  React.useEffect(() => {
    setEdges(rfEdges);
  }, [rfEdges]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return rawNodes.find(n => n.id === selectedNodeId) || null;
  }, [selectedNodeId, rawNodes]);

  const connectedEdges = useMemo(() => {
    if (!selectedNodeId) return { inbound: [], outbound: [] };
    const inbound = rawEdges.filter(e => e.target === selectedNodeId);
    const outbound = rawEdges.filter(e => e.source === selectedNodeId);
    return { inbound, outbound };
  }, [selectedNodeId, rawEdges]);

  return (
    <div className="relative w-full h-[620px] rounded-3xl overflow-hidden glass-panel border border-white/90 shadow-md flex flex-col select-none">
      {/* Top Toolbar */}
      <div className="px-4 py-3 bg-white/90 backdrop-blur-md border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-3 z-10">
        {/* Branch Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight mr-1 hidden sm:inline">
            Filters:
          </span>
          {[
            { id: 'all', label: 'All Nodes' },
            { id: 'parties', label: 'Parties' },
            { id: 'obligations', label: 'Obligations' },
            { id: 'payments', label: 'Payments' },
            { id: 'penalties', label: 'Penalties' },
            { id: 'authorities', label: 'Statutes & Law' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                filterType === tab.id
                  ? 'bg-[#FF6B22] text-white shadow-sm shadow-[#FF6B22]/20'
                  : 'bg-white text-stone-600 hover:text-[#151515] border border-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Accessible View Toggle */}
          <button
            type="button"
            onClick={() => setIsAccessibleView(!isAccessibleView)}
            aria-label="Toggle accessible textual graph view"
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
              isAccessibleView
                ? 'bg-[#FF6B22] text-white shadow-sm shadow-[#FF6B22]/20'
                : 'bg-white text-stone-600 hover:text-[#151515] border border-stone-200'
            }`}
          >
            {isAccessibleView ? 'Visual Graph' : 'Accessible Table'}
          </button>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search graph..."
              className="pl-8 pr-3 py-1 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#FF6B22] w-32 sm:w-44"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Regenerate Action */}
          {onRegenerate && (
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              aria-label="Regenerate Action Graph"
              title="Regenerate Action Graph"
              className="px-2.5 py-1 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#FF6B22]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}

          {/* Export Action */}
          {onExport && (
            <button
              onClick={onExport}
              aria-label="Export graph as SVG or PNG"
              title="Export Graph (SVG / PNG)"
              className="px-2.5 py-1 rounded-xl bg-orange-50 hover:bg-orange-100/90 border border-[#FF6B22]/30 text-[#FF6B22] text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#FF6B22]" />
              <span>Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Flow Canvas or Accessible Table View */}
      <div className="relative flex-1 w-full h-full bg-[#FAF8F5]">
        {isAccessibleView ? (
          <div className="absolute inset-0 overflow-y-auto p-6 bg-[#FAF8F5] text-stone-900 space-y-6 z-20">
            <div className="max-w-4xl mx-auto space-y-4">
              <h3 className="text-base font-bold text-[#151515] flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#FF6B22]" />
                Legal Action Graph — Accessible Table View
              </h3>
              <p className="text-xs text-stone-600">
                This accessible view exposes all extracted legal nodes, entity classifications, relationships, and evidentiary clause references for screen-reader and keyboard-only navigation.
              </p>

              {/* Nodes Table */}
              <div className="glass-panel p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Extracted Graph Nodes ({rawNodes.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500">
                        <th className="py-2 px-3 font-semibold">Node Label</th>
                        <th className="py-2 px-3 font-semibold">Classification Type</th>
                        <th className="py-2 px-3 font-semibold">Description & Evidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/60">
                      {rawNodes.map(node => (
                        <tr key={node.id} className="hover:bg-white/50">
                          <td className="py-2.5 px-3 font-bold text-stone-900">{node.label}</td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 text-[10px] font-bold">
                              {node.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-stone-600">
                            <div>{node.description || 'No additional description'}</div>
                            {node.clauseRef && (
                              <div className="text-[11px] text-[#FF6B22] font-semibold mt-0.5">Evidence: {node.clauseRef}</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Relationships Table */}
              <div className="glass-panel p-4 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">Extracted Relationships ({rawEdges.length})</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-500">
                        <th className="py-2 px-3 font-semibold">Source Entity</th>
                        <th className="py-2 px-3 font-semibold">Relationship Type</th>
                        <th className="py-2 px-3 font-semibold">Target Entity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200/60">
                      {rawEdges.map(edge => {
                        const srcNode = rawNodes.find(n => n.id === edge.source);
                        const tgtNode = rawNodes.find(n => n.id === edge.target);
                        return (
                          <tr key={edge.id} className="hover:bg-white/50">
                            <td className="py-2.5 px-3 font-bold text-stone-900">{srcNode?.label || edge.source}</td>
                            <td className="py-2.5 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold">
                                {edge.relationship}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-stone-900">{tgtNode?.label || edge.target}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ) : isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-20 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-[#FF6B22]" />
            <p className="text-sm font-bold text-stone-700">Synthesizing Verified Legal Action Graph...</p>
          </div>
        ) : rawNodes.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 z-10">
            <GitBranch className="w-12 h-12 text-stone-300" />
            <h3 className="text-sm font-bold text-stone-800">No Legal Graph Available</h3>
            <p className="text-xs text-stone-500 max-w-sm">
              No relationships could be extracted yet. Click below to trigger real graph synthesis from your document clauses.
            </p>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="px-4 py-2 rounded-xl bg-[#FF6B22] text-white text-xs font-bold shadow-md hover:bg-[#E55A16] cursor-pointer"
              >
                Generate Action Graph
              </button>
            )}
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            minZoom={0.2}
            maxZoom={2.5}
            defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
          >
            <Background color="#B8AEA2" gap={24} size={1.2} />
            <Controls showInteractive={false} className="!bottom-4 !left-4 !bg-white/90 !border-stone-200 !rounded-xl !shadow-md" />
            <MiniMap 
              nodeStrokeColor="#FF6B22"
              nodeColor="#FFE2CC"
              maskColor="rgba(245, 242, 236, 0.7)"
              className="!bottom-4 !right-4 !w-36 !h-24 !rounded-xl !border-stone-200 !shadow-md !bg-white/80" 
            />
          </ReactFlow>
        )}

        {/* Selected Node Details Drawer / Side Panel */}
        {selectedNode && (
          <div className="absolute top-3 right-3 bottom-3 w-80 max-w-[90%] bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-stone-200 p-4 flex flex-col justify-between z-30 animate-in slide-in-from-right duration-200">
            <div>
              {/* Panel Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6B22]/10 text-[#FF6B22] border border-[#FF6B22]/20 uppercase">
                  {selectedNode.type} Node
                </span>
                <button
                  onClick={() => setSelectedNodeId(null)}
                  className="w-6 h-6 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Title & Description */}
              <div className="mt-3">
                <h3 className="text-sm font-extrabold text-[#151515] leading-snug">
                  {selectedNode.label}
                </h3>
                {selectedNode.description && (
                  <p className="text-xs text-stone-600 mt-1.5 leading-relaxed bg-stone-50/80 p-2.5 rounded-xl border border-stone-200/60">
                    {selectedNode.description}
                  </p>
                )}
              </div>

              {/* Node Metadata & Source Evidence */}
              <div className="mt-3 space-y-2 text-xs">
                {selectedNode.sourceClauseId && (
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="font-semibold">Clause Ref:</span>
                    <span className="font-mono text-[11px] text-[#151515] bg-stone-100 px-1.5 py-0.5 rounded">
                      {selectedNode.sourceClauseId}
                    </span>
                  </div>
                )}
                {selectedNode.sourcePage && (
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="font-semibold">Page Number:</span>
                    <span className="font-bold text-[#151515]">Page {selectedNode.sourcePage}</span>
                  </div>
                )}
                {selectedNode.data?.actor && (
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="font-semibold">Obligated Actor:</span>
                    <span className="font-bold text-[#151515] capitalize">{selectedNode.data.actor}</span>
                  </div>
                )}
                {selectedNode.data?.amount && (
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="font-semibold">Amount:</span>
                    <span className="font-bold text-emerald-700">₹{Number(selectedNode.data.amount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {selectedNode.data?.url && (
                  <div className="pt-1">
                    <a
                      href={selectedNode.data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#FF6B22] hover:underline font-bold flex items-center gap-1"
                    >
                      <span>Read Official Statute / Judgment</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Connected Relationships */}
              <div className="mt-4 pt-3 border-t border-stone-100">
                <h4 className="text-[11px] font-bold text-stone-500 uppercase tracking-tight mb-2">
                  Connected Relationships ({connectedEdges.inbound.length + connectedEdges.outbound.length})
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {connectedEdges.outbound.map(edge => {
                    const targetNode = rawNodes.find(n => n.id === edge.target);
                    return (
                      <div key={edge.id} className="text-[11px] p-1.5 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-between">
                        <span className="font-bold text-[#FF6B22] uppercase text-[9px]">{edge.relationship}</span>
                        <span className="truncate max-w-[130px] text-stone-700">{targetNode?.label || edge.target}</span>
                      </div>
                    );
                  })}
                  {connectedEdges.inbound.map(edge => {
                    const srcNode = rawNodes.find(n => n.id === edge.source);
                    return (
                      <div key={edge.id} className="text-[11px] p-1.5 rounded-lg bg-stone-50 border border-stone-200/60 flex items-center justify-between">
                        <span className="truncate max-w-[130px] text-stone-700">{srcNode?.label || edge.source}</span>
                        <span className="font-bold text-stone-500 uppercase text-[9px]">→ {edge.relationship}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-stone-100">
              <button
                onClick={() => onOpenEvidence && onOpenEvidence(selectedNode)}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FF6B22] hover:bg-[#E55A16] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-[#FF6B22]/20 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>View Clause Evidence</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
