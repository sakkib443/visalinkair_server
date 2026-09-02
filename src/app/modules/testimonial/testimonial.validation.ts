// ===================================================================
// Visalink Air - Testimonial Validation (Zod)
// ===================================================================

import { z } from 'zod';
import { mediaUrl } from '../../utils/validators';

const createTestimonialSchema = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Name is required' })
            .min(1, 'Name is required')
            .max(100, 'Name cannot exceed 100 characters'),
        message: z
            .string({ required_error: 'Message is required' })
            .min(10, 'Message must be at least 10 characters')
            .max(1000, 'Message cannot exceed 1000 characters'),
        rating: z
            .number()
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating cannot exceed 5')
            .optional(),
        role: z.string().max(100).optional().or(z.literal('')),
        avatar: mediaUrl('Avatar must be a valid URL').optional().or(z.literal('')),
    }),
});

const updateTestimonialSchema = z.object({
    body: z.object({
        name: z.string().min(1).max(100).optional(),
        message: z.string().min(10).max(1000).optional(),
        rating: z.number().min(1).max(5).optional(),
        role: z.string().max(100).optional().or(z.literal('')),
        avatar: mediaUrl('Avatar must be a valid URL').optional().or(z.literal('')),
    }),
});

export const TestimonialValidation = {
    createTestimonialSchema,
    updateTestimonialSchema,
};
