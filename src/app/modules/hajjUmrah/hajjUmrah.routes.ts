import express from 'express';
import { HajjUmrahController } from './hajjUmrah.controller';
import { HajjUmrahValidation } from './hajjUmrah.validation';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// Public routes
router.get('/active', HajjUmrahController.getActivePackages);
router.get('/featured', HajjUmrahController.getFeaturedPackages);
router.get('/type/:type', HajjUmrahController.getByType);
router.get('/slug/:slug', HajjUmrahController.getPackageBySlug);

// Admin routes
router.get('/', HajjUmrahController.getAllPackages);
router.get('/:id', HajjUmrahController.getPackageById);
router.post('/', authMiddleware, authorizeRoles('super_admin'), validateRequest(HajjUmrahValidation.createHajjUmrahZodSchema), HajjUmrahController.createPackage);
router.patch('/:id', authMiddleware, authorizeRoles('super_admin'), validateRequest(HajjUmrahValidation.updateHajjUmrahZodSchema), HajjUmrahController.updatePackage);
router.delete('/:id', authMiddleware, authorizeRoles('super_admin'), HajjUmrahController.deletePackage);

export const HajjUmrahRoutes = router;
