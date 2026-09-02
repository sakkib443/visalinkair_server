// ===================================================================
// Visalink Air - Hotel Interface
// Hotel module TypeScript interface definitions
// হোটেল মডিউলের TypeScript interface definitions
// ===================================================================

import { Model, Types } from 'mongoose';

/**
 * IHotelFaq - Frequently asked questions
 */
export interface IHotelFaq {
    question: string;
    questionBn?: string;
    answer: string;
    answerBn?: string;
}

/**
 * IHotel - Main Hotel Interface
 */
export interface IHotel {
    _id?: Types.ObjectId;

    // ==================== Basic Info ====================
    name: string;
    nameBn?: string;
    slug: string;
    image?: string;
    gallery?: string[];

    // ==================== Location ====================
    location: string;
    locationBn?: string;
    city: string;
    cityBn?: string;
    country?: string;
    countryBn?: string;

    // ==================== Hotel Details ====================
    starRating: number;
    hotelCategory: string;
    roomType?: string;
    roomTypeBn?: string;

    // ==================== Pricing ====================
    pricePerNight: number;
    oldPrice?: number;
    currency?: string;

    // ==================== Capacity ====================
    totalRooms?: number;
    availableRooms?: number;
    bookings?: number;

    // ==================== Times ====================
    checkInTime?: string;
    checkOutTime?: string;

    // ==================== Amenities ====================
    amenities?: string[];
    amenitiesBn?: string[];

    // ==================== Description ====================
    description?: string;
    descriptionBn?: string;
    longDescription?: string;
    longDescriptionBn?: string;

    // ==================== FAQs ====================
    faqs?: IHotelFaq[];

    // ==================== Tags ====================
    tags?: string[];

    // ==================== Rating ====================
    rating?: number;
    reviewsCount?: number;

    // ==================== SEO ====================
    metaTitle?: string;
    metaDescription?: string;

    // ==================== Status & Order ====================
    status: 'active' | 'inactive' | 'maintenance';
    isActive: boolean;
    isFeatured: boolean;
    order: number;

    // ==================== Timestamps ====================
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * IHotelFilters - Query Filters
 */
export interface IHotelFilters {
    searchTerm?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    city?: string;
    country?: string;
    starRating?: number;
    hotelCategory?: string;
    roomType?: string;
    status?: string;
    minPrice?: number;
    maxPrice?: number;
}

/**
 * HotelModel - Mongoose Model Type
 */
export interface HotelModel extends Model<IHotel> {
    isHotelExists(id: string): Promise<boolean>;
    findBySlug(slug: string): Promise<IHotel | null>;
}
