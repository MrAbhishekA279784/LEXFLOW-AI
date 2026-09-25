import { Request, Response, NextFunction } from 'express';
import { repository } from '../repositories';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { GraphEngine } from '../services/graph/graphEngine';
import { LegalModelService } from '../services/legalModel/legalModelService';

export class ClauseController {
  static async listByDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Clause list denied or document not found', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      const clauses = await repository.listByDocument(id);
      res.json({ success: true, data: clauses });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, clauseId } = req.params;
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Clause get denied or document not found', { id, clauseId, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

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
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Graph get denied or document not found', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      let graph = await repository.findGraphByDocument(id);
      if (!graph) {
        // Deterministically construct graph from existing document clauses and legal model
        const clauses = await repository.listByDocument(id);
        let model = await repository.findModelByDocument(id);
        if (!model && clauses.length > 0) {
          model = await LegalModelService.buildLegalModel(id, clauses.map(c => c.fullText).join('\n\n'), clauses);
          await repository.saveModel(id, model);
        }

        if (model) {
          const authorities = await repository.listAuthoritative();
          graph = GraphEngine.buildGraph(id, model, clauses, authorities);
          await repository.saveGraph(id, graph);
        } else {
          throw new NotFoundError(`Legal graph for document "${id}" was not found.`);
        }
      }

      res.json({
        success: true,
        data: {
          documentId: id,
          nodes: graph.nodes,
          edges: graph.edges,
          metadata: graph.metadata || {
            generatedAt: new Date().toISOString(),
            nodeCount: graph.nodes.length,
            edgeCount: graph.edges.length,
            isValid: true
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static async regenerateGraph(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const doc = await repository.findById(id, userId);
      if (!doc) {
        logger.warn('Graph regeneration denied or document not found', { id, userId, path: req.path });
        throw new NotFoundError(`Document with ID "${id}" was not found.`);
      }

      const clauses = await repository.listByDocument(id);
      let model = await repository.findModelByDocument(id);
      if (!model && clauses.length > 0) {
        model = await LegalModelService.buildLegalModel(id, clauses.map(c => c.fullText).join('\n\n'), clauses);
        await repository.saveModel(id, model);
      }

      if (!model) {
        throw new NotFoundError(`Cannot generate graph: No legal model or clauses available for document "${id}".`);
      }

      const authorities = await repository.listAuthoritative();
      const freshGraph = GraphEngine.buildGraph(id, model, clauses, authorities);
      await repository.saveGraph(id, freshGraph);

      logger.info('Legal graph regenerated successfully', { documentId: id, nodeCount: freshGraph.nodes.length });
      res.json({
        success: true,
        data: {
          documentId: id,
          nodes: freshGraph.nodes,
          edges: freshGraph.edges,
          metadata: freshGraph.metadata
        }
      });
    } catch (err) {
      next(err);
    }
  }
}
