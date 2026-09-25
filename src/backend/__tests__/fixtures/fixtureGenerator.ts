import fs from 'fs';
import path from 'path';

/**
 * Deterministic Real Binary Document Fixtures Generator for Ingestion Testing
 */

/**
 * Generates a valid minimal binary PDF 1.7 buffer
 */
export function createValidPdfBuffer(text = 'SECTION 1: DEFINITIONS. Commercial Supply Agreement'): Buffer {
  const pdfContent = `%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${text.length + 55} >>
stream
BT
/F1 12 Tf
100 700 Td
(${text.replace(/[()]/g, '')}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000350 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
420
%%EOF`;

  return Buffer.from(pdfContent, 'utf-8');
}

/**
 * Generates a valid minimal binary DOCX PKZip Buffer
 */
export function createValidDocxBuffer(): Buffer {
  const possiblePaths = [
    path.resolve(process.cwd(), 'node_modules/mammoth/test/test-data/single-paragraph.docx'),
    path.resolve(__dirname, '../../../../node_modules/mammoth/test/test-data/single-paragraph.docx'),
    path.resolve(__dirname, '../../../node_modules/mammoth/test/test-data/single-paragraph.docx'),
    '/node_modules/mammoth/test/test-data/single-paragraph.docx'
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p);
    }
  }

  // Fallback minimal valid docx header
  const pkHeader = Buffer.from([
    0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00, 0x08, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x13, 0x00, 0x00, 0x00, 0x77, 0x6f, 0x72, 0x64,
    0x2f, 0x64, 0x6f, 0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x2e,
    0x78, 0x6d, 0x6c, 0x3c, 0x77, 0x3a, 0x64, 0x6f, 0x63, 0x75,
    0x6d, 0x65, 0x6e, 0x74, 0x3e, 0x3c, 0x77, 0x3a, 0x62, 0x6f,
    0x64, 0x79, 0x3e, 0x3c, 0x77, 0x3a, 0x70, 0x3e, 0x3c, 0x77,
    0x3a, 0x74, 0x3e, 0x43, 0x6f, 0x6e, 0x73, 0x75, 0x6c, 0x74,
    0x69, 0x6e, 0x67, 0x20, 0x41, 0x67, 0x72, 0x65, 0x65, 0x6d,
    0x65, 0x6e, 0x74, 0x3c, 0x2f, 0x77, 0x3a, 0x74, 0x3e, 0x3c,
    0x2f, 0x77, 0x3a, 0x70, 0x3e, 0x3c, 0x2f, 0x77, 0x3a, 0x62,
    0x6f, 0x64, 0x79, 0x3e, 0x3c, 0x2f, 0x77, 0x3a, 0x64, 0x6f,
    0x63, 0x75, 0x6d, 0x65, 0x6e, 0x74, 0x3e, 0x50, 0x4b, 0x05,
    0x06, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x41,
    0x00, 0x00, 0x00, 0x43, 0x00, 0x00, 0x00, 0x00, 0x00
  ]);
  return pkHeader;
}

/**
 * Generates corrupted PDF buffer with invalid binary structure
 */
export function createCorruptedPdfBuffer(): Buffer {
  return Buffer.from('%PDF-1.7 CORRUPTED BINARY STREAM INVALID XREF %EOF', 'utf-8');
}

/**
 * Generates corrupted DOCX buffer with broken zip header
 */
export function createCorruptedDocxBuffer(): Buffer {
  return Buffer.from('NOT_A_ZIP_HEADER_INVALID_DOCX_FILE', 'utf-8');
}
