import { Router } from 'express';
import multer from 'multer';
import { DocumentController } from '../controllers/documentController';
import { AnalysisController } from '../controllers/analysisController';
import { ClauseController, GraphController } from '../controllers/clauseAndGraphController';
import { ScenarioController } from '../controllers/scenarioController';
import { AssistantController, RiskController } from '../controllers/assistantAndRiskController';
import { LawyerKitController } from '../controllers/comparisonAndLawyerKitController';
import { ComplianceAuditController } from '../controllers/complianceAuditController';
import { validateBody } from '../middleware/validation';
import { 
  RunScenarioBodySchema, 
  AssistantMessageBodySchema 
} from '../schemas/apiSchemas';
import { standardRateLimiter, expensiveRateLimiter } from '../middleware/rateLimit';
import { CONSTANTS } from '../config/constants';

const upload = multer({
  limits: { fileSize: CONSTANTS.MAX_FILE_SIZE_BYTES },
  storage: multer.memoryStorage()
});

const router = Router();

// Documents CRUD
router.get('/', standardRateLimiter, DocumentController.list);
router.post('/', expensiveRateLimiter, (upload.single('file') as unknown as import('express').RequestHandler), DocumentController.create);
router.get('/:id', standardRateLimiter, DocumentController.getById);
router.delete('/:id', standardRateLimiter, DocumentController.delete);

// Document Versioning & History
router.get('/:id/versions', standardRateLimiter, DocumentController.listVersions);
router.post('/:id/versions', standardRateLimiter, DocumentController.createVersion);
router.post('/:id/versions/:versionId/revert', standardRateLimiter, DocumentController.revertVersion);

// Analysis
router.post('/:id/analyze', expensiveRateLimiter, AnalysisController.triggerAnalysis);
router.post('/:id/full-ai-analysis', expensiveRateLimiter, AnalysisController.triggerFullAiAnalysis);
router.get('/:id/analysis', standardRateLimiter, AnalysisController.getDocumentAnalysis);
router.get('/:id/debates', standardRateLimiter, AnalysisController.getDebatesForDocument);

// Clauses & Graph
router.get('/:id/clauses', standardRateLimiter, ClauseController.listByDocument);
router.get('/:id/clauses/:clauseId', standardRateLimiter, ClauseController.getById);
router.get('/:id/graph', standardRateLimiter, GraphController.getGraph);
router.post('/:id/graph/regenerate', expensiveRateLimiter, GraphController.regenerateGraph);

// Scenarios
router.post('/:id/scenarios', expensiveRateLimiter, validateBody(RunScenarioBodySchema), ScenarioController.runScenario);
router.get('/:id/scenarios', standardRateLimiter, ScenarioController.listByDocument);

// Assistant & Risks
router.post('/:id/assistant', expensiveRateLimiter, validateBody(AssistantMessageBodySchema), AssistantController.askAssistant);
router.get('/:id/risks', standardRateLimiter, RiskController.getRisks);

// Lawyer Prep-Kit
router.post('/:id/lawyer-kit', expensiveRateLimiter, LawyerKitController.generateKit);
router.get('/:id/lawyer-kit', standardRateLimiter, LawyerKitController.getKitByDocument);
router.get('/:id/lawyer-kit/export', standardRateLimiter, LawyerKitController.exportPdf);

// Multi-Agent Compliance Audit (PS #5)
router.post('/:id/compliance-audit', expensiveRateLimiter, ComplianceAuditController.startAudit);
router.get('/:id/compliance-audit/:auditId', standardRateLimiter, ComplianceAuditController.getAudit);
router.get('/:id/compliance-audits', standardRateLimiter, ComplianceAuditController.listAudits);

export const documentRoutes = router;
