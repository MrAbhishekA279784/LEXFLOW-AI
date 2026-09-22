import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Building2, 
  ArrowRight, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  FileText, 
  Wrench, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  ExternalLink,
  Info,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Download,
  RotateCcw,
  Move,
  Crosshair,
  Sparkles,
  Scale,
  Shield,
  Clock,
  Compass
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppHeader } from '../common/AppHeader';
import { GlassCard } from '../common/GlassCard';
import { GlassBadge } from '../common/GlassBadge';
import { GlassButton } from '../common/GlassButton';
import { RENTAL_CLAUSES, RENTAL_RISKS } from '../../data/initialData';
import { ClauseItem } from '../../types';
import { DocumentHistoryView } from '../history/DocumentHistoryView';
import { ComplianceAuditWorkspace } from '../complianceAudit/ComplianceAuditWorkspace';

interface GraphNodeData {
  id: string;
  title: string;
  subtitle: string;
  category: 'root' | 'party' | 'tenant' | 'landlord' | 'warning' | 'remedy';
  clauseSection: string;
  x: number;
  y: number;
  icon: React.ReactNode;
}

export const LegalGraphScreen: React.FC = () => {
  const { 
    activeDocument, 
    activeDocTab, 
    setActiveDocTab, 
    openEvidence,
    navigateTo,
    setIsGraphExportModalOpen 
  } = useApp();

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-pay');
  const [clauseSearch, setClauseSearch] = useState<string>('');
  const [activeBranchFilter, setActiveBranchFilter] = useState<'all' | 'tenant' | 'landlord' | 'dispute'>('all');

  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);
  const touchDistanceRef = useRef<number | null>(null);
  const touchStartZoomRef = useRef<number>(1);

  // Wheel-based zooming centered at cursor position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();

      // Differentiate trackpad pinch vs discrete mouse wheel
      const zoomFactor = e.ctrlKey ? -e.deltaY * 0.012 : -e.deltaY * 0.0016;

      setZoomLevel((currentZoom) => {
        const nextZoom = Math.min(Math.max(0.45, +(currentZoom + zoomFactor).toFixed(3)), 2.2);
        if (Math.abs(nextZoom - currentZoom) < 0.001) return currentZoom;

        // Mouse coordinates relative to container center
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;

        const ratio = nextZoom / currentZoom;
        setPan((currentPan) => ({
          x: Math.round(mouseX - (mouseX - currentPan.x) * ratio),
          y: Math.round(mouseY - (mouseY - currentPan.y) * ratio),
        }));

        return nextZoom;
      });
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only primary (left) or middle button
    if (e.button !== 0 && e.button !== 1) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasMovedRef.current = true;
    }
    setPan({
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile/tablet pinch and drag
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      hasMovedRef.current = false;
      dragStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panStartRef.current = { ...pan };
    } else if (e.touches.length === 2) {
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchDistanceRef.current = dist;
      touchStartZoomRef.current = zoomLevel;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMovedRef.current = true;
      }
      setPan({
        x: panStartRef.current.x + dx,
        y: panStartRef.current.y + dy,
      });
    } else if (e.touches.length === 2 && touchDistanceRef.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = dist / touchDistanceRef.current;
      const nextZoom = Math.min(Math.max(0.45, +(touchStartZoomRef.current * scale).toFixed(2)), 2.2);
      setZoomLevel(nextZoom);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistanceRef.current = null;
  };

  // Zoom Button Controls
  const handleZoomStep = (delta: number) => {
    setZoomLevel((currentZoom) => {
      const nextZoom = Math.min(Math.max(0.45, +(currentZoom + delta).toFixed(2)), 2.2);
      const ratio = nextZoom / currentZoom;
      setPan((currentPan) => ({
        x: Math.round(currentPan.x * ratio),
        y: Math.round(currentPan.y * ratio),
      }));
      return nextZoom;
    });
  };

  const handleResetView = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
    setActiveBranchFilter('all');
  };

  // Preset branch navigators for multi-branch complex exploration
  const jumpToBranch = (branch: 'all' | 'tenant' | 'landlord' | 'dispute') => {
    setActiveBranchFilter(branch);
    if (branch === 'all') {
      setZoomLevel(0.9);
      setPan({ x: 0, y: 0 });
    } else if (branch === 'tenant') {
      setZoomLevel(1.1);
      setPan({ x: 170, y: 30 });
      setSelectedNodeId('node-pay');
    } else if (branch === 'landlord') {
      setZoomLevel(1.1);
      setPan({ x: -170, y: 30 });
      setSelectedNodeId('node-maintenance');
    } else if (branch === 'dispute') {
      setZoomLevel(1.15);
      setPan({ x: 0, y: -160 });
      setSelectedNodeId('node-dispute');
    }
  };

  const handleNodeClick = (nodeId: string) => {
    // If the user was dragging/panning the canvas, ignore the node click
    if (hasMovedRef.current) return;
    setSelectedNodeId(nodeId);
  };

  // Node details for evidence linkage
  const getNodeClause = (nodeId: string): ClauseItem => {
    if (nodeId === 'node-pay' || nodeId === 'node-due' || nodeId === 'node-grace') {
      return RENTAL_CLAUSES.find(c => c.section === 'Section 4.1') || RENTAL_CLAUSES[0];
    }
    if (nodeId === 'node-penalty') {
      return RENTAL_CLAUSES.find(c => c.section === 'Section 4.3') || RENTAL_CLAUSES[1];
    }
    if (nodeId === 'node-deposit' || nodeId === 'node-refund' || nodeId === 'node-deduction') {
      return RENTAL_CLAUSES.find(c => c.section === 'Section 5.1') || RENTAL_CLAUSES[2];
    }
    if (nodeId === 'node-lockin' || nodeId === 'node-termination' || nodeId === 'node-notice-mode' || nodeId === 'node-forfeiture' || nodeId === 'node-handover') {
      return RENTAL_CLAUSES.find(c => c.section === 'Section 12.1') || RENTAL_CLAUSES[5];
    }
    if (nodeId === 'node-escalation') {
      return RENTAL_CLAUSES.find(c => c.section === 'Section 8.2') || RENTAL_CLAUSES[3];
    }
    if (nodeId === 'node-maintenance' || nodeId === 'node-structural' || nodeId === 'node-inspection') {
      return RENTAL_CLAUSES.find(c => c.section === 'Section 9.1') || RENTAL_CLAUSES[4];
    }
    if (nodeId === 'node-dispute' || nodeId === 'node-cure' || nodeId === 'node-arbitration') {
      return RENTAL_CLAUSES.find(c => c.section === 'Section 12.1') || RENTAL_CLAUSES[5];
    }
    return RENTAL_CLAUSES[0];
  };

  // Multi-branch legal case nodes definitions
  const graphNodes: GraphNodeData[] = [
    // 1. Root
    {
      id: 'node-root',
      title: 'Residential Tenancy Agreement',
      subtitle: '11-Month Term · Bengaluru Urban',
      category: 'root',
      clauseSection: 'Preamble',
      x: 400,
      y: 35,
      icon: <FileText className="w-4 h-4 text-white" />
    },
    // 2. Parties
    {
      id: 'node-tenant',
      title: 'Tenant: Vikram Sharma',
      subtitle: 'Primary Obligor · Residential Use',
      category: 'party',
      clauseSection: 'Section 2.1',
      x: 200,
      y: 105,
      icon: <User className="w-3.5 h-3.5 text-stone-700" />
    },
    {
      id: 'node-landlord',
      title: 'Landlord: Rajesh Verma',
      subtitle: 'Lessor · Title Holder',
      category: 'party',
      clauseSection: 'Section 2.2',
      x: 600,
      y: 105,
      icon: <Building2 className="w-3.5 h-3.5 text-stone-700" />
    },
    // 3. Tenant Branch 1: Monthly Rent
    {
      id: 'node-pay',
      title: 'Pay ₹25,000 / month',
      subtitle: 'Monthly Rental via Bank Transfer',
      category: 'tenant',
      clauseSection: 'Section 4.1',
      x: 105,
      y: 185,
      icon: <ArrowRight className="w-3.5 h-3.5 text-[#FF6B22]" />
    },
    {
      id: 'node-due',
      title: 'Due: 5th of Each Month',
      subtitle: 'Strict Calendar Cut-off',
      category: 'tenant',
      clauseSection: 'Section 4.1',
      x: 55,
      y: 260,
      icon: <Calendar className="w-3.5 h-3.5 text-blue-600" />
    },
    {
      id: 'node-grace',
      title: '3-Day Grace Window',
      subtitle: 'Exemption until 8th of month',
      category: 'tenant',
      clauseSection: 'Section 4.1',
      x: 135,
      y: 330,
      icon: <Clock className="w-3.5 h-3.5 text-stone-600" />
    },
    {
      id: 'node-penalty',
      title: 'Late Surcharge: ₹500/day',
      subtitle: 'Accrues daily upon default',
      category: 'warning',
      clauseSection: 'Section 4.3',
      x: 75,
      y: 405,
      icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
    },
    // 4. Tenant Branch 2: Security Deposit
    {
      id: 'node-deposit',
      title: 'Security Deposit ₹75,000',
      subtitle: 'Interest-free refundable corpus',
      category: 'tenant',
      clauseSection: 'Section 5.1',
      x: 295,
      y: 185,
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
    },
    {
      id: 'node-lockin',
      title: '6-Month Lock-in Period',
      subtitle: 'Mandatory tenure commitment',
      category: 'warning',
      clauseSection: 'Section 12.1',
      x: 235,
      y: 260,
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
    },
    {
      id: 'node-deduction',
      title: 'Permissible Deductions',
      subtitle: 'Painting & verifiable damage repair',
      category: 'tenant',
      clauseSection: 'Section 5.1',
      x: 325,
      y: 330,
      icon: <Wrench className="w-3.5 h-3.5 text-stone-600" />
    },
    {
      id: 'node-refund',
      title: '14-Day Refund Clause',
      subtitle: 'Upon peaceful physical handover',
      category: 'tenant',
      clauseSection: 'Section 5.1',
      x: 255,
      y: 405,
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
    },
    // 5. Landlord Branch 1: Maintenance
    {
      id: 'node-maintenance',
      title: 'Maintain Structural Repairs',
      subtitle: 'Exterior walls, dampness & plumbing',
      category: 'landlord',
      clauseSection: 'Section 9.1',
      x: 505,
      y: 185,
      icon: <Wrench className="w-3.5 h-3.5 text-stone-600" />
    },
    {
      id: 'node-structural',
      title: 'Major Repairs (>₹5,000)',
      subtitle: 'Sole Landlord legal liability',
      category: 'landlord',
      clauseSection: 'Section 9.1',
      x: 450,
      y: 260,
      icon: <Shield className="w-3.5 h-3.5 text-blue-600" />
    },
    {
      id: 'node-inspection',
      title: '24h Prior Notice for Entry',
      subtitle: 'Tenant quiet enjoyment protection',
      category: 'landlord',
      clauseSection: 'Section 9.1',
      x: 535,
      y: 330,
      icon: <Clock className="w-3.5 h-3.5 text-stone-600" />
    },
    {
      id: 'node-escalation',
      title: 'Annual Increment Capped 7%',
      subtitle: 'Only upon renewal term completion',
      category: 'landlord',
      clauseSection: 'Section 8.2',
      x: 465,
      y: 405,
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-600" />
    },
    // 6. Landlord Branch 2: Termination & Handover
    {
      id: 'node-termination',
      title: 'Termination: 30-Day Notice',
      subtitle: 'Mutual exit requirement',
      category: 'landlord',
      clauseSection: 'Section 12.1',
      x: 695,
      y: 185,
      icon: <FileText className="w-3.5 h-3.5 text-blue-600" />
    },
    {
      id: 'node-notice-mode',
      title: 'Registered Written Notice',
      subtitle: 'Formal courier or registered email',
      category: 'landlord',
      clauseSection: 'Section 12.1',
      x: 645,
      y: 260,
      icon: <FileText className="w-3.5 h-3.5 text-stone-600" />
    },
    {
      id: 'node-forfeiture',
      title: 'Deposit Forfeiture Risk',
      subtitle: 'Triggered if vacated within lock-in',
      category: 'warning',
      clauseSection: 'Section 12.1',
      x: 725,
      y: 330,
      icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
    },
    {
      id: 'node-handover',
      title: 'Joint Inspection Protocol',
      subtitle: 'Signed fixture clearance list',
      category: 'landlord',
      clauseSection: 'Section 12.1',
      x: 655,
      y: 405,
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-stone-700" />
    },
    // 7. Tier 4: Cross-Branch Breach & Remedy Resolution
    {
      id: 'node-dispute',
      title: 'Breach & Dispute Escalation',
      subtitle: 'Cross-cutting covenant remedies',
      category: 'remedy',
      clauseSection: 'Section 12.1',
      x: 400,
      y: 495,
      icon: <Scale className="w-4 h-4 text-[#FF6B22]" />
    },
    {
      id: 'node-cure',
      title: '15-Day Cure Notice',
      subtitle: 'Mandatory rectification window before legal suit',
      category: 'remedy',
      clauseSection: 'Section 12.1',
      x: 275,
      y: 565,
      icon: <Clock className="w-3.5 h-3.5 text-blue-600" />
    },
    {
      id: 'node-arbitration',
      title: 'Exclusive Bengaluru Jurisdiction',
      subtitle: 'Sole arbitral seat & small claims forum',
      category: 'remedy',
      clauseSection: 'Section 12.1',
      x: 525,
      y: 565,
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
    }
  ];

  const activeClauseItem = getNodeClause(selectedNodeId);

  return (
    <div className="min-h-screen pb-28 w-full max-w-5xl mx-auto px-0 sm:px-2">
      {/* Header with Title and back */}
      <AppHeader title={activeDocument.name} />

      {/* Tabs: Overview, Graph, Clauses, Risks, Audit, History */}
      <div className="px-4 pt-2">
        <div className="glass-panel p-1 rounded-2xl flex items-center justify-between shadow-sm border border-white/80">
          {(['Overview', 'Graph', 'Clauses', 'Risks', 'Audit', 'History'] as const).map((tab) => {
            const isActive = activeDocTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveDocTab(tab)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#FF6B22] shadow-sm font-bold'
                    : 'text-[#6F6A64] hover:text-[#151515]'
                }`}
              >
                {tab}
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
            {/* Interactive Graph Canvas Frame */}
            <div className="glass-card rounded-3xl p-3 md:p-4 border border-white/80 shadow-md shadow-[#46321e]/5 flex flex-col space-y-3">
              {/* Toolbar & Branch Quick Filters Header */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-stone-200/60">
                {/* Left Branch Filter Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-tight mr-1 hidden sm:inline">
                    Branches:
                  </span>
                  {[
                    { id: 'all', label: 'Full Graph' },
                    { id: 'tenant', label: 'Tenant Obligations' },
                    { id: 'landlord', label: 'Landlord Covenants' },
                    { id: 'dispute', label: 'Breach & Remedies' },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => jumpToBranch(filter.id as any)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                        activeBranchFilter === filter.id
                          ? 'bg-[#FF6B22] text-white shadow-sm shadow-[#FF6B22]/20'
                          : 'bg-white/80 hover:bg-white text-stone-600 border border-stone-200/70 hover:border-stone-300'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Right Zoom & Pan Controller Toolbar */}
                <div className="flex items-center gap-1.5 ml-auto">
                  {/* Compliance Audit Button */}
                  <button
                    onClick={() => setActiveDocTab('Audit')}
                    title="Audit with Reviewer & Skeptic Agents"
                    className="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100/90 flex items-center gap-1.5 text-xs font-bold text-[#FF6B22] border border-[#FF6B22]/30 shadow-2xs cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#FF6B22]" />
                    <span>Compliance Audit</span>
                  </button>

                  {/* Export Button */}
                  <button
                    onClick={() => setIsGraphExportModalOpen(true)}
                    aria-label="Export Legal Action Graph as SVG or PNG"
                    title="Export Graph (SVG / High-Res PNG)"
                    className="px-2.5 py-1.5 rounded-xl bg-white/90 hover:bg-white flex items-center gap-1.5 text-xs font-bold text-[#FF6B22] border border-[#FF6B22]/30 shadow-2xs cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <Download className="w-3.5 h-3.5 text-[#FF6B22]" />
                    <span>Export</span>
                  </button>

                  <div className="w-px h-5 bg-stone-200 mx-0.5" />

                  {/* Zoom Controls */}
                  <div className="flex items-center gap-1 glass-panel p-0.5 rounded-xl border border-white/90 shadow-2xs">
                    <button
                      onClick={() => handleZoomStep(-0.15)}
                      aria-label="Zoom Out"
                      title="Zoom Out (Mouse Wheel Down)"
                      className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-stone-600 cursor-pointer transition-colors"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>

                    {/* Zoom Percentage Badge */}
                    <button
                      onClick={handleResetView}
                      title="Click to reset zoom (100%)"
                      className="px-2 py-0.5 text-[11px] font-extrabold text-stone-700 hover:text-[#FF6B22] cursor-pointer tabular-nums"
                    >
                      {Math.round(zoomLevel * 100)}%
                    </button>

                    <button
                      onClick={() => handleZoomStep(0.15)}
                      aria-label="Zoom In"
                      title="Zoom In (Mouse Wheel Up)"
                      className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-stone-600 cursor-pointer transition-colors"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={handleResetView}
                      aria-label="Reset & Center View"
                      title="Center View & Reset Pan"
                      className="w-7 h-7 rounded-lg hover:bg-white flex items-center justify-center text-stone-600 hover:text-[#FF6B22] cursor-pointer transition-colors"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Accessible Graph Explanation for Screen Readers */}
              <div className="sr-only">
                Interactive Legal Action Graph with mouse wheel zooming and panning, mapping multi-branch tenant and landlord contractual obligations, grace windows, late surcharges, and dispute arbitration remedies.
              </div>

              {/* The Interactive Zoom & Pan Canvas Stage */}
              <div
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`relative w-full h-[520px] md:h-[620px] overflow-hidden rounded-2xl bg-gradient-to-b from-[#FAF7F2] via-[#F6F1EA] to-[#FAF7F2] border border-stone-200/80 select-none ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                style={{ touchAction: 'none' }}
              >
                {/* Dynamic Coordinate Dot Grid reacting optically to Pan & Zoom */}
                <div 
                  className="absolute inset-0 pointer-events-none opacity-45 transition-opacity"
                  style={{
                    backgroundImage: 'radial-gradient(#B8AEA2 1.2px, transparent 1.2px)',
                    backgroundSize: `${26 * zoomLevel}px ${26 * zoomLevel}px`,
                    backgroundPosition: `${pan.x}px ${pan.y}px`,
                  }}
                />

                {/* Floating Navigation Hint Pill */}
                <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/85 backdrop-blur-md border border-white shadow-xs text-[11px] font-medium text-[#6F6A64]">
                  <Move className="w-3.5 h-3.5 text-[#FF6B22]" />
                  <span>Scroll wheel to zoom · Click & drag to pan</span>
                </div>

                {/* Floating Coordinates & Node Count Badge */}
                <div className="absolute top-3 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white/80 backdrop-blur-md border border-white/80 text-[10px] font-bold text-stone-600 shadow-2xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>18 Interconnected Causal Nodes</span>
                </div>

                {/* The Pan & Zoom Virtual Board */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    width: '800px',
                    height: '620px',
                    marginLeft: '-400px',
                    marginTop: '-310px',
                    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoomLevel})`,
                    transformOrigin: '50% 50%',
                    transition: isDragging ? 'none' : 'transform 0.12s cubic-bezier(0.2, 0, 0, 1)',
                    willChange: 'transform',
                  }}
                >
                  {/* SVG Multi-Branch Connectors Layer with Animated Flow Lines */}
                  <svg 
                    className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" 
                    viewBox="0 0 800 620"
                  >
                    <defs>
                      <linearGradient id="flowOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FF6B22" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#FFA366" stopOpacity="0.3" />
                      </linearGradient>
                      <linearGradient id="flowEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.3" />
                      </linearGradient>
                      <linearGradient id="flowBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#93C5FD" stopOpacity="0.3" />
                      </linearGradient>
                    </defs>

                    {/* Structural Backbone Connectors */}
                    {/* Root to Parties */}
                    <path d="M 400 55 L 400 78 L 200 78 L 200 100" stroke="#DDD4CA" strokeWidth="2" fill="none" />
                    <path d="M 400 55 L 400 78 L 600 78 L 600 100" stroke="#DDD4CA" strokeWidth="2" fill="none" />

                    {/* Tenant to Primary Branches (Pay Rent & Deposit) */}
                    <path d="M 200 130 L 200 155 L 105 155 L 105 180" stroke="#DDD4CA" strokeWidth="2" fill="none" />
                    <path d="M 200 130 L 200 155 L 295 155 L 295 180" stroke="#DDD4CA" strokeWidth="2" fill="none" />

                    {/* Landlord to Primary Branches (Maintenance & Termination) */}
                    <path d="M 600 130 L 600 155 L 505 155 L 505 180" stroke="#DDD4CA" strokeWidth="2" fill="none" />
                    <path d="M 600 130 L 600 155 L 695 155 L 695 180" stroke="#DDD4CA" strokeWidth="2" fill="none" />

                    {/* Pay Rent Sub-Branch -> Due Date -> Grace -> Penalty */}
                    <path d="M 105 210 L 105 235 L 55 235 L 55 255" stroke="#DDD4CA" strokeWidth="2" fill="none" />
                    <path d="M 55 285 L 55 305 L 135 305 L 135 325" stroke="#DDD4CA" strokeWidth="2" fill="none" />
                    <path d="M 135 355 L 135 380 L 75 380 L 75 400" stroke="#DDD4CA" strokeWidth="2" fill="none" />

                    {/* Security Deposit Sub-Branch -> Lockin -> Deduction -> Refund */}
                    <path d="M 295 210 L 295 235 L 235 235 L 235 255" stroke="#DDD4CA" strokeWidth="2" fill="none" />
                    <path d="M 235 285 L 235 305 L 325 305 L 325 325" stroke="#DDD4CA" strokeWidth="2" fill="none" />
                    <path d="M 325 355 L 325 380 L 255 380 L 255 400" stroke="#DDD4CA" strokeWidth="2" fill="none" />

                    {/* Maintenance Sub-Branch -> Structural -> Inspection -> Escalation */}
                    <path d="M 505 210 L 505 235 L 450 235 L 450 255" stroke="#DDD4CA" strokeWidth="2" fill="none" />
                    <path d="M 450 285 L 450 305 L 535 305 L 535 325" stroke="#DDD4CA" strokeWidth="2" fill="none" />
                    <path d="M 535 355 L 535 380 L 465 380 L 465 400" stroke="#DDD4CA" strokeWidth="2" fill="none" />

                    {/* Termination Sub-Branch -> Notice Mode -> Forfeiture -> Handover */}
                    <path d="M 695 210 L 695 235 L 645 235 L 645 255" stroke="#DDD4CA" strokeWidth="2" fill="none" />
                    <path d="M 645 285 L 645 305 L 725 305 L 725 325" stroke="#DDD4CA" strokeWidth="2" fill="none" />
                    <path d="M 725 355 L 725 380 L 655 380 L 655 400" stroke="#DDD4CA" strokeWidth="2" fill="none" />

                    {/* Tier 4 Breach & Dispute Escalation Connections */}
                    <path d="M 75 435 L 75 465 L 400 465 L 400 490" stroke="#F59E0B" strokeWidth="1.8" strokeDasharray="4 3" fill="none" />
                    <path d="M 725 355 L 725 465 L 400 465 L 400 490" stroke="#EF4444" strokeWidth="1.8" strokeDasharray="4 3" fill="none" />
                    <path d="M 400 525 L 400 545 L 275 545 L 275 560" stroke="#DDD4CA" strokeWidth="2" fill="none" />
                    <path d="M 400 525 L 400 545 L 525 545 L 525 560" stroke="#DDD4CA" strokeWidth="2" fill="none" />

                    {/* Animated Energy Flow Beams */}
                    <path d="M 400 55 L 400 78 L 200 78 L 200 100" stroke="url(#flowOrange)" strokeWidth="2" fill="none" className="connector-flow" />
                    <path d="M 400 55 L 400 78 L 600 78 L 600 100" stroke="url(#flowEmerald)" strokeWidth="2" fill="none" className="connector-flow" />
                    <path d="M 200 130 L 200 155 L 105 155 L 105 180" stroke="url(#flowOrange)" strokeWidth="2" fill="none" className="connector-flow" />
                    <path d="M 600 130 L 600 155 L 505 155 L 505 180" stroke="url(#flowEmerald)" strokeWidth="2" fill="none" className="connector-flow" />
                    <path d="M 105 210 L 105 235 L 55 235 L 55 255" stroke="url(#flowBlue)" strokeWidth="2" fill="none" className="connector-flow" />
                  </svg>

                  {/* Render All Graph Nodes */}
                  {graphNodes.map((node) => {
                    const isSelected = selectedNodeId === node.id;
                    const isRoot = node.category === 'root';
                    const isParty = node.category === 'party';
                    const isWarning = node.category === 'warning';
                    const isRemedy = node.category === 'remedy';

                    // Node styling based on archetype
                    let nodeClasses = 'glass-card border-white/85 text-[#151515] shadow-xs';
                    if (isRoot) {
                      nodeClasses = 'bg-[#FF6B22] text-white border-[#FF6B22] shadow-md shadow-[#FF6B22]/30';
                    } else if (isWarning) {
                      nodeClasses = isSelected
                        ? 'bg-amber-50/95 border-[#FF6B22] ring-2 ring-[#FF6B22]/30 text-amber-950 shadow-md'
                        : 'bg-amber-50/85 border-amber-200 text-amber-900 shadow-2xs';
                    } else if (isRemedy) {
                      nodeClasses = isSelected
                        ? 'bg-orange-50/95 border-[#FF6B22] ring-2 ring-[#FF6B22]/30 text-[#151515] shadow-md'
                        : 'bg-orange-50/80 border-orange-200/70 text-stone-800 shadow-2xs';
                    } else if (isSelected) {
                      nodeClasses = 'bg-white border-[#FF6B22] ring-2 ring-[#FF6B22]/25 text-[#151515] shadow-md';
                    }

                    return (
                      <div
                        key={node.id}
                        onClick={() => handleNodeClick(node.id)}
                        style={{
                          position: 'absolute',
                          left: `${node.x}px`,
                          top: `${node.y}px`,
                          transform: 'translate(-50%, -50%)',
                          zIndex: isSelected ? 30 : isRoot ? 25 : 15,
                        }}
                        className={`group px-3.5 py-2 rounded-2xl border transition-all duration-150 cursor-pointer text-left flex items-center gap-2.5 ${nodeClasses} ${
                          isRoot ? 'hover:scale-105' : 'hover:scale-103'
                        }`}
                      >
                        <div className={`p-1.5 rounded-xl shrink-0 ${isRoot ? 'bg-white/20' : 'bg-stone-100/90'}`}>
                          {node.icon}
                        </div>
                        <div className="leading-tight min-w-0">
                          <p className={`text-xs font-bold whitespace-nowrap ${isRoot ? 'text-white' : 'text-[#151515]'}`}>
                            {node.title}
                          </p>
                          <p className={`text-[10px] whitespace-nowrap truncate max-w-[150px] ${isRoot ? 'text-white/80' : 'text-[#6F6A64]'}`}>
                            {node.subtitle}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Interactive Node Inspector Bar */}
              <div className="pt-3 border-t border-stone-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF6B22]">
                      Active Clause Inspector
                    </span>
                    <span className="text-xs font-bold text-[#151515]">
                      {activeClauseItem.section} — {activeClauseItem.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6F6A64] mt-0.5 line-clamp-1 max-w-xl">
                    {activeClauseItem.summary}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                  <button
                    onClick={() => openEvidence(activeClauseItem)}
                    className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-xs font-bold text-[#FF6B22] border border-[#FF6B22]/30 shadow-2xs hover:shadow-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <span>Inspect Evidence</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions below graph */}
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
                <GlassBadge variant="success">Standard Verification Passed</GlassBadge>
              </div>
              <h3 className="text-base font-bold text-[#151515] mb-2">
                11-Month Residential Tenancy Agreement
              </h3>
              <p className="text-xs text-[#6F6A64] leading-relaxed">
                {activeDocument.summary}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-stone-200/60 text-xs">
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
        {/* TAB 5: COMPLIANCE AUDIT (PS #5) */}
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
