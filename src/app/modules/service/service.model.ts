// ===================================================================
// Visalink Air — Service (unified CMS)
// One collection holds every "service" landing-page the site offers:
// Study Abroad, Passport, Banking, Career, Course, and future ones.
// Admin edits everything from the dashboard — pages are 100% dynamic.
// ===================================================================

import { Schema, model, Document, Types } from 'mongoose';

const bilingual = new Schema(
    {
        en: { type: String, default: '', trim: true },
        bn: { type: String, default: '', trim: true },
    },
    { _id: false }
);

// One item inside a "features" / "list" / "faq" section.
const sectionItemSchema = new Schema(
    {
        title: { type: bilingual, default: () => ({}) },
        description: { type: bilingual, default: () => ({}) },
        icon: { type: String, default: '' }, // lucide/react-icons name or emoji
        image: { type: String, default: '' },
        link: { type: String, default: '' },
    },
    { _id: false }
);

// Flexible section — admin adds any number, any type, in any order.
const sectionSchema = new Schema(
    {
        type: {
            type: String,
            enum: ['text', 'features', 'list', 'faq', 'cta', 'image', 'stats'],
            default: 'text',
        },
        title: { type: bilingual, default: () => ({}) },
        content: { type: bilingual, default: () => ({}) },
        items: { type: [sectionItemSchema], default: [] },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { _id: false }
);

const serviceSchema = new Schema(
    {
        slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
        type: {
            type: String,
            enum: ['study_abroad', 'passport', 'banking', 'career', 'course', 'other'],
            required: true,
            index: true,
        },
        title: { type: bilingual, default: () => ({}) },
        subtitle: { type: bilingual, default: () => ({}) },
        description: { type: bilingual, default: () => ({}) },
        heroImage: { type: String, default: '' },
        icon: { type: String, default: '' },

        sections: { type: [sectionSchema], default: [] },

        // Simple inquiry form on the page — turn on/off from admin.
        formEnabled: { type: Boolean, default: true },
        ctaText: { type: bilingual, default: () => ({}) },
        ctaLink: { type: String, default: '' },

        // SEO metadata per service — set from admin, rendered as <head> tags.
        seoTitle: { type: bilingual, default: () => ({}) },
        seoDescription: { type: bilingual, default: () => ({}) },
        seoKeywords: { type: String, default: '' },

        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

serviceSchema.index({ type: 1, isActive: 1, order: 1 });

export interface IService extends Document {
    _id: Types.ObjectId;
    slug: string;
    type: string;
    title: { en: string; bn: string };
    subtitle: { en: string; bn: string };
    description: { en: string; bn: string };
    heroImage: string;
    icon: string;
    sections: any[];
    formEnabled: boolean;
    ctaText: { en: string; bn: string };
    ctaLink: string;
    seoTitle: { en: string; bn: string };
    seoDescription: { en: string; bn: string };
    seoKeywords: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export const Service = model<IService>('Service', serviceSchema);
