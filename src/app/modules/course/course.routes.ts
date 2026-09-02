// ===================================================================
// Visalink Air - Course Routes
// Course + CourseCategory module এর API endpoints
// কোর্স ও কোর্স ক্যাটাগরির API রাউটস
// ===================================================================

import express from 'express';
import { CourseController } from './course.controller';
import { CourseValidation } from './course.validation';
import { authMiddleware, authorizeRoles, optionalAuth } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// ===================================================================
//  CATEGORY ROUTES
//  `/:id` এর আগে বসাতেই হবে — নাহলে GET /categories কে course id ধরে নেবে।
// ===================================================================

// List categories (public — ভিজিটর active গুলো, অ্যাডমিন সবগুলো)
router.get(
    '/categories',
    optionalAuth,
    CourseController.getAllCategories
);

// Create category (admin — কোর্স ফর্মের উপর থেকেই ডাইনামিকভাবে তৈরি হয়)
router.post(
    '/categories',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(CourseValidation.createCategorySchema),
    CourseController.createCategory
);

// Update category (admin)
router.patch(
    '/categories/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(CourseValidation.updateCategorySchema),
    CourseController.updateCategory
);

// Delete category (admin)
router.delete(
    '/categories/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    CourseController.deleteCategory
);

// ===================================================================
//  PUBLIC COURSE ROUTES
// ===================================================================

// Active courses (frontend listing)
router.get('/active', CourseController.getActiveCourses);

// Featured courses (homepage)
router.get('/featured', CourseController.getFeaturedCourses);

// Course by slug (public detail page)
router.get('/slug/:slug', CourseController.getCourseBySlug);

// All courses (public list — inactive শুধু অ্যাডমিন দেখে, controller দেখুন)
router.get('/', optionalAuth, CourseController.getAllCourses);

// Single course by ID (অ্যাডমিন inactive কোর্সও পায়, এডিট ফর্মের জন্য)
router.get('/:id', optionalAuth, CourseController.getCourseById);

// ===================================================================
//  ADMIN COURSE ROUTES
// ===================================================================

// Create new course
router.post(
    '/',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(CourseValidation.createCourseSchema),
    CourseController.createCourse
);

// Update course
router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(CourseValidation.updateCourseSchema),
    CourseController.updateCourse
);

// Delete course
router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    CourseController.deleteCourse
);

export const CourseRoutes = router;
