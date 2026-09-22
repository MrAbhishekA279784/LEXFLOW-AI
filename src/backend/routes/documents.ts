import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { AnalysisController } from '../controllers/analysisController';
import { ClauseController, GraphController } from '../controllers/clauseAndGraphController';
import { ScenarioController } from '../controllers/scenarioController';
import { AssistantController, RiskController } from '../controllers/assistantAndRiskController';
import { LawyerKitController } from '../controllers/comparisonAndLawyerKitController';
import { ComplianceAuditController } from '../controllers/complianceAuditController';
import { validateBody } from '../middleware/validation';
import { 
  CreateDocumentBodySchema, 
  RunScenarioBodySchema, 
  AssistantMessageBodySchema 
} from '../schemas/apiSchemas';
import { standardRateLimiter, expensiveRateLimiter } from '../middleware/rateLimit';

const router = Router();

// Documents CRUD
router.get('/', standardRateLimiter, DocumentController.list);
router.post('/', expensiveRateLimiter, validateBody(CreateDocumentBodySchema), DocumentController.create);
router.get('/:id', standardRateLimiter, DocumentController.getById);
router.delete('/:id', standardRateLimiter, DocumentController.delete);

// Document Versioning & History
router.get('/:id/versions', standardRateLimiter, DocumentController.listVersions);
router.post('/:id/versions', standardRateLimiter, DocumentController.createVersion);
router.post('/:id/versions/:versionId/revert', standardRateLimiter, DocumentController.revertVersion);

// Analysis
router.post('/:id/analyze', expensiveRateLimiter, AnalysisController.triggerAnalysis);
router.get('/:id/analysis', standardRateLimiter, AnalysisController.getDocumentAnalysis);

// Clauses & Graph
router.get('/:id/clauses', standardRateLimiter, ClauseController.listByDocument);
router.get('/:id/clauses/:clauseId', standardRateLimiter, ClauseController.getById);
router.get('/:id/graph', standardRateLimiter, GraphController.getGraph);

// Scenarios
router.post('/:id/scenarios', expensiveRateLimiter, validateBody(RunScenarioBodySchema), ScenarioController.runScenario);
router.get('/:id/scenarios', standardRateLimiter, ScenarioController.listByDocument);

// Assistant & Risks
router.post('/:id/assistant', expensiveRateLimiter, validateBody(AssistantMessageBodySchema), AssistantController.askAssistant);
router.get('/:id/risks', standardRateLimiter, RiskController.getRisks);

// Lawyer Prep-Kit
router.post('/:id/lawyer-kit', expensiveRateLimiter, LawyerKitController.generateKit);

// Multi-Agent Compliance Audit (PS #5)
router.post('/:id/compliance-audit', expensiveRateLimiter, ComplianceAuditController.startAudit);
router.get('/:id/compliance-audit/:auditId', standardRateLimiter, ComplianceAuditController.getAudit);
router.get('/:id/compliance-audits', standardRateLimiter, ComplianceAuditController.listAudits);

export const documentRoutes = router;
