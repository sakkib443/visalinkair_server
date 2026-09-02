// ===================================================================
// Visalink Air - Visa Guide Controller
// HTTP request handlers for the Visa Guide module
// ভিসা গাইড মডিউলের HTTP রিকোয়েস্ট হ্যান্ডলার
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { VisaGuideService } from './visaGuide.service';
import { IVisaGuideFilters, TVisaGuideCategory } from './visaGuide.interface';
import AppError from '../../utils/AppError';

/** Narrow an untrusted ?category= value to the union, or undefined. */
const asCategory = (v: unknown): TVisaGuideCategory | undefined =>
    v === 'tourist' || v === 'student' ? v : undefined;

/**
 * Create a visa guide
 * POST /api/visa-guides
 */
const createVisaGuide = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const guide = await VisaGuideService.createVisaGuide(req.body);
        res.status(201).json({
            success: true,
            message: 'Visa guide created successfully',
            data: guide,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin list with filters
 * GET /api/visa-guides?category=&isActive=&searchTerm=&page=&limit=
 */
const getAllVisaGuides = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { searchTerm, category, isActive, page, limit, sortBy, sortOrder } = req.query;

        const filters: IVisaGuideFilters = {};
        if (searchTerm) filters.searchTerm = String(searchTerm);
        const cat = asCategory(category);
        if (cat) filters.category = cat;
        if (isActive === 'true') filters.isActive = true;
        if (isActive === 'false') filters.isActive = false;

        const result = await VisaGuideService.getAllVisaGuides(filters, {
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 50,
            sortBy: (sortBy as string) || 'createdAt',
            sortOrder: (sortOrder as 'asc' | 'desc') || 'desc',
        });

        res.status(200).json({
            success: true,
            message: 'Visa guides retrieved successfully',
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Public country list for the client search dropdown
 * GET /api/visa-guides/public/countries?category=tourist
 */
const getPublicCountries = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const countries = await VisaGuideService.getPublicCountries(
            asCategory(req.query.category)
        );
        res.status(200).json({
            success: true,
            message: 'Countries retrieved successfully',
            data: countries,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Public detail page
 * GET /api/visa-guides/public/:category/:countrySlug
 */
const getPublicVisaGuide = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = asCategory(req.params.category);
        if (!category) {
            throw new AppError(400, 'Category must be either tourist or student');
        }
        const guide = await VisaGuideService.getPublicVisaGuide(
            category,
            req.params.countrySlug
        );
        res.status(200).json({
            success: true,
            message: 'Visa guide retrieved successfully',
            data: guide,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Single guide by id (admin — returns inactive ones too)
 * GET /api/visa-guides/:id
 */
const getVisaGuideById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const guide = await VisaGuideService.getVisaGuideById(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Visa guide retrieved successfully',
            data: guide,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update
 * PATCH /api/visa-guides/:id
 */
const updateVisaGuide = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const guide = await VisaGuideService.updateVisaGuide(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Visa guide updated successfully',
            data: guide,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Toggle public visibility
 * PATCH /api/visa-guides/:id/toggle
 */
const toggleVisaGuideStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const guide = await VisaGuideService.toggleVisaGuideStatus(req.params.id);
        res.status(200).json({
            success: true,
            message: `Visa guide is now ${guide?.isActive ? 'active' : 'inactive'}`,
            data: guide,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete
 * DELETE /api/visa-guides/:id
 */
const deleteVisaGuide = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await VisaGuideService.deleteVisaGuide(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Visa guide deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

export const VisaGuideController = {
    createVisaGuide,
    getAllVisaGuides,
    getPublicCountries,
    getPublicVisaGuide,
    getVisaGuideById,
    updateVisaGuide,
    toggleVisaGuideStatus,
    deleteVisaGuide,
};
