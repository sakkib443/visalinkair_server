// ===================================================================
// Visalink Air Backend - User Routes
// API endpoints for User module
//
// Single-role system. A super_admin may list / view / create / delete other
// super_admins. There is intentionally no admin-side edit endpoint — the only
// write a user can make to an account is to their own profile or password.
// ===================================================================

import express from 'express';
import UserController from './user.controller';
import validateRequest from '../../middlewares/validateRequest';
import { authMiddleware, authorizeRoles } from '../../middlewares/auth';
import {
    createUserValidation,
    updateUserValidation,
    changePasswordValidation,
    userQueryValidation,
} from './user.validation';

const router = express.Router();

// ===================================================================
// SELF ROUTES (any authenticated user)
// ===================================================================

/**
 * GET /api/users/me
 * Get current logged in user's profile
 * নিজের প্রোফাইল দেখা
 */
router.get('/me', authMiddleware, UserController.getMyProfile);

/**
 * PATCH /api/users/me
 * Update current logged in user's profile
 * নিজের প্রোফাইল আপডেট করা
 */
router.patch(
    '/me',
    authMiddleware,
    validateRequest(updateUserValidation),
    UserController.updateMyProfile
);

/**
 * PATCH /api/users/change-password
 * Change password for current user
 * পাসওয়ার্ড পরিবর্তন করা
 */
router.patch(
    '/change-password',
    authMiddleware,
    validateRequest(changePasswordValidation),
    UserController.changePassword
);

// ===================================================================
// SUPER ADMIN ROUTES
// ===================================================================

/**
 * GET /api/users/admin/stats
 * Get user statistics for admin dashboard
 * Admin dashboard এর জন্য user statistics
 */
router.get(
    '/admin/stats',
    authMiddleware,
    authorizeRoles('super_admin'),
    UserController.getUserStats
);

/**
 * POST /api/users/admin/create
 * Create a new super_admin (name + email + password)
 * নতুন super_admin তৈরি করা
 */
router.post(
    '/admin/create',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(createUserValidation),
    UserController.createUser
);

/**
 * GET /api/users/admin/all
 * Get all super_admins
 * সব super_admin দেখা
 */
router.get(
    '/admin/all',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(userQueryValidation),
    UserController.getAllUsers
);

/**
 * GET /api/users/admin/:id
 * Get single user by ID
 * Single user details দেখা
 */
router.get(
    '/admin/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    UserController.getSingleUser
);

/**
 * DELETE /api/users/admin/:id
 * Soft delete a super_admin
 * User delete করা (soft delete)
 */
router.delete(
    '/admin/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    UserController.deleteUser
);

export const UserRoutes = router;
