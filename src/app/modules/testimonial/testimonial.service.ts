// ===================================================================
// Visalink Air - Testimonial Service
// টেস্টিমোনিয়াল মডিউলের Business logic
// ===================================================================

import { Testimonial } from './testimonial.model';
import { ITestimonial, ITestimonialFilters } from './testimonial.interface';
import AppError from '../../utils/AppError';

export interface ITestimonialInput {
    name: string;
    message: string;
    rating?: number;
    role?: string;
    avatar?: string;
}

/**
 * Create testimonial (admin)
 */
const createTestimonial = async (payload: ITestimonialInput): Promise<ITestimonial> => {
    return Testimonial.create({
        name: payload.name,
        message: payload.message,
        rating: payload.rating ?? 5,
        role: payload.role || '',
        avatar: payload.avatar || '',
    });
};

/**
 * Get every testimonial, newest first.
 *
 * There is no approval workflow — whatever the admin adds is what the public
 * home page slider shows, so this single query serves both.
 */
const getAllTestimonials = async (
    filters: ITestimonialFilters = {}
): Promise<ITestimonial[]> => {
    const query: Record<string, unknown> = {};

    if (filters.searchTerm) {
        query.$or = [
            { name: { $regex: filters.searchTerm, $options: 'i' } },
            { role: { $regex: filters.searchTerm, $options: 'i' } },
            { message: { $regex: filters.searchTerm, $options: 'i' } },
        ];
    }

    return Testimonial.find(query).sort({ createdAt: -1 }).lean() as unknown as ITestimonial[];
};

/**
 * Get single testimonial
 */
const getTestimonialById = async (id: string): Promise<ITestimonial> => {
    const testimonial = await Testimonial.findById(id).lean();
    if (!testimonial) {
        throw new AppError(404, 'Testimonial not found');
    }
    return testimonial as unknown as ITestimonial;
};

/**
 * Update testimonial (admin)
 */
const updateTestimonial = async (
    id: string,
    payload: Partial<ITestimonialInput>
): Promise<ITestimonial> => {
    // Whitelist only the editable fields — never pass the raw payload through,
    // so createdAt / _id can't be overwritten from the request body.
    const updateData: Record<string, unknown> = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.message !== undefined) updateData.message = payload.message;
    if (payload.rating !== undefined) updateData.rating = payload.rating;
    if (payload.role !== undefined) updateData.role = payload.role;
    if (payload.avatar !== undefined) updateData.avatar = payload.avatar;

    const testimonial = await Testimonial.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
    if (!testimonial) {
        throw new AppError(404, 'Testimonial not found');
    }
    return testimonial;
};

/**
 * Delete testimonial
 */
const deleteTestimonial = async (id: string): Promise<void> => {
    const result = await Testimonial.findByIdAndDelete(id);
    if (!result) {
        throw new AppError(404, 'Testimonial not found');
    }
};

export const TestimonialService = {
    createTestimonial,
    getAllTestimonials,
    getTestimonialById,
    updateTestimonial,
    deleteTestimonial,
};
