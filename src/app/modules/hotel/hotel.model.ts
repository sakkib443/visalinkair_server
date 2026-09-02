// ===================================================================
// Visalink Air - Hotel Model
// Mongoose schema for Hotel module
// হোটেল মডিউলের Mongoose স্কিমা
// ===================================================================

import { Schema, model } from 'mongoose';
import { IHotel, HotelModel } from './hotel.interface';

// ==================== Sub-schemas ====================

const faqSchema = new Schema(
    {
        question: { type: String, required: true },
        questionBn: { type: String },
        answer: { type: String, required: true },
        answerBn: { type: String },
    },
    { _id: false }
);

// ==================== Hotel Schema ====================
const hotelSchema = new Schema<IHotel, HotelModel>(
    {
        // Basic Info
        name: {
            type: String,
            required: [true, 'Hotel name is required'],
            trim: true,
            maxlength: [200, 'Name cannot exceed 200 characters'],
        },
        nameBn: { type: String, trim: true },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        image: { type: String },
        gallery: [{ type: String }],

        // Location
        location: {
            type: String,
            required: [true, 'Location is required'],
            trim: true,
        },
        locationBn: { type: String, trim: true },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
        },
        cityBn: { type: String, trim: true },
        country: { type: String, trim: true },
        countryBn: { type: String, trim: true },

        // Hotel Details
        starRating: {
            type: Number,
            required: [true, 'Star rating is required'],
            min: [1, 'Minimum 1 star'],
            max: [5, 'Maximum 5 stars'],
            default: 3,
        },
        hotelCategory: {
            type: String,
            enum: ['luxury', 'budget', 'mid-range', 'boutique', 'resort', 'business', 'hostel'],
            default: 'mid-range',
        },
        roomType: { type: String },
        roomTypeBn: { type: String },

        // Pricing
        pricePerNight: {
            type: Number,
            required: [true, 'Price per night is required'],
            min: [0, 'Price cannot be negative'],
        },
        oldPrice: { type: Number, min: 0 },
        currency: { type: String, default: 'BDT' },

        // Capacity
        totalRooms: { type: Number, default: 0 },
        availableRooms: { type: Number, default: 0 },
        bookings: { type: Number, default: 0 },

        // Times
        checkInTime: { type: String, default: '14:00' },
        checkOutTime: { type: String, default: '12:00' },

        // Amenities
        amenities: [{ type: String }],
        amenitiesBn: [{ type: String }],

        // Description
        description: {
            type: String,
            maxlength: [1000, 'Short description cannot exceed 1000 characters'],
        },
        descriptionBn: { type: String, maxlength: [1000] },
        longDescription: { type: String, maxlength: [5000] },
        longDescriptionBn: { type: String, maxlength: [5000] },

        // FAQs
        faqs: [faqSchema],

        // Tags
        tags: [{ type: String }],

        // Rating
        rating: { type: Number, default: 0, min: 0, max: 5 },
        reviewsCount: { type: Number, default: 0 },

        // SEO
        metaTitle: { type: String },
        metaDescription: { type: String },

        // Status & Order
        status: {
            type: String,
            enum: ['active', 'inactive', 'maintenance'],
            default: 'active',
        },
        isActive: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// ==================== Indexes ====================
hotelSchema.index({ slug: 1 });
hotelSchema.index({ isActive: 1 });
hotelSchema.index({ isFeatured: 1 });
hotelSchema.index({ city: 1 });
hotelSchema.index({ starRating: 1 });
hotelSchema.index({ hotelCategory: 1 });
hotelSchema.index({ status: 1 });
hotelSchema.index({ pricePerNight: 1 });
hotelSchema.index({ order: 1 });
hotelSchema.index({ name: 'text', nameBn: 'text', city: 'text', location: 'text' });

// ==================== Static Methods ====================
hotelSchema.statics.isHotelExists = async function (id: string): Promise<boolean> {
    const hotel = await this.findById(id);
    return !!hotel;
};

hotelSchema.statics.findBySlug = async function (slug: string): Promise<IHotel | null> {
    return this.findOne({ slug });
};

// ==================== Export Model ====================
export const Hotel = model<IHotel, HotelModel>('Hotel', hotelSchema);
