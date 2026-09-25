import { Request, Response, NextFunction } from 'express';
import { ComplianceAuditService } from '../services/complianceAudit/complianceAuditService';
import { repository } from '../repositories';
import { logger } from '../utils/logger';

export class ComplianceAuditController {
  /**
   * Starts a new compliance audit job for a document
   * POST /api/v1/documents/:id/compliance-audit
   */
  static async startAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: documentId } = req.params;
      const userId = req.user!.id;

      if (!documentId) {
        res.status(400).json({ error: 'Document ID is required' });
        return;
      }

      // Check document existence & ownership
      const doc = await repository.findById(documentId, userId);
      if (!doc) {
        logger.warn('Compliance audit start denied: Document not found or tenant access denied', { documentId, userId });
        res.status(404).json({ error: 'Document not found or access denied' });
        return;
      }

      const auditRecord = await ComplianceAuditService.startAudit(documentId, userId);

      res.status(202).json({
        message: 'Compliance audit initiated successfully',
        audit: auditRecord
      });
    } catch (err: any) {
      logger.error('Failed to start compliance audit:', err);
      next(err);
    }
  }

  /**
   * Retrieves a specific compliance audit by ID
   * GET /api/v1/documents/:id/compliance-audit/:auditId
   */
  static async getAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: documentId, auditId } = req.params;
      const userId = req.user!.id;

      if (!documentId || !auditId) {
        res.status(400).json({ error: 'Document ID and Audit ID are required' });
        return;
      }

      const doc = await repository.findById(documentId, userId);
      if (!doc) {
        logger.warn('Compliance audit get denied: Document not found or tenant access denied', { documentId, auditId, userId });
        res.status(404).json({ error: 'Compliance audit not found' });
        return;
      }

      const audit = await ComplianceAuditService.getAuditById(auditId, userId);
      if (!audit) {
        res.status(404).json({ error: 'Compliance audit not found' });
        return;
      }

      if (audit.documentId !== documentId) {
        res.status(400).json({ error: 'Audit ID does not match specified document' });
        return;
      }

      res.json({ audit });
    } catch (err: any) {
      logger.error('Failed to fetch compliance audit:', err);
      next(err);
    }
  }

  /**
   * Lists all compliance audits for a document
   * GET /api/v1/documents/:id/compliance-audits
   */
  static async listAudits(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id: documentId } = req.params;
      const userId = req.user!.id;

      if (!documentId) {
        res.status(400).json({ error: 'Document ID is required' });
        return;
      }

      const doc = await repository.findById(documentId, userId);
      if (!doc) {
        logger.warn('Compliance audits list denied: Document not found or tenant access denied', { documentId, userId });
        res.status(404).json({ error: 'Document not found or access denied' });
        return;
      }

      const audits = await ComplianceAuditService.listAuditsByDocument(documentId, userId);
      res.json({ audits });
    } catch (err: any) {
      logger.error('Failed to list compliance audits:', err);
      next(err);
    }
  }
}

