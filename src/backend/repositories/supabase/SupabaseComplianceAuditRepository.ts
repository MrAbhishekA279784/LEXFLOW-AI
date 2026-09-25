import { getSupabaseClient } from '../../db/client';
import { memoryStore } from '../memoryStore';
import { IComplianceAuditRepository } from '../types';
import { ComplianceAuditRecord } from '../../services/complianceAudit/types';
import { logger } from '../../utils/logger';
import { DatabaseError } from '../../utils/errors';

export class SupabaseComplianceAuditRepository implements IComplianceAuditRepository {
  private static hasLoggedFallbackNotice = false;

  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV !== 'production' || !!process.env.VITEST;
  }

  private async handleFallback<T>(operation: string, err: unknown, memoryFallback: () => Promise<T>): Promise<T> {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (this.isTestEnvironment()) {
      if (!SupabaseComplianceAuditRepository.hasLoggedFallbackNotice) {
        SupabaseComplianceAuditRepository.hasLoggedFallbackNotice = true;
        logger.info(`Supabase not configured; operating with in-memory persistence store.`);
      }
      return memoryFallback();
    }
    logger.error(`Database error in ${operation}`, { error: errorMsg });
    throw new DatabaseError(`Database operation failed during ${operation}: ${errorMsg}`);
  }

  async saveComplianceAudit(audit: ComplianceAuditRecord, userId?: string): Promise<ComplianceAuditRecord> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('save compliance audit', 'Supabase client not initialized', () => memoryStore.saveComplianceAudit({ ...audit, userId: userId || audit.userId }));

    try {
      const row = {
        id: audit.id,
        document_id: audit.documentId,
        document_name: audit.documentName || '',
        user_id: userId || audit.userId || 'usr-default',
        status: audit.status,
        current_step: audit.currentStep || '',
        progress_percentage: audit.progressPercentage || 0,
        summary_metrics: audit.summaryMetrics || audit.summary || {},
        findings: audit.findings || [],
        debate_log: audit.debateLog || [],
        applicable_authorities: audit.applicableAuthorities || [],
        overall_executive_summary: audit.overallExecutiveSummary || '',
        created_at: audit.startedAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from('compliance_audits').upsert(row).select().single();
      if (error || !data) throw error || new Error('Failed to save compliance audit');

      return audit;
    } catch (err) {
      return this.handleFallback('save compliance audit', err, () => memoryStore.saveComplianceAudit({ ...audit, userId: userId || audit.userId }));
    }
  }

  async updateComplianceAudit(id: string, updates: Partial<ComplianceAuditRecord>): Promise<ComplianceAuditRecord> {
    const supabase = getSupabaseClient();
    if (!supabase) return memoryStore.updateComplianceAudit(id, updates);

    try {
      const { data, error } = await supabase.from('compliance_audits').update(updates).eq('id', id).select().single();
      if (error || !data) throw error || new Error('Failed to update compliance audit');
      return data as unknown as ComplianceAuditRecord;
    } catch (err) {
      return memoryStore.updateComplianceAudit(id, updates);
    }
  }

  async getComplianceAuditById(id: string, userId?: string): Promise<ComplianceAuditRecord | null> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('get compliance audit by id', 'Supabase client not initialized', () => memoryStore.getComplianceAuditById(id, userId));

    try {
      let query = supabase.from('compliance_audits').select('*').eq('id', id);
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query.single();
      if (error || !data) return null;

      return {
        id: data.id,
        documentId: data.document_id,
        documentName: data.document_name || '',
        userId: data.user_id,
        status: data.status,
        currentStep: data.current_step || '',
        progressPercentage: data.progress_percentage || 0,
        startedAt: data.created_at,
        completedAt: data.updated_at,
        summaryMetrics: data.summary_metrics || { totalFindings: 0, highPriorityCount: 0, mediumPriorityCount: 0, protectionCount: 0, disputedCount: 0, humanReviewCount: 0 },
        findings: data.findings || [],
        debateLog: data.debate_log || [],
        applicableAuthorities: data.applicable_authorities || [],
        overallExecutiveSummary: data.overall_executive_summary || '',
      };
    } catch (err) {
      return this.handleFallback('get compliance audit by id', err, () => memoryStore.getComplianceAuditById(id, userId));
    }
  }

  async getComplianceAuditsByDocument(documentId: string, userId?: string): Promise<ComplianceAuditRecord[]> {
    const supabase = getSupabaseClient();
    if (!supabase) return this.handleFallback('get compliance audits by document', 'Supabase client not initialized', () => memoryStore.getComplianceAuditsByDocument(documentId, userId));

    try {
      let query = supabase.from('compliance_audits').select('*').eq('document_id', documentId).order('created_at', { ascending: false });
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error || !data) return [];

      return data.map((d) => ({
        id: d.id,
        documentId: d.document_id,
        documentName: d.document_name || '',
        userId: d.user_id,
        status: d.status,
        currentStep: d.current_step || '',
        progressPercentage: d.progress_percentage || 0,
        startedAt: d.created_at,
        completedAt: d.updated_at,
        summaryMetrics: d.summary_metrics || { totalFindings: 0, highPriorityCount: 0, mediumPriorityCount: 0, protectionCount: 0, disputedCount: 0, humanReviewCount: 0 },
        findings: d.findings || [],
        debateLog: d.debate_log || [],
        applicableAuthorities: d.applicable_authorities || [],
        overallExecutiveSummary: d.overall_executive_summary || '',
      }));
    } catch (err) {
      return this.handleFallback('get compliance audits by document', err, () => memoryStore.getComplianceAuditsByDocument(documentId, userId));
    }
  }
}
