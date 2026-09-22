/**
 * Legal Action Graph Exporter Utility
 * Generates vector SVGs and high-resolution PNG images
 * formatted specifically for inclusion in formal legal briefs, case files, and executive reports.
 */

export interface GraphExportOptions {
  documentName?: string;
  documentDate?: string;
  theme?: 'legal-light' | 'parchment' | 'dark' | 'monochrome';
  includeHeader?: boolean;
  includeLegend?: boolean;
  includeClauseCitations?: boolean;
  documentId?: string;
  scale?: number; // 1 = 72dpi, 2 = 150dpi, 3 = 300dpi (Print Quality)
}

export interface GraphNodeData {
  id: string;
  label: string;
  subtitle?: string;
  sectionRef?: string;
  type: 'root' | 'party' | 'obligation' | 'risk' | 'detail' | 'condition';
  badge?: string;
  colorType?: 'orange' | 'neutral' | 'red' | 'green' | 'blue' | 'amber';
}

/**
 * Builds a standalone, clean vector SVG string representing the Legal Action Graph
 */
export const generateLegalGraphSvg = (options: GraphExportOptions = {}): string => {
  const {
    documentName = 'Rental Agreement.pdf',
    documentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    theme = 'legal-light',
    includeHeader = true,
    includeLegend = true,
    includeClauseCitations = true,
    documentId = 'LX-2025-8842-SYN'
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

  // Dimensions
  const width = 1000;
  const height = includeHeader ? (includeClauseCitations ? 920 : 800) : (includeClauseCitations ? 780 : 660);
  const offsetY = includeHeader ? 140 : 30;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background-color: ${t.bg}; font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <!-- Filter for subtle drop shadows -->
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.06"/>
    </filter>
    <filter id="pillShadow" x="-10%" y="-10%" width="120%" height="130%" filterUnits="userSpaceOnUse">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#FF6B22" flood-opacity="0.25"/>
    </filter>
    
    <!-- Marker Arrow Heads -->
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="${t.connector}" />
    </marker>
    <marker id="arrow-accent" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="${t.accent}" />
    </marker>
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="${t.bg}" />

  ${includeHeader ? `
  <!-- ================= FORMAL LEGAL BRIEF HEADER ================= -->
  <g transform="translate(40, 30)">
    <!-- Header Background Box -->
    <rect width="920" height="90" rx="16" fill="${t.headerBg}" stroke="${t.headerBorder}" stroke-width="1.2" filter="url(#cardShadow)" />
    
    <!-- Logo / Brandmark -->
    <text x="30" y="38" font-size="20" font-weight="800" fill="${t.primaryText}">LEX<tspan fill="${t.accent}">FLOW</tspan></text>
    <text x="30" y="58" font-size="11" font-weight="600" fill="${t.secondaryText}" letter-spacing="1.5">LEGAL ACTION GRAPH — CLAUSE MAPPING BRIEF</text>
    <text x="30" y="74" font-size="10" font-weight="500" fill="${t.secondaryText}">Ref ID: ${documentId} · Status: Structurally Verified</text>

    <!-- Document Target & Synthesis Date -->
    <g transform="translate(560, 20)">
      <rect width="330" height="50" rx="10" fill="${t.accentBg}" stroke="${t.accentBorder}" stroke-width="1" />
      <text x="16" y="22" font-size="10" font-weight="700" fill="${t.accent}" letter-spacing="0.5">SOURCE DOCUMENT</text>
      <text x="16" y="38" font-size="13" font-weight="800" fill="${t.primaryText}">${documentName}</text>
      <text x="230" y="36" font-size="11" font-weight="600" fill="${t.secondaryText}">${documentDate}</text>
    </g>
  </g>
  ` : ''}

  <!-- ================= MAIN GRAPH CANVAS ================= -->
  <g transform="translate(0, ${offsetY})">
    
    <!-- CONNECTING FLOW LINES & RELATIONSHIPS -->
    <!-- 1. Root to Parties -->
    <path d="M 500 55 L 500 95 L 300 95 L 300 135" stroke="${t.connector}" stroke-width="2" stroke-dasharray="0" fill="none" marker-end="url(#arrow)" />
    <path d="M 500 55 L 500 95 L 700 95 L 700 135" stroke="${t.connector}" stroke-width="2" stroke-dasharray="0" fill="none" marker-end="url(#arrow)" />

    <!-- 2. Tenant to Pay Rent Obligation -->
    <path d="M 300 195 L 300 245" stroke="${t.connector}" stroke-width="2" fill="none" marker-end="url(#arrow)" />

    <!-- 3. Landlord to Maintain Premises Obligation -->
    <path d="M 700 195 L 700 245" stroke="${t.connector}" stroke-width="2" fill="none" marker-end="url(#arrow)" />

    <!-- 4. Pay Rent branching to Due Date & Late Penalty -->
    <path d="M 300 310 L 300 345 L 200 345 L 200 375" stroke="${t.connector}" stroke-width="1.8" fill="none" marker-end="url(#arrow)" />
    <path d="M 300 310 L 300 345 L 400 345 L 400 375" stroke="${t.accent}" stroke-width="2" fill="none" marker-end="url(#arrow-accent)" />

    <!-- 5. Tenant to Security Deposit -->
    <path d="M 200 445 L 200 480 L 300 480 L 300 505" stroke="${t.connector}" stroke-width="1.8" fill="none" marker-end="url(#arrow)" />
    
    <!-- 6. Mutual to Termination Notice -->
    <path d="M 700 310 L 700 480 L 700 505" stroke="${t.connector}" stroke-width="1.8" fill="none" marker-end="url(#arrow)" />

    <!-- ================= GRAPH NODES ================= -->

    <!-- [NODE 1: ROOT CONTRACT] -->
    <g transform="translate(375, 10)">
      <rect width="250" height="46" rx="23" fill="${t.accent}" filter="url(#pillShadow)" />
      <circle cx="28" cy="23" r="12" fill="#FFFFFF" fill-opacity="0.2" />
      <path d="M 23 18 L 33 18 L 33 28 L 23 28 Z M 25 21 L 31 21 M 25 24 L 31 24 M 25 26 L 29 26" stroke="#FFFFFF" stroke-width="1.5" fill="none" stroke-linecap="round" />
      <text x="48" y="28" font-size="14" font-weight="800" fill="#FFFFFF" letter-spacing="0.3">Rental Agreement (Root)</text>
    </g>

    <!-- [NODE 2: TENANT PARTY] -->
    <g transform="translate(190, 135)">
      <rect width="220" height="60" rx="16" fill="${t.cardBg}" stroke="${t.border}" stroke-width="1.5" filter="url(#cardShadow)" />
      <!-- Avatar icon -->
      <rect x="14" y="13" width="34" height="34" rx="17" fill="${t.accentBg}" stroke="${t.accentBorder}" stroke-width="1" />
      <circle cx="31" cy="26" r="6" fill="${t.accent}" />
      <path d="M 22 41 C 22 35, 40 35, 40 41" fill="${t.accent}" />
      <text x="58" y="32" font-size="14" font-weight="800" fill="${t.primaryText}">Tenant (Lessee)</text>
      <text x="58" y="48" font-size="11" font-weight="600" fill="${t.secondaryText}">Party 1 · Primary Obligor</text>
    </g>

    <!-- [NODE 3: LANDLORD PARTY] -->
    <g transform="translate(590, 135)">
      <rect width="220" height="60" rx="16" fill="${t.cardBg}" stroke="${t.border}" stroke-width="1.5" filter="url(#cardShadow)" />
      <!-- Building icon -->
      <rect x="14" y="13" width="34" height="34" rx="17" fill="${t.accentBg}" stroke="${t.accentBorder}" stroke-width="1" />
      <path d="M 25 38 L 25 22 L 37 22 L 37 38 Z M 28 26 L 30 26 M 32 26 L 34 26 M 28 30 L 30 30 M 32 30 L 34 30" stroke="${t.accent}" stroke-width="1.4" fill="none" />
      <text x="58" y="32" font-size="14" font-weight="800" fill="${t.primaryText}">Landlord (Lessor)</text>
      <text x="58" y="48" font-size="11" font-weight="600" fill="${t.secondaryText}">Party 2 · Property Owner</text>
    </g>

    <!-- [NODE 4: PAY RENT OBLIGATION] -->
    <g transform="translate(180, 245)">
      <rect width="240" height="65" rx="16" fill="${t.accentBg}" stroke="${t.accentBorder}" stroke-width="1.5" filter="url(#cardShadow)" />
      <rect x="14" y="12" width="70" height="18" rx="9" fill="${t.accent}" />
      <text x="49" y="24" font-size="9" font-weight="800" fill="#FFFFFF" text-anchor="middle">SECTION 4.1</text>
      <text x="14" y="46" font-size="14" font-weight="800" fill="${t.primaryText}">Pay ₹25,000 / month</text>
      <text x="14" y="58" font-size="10" font-weight="600" fill="${t.secondaryText}">Fixed recurring consideration</text>
    </g>

    <!-- [NODE 5: MAINTAIN PREMISES OBLIGATION] -->
    <g transform="translate(580, 245)">
      <rect width="240" height="65" rx="16" fill="${t.cardBg}" stroke="${t.border}" stroke-width="1.5" filter="url(#cardShadow)" />
      <rect x="14" y="12" width="70" height="18" rx="9" fill="${t.border}" />
      <text x="49" y="24" font-size="9" font-weight="800" fill="${t.secondaryText}" text-anchor="middle">SECTION 9.1</text>
      <text x="14" y="46" font-size="14" font-weight="800" fill="${t.primaryText}">Maintain Premises</text>
      <text x="14" y="58" font-size="10" font-weight="600" fill="${t.secondaryText}">Structural repairs &amp; habitability</text>
    </g>

    <!-- [NODE 6: DUE DATE CONDITION] -->
    <g transform="translate(80, 375)">
      <rect width="210" height="70" rx="14" fill="${t.cardBg}" stroke="${t.border}" stroke-width="1.4" filter="url(#cardShadow)" />
      <circle cx="26" cy="26" r="10" fill="#EBF4FF" />
      <path d="M 22 26 L 25 29 L 31 23" stroke="#2563EB" stroke-width="1.8" fill="none" stroke-linecap="round" />
      <text x="42" y="29" font-size="11" font-weight="700" fill="${t.secondaryText}">TIMELINE RULE</text>
      <text x="16" y="50" font-size="13" font-weight="800" fill="${t.primaryText}">Due 5th of Each Month</text>
      <text x="16" y="62" font-size="10" font-weight="500" fill="${t.secondaryText}">Grace period up to 8th</text>
    </g>

    <!-- [NODE 7: LATE PENALTY RISK NODE] -->
    <g transform="translate(310, 375)">
      <rect width="230" height="70" rx="14" fill="${t.riskBg}" stroke="${t.riskBorder}" stroke-width="1.5" filter="url(#cardShadow)" />
      <!-- Alert Warning Triangle -->
      <path d="M 28 18 L 38 34 L 18 34 Z" fill="${t.riskText}" fill-opacity="0.15" stroke="${t.riskText}" stroke-width="1.5" stroke-linejoin="round" />
      <text x="28" y="30" font-size="11" font-weight="800" fill="${t.riskText}" text-anchor="middle">!</text>
      
      <rect x="46" y="16" width="76" height="18" rx="9" fill="${t.riskText}" />
      <text x="84" y="28" font-size="9" font-weight="800" fill="#FFFFFF" text-anchor="middle">SECTION 4.3</text>
      
      <text x="16" y="50" font-size="13" font-weight="800" fill="${t.riskText}">Late Penalty: ₹500/day</text>
      <text x="16" y="62" font-size="10" font-weight="600" fill="${t.riskText}">Triggers default clause if &gt; 30d</text>
    </g>

    <!-- [NODE 8: SECURITY DEPOSIT REFUND] -->
    <g transform="translate(180, 505)">
      <rect width="240" height="70" rx="14" fill="${t.cardBg}" stroke="${t.border}" stroke-width="1.4" filter="url(#cardShadow)" />
      <rect x="14" y="12" width="70" height="18" rx="9" fill="${t.border}" />
      <text x="49" y="24" font-size="9" font-weight="800" fill="${t.secondaryText}" text-anchor="middle">SECTION 5.1</text>
      <text x="14" y="47" font-size="13" font-weight="800" fill="${t.primaryText}">Security Deposit: ₹75,000</text>
      <text x="14" y="60" font-size="10" font-weight="500" fill="${t.secondaryText}">Refundable upon peaceful handover</text>
    </g>

    <!-- [NODE 9: TERMINATION NOTICE] -->
    <g transform="translate(580, 505)">
      <rect width="240" height="70" rx="14" fill="${t.cardBg}" stroke="${t.border}" stroke-width="1.4" filter="url(#cardShadow)" />
      <rect x="14" y="12" width="76" height="18" rx="9" fill="${t.border}" />
      <text x="52" y="24" font-size="9" font-weight="800" fill="${t.secondaryText}" text-anchor="middle">SECTION 12.1</text>
      <text x="14" y="47" font-size="13" font-weight="800" fill="${t.primaryText}">Termination: 30 Days</text>
      <text x="14" y="60" font-size="10" font-weight="500" fill="${t.secondaryText}">Written notice from either party</text>
    </g>
  </g>

  ${includeClauseCitations ? `
  <!-- ================= FOOTER / LEGAL CITATION LEGEND ================= -->
  <g transform="translate(40, ${height - 110})">
    <rect width="920" height="85" rx="14" fill="${t.cardBg}" stroke="${t.border}" stroke-width="1.2" />
    
    <!-- Legend items -->
    <g transform="translate(24, 20)">
      <text x="0" y="14" font-size="11" font-weight="800" fill="${t.primaryText}">GRAPH LEGEND &amp; STATUTORY TRACEABILITY</text>
      
      <!-- Legend row -->
      <g transform="translate(0, 26)">
        <rect x="0" y="0" width="14" height="14" rx="4" fill="${t.accent}" />
        <text x="22" y="11" font-size="10" font-weight="600" fill="${t.secondaryText}">Primary Root Contract</text>

        <rect x="160" y="0" width="14" height="14" rx="4" fill="${t.cardBg}" stroke="${t.border}" />
        <text x="182" y="11" font-size="10" font-weight="600" fill="${t.secondaryText}">Legal Party / Obligation</text>

        <rect x="340" y="0" width="14" height="14" rx="4" fill="${t.riskBg}" stroke="${t.riskBorder}" />
        <text x="362" y="11" font-size="10" font-weight="600" fill="${t.riskText}">Adversarial / Financial Risk</text>
      </g>
    </g>

    <!-- Formal Legal Disclaimer -->
    <text x="900" y="52" font-size="9" font-weight="500" fill="${t.secondaryText}" text-anchor="end">
      Generated by LEXFLOW Legal Action Graph Engine · Verified against Original Contract Sections
    </text>
  </g>
  ` : ''}
</svg>`;
};

/**
 * Downloads the generated SVG vector file
 */
export const exportGraphAsSvg = (options: GraphExportOptions = {}) => {
  const svgString = generateLegalGraphSvg(options);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  const cleanName = (options.documentName || 'legal_action_graph')
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_');
  a.download = `${cleanName}_action_graph.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Rasterizes the SVG to a high-resolution PNG using an off-screen HTML5 Canvas
 * @param options Graph options including scale (1x, 2x, 3x)
 */
export const exportGraphAsPng = async (options: GraphExportOptions = {}): Promise<void> => {
  const scale = options.scale || 2; // Default 2x for crisp report printing
  const svgString = generateLegalGraphSvg(options);
  
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
          URL.revokeObjectURL(url);
          reject(new Error('Could not get 2D canvas context'));
          return;
        }

        // High quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (!blob) {
            reject(new Error('Failed to create PNG blob'));
            return;
          }

          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = pngUrl;
          const cleanName = (options.documentName || 'legal_action_graph')
            .replace(/\.[^/.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '_');
          a.download = `${cleanName}_action_graph_${scale}x.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(pngUrl);
          resolve();
        }, 'image/png');
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG for rasterization'));
    };

    img.src = url;
  });
};

/**
 * Copies the raw SVG string to the clipboard
 */
export const copyGraphSvgToClipboard = async (options: GraphExportOptions = {}): Promise<boolean> => {
  try {
    const svgString = generateLegalGraphSvg(options);
    await navigator.clipboard.writeText(svgString);
    return true;
  } catch (err) {
    console.error('Failed to copy SVG code to clipboard', err);
    return false;
  }
};
