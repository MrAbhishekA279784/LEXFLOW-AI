import { Request, Response, NextFunction } from 'express';
import { repository } from '../repositories';
import { LawyerKitService } from '../services/lawyerKit/lawyerKitService';
import { LegalKnowledgeEngine } from '../services/legalKnowledge/legalKnowledgeEngine';
import { ComparisonService } from '../services/comparison/comparisonService';
import { NotFoundError } from '../utils/errors';

export class ComparisonController {
  static async compareDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentAId, documentBId } = req.body;
      const userId = req.user?.id || 'user-ahamed-001';

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
      const userId = req.user?.id || 'user-ahamed-001';

      const kit = await LawyerKitService.generateKit(id, userId, scenarioId);
      res.status(201).json({ success: true, data: kit });
    } catch (err) {
      next(err);
    }
  }

  static async getKitById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const kit = await repository.findKitById(id, userId);
      if (!kit) {
        throw new NotFoundError(`Lawyer Prep-Kit "${id}" was not found.`);
      }
      res.json({ success: true, data: kit });
    } catch (err) {
      next(err);
    }
  }
}
