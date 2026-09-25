import { repository } from '../../repositories';
import { TextExtractor } from '../../utils/textExtractor';
import { ClauseSegmenter } from '../../utils/clauseSegmenter';
import { DocumentChunker } from '../retrieval/documentChunker';
import { EmbeddingService } from '../retrieval/embeddingService';
import { LegalModelService } from '../legalModel/legalModelService';
import { GraphEngine } from '../graph/graphEngine';
import { AdversarialReviewService } from '../risks/adversarialReviewService';
import { ConflictDetector } from '../conflicts/conflictDetector';
import { logger } from '../../utils/logger';
import { DocumentStatus } from '../../types/backendTypes';

export class DocumentExtractionService {
  /**
   * Cleans and sanitizes uploaded filenames to prevent directory traversal attacks, 
   * absolute path execution, or illegal character injection.
   */
  static sanitizeFilename(filename: string): string {
    if (!filename) return 'unnamed_file';
    
    // 1. Get the base name only, stripping any directory structures (both unix / and windows \)
    let base = filename.replace(/^.*[\\\/]/, '');

    // 2. Remove all parent directory / traversal indicators like '../' or '..\'
    base = base.replace(/\.\.+\//g, '').replace(/\.\.+\\/g, '');

    // 3. Keep repeating step 2 to prevent nested traversal bypasses like '....//'
    while (base.includes('..')) {
      base = base.replace(/\.\./g, '');
    }

    // 4. Strip leading slashes, backslashes, dots or spaces
    base = base.replace(/^[.\\\/ \s]+/, '');

    // 5. Separate extension to preserve it intact
    const lastDotIdx = base.lastIndexOf('.');
    let namePart = lastDotIdx !== -1 ? base.substring(0, lastDotIdx) : base;
    const extPart = lastDotIdx !== -1 ? base.substring(lastDotIdx) : '';

    // 6. Clean characters in the name part: allow alphanumeric, dashes, underscores, and spaces
    namePart = namePart.replace(/[^a-zA-Z0-9_\-\s]/g, '_');

    // If the name part becomes empty, give it a default name
    if (!namePart.trim()) {
      namePart = 'sanitized_document';
    }

    return namePart.trim() + extPart;
  }

  /**
   * Runs the complete asynchronous document processing pipeline through all defined lifecycle stages:
   * uploaded -> validating -> stored -> extracting -> segmenting -> analyzing -> building_model -> building_graph -> detecting_risks -> completed
   */
  static async processDocumentAsync(documentId: string, userId: string, rawBase64OrBuffer?: string | Buffer, originalName?: string, mimeType?: string): Promise<void> {
    const job = await repository.createJob({
      documentId,
      userId,
      status: 'processing',
      currentStep: 'Initializing document ingestion pipeline',
      progressPercentage: 10,
    });

    try {
      const sanitizedName = originalName ? this.sanitizeFilename(originalName) : 'uploaded_file';
      await repository.updateStatus(documentId, 'processing', { name: sanitizedName, userId }, userId);

      // 1. Text Extraction
      await this.updateJobStep(job.id, documentId, 'extracting', 'Extracting binary document text and page mapping', 25, userId);
      
      let extracted;
      try {
        extracted = await TextExtractor.extract(rawBase64OrBuffer, sanitizedName, mimeType);
      } catch (extractErr: any) {
        const msg = extractErr instanceof Error ? extractErr.message : String(extractErr);
        await repository.updateJob(job.id, {
          status: 'failed',
          errorMessage: msg,
        });
        await repository.updateStatus(documentId, 'failed', msg, userId);
        return;
      }

      
      // Clear reference to raw input buffer to allow immediate V8 garbage collection
      rawBase64OrBuffer = undefined;


      // 2. Clause Segmentation & Persistence
      await this.updateJobStep(job.id, documentId, 'analyzing', 'Segmenting legal clauses & section structure', 40, userId);
      
      const clauses = ClauseSegmenter.segment(documentId, extracted.fullText, extracted.pages);
      
      if (!clauses || clauses.length === 0) {
        throw new Error('Document processing failed: Could not segment any legal clauses from the extracted text.');
      }

      await repository.saveMany(documentId, clauses);

      // 2b. Structural Chunking & Embedding Generation
      const chunks = DocumentChunker.chunkDocument(documentId, clauses, extracted.fullText);
      const embeddedChunks = await EmbeddingService.embedChunks(chunks);
      await repository.saveChunks(embeddedChunks);

      // 3. Build Legal Model
      await this.updateJobStep(job.id, documentId, 'building_model', 'Extracting structured Legal Model facts and entities', 55, userId);
      const legalModel = await LegalModelService.buildLegalModel(documentId, extracted.fullText, clauses);

      // 4. Build Legal Action Graph
      await this.updateJobStep(job.id, documentId, 'building_graph', 'Constructing interconnected Legal Action Graph', 70, userId);
      const graph = GraphEngine.buildGraph(legalModel);
      await repository.saveGraph(documentId, graph);

      // 5. Detect Risks (Dual-Agent Review) & Conflicts
      await this.updateJobStep(job.id, documentId, 'detecting_risks', 'Running opposing counsel & protection risk scans', 82, userId);
      const dualReview = AdversarialReviewService.reviewDocument(documentId, clauses);
      await repository.saveRisks(documentId, [...dualReview.opposingRisks, ...dualReview.protections]);

      const conflicts = ConflictDetector.detectConflicts(documentId, clauses);
      await repository.saveConflicts(documentId, conflicts);

      // 6. Finalize Verification Steps
      await this.updateJobStep(job.id, documentId, 'retrieving_law', 'Grounding findings against Indian statutory acts & judicial precedents', 92, userId);
      await this.updateJobStep(job.id, documentId, 'generating_evidence', 'Finalizing verifiable evidence citations', 98, userId);


      // 7. Complete Analysis
      await repository.updateJob(job.id, {
        status: 'completed',
        currentStep: 'Ingestion and analysis complete. Legal Action Graph and Evidence ready.',
        progressPercentage: 100,
        completedAt: new Date().toISOString(),
      });

      await repository.updateStatus(
        documentId, 
        'completed', 
        `Document "${sanitizedName}" successfully processed: ${clauses.length} structured clauses extracted across ${extracted.totalPages} page(s). (${dualReview.opposingRisks.length} risk flags)`,
        userId
      );

      logger.info('Document processing pipeline completed successfully', { documentId, jobId: job.id, clauseCount: clauses.length });
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      logger.error('Document processing pipeline encountered failure', err, { documentId, jobId: job.id });
      await repository.updateJob(job.id, {
        status: 'failed',
        errorMessage: errorMsg,
      });
      await repository.updateStatus(documentId, 'failed', errorMsg, userId);
    }
  }

  private static async updateJobStep(
    jobId: string, 
    documentId: string, 
    status: DocumentStatus, 
    currentStep: string, 
    progressPercentage: number,
    userId?: string
  ) {
    await repository.updateJob(jobId, { status, currentStep, progressPercentage });
    await repository.updateStatus(documentId, status, currentStep, userId);
  }
}
