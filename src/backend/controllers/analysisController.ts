import { Request, Response, NextFunction } from 'express';
import { repository } from '../repositories';
import { NotFoundError } from '../utils/errors';
import { DocumentExtractionService } from '../services/extraction/documentExtractionService';

export class AnalysisController {
  static async triggerAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id || 'user-ahamed-001';
      const doc = await repository.findById(id, userId);
      if (!doc) {
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
        console.error('Async analysis error:', err);
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

  static async getDocumentAnalysis(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const doc = await repository.findById(id);
      if (!doc) throw new NotFoundError(`Document with ID "${id}" was not found.`);

      const legalModel = await repository.findModelByDocument(id);
      const graph = await repository.findGraphByDocument(id);
      const clauses = await repository.listByDocument(id);
      const risks = await repository.listRisksByDocument(id);
      const job = await repository.findJobByDocument(id);

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
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async getJobStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params;
      const job = await repository.findJobById(jobId);
      if (!job) {
        throw new NotFoundError(`Analysis job "${jobId}" was not found.`);
      }
      res.json({ success: true, data: job });
    } catch (err) {
      next(err);
    }
  }
}
