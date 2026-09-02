// ===================================================================
// Visalink Air - Hotel Controller
// HTTP request handlers for Hotel module
// হোটেল মডিউলের HTTP রিকোয়েস্ট হ্যান্ডলার
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { HotelService } from './hotel.service';
import { IHotelFilters } from './hotel.interface';

/**
 * Create a new hotel
 * POST /api/hotels
 */
const createHotel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hotel = await HotelService.createHotel(req.body);
        res.status(201).json({
            success: true,
            message: 'Hotel created successfully',
            data: hotel,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all hotels with filters
 * GET /api/hotels
 */
const getAllHotels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            searchTerm, isActive, isFeatured, city, country,
            starRating, hotelCategory, roomType, status, minPrice, maxPrice,
            page, limit, sortBy, sortOrder
        } = req.query;

        const filters: IHotelFilters = {};
        if (searchTerm) filters.searchTerm = searchTerm as string;
        if (isActive === 'true') filters.isActive = true;
        if (isActive === 'false') filters.isActive = false;
        if (isFeatured === 'true') filters.isFeatured = true;
        if (city) filters.city = city as string;
        if (country) filters.country = country as string;
        if (starRating) filters.starRating = Number(starRating);
        if (hotelCategory) filters.hotelCategory = hotelCategory as string;
        if (roomType) filters.roomType = roomType as string;
        if (status) filters.status = status as string;
        if (minPrice) filters.minPrice = Number(minPrice);
        if (maxPrice) filters.maxPrice = Number(maxPrice);

        const paginationOptions = {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 200,
            sortBy: (sortBy as string) || 'order',
            sortOrder: (sortOrder as 'asc' | 'desc') || 'asc',
        };

        const result = await HotelService.getAllHotels(filters, paginationOptions);

        res.status(200).json({
            success: true,
            message: 'Hotels retrieved successfully',
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single hotel by ID
 * GET /api/hotels/:id
 */
const getHotelById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const hotel = await HotelService.getHotelById(id);
        res.status(200).json({
            success: true,
            message: 'Hotel retrieved successfully',
            data: hotel,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get hotel by slug (public)
 * GET /api/hotels/slug/:slug
 */
const getHotelBySlug = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { slug } = req.params;
        const hotel = await HotelService.getHotelBySlug(slug);
        res.status(200).json({
            success: true,
            message: 'Hotel retrieved successfully',
            data: hotel,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update hotel
 * PATCH /api/hotels/:id
 */
const updateHotel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const hotel = await HotelService.updateHotel(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Hotel updated successfully',
            data: hotel,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete hotel
 * DELETE /api/hotels/:id
 */
const deleteHotel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await HotelService.deleteHotel(id);
        res.status(200).json({
            success: true,
            message: 'Hotel deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get active hotels (public)
 * GET /api/hotels/active
 */
const getActiveHotels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hotels = await HotelService.getActiveHotels();
        res.status(200).json({
            success: true,
            message: 'Active hotels retrieved successfully',
            data: hotels,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get featured hotels (for homepage)
 * GET /api/hotels/featured
 */
const getFeaturedHotels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const hotels = await HotelService.getFeaturedHotels();
        res.status(200).json({
            success: true,
            message: 'Featured hotels retrieved successfully',
            data: hotels,
        });
    } catch (error) {
        next(error);
    }
};

export const HotelController = {
    createHotel,
    getAllHotels,
    getHotelById,
    getHotelBySlug,
    updateHotel,
    deleteHotel,
    getActiveHotels,
    getFeaturedHotels,
};
