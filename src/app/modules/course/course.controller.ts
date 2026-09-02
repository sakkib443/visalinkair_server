// ===================================================================
// Visalink Air - Course Controller
// HTTP request handlers for Course + CourseCategory
// কোর্স ও কোর্স ক্যাটাগরির HTTP রিকোয়েস্ট হ্যান্ডলার
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { CourseService } from './course.service';
import { ICourseFilters, TCourseType } from './course.interface';

// ===================================================================
//                        COURSE CATEGORIES
// ===================================================================

/**
 * Create category
 * POST /api/courses/categories
 */
const createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await CourseService.createCategory(req.body);
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all categories
 * GET /api/courses/categories
 * অ্যাডমিন inactive সহ পায়, ভিজিটর শুধু active গুলো।
 */
const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await CourseService.getAllCategories(
            req.user?.role === 'super_admin'
        );
        res.status(200).json({
            success: true,
            message: 'Categories retrieved successfully',
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update category
 * PATCH /api/courses/categories/:id
 */
const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await CourseService.updateCategory(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete category
 * DELETE /api/courses/categories/:id
 */
const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CourseService.deleteCategory(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

// ===================================================================
//                             COURSES
// ===================================================================

/**
 * Create a new course
 * POST /api/courses
 */
const createCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await CourseService.createCourse(req.body);
        res.status(201).json({
            success: true,
            message: 'Course created successfully',
            data: course,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all courses with filters
 * GET /api/courses
 */
const getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            searchTerm, isActive, isFeatured, category, courseType,
            status, level, minPrice, maxPrice,
            page, limit, sortBy, sortOrder,
        } = req.query;

        const filters: ICourseFilters = {};
        if (searchTerm) filters.searchTerm = searchTerm as string;
        if (isActive === 'true') filters.isActive = true;
        if (isActive === 'false') filters.isActive = false;
        if (isFeatured === 'true') filters.isFeatured = true;
        if (category) filters.category = category as string;
        if (courseType === 'online' || courseType === 'offline') {
            filters.courseType = courseType as TCourseType;
        }
        if (status) filters.status = status as string;
        if (level) filters.level = level as string;
        if (minPrice) filters.minPrice = Number(minPrice);
        if (maxPrice) filters.maxPrice = Number(maxPrice);

        // শুধু অ্যাডমিন inactive কোর্স লিস্টে দেখতে পারে — ভিজিটর যেই
        // isActive পাঠাক, তাকে active-এই আটকে রাখা হয়।
        if (req.user?.role !== 'super_admin') filters.isActive = true;

        const paginationOptions = {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 200,
            sortBy: (sortBy as string) || 'order',
            sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
        };

        const result = await CourseService.getAllCourses(filters, paginationOptions);

        res.status(200).json({
            success: true,
            message: 'Courses retrieved successfully',
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single course by ID
 * GET /api/courses/:id
 */
const getCourseById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await CourseService.getCourseById(
            req.params.id,
            req.user?.role === 'super_admin'
        );
        res.status(200).json({
            success: true,
            message: 'Course retrieved successfully',
            data: course,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get course by slug (public)
 * GET /api/courses/slug/:slug
 */
const getCourseBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await CourseService.getCourseBySlug(req.params.slug);
        res.status(200).json({
            success: true,
            message: 'Course retrieved successfully',
            data: course,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update course
 * PATCH /api/courses/:id
 */
const updateCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const course = await CourseService.updateCourse(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Course updated successfully',
            data: course,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete course
 * DELETE /api/courses/:id
 */
const deleteCourse = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await CourseService.deleteCourse(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Course deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get active courses (public listing)
 * GET /api/courses/active
 */
const getActiveCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await CourseService.getActiveCourses();
        res.status(200).json({
            success: true,
            message: 'Active courses retrieved successfully',
            data: courses,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get featured courses (homepage)
 * GET /api/courses/featured
 */
const getFeaturedCourses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const courses = await CourseService.getFeaturedCourses();
        res.status(200).json({
            success: true,
            message: 'Featured courses retrieved successfully',
            data: courses,
        });
    } catch (error) {
        next(error);
    }
};

export const CourseController = {
    // Categories
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
    // Courses
    createCourse,
    getAllCourses,
    getCourseById,
    getCourseBySlug,
    updateCourse,
    deleteCourse,
    getActiveCourses,
    getFeaturedCourses,
};
