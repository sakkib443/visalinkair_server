// ===================================================================
// Visalink Air - Course Interface
// Course + Course Category module TypeScript interface definitions
// কোর্স ও কোর্স ক্যাটাগরি মডিউলের TypeScript interface definitions
// ===================================================================

import { Model, Types } from 'mongoose';

/**
 * Course delivery mode.
 * 'offline' এর জন্য location বাধ্যতামূলক — অনলাইন কোর্সে লোকেশন থাকে না।
 */
export type TCourseType = 'online' | 'offline';

/**
 * ICourseCategory - Admin দ্বারা ডাইনামিকভাবে তৈরি হওয়া কোর্স ক্যাটাগরি
 * কোর্স অ্যাড করার ফর্মের উপরেই নতুন ক্যাটাগরি বানানো যায়।
 */
export interface ICourseCategory {
    _id?: Types.ObjectId;

    name: string;                      // e.g. "IELTS Preparation"
    slug: string;                      // URL friendly — server-computed
    description?: string;              // Optional blurb for the public listing
    icon?: string;                     // Optional icon / image URL

    isActive: boolean;
    order: number;

    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * ICourse - Main Course Interface
 * Database এ যে format এ course data save হবে
 */
export interface ICourse {
    _id?: Types.ObjectId;

    // ==================== Basic Info ====================
    title: string;                     // Course title
    slug: string;                      // URL friendly slug — server-computed
    image?: string;                    // Cover / thumbnail image URL
    gallery?: string[];                // Additional images

    // ==================== Category ====================
    // CourseCategory কালেকশনের রেফারেন্স — read এ populate করে পাঠানো হয়
    category: Types.ObjectId | ICourseCategory;

    // ==================== Description ====================
    shortDescription: string;          // Card / listing এ যেটা দেখাবে
    // longDescription হচ্ছে rich-text HTML (Quill editor) — মডিউল, হেডিং,
    // বুলেট, কালার সব ফরম্যাটিং এই HTML এর ভেতরেই থাকে।
    longDescription?: string;

    // ==================== Delivery ====================
    courseType: TCourseType;           // 'online' | 'offline'
    location?: string;                 // offline হলে ম্যানুয়ালি লেখা ঠিকানা

    // ==================== Seats & Enrollment ====================
    totalSeats: number;                // মোট কত সিট
    enrolledCount: number;             // কতজন এনরোল করেছে

    // ==================== Schedule ====================
    duration: string;                  // e.g. "3 Months", "24 Classes"
    startDate?: string;                // Batch start date (ISO / free text)
    classSchedule?: string;            // e.g. "Sat, Mon, Wed — 7:00 PM"

    // ==================== Instructor ====================
    instructor?: string;
    instructorTitle?: string;          // e.g. "Senior IELTS Trainer"

    // ==================== Pricing ====================
    price?: number;
    oldPrice?: number;                 // Strike-through price
    currency?: string;

    // ==================== Meta ====================
    level?: string;                    // e.g. "Beginner", "Intermediate"
    language?: string;                 // e.g. "Bangla", "English"
    tags?: string[];

    // ==================== SEO ====================
    metaTitle?: string;
    metaDescription?: string;

    // ==================== Status & Order ====================
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    isActive: boolean;
    isFeatured: boolean;
    order: number;

    // ==================== Timestamps ====================
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * ICourseFilters - Course list filter করার জন্য
 */
export interface ICourseFilters {
    searchTerm?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    category?: string;                 // CourseCategory _id
    courseType?: TCourseType;
    status?: string;
    level?: string;
    minPrice?: number;
    maxPrice?: number;
}

/**
 * CourseModel / CourseCategoryModel - Mongoose Model Types
 */
export interface CourseModel extends Model<ICourse> {
    isCourseExists(id: string): Promise<boolean>;
    findBySlug(slug: string): Promise<ICourse | null>;
}

export type CourseCategoryModel = Model<ICourseCategory>;
