// ===================================================================
// Visalink Air - Course Validation
// Zod validation schemas for Course + CourseCategory
// কোর্স ও কোর্স ক্যাটাগরির ভ্যালিডেশন স্কিমা
// ===================================================================

import { z } from 'zod';

const objectId = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category id');

const courseTypeEnum = z.enum(['online', 'offline']);
const courseStatusEnum = z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']);

/**
 * অফলাইন কোর্সে লোকেশন ছাড়া কোর্স সেভ হতে দেওয়া যাবে না — ফর্মে
 * লোকেশন ফিল্ডটা কেবল offline বেছে নিলেই দেখায়, তাই সার্ভারেও একই নিয়ম।
 * body-এর উপরেই refine করা হয় যাতে error path ঠিক `body.location` এ বসে।
 */
const requireLocationWhenOffline = (
    body: { courseType?: string; location?: string },
    ctx: z.RefinementCtx
) => {
    if (
        body.courseType === 'offline' &&
        (typeof body.location !== 'string' || body.location.trim() === '')
    ) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['location'],
            message: 'Location is required for an offline course',
        });
    }
};

// ==================== Course Category ====================

const createCategorySchema = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Category name is required' })
            .min(2, 'Category name must be at least 2 characters')
            .max(120, 'Category name cannot exceed 120 characters'),
        description: z.string().max(500).optional().or(z.literal('')),
        icon: z.string().optional().or(z.literal('')),
        isActive: z.boolean().default(true),
        order: z.number().min(0).default(0),
    }),
});

const updateCategorySchema = z.object({
    body: z.object({
        name: z.string().min(2).max(120).optional(),
        description: z.string().max(500).optional().or(z.literal('')),
        icon: z.string().optional().or(z.literal('')),
        isActive: z.boolean().optional(),
        order: z.number().min(0).optional(),
    }),
});

// ==================== Course ====================

const createCourseSchema = z.object({
    body: z
        .object({
            // Basic Info
            title: z
                .string({ required_error: 'Course title is required' })
                .min(2, 'Title must be at least 2 characters')
                .max(200, 'Title cannot exceed 200 characters'),
            image: z.string().optional().or(z.literal('')),
            gallery: z.array(z.string()).optional(),

            // Category — must reference an existing CourseCategory
            category: objectId,

            // Description
            shortDescription: z
                .string({ required_error: 'Short description is required' })
                .min(10, 'Short description must be at least 10 characters')
                .max(1000, 'Short description cannot exceed 1000 characters'),
            longDescription: z.string().max(50000).optional().or(z.literal('')),

            // Delivery
            courseType: courseTypeEnum.default('online'),
            location: z.string().max(500).optional().or(z.literal('')),

            // Seats & Enrollment
            totalSeats: z
                .number({ required_error: 'Total seats is required' })
                .min(1, 'There must be at least 1 seat'),
            enrolledCount: z.number().min(0).default(0),

            // Schedule
            duration: z
                .string({ required_error: 'Duration is required' })
                .min(1, 'Duration is required'),
            startDate: z.string().optional().or(z.literal('')),
            classSchedule: z.string().optional().or(z.literal('')),

            // Instructor
            instructor: z.string().optional().or(z.literal('')),
            instructorTitle: z.string().optional().or(z.literal('')),

            // Pricing — oldPrice nullable so the form can clear it later
            price: z.number().min(0).default(0),
            oldPrice: z.number().min(0).nullable().optional(),
            currency: z.string().default('BDT'),

            // Meta
            level: z.string().optional().or(z.literal('')),
            language: z.string().optional().or(z.literal('')),
            tags: z.array(z.string()).optional(),

            // SEO
            metaTitle: z.string().optional().or(z.literal('')),
            metaDescription: z.string().optional().or(z.literal('')),

            // Status & Order
            status: courseStatusEnum.default('upcoming'),
            isActive: z.boolean().default(true),
            isFeatured: z.boolean().default(false),
            order: z.number().min(0).default(0),
        })
        .superRefine(requireLocationWhenOffline),
});

const updateCourseSchema = z.object({
    body: z
        .object({
            title: z.string().min(2).max(200).optional(),
            image: z.string().optional().or(z.literal('')),
            gallery: z.array(z.string()).optional(),

            category: objectId.optional(),

            shortDescription: z.string().min(10).max(1000).optional(),
            longDescription: z.string().max(50000).optional().or(z.literal('')),

            courseType: courseTypeEnum.optional(),
            location: z.string().max(500).optional().or(z.literal('')),

            totalSeats: z.number().min(1).optional(),
            enrolledCount: z.number().min(0).optional(),

            duration: z.string().min(1).optional(),
            startDate: z.string().optional().or(z.literal('')),
            classSchedule: z.string().optional().or(z.literal('')),

            instructor: z.string().optional().or(z.literal('')),
            instructorTitle: z.string().optional().or(z.literal('')),

            price: z.number().min(0).optional(),
            oldPrice: z.number().min(0).nullable().optional(),
            currency: z.string().optional(),

            level: z.string().optional().or(z.literal('')),
            language: z.string().optional().or(z.literal('')),
            tags: z.array(z.string()).optional(),

            metaTitle: z.string().optional().or(z.literal('')),
            metaDescription: z.string().optional().or(z.literal('')),

            status: courseStatusEnum.optional(),
            isActive: z.boolean().optional(),
            isFeatured: z.boolean().optional(),
            order: z.number().min(0).optional(),
        })
        // PATCH-এ courseType না পাঠালে এখানে ধরা পড়বে না — সেই কেসটা
        // service লেয়ারে সেভ করা courseType মিলিয়ে যাচাই হয়।
        .superRefine(requireLocationWhenOffline),
});

export const CourseValidation = {
    createCategorySchema,
    updateCategorySchema,
    createCourseSchema,
    updateCourseSchema,
};
