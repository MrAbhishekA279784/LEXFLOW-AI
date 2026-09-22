import { Router } from 'express';
import { AnalysisController } from '../controllers/analysisController';
import { ScenarioController } from '../controllers/scenarioController';
import { ComparisonController, LegalController, LawyerKitController } from '../controllers/comparisonAndLawyerKitController';
import { validateBody } from '../middleware/validation';
import { CompareDocumentsBodySchema, RetrieveLawBodySchema } from '../schemas/apiSchemas';
import { standardRateLimiter, expensiveRateLimiter } from '../middleware/rateLimit';

// Analysis Jobs Routes
export const analysisRoutes = Router();
analysisRoutes.get('/:jobId', standardRateLimiter, AnalysisController.getJobStatus);

// Scenarios Direct Routes
export const scenarioRoutes = Router();
scenarioRoutes.get('/:id', standardRateLimiter, ScenarioController.getById);

// Comparison Routes
export const comparisonRoutes = Router();
comparisonRoutes.post('/', expensiveRateLimiter, validateBody(CompareDocumentsBodySchema), ComparisonController.compareDocuments);

// Legal Knowledge Retrieval Routes
export const legalRoutes = Router();
legalRoutes.post('/retrieve', expensiveRateLimiter, validateBody(RetrieveLawBodySchema), LegalController.retrieveLaw);

// Lawyer Kit Direct Routes
export const lawyerKitRoutes = Router();
lawyerKitRoutes.get('/:id', standardRateLimiter, LawyerKitController.getKitById);
