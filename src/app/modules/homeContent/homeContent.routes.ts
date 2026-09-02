// ===================================================================
// Visalink Air - Home Content Routes
// ===================================================================

import express from 'express';
import { HomeContentController } from './homeContent.controller';
import { HomeContentValidation } from './homeContent.validation';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// Public — homepage reads content
router.get('/', HomeContentController.getAllSections);
router.get('/:section', HomeContentController.getSection);

// Admin only — update section content
router.put(
    '/:section',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(HomeContentValidation.updateSectionSchema),
    HomeContentController.updateSection
);

// Admin only — seed default data
router.post(
    '/seed',
    authMiddleware,
    authorizeRoles('super_admin'),
    HomeContentController.seedDefaults
);

export const HomeContentRoutes = router;
