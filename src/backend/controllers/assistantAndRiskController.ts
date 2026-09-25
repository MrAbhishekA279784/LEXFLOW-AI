import { Request, Response, NextFunction } from 'express';
import { repository } from '../repositories';
import { AssistantService } from '../services/assistant/assistantService';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class AssistantController {
  static async askAssistant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Assistant query denied or document not found', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      const { text, history, preferences } = req.body;
      const result = await AssistantService.askAssistant(id, text, history, preferences);

      res.json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export class RiskController {
  static async getRisks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Risk retrieval denied or document not found', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      const risks = await repository.listRisksByDocument(id);
      res.json({ success: true, data: risks || [] });
    } catch (err) {
      next(err);
    }
  }
}

