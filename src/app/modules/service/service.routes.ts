import express from 'express';
import * as ServiceController from './service.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';

const router = express.Router();

// ── Public ────────────────────────────────────────────────
router.get('/', ServiceController.getAll);
router.get('/:slug', ServiceController.getBySlug);

// ── Admin ─────────────────────────────────────────────────
router.get('/id/:id', authMiddleware, authorizeRoles('super_admin'), ServiceController.getById);
router.post('/', authMiddleware, authorizeRoles('super_admin'), ServiceController.create);
router.patch('/:id', authMiddleware, authorizeRoles('super_admin'), ServiceController.update);
router.delete('/:id', authMiddleware, authorizeRoles('super_admin'), ServiceController.remove);

export const ServiceRoutes = router;
