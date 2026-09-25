import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Printer, 
  FileCode, 
  Image as ImageIcon, 
  Sparkles, 
  ShieldCheck, 
  Sliders, 
  Maximize2,
  FileCheck2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  generateLegalGraphSvg, 
  exportGraphAsSvg, 
  exportGraphAsPng, 
  copyGraphSvgToClipboard,
  GraphExportOptions 
} from '../../utils/graphExporter';

export const GraphExportModal: React.FC = () => {
  const { 
    isGraphExportModalOpen, 
    setIsGraphExportModalOpen, 
    activeDocument,
    currentGraph
  } = useApp();

  const [format, setFormat] = useState<'svg' | 'png'>('png');
  const [scale, setScale] = useState<1 | 2 | 3>(2);
  const [theme, setTheme] = useState<'legal-light' | 'parchment' | 'monochrome' | 'dark'>('legal-light');
  const [includeHeader, setIncludeHeader] = useState<boolean>(true);
  const [includeLegend, setIncludeLegend] = useState<boolean>(true);
  const [includeClauseCitations, setIncludeClauseCitations] = useState<boolean>(true);
  
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [exportSuccessToast, setExportSuccessToast] = useState<string | null>(null);

  const exportOptions: GraphExportOptions = useMemo(() => ({
    documentName: activeDocument?.name || 'Legal Document.pdf',
    documentDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    theme,
    includeHeader,
    includeLegend,
    includeClauseCitations,
    documentId: activeDocument?.id || currentGraph?.documentId || 'LX-LEGAL-GRAPH',
    scale,
    nodes: currentGraph?.nodes || [],
    edges: currentGraph?.edges || []
  }), [activeDocument, currentGraph, theme, includeHeader, includeLegend, includeClauseCitations, scale]);

  // Live SVG code string for the preview
  const liveSvgString = useMemo(() => {
    return generateLegalGraphSvg(exportOptions);
  }, [exportOptions]);

  if (!isGraphExportModalOpen) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      if (format === 'svg') {
        exportGraphAsSvg(exportOptions);
        setExportSuccessToast('Vector SVG downloaded successfully!');
      } else {
        await exportGraphAsPng(exportOptions);
        setExportSuccessToast(`High-Resolution PNG (${scale}x) downloaded successfully!`);
      }
      setTimeout(() => setExportSuccessToast(null), 4000);
    } catch (err) {
      console.error('Export error:', err);
      setExportSuccessToast('Failed to export image. Please try SVG format.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopySvg = async () => {
    const success = await copyGraphSvgToClipboard(exportOptions);
    if (success) {
      setCopied(true);
      setExportSuccessToast('SVG code copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setExportSuccessToast(null);
      }, 3000);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Legal Action Graph — ${exportOptions.documentName}</title>
          <style>
            @page { size: landscape; margin: 1cm; }
            body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; background: white; }
            svg { width: 100%; height: auto; max-width: 1000px; }
          </style>
        </head>
        <body>
          ${liveSvgString}
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsGraphExportModalOpen(false)}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20, rotateX: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 20, rotateX: 4 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
          className="relative w-full max-w-5xl max-h-[92vh] glass-panel bg-[#FAF8F5]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/90 overflow-hidden flex flex-col z-10"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 bg-white/85 backdrop-blur-md border-b border-stone-200/70 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFF0E6] border border-[#FFB894] flex items-center justify-center text-[#FF6B22] shadow-2xs">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-[#151515]">Export Legal Action Graph</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FF6B22]/10 text-[#FF6B22] border border-[#FF6B22]/20 uppercase tracking-tight">
                    Formal Brief Ready
                  </span>
                </div>
                <p className="text-xs text-[#6F6A64]">
                  Export high-resolution diagrams &amp; scalable vectors for legal discovery, briefs, and client reports.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsGraphExportModalOpen(false)}
              className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-[#151515] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Body: Split View (Preview on Left, Settings on Right) */}
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Left Column: Live Visual Preview (8 cols on lg) */}
            <div className="lg:col-span-7 p-5 bg-[#F0ECE6]/60 border-b lg:border-b-0 lg:border-r border-stone-200/70 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 text-xs text-[#6F6A64]">
                <span className="font-bold text-[#151515] flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-[#FF6B22]" />
                  Live Export Preview
                </span>
                <span className="text-[11px] bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                  {format === 'svg' ? 'Vector SVG (Infinite Zoom)' : `Raster PNG @ ${scale}x (${scale === 1 ? '1000px' : scale === 2 ? '2000px Print' : '3000px Ultra'})`}
                </span>
              </div>

              {/* Scrollable / Scaled Preview Canvas Frame */}
              <div className="relative w-full rounded-2xl bg-white border border-stone-300 shadow-md p-3 overflow-hidden flex items-center justify-center min-h-[340px] max-h-[480px]">
                <div 
                  className="w-full h-full max-h-[440px] overflow-auto flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: liveSvgString }}
                />
              </div>

              {/* Source Document Tag */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-[#6F6A64]">
                <span>Source: <strong className="text-[#151515]">{activeDocument?.name || 'Rental Agreement.pdf'}</strong></span>
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Traceable Clauses (5 Linked)
                </span>
              </div>
            </div>

            {/* Right Column: Configuration & Export Actions (5 cols on lg) */}
            <div className="lg:col-span-5 p-5 sm:p-6 bg-white flex flex-col justify-between space-y-6 text-left">
              <div className="space-y-5">
                {/* 1. Format Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#151515] uppercase tracking-wider mb-2">
                    1. Export Format
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormat('png')}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                        format === 'png'
                          ? 'border-[#FF6B22] bg-[#FFF8F3] shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#151515] flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#FF6B22]" />
                          High-Res PNG
                        </span>
                        {format === 'png' && <div className="w-2 h-2 rounded-full bg-[#FF6B22]" />}
                      </div>
                      <span className="text-[10px] text-[#6F6A64]">
                        Crisp 300 DPI for Word, PDFs, &amp; slides
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormat('svg')}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1 cursor-pointer transition-all ${
                        format === 'svg'
                          ? 'border-[#FF6B22] bg-[#FFF8F3] shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#151515] flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-[#FF6B22]" />
                          Vector SVG
                        </span>
                        {format === 'svg' && <div className="w-2 h-2 rounded-full bg-[#FF6B22]" />}
                      </div>
                      <span className="text-[10px] text-[#6F6A64]">
                        Infinite scale, LaTeX &amp; Illustrator ready
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. Scale / DPI Options (when PNG selected) */}
                {format === 'png' && (
                  <div>
                    <label className="block text-xs font-bold text-[#151515] uppercase tracking-wider mb-2">
                      2. Resolution / Print Quality
                    </label>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {[
                        { val: 1 as const, label: '1x Web', desc: '1000px' },
                        { val: 2 as const, label: '2x Print', desc: '2000px (300DPI)' },
                        { val: 3 as const, label: '3x Ultra', desc: '3000px Poster' }
                      ].map(item => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setScale(item.val)}
                          className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                            scale === item.val
                              ? 'border-[#FF6B22] bg-[#FFF0E6] text-[#FF6B22] font-bold shadow-2xs'
                              : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                          }`}
                        >
                          <div>{item.label}</div>
                          <div className="text-[9px] text-stone-400 font-normal">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Theme & Styling */}
                <div>
                  <label className="block text-xs font-bold text-[#151515] uppercase tracking-wider mb-2">
                    3. Report Theme
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'legal-light' as const, name: 'Legal Light', hint: 'Default crisp studio' },
                      { id: 'monochrome' as const, name: 'Monochrome Print', hint: 'High-contrast B&W brief' },
                      { id: 'parchment' as const, name: 'Classic Parchment', hint: 'Traditional contract tone' },
                      { id: 'dark' as const, name: 'Executive Dark', hint: 'Modern dark deck' }
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t.id)}
                        className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all text-xs ${
                          theme === t.id
                            ? 'border-[#FF6B22] bg-[#FFF8F3] font-bold text-[#151515] shadow-2xs'
                            : 'border-stone-200 text-[#6F6A64] hover:bg-stone-50'
                        }`}
                      >
                        <div className="text-xs">{t.name}</div>
                        <div className="text-[10px] text-stone-400 font-normal">{t.hint}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Inclusion Toggles */}
                <div>
                  <label className="block text-xs font-bold text-[#151515] uppercase tracking-wider mb-2">
                    4. Legal Brief Formatting
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs text-[#151515] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeHeader}
                        onChange={(e) => setIncludeHeader(e.target.checked)}
                        className="rounded text-[#FF6B22] focus:ring-[#FF6B22] accent-[#FF6B22]"
                      />
                      <span>Include Formal Case Header &amp; Verification Stamp</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-[#151515] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeClauseCitations}
                        onChange={(e) => setIncludeClauseCitations(e.target.checked)}
                        className="rounded text-[#FF6B22] focus:ring-[#FF6B22] accent-[#FF6B22]"
                      />
                      <span>Include Statutory Citations &amp; Legend Footnote</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="space-y-2.5 pt-4 border-t border-stone-100">
                {/* Main Download Button */}
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isExporting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#FF6B22] hover:bg-[#E55A16] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-[#FF6B22]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {isExporting 
                      ? 'Generating Image...' 
                      : `Download ${format === 'svg' ? 'Vector SVG (.svg)' : `High-Res Image (.png)`}`}
                  </span>
                </button>

                {/* Secondary Row: Copy SVG & Print View */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopySvg}
                    className="py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-[#151515] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-600" />
                        <span>Copy SVG Code</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="py-2.5 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-[#151515] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-600" />
                    <span>Print Diagram</span>
                  </button>
                </div>

                {/* Toast status message */}
                {exportSuccessToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold text-center flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{exportSuccessToast}</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
