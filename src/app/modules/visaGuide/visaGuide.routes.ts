// ===================================================================
// Visalink Air - Visa Guide Routes
// ভিসা গাইড মডিউলের API রাউটস
// ===================================================================

import express from 'express';
import { VisaGuideController } from './visaGuide.controller';
import { VisaGuideValidation } from './visaGuide.validation';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// ==================== Public Routes ====================
// These MUST be declared before `/:id`, otherwise Express matches
// "public" as an :id and every public request 404s on a cast error.

// Country list for the client-side search dropdown
router.get('/public/countries', VisaGuideController.getPublicCountries);

// Public details page — active guides only
router.get('/public/:category/:countrySlug', VisaGuideController.getPublicVisaGuide);

// ==================== Admin Routes ====================

router.get(
    '/',
    authMiddleware,
    authorizeRoles('super_admin'),
    VisaGuideController.getAllVisaGuides
);

router.get(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    VisaGuideController.getVisaGuideById
);

router.post(
    '/',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(VisaGuideValidation.createVisaGuideSchema),
    VisaGuideController.createVisaGuide
);

router.patch(
    '/:id/toggle',
    authMiddleware,
    authorizeRoles('super_admin'),
    VisaGuideController.toggleVisaGuideStatus
);

router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(VisaGuideValidation.updateVisaGuideSchema),
    VisaGuideController.updateVisaGuide
);

router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    VisaGuideController.deleteVisaGuide
);

export const VisaGuideRoutes = router;
