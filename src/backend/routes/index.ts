import { Router } from 'express';
import { documentRoutes } from './documents';
import { analysisRoutes, scenarioRoutes, comparisonRoutes, legalRoutes, lawyerKitRoutes } from './additionalRoutes';

const router = Router();

router.use('/documents', documentRoutes);
router.use('/analysis', analysisRoutes);
router.use('/scenarios', scenarioRoutes);
router.use('/comparison', comparisonRoutes);
router.use('/legal', legalRoutes);
router.use('/lawyer-kit', lawyerKitRoutes);

export const apiV1Router = router;
