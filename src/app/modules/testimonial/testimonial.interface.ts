// ===================================================================
// Visalink Air - Testimonial Interface
// টেস্টিমোনিয়াল মডিউলের TypeScript interfaces
//
// Testimonials are admin-authored content, not user-submitted reviews.
// There is no submitter, no approval workflow — a super admin adds one and
// it appears in the home page slider immediately.
// ===================================================================

import { Document, Model } from 'mongoose';

export interface ITestimonial extends Document {
    name: string;
    avatar?: string;
    role?: string;
    rating: number;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITestimonialFilters {
    searchTerm?: string;
}

export type TestimonialModel = Model<ITestimonial>;
