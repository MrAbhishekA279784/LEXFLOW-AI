import { Request, Response, NextFunction } from 'express';
import { repository } from '../repositories';
import { NotFoundError } from '../utils/errors';

export class ClauseController {
  static async listByDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const clauses = await repository.listByDocument(id);
      res.json({ success: true, data: clauses });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, clauseId } = req.params;
      const clause = await repository.findClauseById(id, clauseId);
      if (!clause) {
        throw new NotFoundError(`Clause "${clauseId}" for document "${id}" was not found.`);
      }
      res.json({ success: true, data: clause });
    } catch (err) {
      next(err);
    }
  }
}

export class GraphController {
  static async getGraph(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const graph = await repository.findGraphByDocument(id);
      if (!graph) {
        // Return default graph or 404
        const fallback = await repository.findGraphByDocument('doc-rental');
        res.json({ success: true, data: fallback });
        return;
      }
      res.json({ success: true, data: graph });
    } catch (err) {
      next(err);
    }
  }
}
