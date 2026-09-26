import { getSupabaseClient } from '../../db/client';
import { memoryStore } from '../memoryStore';
import { IDocumentRepository, DocumentRecord } from '../types';
import { DocumentStatus } from '../../types/backendTypes';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';
import { v4 as uuidv4 } from 'uuid';

export class SupabaseDocumentRepository implements IDocumentRepository {
  private static hasLoggedFallbackNotice = false;

  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV !== 'production' || !!process.env.VITEST;
  }

  private async handleFallback<T>(operation: string, err: unknown, memoryFallback: () => Promise<T>): Promise<T> {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (this.isTestEnvironment()) {
      if (!SupabaseDocumentRepository.hasLoggedFallbackNotice) {
        SupabaseDocumentRepository.hasLoggedFallbackNotice = true;
        logger.info(`Supabase not configured; operating with in-memory persistence store.`);
      }
      return memoryFallback();
    }
    logger.error(`Database error in ${operation}`, { error: errorMsg });
    throw new DatabaseError(`Database operation failed during ${operation}: ${errorMsg}`);
  }

  async create(doc: Partial<DocumentRecord> & { userId: string; name: string; type: 'pdf' | 'docx' }): Promise<DocumentRecord> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('create document', 'Supabase client not initialized', () => memoryStore.create(doc));

    try {
      const docId = doc.id || uuidv4();
      const { data, error } = await supabase
        .from('documents')
        .insert({
          id: docId,
          user_id: doc.userId,
          name: doc.name,
          file_type: doc.type,
          file_size_bytes: doc.size ? parseInt(doc.size, 10) || 1024 * 1024 : 1024 * 1024,
          status: doc.status || 'uploaded',
          summary: doc.summary || '',
        })
        .select()
        .single();

      if (error || !data) throw error || new Error('Failed to insert document');
      const createdRecord: DocumentRecord = {
        id: data.id,
        name: data.name,
        type: data.file_type,
        size: doc.size || '1.2 MB',
        uploadedAt: data.created_at,
        status: data.status as DocumentStatus,
        color: data.file_type === 'pdf' ? 'red' : 'blue',
        userId: data.user_id,
        summary: data.summary,
      };
      // Keep memory store synchronized with all created documents
      await memoryStore.create({ ...createdRecord, id: data.id, userId: data.user_id }).catch(() => {});
      return createdRecord;
    } catch (err) {
      return this.handleFallback('create document', err, () => memoryStore.create(doc));
    }
  }

  async findById(id: string, userId?: string): Promise<DocumentRecord | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('find document by id', 'Supabase client not initialized', () => memoryStore.findById(id, userId));

    try {
      let query = supabase.from('documents').select('*').eq('id', id);
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query.single();
      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          type: data.file_type,
          size: `${(data.file_size_bytes / (1024 * 1024)).toFixed(1)} MB`,
          uploadedAt: data.created_at,
          status: data.status as DocumentStatus,
          color: data.file_type === 'pdf' ? 'red' : 'blue',
          userId: data.user_id,
          summary: data.summary,
        };
      }

      // Check in-memory store for template documents or initial seeded documents
      const memDoc = await memoryStore.findById(id, userId);
      if (memDoc) return memDoc;
      return null;
    } catch (err) {
      return this.handleFallback('find document by id', err, () => memoryStore.findById(id, userId));
    }
  }

  async listByUser(userId: string, options?: { page?: number; limit?: number }): Promise<DocumentRecord[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('list documents by user', 'Supabase client not initialized', () => memoryStore.listByUser(userId, options));

    try {
      const page = Math.max(1, Math.floor(Number(options?.page) || 1));
      const rawLimit = Number(options?.limit);
      const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.floor(rawLimit), 100) : 50;
      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('documents')
        .select('id, name, file_type, file_size_bytes, created_at, status, user_id, summary, risk_count, clause_count')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (!error && data && data.length > 0) {
        return data.map((d) => ({
          id: d.id,
          name: d.name,
          type: d.file_type as 'pdf' | 'docx',
          size: `${((d.file_size_bytes || 0) / (1024 * 1024)).toFixed(1)} MB`,
          uploadedAt: d.created_at,
          status: d.status as DocumentStatus,
          color: d.file_type === 'pdf' ? 'red' : 'blue',
          userId: d.user_id,
          summary: d.summary || '',
          riskCount: d.risk_count || 0,
          clauseCount: d.clause_count || 0,
        }));
      }

      // If user has no custom documents yet in Supabase, load initial template documents from memoryStore
      const memDocs = await memoryStore.listByUser(userId, options);
      return memDocs;
    } catch (err) {
      return this.handleFallback('list documents by user', err, () => memoryStore.listByUser(userId, options));
    }
  }

  async updateStatus(id: string, status: DocumentStatus, summary?: string | Partial<DocumentRecord>, userId?: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      await this.handleFallback('update status', 'Supabase client not initialized', async () => {
        await memoryStore.updateStatus(id, status, typeof summary === 'string' ? { summary, userId } : { ...summary, userId });
      });
      return;
    }

    try {
      const updatePayload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
      if (summary !== undefined) {
        if (typeof summary === 'string') {
          updatePayload.summary = summary;
        } else if (summary && typeof summary === 'object') {
          if (summary.summary !== undefined) updatePayload.summary = summary.summary;
          if (summary.name !== undefined) updatePayload.name = summary.name;
          if (summary.clauseCount !== undefined) updatePayload.clause_count = summary.clauseCount;
          if (summary.riskCount !== undefined) updatePayload.risk_count = summary.riskCount;
        }
      }

      let query = supabase.from('documents').update(updatePayload).eq('id', id);
      if (userId) query = query.eq('user_id', userId);

      const { error } = await query;
      if (error) throw error;
      await memoryStore.updateStatus(id, status, typeof summary === 'string' ? { summary, userId } : { ...summary, userId }).catch(() => {});
    } catch (err) {
      await this.handleFallback('update status', err, async () => {
        await memoryStore.updateStatus(id, status, typeof summary === 'string' ? { summary, userId } : { ...summary, userId });
      });
    }
  }

  async delete(id: string, userId?: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      await this.handleFallback('delete document', 'Supabase client not initialized', async () => {
        await memoryStore.delete(id, userId);
      });
      return;
    }

    try {
      let query = supabase.from('documents').delete().eq('id', id);
      if (userId) query = query.eq('user_id', userId);
      const { error } = await query;
      if (error) throw error;
      await memoryStore.delete(id, userId).catch(() => {});
    } catch (err) {
      await this.handleFallback('delete document', err, async () => {
        await memoryStore.delete(id, userId);
      });
    }
  }
}
