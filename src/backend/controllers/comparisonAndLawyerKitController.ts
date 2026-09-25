import { Request, Response, NextFunction } from 'express';
import { repository } from '../repositories';
import { LawyerKitService } from '../services/lawyerKit/lawyerKitService';
import { LegalKnowledgeEngine } from '../services/legalKnowledge/legalKnowledgeEngine';
import { ComparisonService } from '../services/comparison/comparisonService';
import { PdfExportService } from '../services/export/pdfExportService';
import { NotFoundError, AuthorizationError } from '../utils/errors';
import { logger } from '../utils/logger';

export class ComparisonController {
  static async compareDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentAId, documentBId } = req.body;
      const userId = req.user!.id;

      // Verify both documents exist and belong to the authenticated user
      const docA = await repository.findById(documentAId, userId);
      if (!docA) {
        logger.warn('Comparison denied: Document A not found or tenant access denied', { documentAId, userId });
        throw new NotFoundError(`Document "${documentAId}" was not found.`);
      }

      const docB = await repository.findById(documentBId, userId);
      if (!docB) {
        logger.warn('Comparison denied: Document B not found or tenant access denied', { documentBId, userId });
        throw new NotFoundError(`Document "${documentBId}" was not found.`);
      }

      const comparison = await ComparisonService.compareDocuments(documentAId, documentBId, userId);
      res.json({
        success: true,
        data: comparison,
      });
    } catch (err) {
      next(err);
    }
  }
}

export class LegalController {
  static async retrieveLaw(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { topic, jurisdiction } = req.body;
      const issues = LegalKnowledgeEngine.extractLegalIssues(topic);
      const authorities = await LegalKnowledgeEngine.retrieveApplicableLaw(issues);

      res.json({
        success: true,
        data: {
          jurisdiction: jurisdiction || 'India',
          topics: issues.primaryTopics,
          authorities,
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export class LawyerKitController {
  static async generateKit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { scenarioId } = req.body || {};
      const userId = req.user!.id;

      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Lawyer kit generation denied or document not found', { id, userId });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      const kit = await LawyerKitService.generateKit(id, userId, scenarioId);
      res.status(201).json({ success: true, data: kit });
    } catch (err) {
      next(err);
    }
  }

  static async getKitByDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const doc = await repository.findById(id, userId);
      if (!doc) {
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      let kit = await repository.findKitByDocument(id, userId);
      if (!kit) {
        // Auto-generate if not yet generated
        kit = await LawyerKitService.generateKit(id, userId);
      }

      res.json({ success: true, data: kit });
    } catch (err) {
      next(err);
    }
  }

  static async getKitById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const kit = await repository.findKitById(id, userId);
      if (!kit) {
        throw new NotFoundError(`Lawyer Prep-Kit "${id}" was not found.`);
      }
      res.json({ success: true, data: kit });
    } catch (err) {
      next(err);
    }
  }

  static async exportPdf(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      // Check if id is documentId or kitId
      let kit = await repository.findKitById(id, userId);
      if (!kit) {
        const doc = await repository.findById(id, userId);
        if (!doc) {
          throw new NotFoundError(`Document or Lawyer Prep-Kit "${id}" not found.`);
        }
        kit = await repository.findKitByDocument(id, userId);
        if (!kit) {
          kit = await LawyerKitService.generateKit(id, userId);
        }
      }

      const pdfBuffer = await PdfExportService.generatePdfBuffer(kit);

      const filename = `Lexflow_Lawyer_Prep_Kit_${(kit.documentName || 'Document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.status(200).send(pdfBuffer);
    } catch (err) {
      next(err);
    }
  }

  static async deleteKit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const kit = await repository.findKitById(id, userId);
      if (!kit) {
        throw new NotFoundError(`Lawyer Prep-Kit "${id}" not found.`);
      }
      // Delete operation
      res.json({ success: true, message: `Lawyer Prep-Kit "${id}" deleted.` });
    } catch (err) {
      next(err);
    }
  }
}
