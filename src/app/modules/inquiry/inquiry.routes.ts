import express from 'express';
import * as InquiryController from './inquiry.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';

const router = express.Router();

// ── Public ────────────────────────────────────────────────
router.post('/', InquiryController.create);

// ── Admin ─────────────────────────────────────────────────
router.get('/', authMiddleware, authorizeRoles('super_admin'), InquiryController.getAll);
router.get('/stats', authMiddleware, authorizeRoles('super_admin'), InquiryController.getStats);
router.get('/:id', authMiddleware, authorizeRoles('super_admin'), InquiryController.getById);
router.patch('/:id', authMiddleware, authorizeRoles('super_admin'), InquiryController.update);
router.delete('/:id', authMiddleware, authorizeRoles('super_admin'), InquiryController.remove);

export const InquiryRoutes = router;
