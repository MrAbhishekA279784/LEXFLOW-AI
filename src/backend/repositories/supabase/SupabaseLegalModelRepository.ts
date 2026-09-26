import { getSupabaseClient } from '../../db/client';
import { memoryStore } from '../memoryStore';
import { ILegalModelRepository } from '../types';
import { LegalModelData } from '../../types/backendTypes';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';

export class SupabaseLegalModelRepository implements ILegalModelRepository {
  private static hasLoggedFallbackNotice = false;

  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV !== 'production' || !!process.env.VITEST;
  }

  private async handleFallback<T>(operation: string, err: unknown, memoryFallback: () => Promise<T>): Promise<T> {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (this.isTestEnvironment()) {
      if (!SupabaseLegalModelRepository.hasLoggedFallbackNotice) {
        SupabaseLegalModelRepository.hasLoggedFallbackNotice = true;
        logger.info(`Supabase not configured; operating with in-memory persistence store.`);
      }
      return memoryFallback();
    }
    logger.error(`Database error in ${operation}`, { error: errorMsg });
    throw new DatabaseError(`Database operation failed during ${operation}: ${errorMsg}`);
  }

  async saveLegalModel(documentId: string, modelData: LegalModelData, userId?: string): Promise<LegalModelData> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('save legal model', 'Supabase client not initialized', () => memoryStore.saveLegalModel(documentId, modelData, userId));

    try {
      const { data, error } = await supabase
        .from('legal_models')
        .upsert({
          document_id: documentId,
          model_data: modelData as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error || !data) throw error || new Error('Failed to save legal model');
      return (data.model_data as unknown as LegalModelData) || modelData;
    } catch (err) {
      return this.handleFallback('save legal model', err, () => memoryStore.saveLegalModel(documentId, modelData, userId));
    }
  }

  async getLegalModel(documentId: string, userId?: string): Promise<LegalModelData | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('get legal model', 'Supabase client not initialized', () => memoryStore.getLegalModel(documentId, userId));

    try {
      const { data, error } = await supabase
        .from('legal_models')
        .select('*')
        .eq('document_id', documentId)
        .single();

      if (!error && data && data.model_data) {
        return (data.model_data as unknown as LegalModelData);
      }

      const memModel = await memoryStore.getLegalModel(documentId, userId);
      return memModel;
    } catch (err) {
      return this.handleFallback('get legal model', err, () => memoryStore.getLegalModel(documentId, userId));
    }
  }
}
