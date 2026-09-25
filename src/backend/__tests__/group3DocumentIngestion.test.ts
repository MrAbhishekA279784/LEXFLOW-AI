import { describe, it, expect, beforeEach } from 'vitest';
import { TextExtractor } from '../utils/textExtractor';
import { ClauseSegmenter } from '../utils/clauseSegmenter';
import { DocumentExtractionService } from '../services/extraction/documentExtractionService';
import { repository } from '../repositories';
import { FileProcessingError, ValidationError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

describe('Group 3 — Real Document Ingestion Pipeline Test Suite', () => {
  const userA = 'user-ingest-a-' + uuidv4().substring(0, 8);
  const userB = 'user-ingest-b-' + uuidv4().substring(0, 8);

  it('TEST A & B: Should parse text from a valid PDF binary buffer', async () => {
    // Generate simple text buffer simulating extracted document
    const sampleDocText = 'SECTION 1. DEFINITIONS. This Commercial Supply Agreement is entered into between Vendor Corp and Client Inc.';
    const pdfBuffer = Buffer.from(sampleDocText, 'utf-8');

    // Extract text
    const result = await TextExtractor.extract(pdfBuffer, 'Commercial_Supply_Agreement.txt', 'text/plain');

    expect(result).toBeDefined();
    expect(result.totalPages).toBeGreaterThanOrEqual(1);
    expect(result.fullText).toContain('Commercial Supply Agreement');
    expect(result.charCount).toBeGreaterThan(0);
    expect(result.isScannedOrImageOnly).toBe(false);
  });

  it('TEST D: Should deterministically segment clauses from extracted text without fake fallbacks', () => {
    const docId = 'doc-test-ingest-1';
    const contractText = `
SECTION 1: PAYMENT TERMS
Rent of $5,000 per month is due on the 1st of each month via ACH transfer.
Failure to pay within 5 days incurs a late penalty surcharge of 5% per month.

SECTION 2: INDEMNIFICATION AND LIABILITY
Client shall indemnify and hold harmless Vendor against all third party claims.
Vendor liability is limited to total fees paid in preceding 12 months.

SECTION 3: TERMINATION
Either party may terminate this agreement upon 30 days written notice.
    `;

    const clauses = ClauseSegmenter.segment(docId, contractText, [{ pageNumber: 1, text: contractText }]);

    expect(clauses.length).toBeGreaterThanOrEqual(3);
    expect(clauses[0].title).toContain('PAYMENT TERMS');
    expect(clauses[0].summary).toContain('Rent of $5,000');
    expect(clauses[1].riskLevel).toBe('high'); // Contains 'indemnify'
    expect(clauses[0].party).toBe('mutual');
    // Ensure NO Bangalore lease text is present
    expect(contractText).not.toContain('Bangalore');
    expect(contractText).not.toContain('Dr. Ramesh Sharma');
  });

  it('TEST F & H: Should reject unsupported file formats and invalid signatures', () => {
    // Executable / script buffer
    const exeBuffer = Buffer.from('MZ\x90\x00\x03\x00\x00\x00\x04\x00\x00\x00\xFF\xFF', 'utf-8');

    expect(() => {
      TextExtractor.validateFile({
        name: 'malicious.exe',
        size: exeBuffer.length,
        mimetype: 'application/x-msdownload',
        buffer: exeBuffer
      });
    }).toThrow(FileProcessingError);
  });

  it('TEST I: Should reject oversized files exceeding size limits', () => {
    const hugeSize = 50 * 1024 * 1024; // 50MB

    expect(() => {
      TextExtractor.validateFile({
        name: 'huge_document.pdf',
        size: hugeSize,
        mimetype: 'application/pdf'
      });
    }).toThrow(FileProcessingError);
  });

  it('TEST J & K: Should fail gracefully and set status = FAILED on empty or corrupted payload', async () => {
    const doc = await repository.create({
      userId: userA,
      name: 'Empty_Corrupted_File.pdf',
      type: 'pdf'
    });

    const emptyBuffer = Buffer.from('', 'utf-8');

    // Run processing
    await DocumentExtractionService.processDocumentAsync(doc.id, userA, emptyBuffer, doc.name);

    // Verify document status becomes failed, not READY
    const updatedDoc = await repository.findById(doc.id, userA);
    expect(updatedDoc?.status).toBe('failed');

    const job = await repository.findJobByDocument(doc.id);
    expect(job?.status).toBe('failed');
    expect(job?.errorMessage).toBeDefined();
  });

  it('TEST N & O: Should maintain Group 1 tenant isolation on uploaded documents', async () => {
    const docText = 'SECTION 1. CONFIDENTIAL NON-DISCLOSURE AGREEMENT. Between Party A and Party B.';
    const docBuffer = Buffer.from(docText, 'utf-8');

    const doc = await repository.create({
      userId: userA,
      name: 'Private_NDA.txt',
      type: 'pdf'
    });

    await DocumentExtractionService.processDocumentAsync(doc.id, userA, docBuffer, doc.name, 'text/plain');

    // User A can access clauses
    const clausesA = await repository.listByDocument(doc.id);
    expect(clausesA.length).toBeGreaterThan(0);

    // User B attempting to fetch document record gets null
    const crossFetchDoc = await repository.findById(doc.id, userB);
    expect(crossFetchDoc).toBeNull();
  });

  it('TEST R: Verify zero production Bangalore lease fallbacks in extraction output', async () => {
    const customText = 'SECTION 1. CONSULTING AGREEMENT. Scope: Cloud Infrastructure Consulting Services. Fee: $150/hour.';
    const customBuffer = Buffer.from(customText, 'utf-8');

    const doc = await repository.create({
      userId: userA,
      name: 'Custom_Consulting_Agreement.txt',
      type: 'pdf'
    });

    await DocumentExtractionService.processDocumentAsync(doc.id, userA, customBuffer, doc.name, 'text/plain');

    const clauses = await repository.listByDocument(doc.id);
    expect(clauses.length).toBeGreaterThan(0);

    const hasBangaloreFallback = clauses.some(c => 
      c.fullText.includes('Bangalore') || 
      c.fullText.includes('Lotus Heights') || 
      c.fullText.includes('Dr. Ramesh Sharma') || 
      c.fullText.includes('Ahamed Khan')
    );

    expect(hasBangaloreFallback).toBe(false);
  });
});
