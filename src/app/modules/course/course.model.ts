// ===================================================================
// Visalink Air - Course Models
// Mongoose schemas for Course + CourseCategory
// কোর্স ও কোর্স ক্যাটাগরির Mongoose স্কিমা
// ===================================================================

import { Schema, model } from 'mongoose';
import {
    ICourse,
    ICourseCategory,
    CourseModel,
    CourseCategoryModel,
} from './course.interface';

// ==================== Course Category Schema ====================
const courseCategorySchema = new Schema<ICourseCategory, CourseCategoryModel>(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            maxlength: [120, 'Category name cannot exceed 120 characters'],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'Description cannot exceed 500 characters'],
        },
        icon: { type: String },

        isActive: { type: Boolean, default: true },
        order: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// slug already carries a unique index from its schema definition
courseCategorySchema.index({ isActive: 1 });
courseCategorySchema.index({ order: 1 });

export const CourseCategory = model<ICourseCategory, CourseCategoryModel>(
    'CourseCategory',
    courseCategorySchema
);

// ==================== Course Schema ====================
const courseSchema = new Schema<ICourse, CourseModel>(
    {
        // Basic Info
        title: {
            type: String,
            required: [true, 'Course title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        image: { type: String },
        gallery: [{ type: String }],

        // Category — dynamic, admin-managed collection
        category: {
            type: Schema.Types.ObjectId,
            ref: 'CourseCategory',
            required: [true, 'Course category is required'],
        },

        // Description
        shortDescription: {
            type: String,
            required: [true, 'Short description is required'],
            trim: true,
            maxlength: [1000, 'Short description cannot exceed 1000 characters'],
        },
        // Quill থেকে আসা rich-text HTML — হেডিং/বুলেট/কালার সব এর ভেতরেই।
        // ৫০ হাজার ক্যারেক্টার সীমা, কারণ মডিউল লিস্ট বেশ বড় হতে পারে।
        longDescription: {
            type: String,
            maxlength: [50000, 'Long description cannot exceed 50000 characters'],
        },

        // Delivery
        courseType: {
            type: String,
            required: [true, 'Course type is required'],
            enum: {
                values: ['online', 'offline'],
                message: '{VALUE} is not a valid course type',
            },
            default: 'online',
        },
        location: { type: String, trim: true },

        // Seats & Enrollment
        totalSeats: {
            type: Number,
            required: [true, 'Total seats is required'],
            min: [1, 'There must be at least 1 seat'],
            default: 30,
        },
        enrolledCount: {
            type: Number,
            min: [0, 'Enrolled count cannot be negative'],
            default: 0,
        },

        // Schedule
        duration: {
            type: String,
            required: [true, 'Duration is required'],
            trim: true,
        },
        startDate: { type: String },
        classSchedule: { type: String, trim: true },

        // Instructor
        instructor: { type: String, trim: true },
        instructorTitle: { type: String, trim: true },

        // Pricing
        price: { type: Number, min: [0, 'Price cannot be negative'], default: 0 },
        oldPrice: { type: Number, min: [0, 'Old price cannot be negative'] },
        currency: { type: String, default: 'BDT' },

        // Meta
        level: { type: String, trim: true },
        language: { type: String, trim: true },
        tags: [{ type: String }],

        // SEO
        metaTitle: { type: String },
        metaDescription: { type: String },

        // Status & Order
        status: {
            type: String,
            enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
            default: 'upcoming',
        },
        isActive: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// ==================== Virtuals ====================
// বাকি কত সিট আছে — ক্লায়েন্ট সাইডে "X seats left" দেখানোর জন্য।
// কখনো নেগেটিভ হবে না, ওভার-এনরোলমেন্ট হলেও ০ দেখাবে।
courseSchema.virtual('availableSeats').get(function (this: ICourse) {
    return Math.max(0, (this.totalSeats || 0) - (this.enrolledCount || 0));
});

// ==================== Indexes ====================
// slug already carries a unique index from its schema definition
courseSchema.index({ isActive: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ courseType: 1 });
courseSchema.index({ status: 1 });
courseSchema.index({ order: 1 });
// `language_override` না দিলে MongoDB ডকুমেন্টের `language` ফিল্ডটাকে text
// index-এর ভাষা হিসেবে ধরে নেয়। আমাদের `language` মানে ক্লাসের ভাষা (যেমন
// "Bangla"), আর সেটা Mongo-র সাপোর্টেড ভাষা নয় — ফলে সেভ করতে গেলেই
// "language override unsupported: Bangla" এরর দিয়ে কোর্স সেভ আটকে যেত।
// এমন একটা ফিল্ডনেম দেওয়া হলো যা ডকুমেন্টে কখনো থাকে না, তাই override বন্ধ।
courseSchema.index(
    { title: 'text', shortDescription: 'text' },
    { language_override: 'textSearchLanguage' }
);

// ==================== Static Methods ====================
courseSchema.statics.isCourseExists = async function (id: string): Promise<boolean> {
    const course = await this.findById(id);
    return !!course;
};

courseSchema.statics.findBySlug = async function (slug: string): Promise<ICourse | null> {
    return this.findOne({ slug });
};

// ==================== Export Model ====================
export const Course = model<ICourse, CourseModel>('Course', courseSchema);
