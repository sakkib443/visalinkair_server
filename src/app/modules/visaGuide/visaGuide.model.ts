// ===================================================================
// Visalink Air - Visa Guide Model
// Mongoose schema for the Visa Guide module
// ভিসা গাইড মডিউলের Mongoose স্কিমা
// ===================================================================

import { Schema, model } from 'mongoose';
import { IVisaGuide, VisaGuideModel, TVisaGuideCategory } from './visaGuide.interface';

const visaGuideSchema = new Schema<IVisaGuide, VisaGuideModel>(
    {
        // ==================== Identity ====================
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: {
                values: ['tourist', 'student'],
                message: 'Category must be either tourist or student',
            },
            index: true,
        },
        country: {
            type: String,
            required: [true, 'Country name is required'],
            trim: true,
            maxlength: [100, 'Country name cannot exceed 100 characters'],
        },
        countryBn: {
            type: String,
            trim: true,
            maxlength: [100, 'Bengali country name cannot exceed 100 characters'],
        },
        countrySlug: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        flag: { type: String, trim: true, default: '' },

        // ==================== Summary fields ====================
        visaType: { type: String, trim: true, default: '' },
        processingTime: { type: String, trim: true, default: '' },
        processingFee: { type: String, trim: true, default: '' },
        embassyFee: { type: String, trim: true, default: '' },
        validity: { type: String, trim: true, default: '' },
        stayDuration: { type: String, trim: true, default: '' },
        entryType: { type: String, trim: true, default: '' },

        // ==================== Body ====================
        content: { type: String, default: '' },

        // ==================== Status ====================
        isActive: { type: Boolean, default: true, index: true },
        order: { type: Number, default: 0 },

        // ==================== SEO ====================
        metaTitle: { type: String, trim: true, default: '' },
        metaDescription: { type: String, trim: true, default: '' },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ==================== Indexes ====================
// One guide per country per category — adding "Singapore" twice under
// "tourist" is a data-entry mistake, so the DB rejects it outright
// instead of leaving two competing pages behind the same URL.
visaGuideSchema.index({ category: 1, countrySlug: 1 }, { unique: true });
visaGuideSchema.index({ category: 1, isActive: 1, order: 1 });
visaGuideSchema.index({ country: 'text' });

// ==================== Static Methods ====================
visaGuideSchema.statics.findByCountry = async function (
    category: TVisaGuideCategory,
    countrySlug: string
): Promise<IVisaGuide | null> {
    return this.findOne({ category, countrySlug });
};

export const VisaGuide = model<IVisaGuide, VisaGuideModel>('VisaGuide', visaGuideSchema);
