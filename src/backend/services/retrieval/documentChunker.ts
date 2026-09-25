/**
 * LEXFLOW Document Chunker
 * Deterministically splits real extracted text/clauses into bounded DocumentChunks with structural provenance.
 */

import { ClauseItem } from '../../../types';
import { DocumentChunk } from '../../repositories/types';
import { v4 as uuidv4 } from 'uuid';

export class DocumentChunker {
  private static readonly MAX_CHUNK_WORDS = 250;

  /**
   * Deterministically produces bounded DocumentChunks from document clauses and/or raw text.
   * Retains full structural provenance (documentId, clauseId, section, title, pageNumber, chunkIndex).
   */
  static chunkDocument(
    documentId: string, 
    clauses: ClauseItem[] = [], 
    rawText?: string
  ): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    let chunkIndex = 0;

    if (clauses && clauses.length > 0) {
      for (const clause of clauses) {
        const textToChunk = (clause.fullText && clause.fullText.trim().length > 0)
          ? clause.fullText
          : (clause.summary || `${clause.section} ${clause.title}`);

        const subChunks = this.splitTextIntoWords(textToChunk, this.MAX_CHUNK_WORDS);

        subChunks.forEach((subText) => {
          chunks.push({
            id: `chk-${documentId}-${chunkIndex}`,
            documentId,
            clauseId: clause.id,
            section: clause.section,
            title: clause.title,
            pageNumber: clause.pageNumber || 1,
            chunkIndex,
            chunkText: subText.trim(),
            createdAt: new Date().toISOString(),
          });
          chunkIndex++;
        });
      }
    } else if (rawText && rawText.trim().length > 0) {
      // Fallback structural chunking by paragraphs/double newlines if no clauses provided
      const paragraphs = rawText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
      let currentPage = 1;

      paragraphs.forEach((paragraph) => {
        // Detect page markers if present
        const pageMatch = paragraph.match(/--- PAGE (\d+) ---/i);
        if (pageMatch) {
          currentPage = parseInt(pageMatch[1], 10) || currentPage;
        }

        const subChunks = this.splitTextIntoWords(paragraph, this.MAX_CHUNK_WORDS);
        subChunks.forEach((subText) => {
          chunks.push({
            id: `chk-${documentId}-${chunkIndex}`,
            documentId,
            pageNumber: currentPage,
            chunkIndex,
            chunkText: subText.trim(),
            createdAt: new Date().toISOString(),
          });
          chunkIndex++;
        });
      });
    }

    return chunks;
  }

  private static splitTextIntoWords(text: string, maxWords: number): string[] {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) {
      return [text];
    }

    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += maxWords) {
      chunks.push(words.slice(i, i + maxWords).join(' '));
    }
    return chunks;
  }
}
