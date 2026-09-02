// ===================================================================
// Visalink Air - Visa Guide Validation
// Zod validation schemas for the Visa Guide module
// ভিসা গাইড মডিউলের ভ্যালিডেশন স্কিমা
// ===================================================================

import { z } from 'zod';

const categoryEnum = z.enum(['tourist', 'student'], {
    required_error: 'Category is required',
    invalid_type_error: 'Category must be either tourist or student',
});

// The rich-text body can legitimately be large (full document
// checklists run long), so the cap is generous rather than absent —
// an unbounded field is an easy way to fill a database.
const contentField = z
    .string()
    .max(200000, 'Content is too large (200,000 character limit)');

const createVisaGuideSchema = z.object({
    body: z.object({
        category: categoryEnum,
        country: z
            .string({ required_error: 'Country name is required' })
            .min(2, 'Country name must be at least 2 characters')
            .max(100, 'Country name cannot exceed 100 characters'),
        countryBn: z.string().max(100).optional(),
        flag: z.string().max(300).optional(),

        visaType: z.string().max(200).optional(),
        processingTime: z.string().max(200).optional(),
        processingFee: z.string().max(200).optional(),
        embassyFee: z.string().max(200).optional(),
        validity: z.string().max(200).optional(),
        stayDuration: z.string().max(200).optional(),
        entryType: z.string().max(200).optional(),

        content: contentField.optional(),

        isActive: z.boolean().optional(),
        order: z.number().min(0).optional(),

        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().max(500).optional(),
    }),
});

const updateVisaGuideSchema = z.object({
    body: z.object({
        category: categoryEnum.optional(),
        country: z
            .string()
            .min(2, 'Country name must be at least 2 characters')
            .max(100, 'Country name cannot exceed 100 characters')
            .optional(),
        countryBn: z.string().max(100).optional(),
        flag: z.string().max(300).optional(),

        visaType: z.string().max(200).optional(),
        processingTime: z.string().max(200).optional(),
        processingFee: z.string().max(200).optional(),
        embassyFee: z.string().max(200).optional(),
        validity: z.string().max(200).optional(),
        stayDuration: z.string().max(200).optional(),
        entryType: z.string().max(200).optional(),

        content: contentField.optional(),

        isActive: z.boolean().optional(),
        order: z.number().min(0).optional(),

        metaTitle: z.string().max(200).optional(),
        metaDescription: z.string().max(500).optional(),
    }),
});

export const VisaGuideValidation = {
    createVisaGuideSchema,
    updateVisaGuideSchema,
};
