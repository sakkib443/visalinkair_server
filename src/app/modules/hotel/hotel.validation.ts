// ===================================================================
// Visalink Air - Hotel Validation
// Zod validation schemas for Hotel module
// হোটেল মডিউলের ভ্যালিডেশন স্কিমা
// ===================================================================

import { z } from 'zod';

const faqSchema = z.object({
    question: z.string().min(1, 'Question is required'),
    questionBn: z.string().optional(),
    answer: z.string().min(1, 'Answer is required'),
    answerBn: z.string().optional(),
});

/**
 * Create Hotel Validation Schema
 */
const createHotelSchema = z.object({
    body: z.object({
        name: z
            .string({ required_error: 'Hotel name is required' })
            .min(2, 'Name must be at least 2 characters')
            .max(200),
        nameBn: z.string().max(200).optional(),
        image: z.string().optional().or(z.literal('')),
        gallery: z.array(z.string()).optional(),

        // Location
        location: z.string({ required_error: 'Location is required' }).min(2),
        locationBn: z.string().optional(),
        city: z.string({ required_error: 'City is required' }).min(2),
        cityBn: z.string().optional(),
        country: z.string().optional(),
        countryBn: z.string().optional(),

        // Hotel Details
        starRating: z.number().min(1).max(5).default(3),
        hotelCategory: z.enum(['luxury', 'budget', 'mid-range', 'boutique', 'resort', 'business', 'hostel']).default('mid-range'),
        roomType: z.string().optional(),
        roomTypeBn: z.string().optional(),

        // Pricing
        pricePerNight: z.number({ required_error: 'Price per night is required' }).min(0),
        oldPrice: z.number().min(0).optional(),
        currency: z.string().default('BDT'),

        // Capacity
        totalRooms: z.number().min(0).default(0),
        availableRooms: z.number().min(0).default(0),
        bookings: z.number().min(0).default(0),

        // Times
        checkInTime: z.string().optional(),
        checkOutTime: z.string().optional(),

        // Amenities
        amenities: z.array(z.string()).default([]),
        amenitiesBn: z.array(z.string()).optional(),

        // Description
        description: z.string().max(1000).optional(),
        descriptionBn: z.string().max(1000).optional(),
        longDescription: z.string().max(5000).optional(),
        longDescriptionBn: z.string().max(5000).optional(),

        // FAQs
        faqs: z.array(faqSchema).optional(),

        // Tags
        tags: z.array(z.string()).optional(),

        // Rating
        rating: z.number().min(0).max(5).default(0),
        reviewsCount: z.number().min(0).default(0),

        // SEO
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),

        // Status & Order
        status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
        isActive: z.boolean().default(true),
        isFeatured: z.boolean().default(false),
        order: z.number().min(0).default(0),
    }),
});

/**
 * Update Hotel Validation Schema
 */
const updateHotelSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(200).optional(),
        nameBn: z.string().max(200).optional(),
        image: z.string().optional().or(z.literal('')),
        gallery: z.array(z.string()).optional(),

        location: z.string().min(2).optional(),
        locationBn: z.string().optional(),
        city: z.string().min(2).optional(),
        cityBn: z.string().optional(),
        country: z.string().optional(),
        countryBn: z.string().optional(),

        starRating: z.number().min(1).max(5).optional(),
        hotelCategory: z.enum(['luxury', 'budget', 'mid-range', 'boutique', 'resort', 'business', 'hostel']).optional(),
        roomType: z.string().optional(),
        roomTypeBn: z.string().optional(),

        pricePerNight: z.number().min(0).optional(),
        oldPrice: z.number().min(0).optional(),
        currency: z.string().optional(),

        totalRooms: z.number().min(0).optional(),
        availableRooms: z.number().min(0).optional(),
        bookings: z.number().min(0).optional(),

        checkInTime: z.string().optional(),
        checkOutTime: z.string().optional(),

        amenities: z.array(z.string()).optional(),
        amenitiesBn: z.array(z.string()).optional(),

        description: z.string().max(1000).optional(),
        descriptionBn: z.string().max(1000).optional(),
        longDescription: z.string().max(5000).optional(),
        longDescriptionBn: z.string().max(5000).optional(),

        faqs: z.array(faqSchema).optional(),
        tags: z.array(z.string()).optional(),

        rating: z.number().min(0).max(5).optional(),
        reviewsCount: z.number().min(0).optional(),

        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),

        status: z.enum(['active', 'inactive', 'maintenance']).optional(),
        isActive: z.boolean().optional(),
        isFeatured: z.boolean().optional(),
        order: z.number().min(0).optional(),
    }),
});

export const HotelValidation = {
    createHotelSchema,
    updateHotelSchema,
};
