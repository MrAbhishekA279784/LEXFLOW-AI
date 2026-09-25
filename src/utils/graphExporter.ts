/**
 * Legal Action Graph Exporter Utility
 * Generates vector SVGs and high-resolution PNG images dynamically from real LegalGraph data,
 * formatted specifically for inclusion in formal legal briefs, case files, and executive reports.
 */

import { GraphNode, GraphEdge, GraphNodeType } from '../backend/types/backendTypes';

export interface GraphExportOptions {
  documentName?: string;
  documentDate?: string;
  theme?: 'legal-light' | 'parchment' | 'dark' | 'monochrome';
  includeHeader?: boolean;
  includeLegend?: boolean;
  includeClauseCitations?: boolean;
  documentId?: string;
  scale?: number; // 1 = 72dpi, 2 = 150dpi, 3 = 300dpi (Print Quality)
  nodes?: GraphNode[];
  edges?: GraphEdge[];
}

export interface GraphNodeData {
  id: string;
  label: string;
  subtitle?: string;
  sectionRef?: string;
  type: 'root' | 'party' | 'obligation' | 'risk' | 'detail' | 'condition' | string;
  badge?: string;
  colorType?: 'orange' | 'neutral' | 'red' | 'green' | 'blue' | 'amber';
}

/**
 * Builds a standalone, clean vector SVG string dynamically representing the Legal Action Graph
 */
export const generateLegalGraphSvg = (options: GraphExportOptions = {}): string => {
  const {
    documentName = 'Legal Document.pdf',
    documentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    theme = 'legal-light',
    includeHeader = true,
    includeLegend = true,
    includeClauseCitations = true,
    documentId = 'LX-LEGAL-GRAPH',
    nodes = [],
    edges = []
  } = options;

  // Color theme definitions
  const themes = {
    'legal-light': {
      bg: '#FAF8F5',
      cardBg: '#FFFFFF',
      border: '#E6DFD5',
      primaryText: '#151515',
      secondaryText: '#6F6A64',
      accent: '#FF6B22',
      accentBg: '#FFF0E6',
      accentBorder: '#FFB894',
      connector: '#8C827A',
      riskBg: '#FEF3F2',
      riskBorder: '#FECDCA',
      riskText: '#B42318',
      successBg: '#ECFDF3',
      successBorder: '#A6F4C5',
      successText: '#027A48',
      headerBg: '#FFFFFF',
      headerBorder: '#E6DFD5'
    },
    'parchment': {
      bg: '#F5EFEB',
      cardBg: '#FCFAF7',
      border: '#DFD5CA',
      primaryText: '#221D18',
      secondaryText: '#7A7269',
      accent: '#D9530F',
      accentBg: '#FCEFE8',
      accentBorder: '#F2C1A8',
      connector: '#7A7269',
      riskBg: '#FBE8E7',
      riskBorder: '#F5BDB8',
      riskText: '#8F1E16',
      successBg: '#E7F6EC',
      successBorder: '#A0DFB5',
      successText: '#0A5C36',
      headerBg: '#EFE6DE',
      headerBorder: '#DFD5CA'
    },
    'dark': {
      bg: '#141210',
      cardBg: '#1F1B18',
      border: '#332E29',
      primaryText: '#F7F2EC',
      secondaryText: '#A39C93',
      accent: '#FF7A38',
      accentBg: '#2E1C12',
      accentBorder: '#663217',
      connector: '#665E56',
      riskBg: '#331614',
      riskBorder: '#66221D',
      riskText: '#FDA29B',
      successBg: '#102A1C',
      successBorder: '#1F5E3D',
      successText: '#6CE9A6',
      headerBg: '#1F1B18',
      headerBorder: '#332E29'
    },
    'monochrome': {
      bg: '#FFFFFF',
      cardBg: '#FFFFFF',
      border: '#CCCCCC',
      primaryText: '#000000',
      secondaryText: '#555555',
      accent: '#000000',
      accentBg: '#F0F0F0',
      accentBorder: '#000000',
      connector: '#444444',
      riskBg: '#F5F5F5',
      riskBorder: '#888888',
      riskText: '#000000',
      successBg: '#F5F5F5',
      successBorder: '#888888',
      successText: '#000000',
      headerBg: '#FFFFFF',
      headerBorder: '#CCCCCC'
    }
  };

  const t = themes[theme] || themes['legal-light'];

  // Dimensions & bounds calculation
  let maxX = 900;
  let maxY = 700;

  nodes.forEach(n => {
    if (n.position) {
      if (n.position.x > maxX - 250) maxX = n.position.x + 250;
      if (n.position.y > maxY - 120) maxY = n.position.y + 120;
    }
  });

  const width = Math.max(1000, maxX + 80);
  const height = Math.max(800, maxY + 220);
  const offsetY = includeHeader ? 130 : 30;

  // Node position map for rendering edges
  const posMap = new Map<string, { x: number; y: number }>();
  nodes.forEach((n, idx) => {
    const x = n.position?.x ?? ((idx % 4) * 230 + 60);
    const y = n.position?.y ?? (Math.floor(idx / 4) * 130 + 40);
    posMap.set(n.id, { x, y });
  });

  // Dynamic Edges SVG
  const edgesSvg = edges.map(e => {
    const p1 = posMap.get(e.source);
    const p2 = posMap.get(e.target);
    if (!p1 || !p2) return '';

    const startX = p1.x + 100;
    const startY = p1.y + 55;
    const endX = p2.x + 100;
    const endY = p2.y;

    const midY = (startY + endY) / 2;
    const pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
    const strokeColor = e.relationship === 'PROTECTED_BY' || e.relationship === 'SUPPORTED_BY' 
      ? t.successText 
      : (e.relationship === 'TRIGGERS' ? t.riskText : t.connector);

    return `
      <g>
        <path d="${pathD}" stroke="${strokeColor}" stroke-width="1.8" fill="none" marker-end="url(#arrow)" />
        ${e.label ? `<text x="${(startX + endX) / 2}" y="${midY - 4}" font-size="9" font-weight="700" fill="${strokeColor}" text-anchor="middle" letter-spacing="0.5">${e.label}</text>` : ''}
      </g>
    `;
  }).join('');

  // Node color helper
  const getNodeStyles = (type: GraphNodeType) => {
    switch (type) {
      case 'Party':
        return { bg: t.accentBg, border: t.accentBorder, text: t.accent, badge: 'PARTY' };
      case 'Obligation':
        return { bg: t.cardBg, border: t.border, text: t.primaryText, badge: 'OBLIGATION' };
      case 'Payment':
        return { bg: '#FFF6ED', border: '#FFD4B2', text: '#D9530F', badge: 'PAYMENT' };
      case 'Penalty':
        return { bg: t.riskBg, border: t.riskBorder, text: t.riskText, badge: 'PENALTY' };
      case 'Condition':
        return { bg: '#F8F5FF', border: '#E0D4FC', text: '#5925DC', badge: 'CONDITION' };
      case 'Deadline':
        return { bg: '#F4F3FF', border: '#D9D6FE', text: '#4338CA', badge: 'DEADLINE' };
      case 'Right':
        return { bg: t.successBg, border: t.successBorder, text: t.successText, badge: 'RIGHT' };
      case 'Consequence':
      case 'Action':
        return { bg: '#FEF6EE', border: '#F9DBAF', text: '#B54708', badge: 'CONSEQUENCE' };
      case 'Statute':
      case 'Judgment':
        return { bg: t.successBg, border: t.successBorder, text: t.successText, badge: type.toUpperCase() };
      default:
        return { bg: t.cardBg, border: t.border, text: t.primaryText, badge: 'NODE' };
    }
  };

  // Dynamic Nodes SVG
  const nodesSvg = nodes.map(n => {
    const pos = posMap.get(n.id) || { x: 50, y: 50 };
    const style = getNodeStyles(n.type);
    const labelSanitized = (n.label || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const descSanitized = (n.description || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 36);

    return `
      <g transform="translate(${pos.x}, ${pos.y})">
        <rect width="210" height="64" rx="14" fill="${style.bg}" stroke="${style.border}" stroke-width="1.4" filter="url(#cardShadow)" />
        <rect x="12" y="10" width="70" height="15" rx="7" fill="${style.border}" />
        <text x="47" y="21" font-size="8.5" font-weight="800" fill="${style.text}" text-anchor="middle" letter-spacing="0.5">${style.badge}</text>
        ${n.sourceClauseId ? `<text x="195" y="21" font-size="8" font-weight="600" fill="${t.secondaryText}" text-anchor="end">p.${n.sourcePage || 1}</text>` : ''}
        <text x="12" y="42" font-size="11.5" font-weight="800" fill="${t.primaryText}">${labelSanitized.slice(0, 24)}</text>
        <text x="12" y="55" font-size="9.5" font-weight="500" fill="${t.secondaryText}">${descSanitized}</text>
      </g>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: ${t.bg}; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000000" flood-opacity="0.06"/>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="${t.connector}" />
    </marker>
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="${t.bg}" />

  ${includeHeader ? `
  <!-- Formal Header -->
  <g transform="translate(40, 24)">
    <rect width="${width - 80}" height="84" rx="16" fill="${t.headerBg}" stroke="${t.headerBorder}" stroke-width="1.2" filter="url(#cardShadow)" />
    <text x="24" y="36" font-size="18" font-weight="800" fill="${t.primaryText}">LEX<tspan fill="${t.accent}">FLOW</tspan></text>
    <text x="24" y="54" font-size="11" font-weight="600" fill="${t.secondaryText}" letter-spacing="1.2">LEGAL ACTION GRAPH — RELATIONSHIP MODEL</text>
    <text x="24" y="70" font-size="9.5" font-weight="500" fill="${t.secondaryText}">Doc Ref: ${documentId} · Nodes: ${nodes.length} · Edges: ${edges.length}</text>

    <g transform="translate(${width - 380}, 16)">
      <rect width="280" height="52" rx="10" fill="${t.accentBg}" stroke="${t.accentBorder}" stroke-width="1" />
      <text x="14" y="22" font-size="9.5" font-weight="700" fill="${t.accent}" letter-spacing="0.5">SOURCE CONTRACT</text>
      <text x="14" y="40" font-size="12" font-weight="800" fill="${t.primaryText}">${documentName.slice(0, 26)}</text>
      <text x="200" y="38" font-size="10" font-weight="600" fill="${t.secondaryText}">${documentDate}</text>
    </g>
  </g>
  ` : ''}

  <!-- Main Graph Canvas -->
  <g transform="translate(40, ${offsetY})">
    ${edgesSvg}
    ${nodesSvg}
  </g>

  ${includeClauseCitations ? `
  <!-- Traceability Stamp Footer -->
  <g transform="translate(40, ${height - 40})">
    <text x="0" y="0" font-size="9" font-weight="600" fill="${t.secondaryText}">
      Generated by LEXFLOW Legal Action Graph Engine · Grounded in Real Contractual Obligations &amp; Indian Statutory Authorities
    </text>
  </g>
  ` : ''}
</svg>`;
};

export const exportGraphAsSvg = (options: GraphExportOptions = {}) => {
  const svgString = generateLegalGraphSvg(options);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanName = (options.documentName || 'legal_action_graph')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .toLowerCase();
  a.download = `${cleanName}_action_graph.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportGraphAsPng = async (options: GraphExportOptions = {}): Promise<void> => {
  const svgString = generateLegalGraphSvg(options);
  const scale = options.scale || 2;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context initialization failed'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = pngUrl;
          const cleanName = (options.documentName || 'legal_action_graph')
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .toLowerCase();
          a.download = `${cleanName}_action_graph_${scale}x.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(pngUrl);
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    img.src = url;
  });
};

export const copyGraphSvgToClipboard = async (options: GraphExportOptions = {}): Promise<boolean> => {
  try {
    const svgString = generateLegalGraphSvg(options);
    await navigator.clipboard.writeText(svgString);
    return true;
  } catch (err) {
    console.error('Failed to copy SVG to clipboard:', err);
    return false;
  }
};
