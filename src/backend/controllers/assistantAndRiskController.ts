import { Request, Response, NextFunction } from 'express';
import { repository } from '../repositories';
import { AssistantService } from '../services/assistant/assistantService';

export class AssistantController {
  static async askAssistant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
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
      let risks = await repository.listRisksByDocument(id);
      if (!risks || risks.length === 0) {
        risks = await repository.listRisksByDocument('doc-rental');
      }
      res.json({ success: true, data: risks });
    } catch (err) {
      next(err);
    }
  }
}
