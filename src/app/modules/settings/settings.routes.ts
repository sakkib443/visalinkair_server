// ===================================================================
// Visalink Air - Settings Routes
// ===================================================================

import express from 'express';
import { SettingsController } from './settings.controller';
import { SettingsValidation } from './settings.validation';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// Public — site reads contact info
router.get('/', SettingsController.getSettings);

// Admin only — update contact / social info
router.patch(
    '/',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(SettingsValidation.updateSettingsSchema),
    SettingsController.updateSettings
);

export const SettingsRoutes = router;
