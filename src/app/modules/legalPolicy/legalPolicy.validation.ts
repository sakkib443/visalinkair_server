// ===================================================================
// Visalink Air - Legal Policy Validation (Zod)
// Privacy / Refund policy আপডেটের জন্য ভ্যালিডেশন
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
 * Update Policy Validation Schema
 *
 * The PUT /:type body carries the policy's title and content (bilingual HTML).
 * Both are optional so the admin can save either language independently, but
 * an empty / non-object body is rejected before it reaches the database.
 */
const updatePolicySchema = z.object({
    body: z
        .object({
            title: bilingualSchema.optional(),
            content: bilingualSchema.optional(),
        })
        .passthrough()
        .refine((val) => Object.keys(val).length > 0, {
            message: 'Policy content cannot be empty',
        }),
});

export const LegalPolicyValidation = {
    updatePolicySchema,
};
