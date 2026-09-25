import { Router } from 'express';
import { documentRoutes } from './documents';
import { analysisRoutes, scenarioRoutes, comparisonRoutes, legalRoutes, lawyerKitRoutes } from './additionalRoutes';
import { authRoutes } from './auth';
import { authMiddleware } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimit';

const router = Router();

// Public routes (accessible without authentication)
router.use('/auth', authRateLimiter, authRoutes);
router.use('/legal', legalRoutes);

// Protected routes (strictly require verified Bearer authentication)
router.use('/documents', authMiddleware, documentRoutes);
router.use('/analysis', authMiddleware, analysisRoutes);
router.use('/scenarios', authMiddleware, scenarioRoutes);
router.use('/comparison', authMiddleware, comparisonRoutes);
router.use('/comparisons', authMiddleware, comparisonRoutes);
router.use('/lawyer-kit', authMiddleware, lawyerKitRoutes);

export const apiV1Router = router;

