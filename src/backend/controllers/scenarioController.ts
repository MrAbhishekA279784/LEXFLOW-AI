import { Request, Response, NextFunction } from 'express';
import { ScenarioOrchestrator } from '../services/scenarios/scenarioOrchestrator';
import { repository } from '../repositories';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

export class ScenarioController {
  static async runScenario(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { prompt, actorRole } = req.body;
      const userId = req.user!.id;

      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Scenario execution denied or document not found', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      const result = await ScenarioOrchestrator.runScenario(id, prompt, userId, actorRole);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  static async listByDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;

      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Scenario list denied or document not found', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      const scenarios = await repository.listScenariosByDocument(id, userId);
      res.json({ success: true, data: scenarios });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const scenario = await repository.findScenarioById(id, userId);
      if (!scenario) {
        throw new NotFoundError(`Scenario "${id}" was not found.`);
      }
      res.json({ success: true, data: scenario });
    } catch (err) {
      next(err);
    }
  }
}

