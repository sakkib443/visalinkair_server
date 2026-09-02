// ===================================================================
// visalinkair LMS - Blog Routes
// Blog module এর API endpoints
// ব্লগ মডিউলের API রাউটস
// ===================================================================

import express from 'express';
import { z } from 'zod';
import { BlogController } from './blog.controller';
import { BlogValidation } from './blog.validation';
import { authMiddleware, authorizeRoles, optionalAuth } from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

// Validates that the :id route param is a well-formed Mongo ObjectId
const blogIdParamSchema = z.object({
    params: z.object({
        id: z
            .string({ required_error: 'Blog ID is required' })
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid blog ID'),
    }),
});

// ==================== Public Routes ====================
// এই routes সবার জন্য accessible

// Get all published blogs with filters
router.get(
    '/',
    BlogController.getAllBlogs
);

// Get featured blogs
router.get(
    '/featured',
    BlogController.getFeaturedBlogs
);

// Get popular blogs
router.get(
    '/popular',
    BlogController.getPopularBlogs
);

// Get recent blogs
router.get(
    '/recent',
    BlogController.getRecentBlogs
);

// Get blog by slug (public view)
router.get(
    '/slug/:slug',
    optionalAuth,
    BlogController.getBlogBySlug
);

// Get blogs by category
router.get(
    '/category/:categoryId',
    BlogController.getBlogsByCategory
);

// Get blogs by author
router.get(
    '/author/:authorId',
    optionalAuth,
    BlogController.getBlogsByAuthor
);

// Get comments for a blog
router.get(
    '/:id/comments',
    BlogController.getComments
);

// Get single blog by ID
router.get(
    '/:id',
    optionalAuth,
    BlogController.getBlogById
);

// ==================== Authenticated Routes ====================

// Toggle blog like
router.post(
    '/:id/toggle-like',
    authMiddleware,
    BlogController.toggleLike
);

// Increment share count
router.post(
    '/:id/share',
    authMiddleware,
    validateRequest(blogIdParamSchema),
    BlogController.incrementShareCount
);

// Add comment to blog
router.post(
    '/:id/comments',
    authMiddleware,
    validateRequest(BlogValidation.createCommentSchema),
    BlogController.addComment
);

// Delete comment
router.delete(
    '/comments/:commentId',
    authMiddleware,
    BlogController.deleteComment
);

// ==================== Admin Routes ====================
// শুধু Admin এই routes access করতে পারবে

// Create new blog
router.post(
    '/',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(BlogValidation.createBlogSchema),
    BlogController.createBlog
);

// Update blog
router.patch(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    validateRequest(BlogValidation.updateBlogSchema),
    BlogController.updateBlog
);

// Delete blog
router.delete(
    '/:id',
    authMiddleware,
    authorizeRoles('super_admin'),
    BlogController.deleteBlog
);

export const BlogRoutes = router;
