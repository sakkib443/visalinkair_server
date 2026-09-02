// ===================================================================
// Visalink Air - Home Content Validation (Zod)
// হোম পেজের সেকশন আপডেটের জন্য ভ্যালিডেশন
// ===================================================================

import { z } from 'zod';

// Bilingual text helper — { en, bn }
const bilingualSchema = z
    .object({
        en: z.string().optional(),
        bn: z.string().optional(),
    })
    .passthrough();

/**
 * Update Section Validation Schema
 *
 * The PUT /:section body is the section's content object. Its exact shape
 * differs per section (hero / services / partners / consultation /
 * whyChooseUs) and is stored as Mixed, so section-specific fields are
 * allowed through via .passthrough(). This schema enforces the parts that
 * are common across sections and, critically, rejects an empty / non-object
 * body before it reaches the database.
 */
const updateSectionSchema = z.object({
    body: z
        .object({
            isActive: z.boolean().optional(),
            // Common bilingual text fields used across sections
            heading: bilingualSchema.optional(),
            headingHighlight: bilingualSchema.optional(),
            description: bilingualSchema.optional(),
            tagText: bilingualSchema.optional(),
            // Array-based collections used by some sections
            items: z.array(z.any()).optional(),
            cards: z.array(z.any()).optional(),
            stats: z.array(z.any()).optional(),
        })
        .passthrough()
        .refine((val) => Object.keys(val).length > 0, {
            message: 'Section content cannot be empty',
        }),
});

export const HomeContentValidation = {
    updateSectionSchema,
};
