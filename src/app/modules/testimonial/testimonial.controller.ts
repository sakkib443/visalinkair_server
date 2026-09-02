// ===================================================================
// Visalink Air - Testimonial Controller
// টেস্টিমোনিয়াল মডিউলের HTTP request handlers
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import { TestimonialService } from './testimonial.service';
import { ITestimonialFilters } from './testimonial.interface';

/**
 * Create testimonial (admin)
 * POST /api/testimonials
 */
const createTestimonial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const testimonial = await TestimonialService.createTestimonial(req.body);

        res.status(201).json({
            success: true,
            message: 'Testimonial created successfully',
            data: testimonial,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all testimonials — public (home page slider) and admin list share this.
 * GET /api/testimonials
 */
const getAllTestimonials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { searchTerm } = req.query;
        const filters: ITestimonialFilters = {};
        if (searchTerm) filters.searchTerm = searchTerm as string;

        const data = await TestimonialService.getAllTestimonials(filters);
        res.status(200).json({
            success: true,
            message: 'Testimonials retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single testimonial
 * GET /api/testimonials/:id
 */
const getTestimonialById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await TestimonialService.getTestimonialById(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Testimonial retrieved successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update testimonial (admin)
 * PATCH /api/testimonials/:id
 */
const updateTestimonial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await TestimonialService.updateTestimonial(req.params.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Testimonial updated successfully',
            data,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete testimonial (admin)
 * DELETE /api/testimonials/:id
 */
const deleteTestimonial = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await TestimonialService.deleteTestimonial(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Testimonial deleted successfully',
            data: null,
        });
    } catch (error) {
        next(error);
    }
};

export const TestimonialController = {
    createTestimonial,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonial,
    deleteTestimonial,
};
