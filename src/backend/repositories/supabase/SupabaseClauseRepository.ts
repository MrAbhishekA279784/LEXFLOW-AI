import { getSupabaseClient } from '../../db/client';
import { memoryStore } from '../memoryStore';
import { IClauseRepository } from '../types';
import { ClauseItem } from '../../../types';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';

export class SupabaseClauseRepository implements IClauseRepository {
  private static hasLoggedFallbackNotice = false;

  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV !== 'production' || !!process.env.VITEST;
  }

  private async handleFallback<T>(operation: string, err: unknown, memoryFallback: () => Promise<T>): Promise<T> {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (this.isTestEnvironment()) {
      if (!SupabaseClauseRepository.hasLoggedFallbackNotice) {
        SupabaseClauseRepository.hasLoggedFallbackNotice = true;
        logger.info(`Supabase not configured; operating with in-memory persistence store.`);
      }
      return memoryFallback();
    }
    logger.error(`Database error in ${operation}`, { error: errorMsg });
    throw new DatabaseError(`Database operation failed during ${operation}: ${errorMsg}`);
  }

  async saveClauses(documentId: string, clauses: ClauseItem[], userId?: string): Promise<ClauseItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('save clauses', 'Supabase client not initialized', () => memoryStore.saveClauses(documentId, clauses, userId));

    try {
      const rows = clauses.map((c) => ({
        id: c.id,
        document_id: documentId,
        section_number: c.section,
        title: c.title,
        full_text: c.fullText,
        summary: c.summary,
        risk_level: c.riskLevel,
        party: c.party,
        page_number: c.pageNumber,
      }));

      const { data, error } = await supabase.from('clauses').upsert(rows).select();
      if (error || !data) throw error || new Error('Failed to upsert clauses');

      return data.map((r) => ({
        id: r.id,
        section: r.section_number,
        title: r.title,
        summary: r.summary || '',
        fullText: r.full_text,
        riskLevel: r.risk_level as 'low' | 'medium' | 'high',
        party: r.party as 'tenant' | 'landlord' | 'mutual',
        pageNumber: r.page_number,
      }));
    } catch (err) {
      return this.handleFallback('save clauses', err, () => memoryStore.saveClauses(documentId, clauses, userId));
    }
  }

  async getClausesByDocument(documentId: string, userId?: string): Promise<ClauseItem[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('get clauses by document', 'Supabase client not initialized', () => memoryStore.getClausesByDocument(documentId, userId));

    try {
      const { data, error } = await supabase
        .from('clauses')
        .select('*')
        .eq('document_id', documentId)
        .order('page_number', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((r) => ({
          id: r.id,
          section: r.section_number,
          title: r.title,
          summary: r.summary || '',
          fullText: r.full_text,
          riskLevel: r.risk_level as 'low' | 'medium' | 'high',
          party: r.party as 'tenant' | 'landlord' | 'mutual',
          pageNumber: r.page_number,
        }));
      }

      const memClauses = await memoryStore.getClausesByDocument(documentId, userId);
      return memClauses;
    } catch (err) {
      return this.handleFallback('get clauses by document', err, () => memoryStore.getClausesByDocument(documentId, userId));
    }
  }
}
