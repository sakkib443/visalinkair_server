// ===================================================================
// Visalink Air - Legal Policy Routes
// ===================================================================

import express from 'express';
import { LegalPolicyController } from './legalPolicy.controller';
import { LegalPolicyValidation } from './legalPolicy.validation';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// Public — policy pages read content
router.get('/', LegalPolicyController.getAllPolicies);
router.get('/:type', LegalPolicyController.getPolicy);

// Admin only — update a policy
router.put(
    '/:type',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(LegalPolicyValidation.updatePolicySchema),
    LegalPolicyController.updatePolicy
);

// Admin only — seed default data
router.post(
    '/seed',
    authMiddleware,
    authorizeRoles('super_admin'),
    LegalPolicyController.seedDefaults
);

export const LegalPolicyRoutes = router;
