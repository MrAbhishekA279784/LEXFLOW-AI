import { getSupabaseClient } from '../../db/client';
import { memoryStore } from '../memoryStore';
import { ILawyerKitRepository } from '../types';
import { LawyerKitData } from '../../types/backendTypes';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';

export class SupabaseLawyerKitRepository implements ILawyerKitRepository {
  private static hasLoggedFallbackNotice = false;

  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV !== 'production' || !!process.env.VITEST;
  }

  private async handleFallback<T>(operation: string, err: unknown, memoryFallback: () => Promise<T>): Promise<T> {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (this.isTestEnvironment()) {
      if (!SupabaseLawyerKitRepository.hasLoggedFallbackNotice) {
        SupabaseLawyerKitRepository.hasLoggedFallbackNotice = true;
        logger.info(`Supabase not configured; operating with in-memory persistence store.`);
      }
      return memoryFallback();
    }
    logger.error(`Database error in ${operation}`, { error: errorMsg });
    throw new DatabaseError(`Database operation failed during ${operation}: ${errorMsg}`);
  }

  async saveLawyerKit(kit: LawyerKitData, userId?: string): Promise<LawyerKitData> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('save lawyer kit', 'Supabase client not initialized', () => memoryStore.saveLawyerKit(kit, userId));

    try {
      const row = {
        id: kit.id,
        document_id: kit.documentId,
        user_id: userId || kit.userId || 'usr-default',
        kit_data: kit as unknown as Record<string, unknown>,
        pdf_storage_path: kit.pdfStoragePath || null,
        created_at: kit.generatedAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('lawyer_kits').upsert(row).select().single();
      if (error || !data) throw error || new Error('Failed to save lawyer kit');

      await memoryStore.saveLawyerKit(kit, userId).catch(() => {});
      return kit;
    } catch (err) {
      return this.handleFallback('save lawyer kit', err, () => memoryStore.saveLawyerKit(kit, userId));
    }
  }

  async getLawyerKitByDocument(documentId: string, userId?: string): Promise<LawyerKitData | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('get lawyer kit by document', 'Supabase client not initialized', () => memoryStore.getLawyerKitByDocument(documentId, userId));

    try {
      let query = supabase.from('lawyer_kits').select('*').eq('document_id', documentId).order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query.limit(1).single();
      if (error || !data) {
        return memoryStore.getLawyerKitByDocument(documentId, userId);
      }

      return (data.kit_data as unknown as LawyerKitData) || null;
    } catch (err) {
      return this.handleFallback('get lawyer kit by document', err, () => memoryStore.getLawyerKitByDocument(documentId, userId));
    }
  }
}
