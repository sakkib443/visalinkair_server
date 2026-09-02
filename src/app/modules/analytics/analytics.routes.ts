// ===================================================================
// Visalink Air - Analytics Routes
// ===================================================================

import express from 'express';
import { AnalyticsController } from './analytics.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';

const router = express.Router();

// Admin / super_admin — dashboard analytics
router.get('/dashboard', authMiddleware, authorizeRoles('super_admin'), AnalyticsController.getDashboard);

export const AnalyticsRoutes = router;
