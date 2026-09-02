// ===================================================================
// Visalink Air - Settings Validation (Zod)
// ===================================================================

import { z } from 'zod';

const updateSettingsSchema = z.object({
    body: z.object({
        contactPhone: z.string().trim().min(5).max(50).optional(),
        contactPhoneAlt: z.string().trim().max(50).optional().or(z.literal('')),
        contactEmail: z.string().trim().email().optional(),
        whatsappNumber: z.string().trim().min(5).max(20).optional(),

        // Mobile payment (manual) "Send Money" numbers
        bkashNumber: z.string().trim().max(20).optional().or(z.literal('')),
        nagadNumber: z.string().trim().max(20).optional().or(z.literal('')),
        rocketNumber: z.string().trim().max(20).optional().or(z.literal('')),

        address: z.string().trim().max(300).optional().or(z.literal('')),
        addressBn: z.string().trim().max(300).optional().or(z.literal('')),

        // Working Hours
        workingDays: z.string().trim().max(100).optional().or(z.literal('')),
        workingDaysBn: z.string().trim().max(100).optional().or(z.literal('')),
        workingHours: z.string().trim().max(100).optional().or(z.literal('')),
        workingHoursBn: z.string().trim().max(100).optional().or(z.literal('')),

        // Map
        mapEmbedUrl: z.string().trim().max(1000).optional().or(z.literal('')),
        mapLabel: z.string().trim().max(200).optional().or(z.literal('')),
        mapLabelBn: z.string().trim().max(200).optional().or(z.literal('')),

        // Stats
        visaSuccessRate: z.string().trim().max(20).optional().or(z.literal('')),
        countriesCount: z.string().trim().max(20).optional().or(z.literal('')),
        happyClientsCount: z.string().trim().max(20).optional().or(z.literal('')),

        // Visa details page banner. Must be listed here to persist —
        // Zod strips unknown keys, so an unregistered field is silently
        // dropped before it ever reaches the model.
        visaBannerImage: z.string().trim().max(1000).optional().or(z.literal('')),

        social: z
            .object({
                facebook: z.string().trim().max(300).optional().or(z.literal('')),
                instagram: z.string().trim().max(300).optional().or(z.literal('')),
                twitter: z.string().trim().max(300).optional().or(z.literal('')),
                youtube: z.string().trim().max(300).optional().or(z.literal('')),
                linkedin: z.string().trim().max(300).optional().or(z.literal('')),
                tiktok: z.string().trim().max(300).optional().or(z.literal('')),
            })
            .partial()
            .optional(),
    }),
});

export const SettingsValidation = {
    updateSettingsSchema,
};
