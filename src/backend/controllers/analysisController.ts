import { Request, Response, NextFunction } from 'express';
import { repository } from '../repositories';
import { NotFoundError } from '../utils/errors';
import { DocumentExtractionService } from '../services/extraction/documentExtractionService';
import { MasterAIOrchestrator } from '../services/ai/orchestrator';
import { AIRunRepository } from '../services/ai/persistence/aiRunRepository';
import { logger } from '../utils/logger';

export class AnalysisController {
  static async triggerAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Analysis trigger denied or document not found', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      // Idempotency check: check if already running or completed
      const existingJob = await repository.findJobByDocument(id);
      if (existingJob && (existingJob.status === 'processing' || existingJob.status === 'analyzing')) {
        res.json({
          success: true,
          data: existingJob,
          message: 'Analysis already in progress for this document.'
        });
        return;
      }

      // Start async pipeline
      DocumentExtractionService.processDocumentAsync(id, userId).catch(err => {
        logger.error('Async analysis error:', { error: String(err) });
      });

      const newJob = await repository.findJobByDocument(id);

      res.status(202).json({
        success: true,
        data: newJob,
        message: 'Analysis job scheduled successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  static async triggerFullAiAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Full AI analysis denied or document not found', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      const { mode = 'FULL_AUDIT', scenarioPrompt, forceRefresh } = req.body || {};

      const result = await MasterAIOrchestrator.runLexflowAiAnalysis({
        userId,
        documentId: id,
        mode,
        scenarioPrompt,
        userName: req.user?.name || (req.user?.email ? req.user.email.split('@')[0] : 'User'),
        forceRefresh,
      });

      res.json({
        success: true,
        data: result,
        message: 'Four-Agent Master AI Analysis completed successfully.'
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDocumentAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Document analysis retrieval denied or document not found', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      const legalModel = await repository.findModelByDocument(id);
      const graph = await repository.findGraphByDocument(id);
      const clauses = await repository.listByDocument(id);
      const risks = await repository.listRisksByDocument(id);
      const job = await repository.findJobByDocument(id);
      const fullAiResult = await AIRunRepository.getAnalysisResult(id, userId);

      res.json({
        success: true,
        data: {
          document: doc,
          jobStatus: job?.status || doc.status,
          currentStep: job?.currentStep || 'Analysis complete',
          progress: job?.progressPercentage || 100,
          legalModel,
          graph,
          clauses,
          risks,
          fullAiResult,
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDebatesForDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Debates retrieval denied or document not found', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      const debates = await AIRunRepository.getDebatesForDocument(id, userId);
      res.json({
        success: true,
        data: debates,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const userId = req.user!.id;
      const job = await repository.findJobById(jobId);
      if (!job) {
        throw new NotFoundError(`Analysis job "${jobId}" was not found.`);
      }

      // Check that the document belongs to the requesting user
      const doc = await repository.findById(job.documentId, userId);
      if (!doc) {
        logger.warn('Job status retrieval denied: document ownership mismatch', { jobId, documentId: job.documentId, userId });
        throw new NotFoundError(`Analysis job "${jobId}" was not found.`);
      }

      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }
}

