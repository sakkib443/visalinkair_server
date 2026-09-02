// ===================================================================
// Visalink Air - Testimonial Routes
//
// Admin-managed content: a super admin adds / edits / deletes testimonials
// and every one of them shows in the public home page slider. There is no
// public review submission and no approval step.
// ===================================================================

import express from 'express';
import { TestimonialController } from './testimonial.controller';
import { TestimonialValidation } from './testimonial.validation';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// ──────── Public ────────
// Home page slider reads this list.
router.get('/', TestimonialController.getAllTestimonials);

// ──────── Admin ────────
router.post(
    '/',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(TestimonialValidation.createTestimonialSchema),
    TestimonialController.createTestimonial
);

router.get(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    TestimonialController.getTestimonialById
);

router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(TestimonialValidation.updateTestimonialSchema),
    TestimonialController.updateTestimonial
);

router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    TestimonialController.deleteTestimonial
);

export const TestimonialRoutes = router;
