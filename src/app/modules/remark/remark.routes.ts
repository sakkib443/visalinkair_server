import express from 'express';
import * as RemarkController from './remark.controller';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';

const router = express.Router();

// Everything here is admin-only — remarks are internal follow-up notes,
// never exposed to the public site.
router.use(authMiddleware, authorizeRoles('super_admin'));

router.get('/', RemarkController.getAll);
router.get('/stats', RemarkController.getStats);
router.get('/by-inquiry/:inquiryId', RemarkController.getByInquiry);
router.get('/:id', RemarkController.getById);
router.post('/', RemarkController.create);
router.patch('/:id', RemarkController.update);
router.delete('/:id', RemarkController.remove);

export const RemarkRoutes = router;
