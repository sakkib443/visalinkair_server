// ===================================================================
// Visalink Air Backend - Upload Routes
// Routes for all image upload operations
// ===================================================================

import { Router } from 'express';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import {
    uploadImage,
    uploadImages,
    uploadUserAvatar,
    uploadCategoryImage,
    uploadPlatformImage,
    uploadSoftwareScreenshots,
    uploadZipFile,
    uploadDocument,
    removeImage,
} from './upload.controller';

const router = Router();

// ==================== Protected Routes (Authenticated users) ====================

// Single image upload (general purpose)
router.post('/single', authMiddleware, uploadImage);

// Multiple images upload (for websites)
router.post('/multiple', authMiddleware, uploadImages);

// Avatar upload
router.post('/avatar', authMiddleware, uploadUserAvatar);

// Visa application supporting document (PDF or image) — applicants upload their own
router.post('/document', authMiddleware, uploadDocument);

// Category icon upload (admin only)
router.post('/category', authMiddleware, authorizeRoles('super_admin'), uploadCategoryImage);

// Platform icon upload (admin only)
router.post('/platform', authMiddleware, authorizeRoles('super_admin'), uploadPlatformImage);

// Software screenshots upload
router.post('/software', authMiddleware, uploadSoftwareScreenshots);

// ZIP/RAR file upload (for download files - admin/seller)
router.post('/file', authMiddleware, uploadZipFile);

// Delete image/file (admin only)
router.delete('/delete', authMiddleware, authorizeRoles('super_admin'), removeImage);

export const uploadRoutes = router;

