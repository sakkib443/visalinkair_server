// ===================================================================
// Visalink Air - Visa Guide Service
// Business logic for the Visa Guide module
// ভিসা গাইড মডিউলের বিজনেস লজিক
// ===================================================================

import { VisaGuide } from './visaGuide.model';
import { IVisaGuide, IVisaGuideFilters, TVisaGuideCategory } from './visaGuide.interface';
import AppError from '../../utils/AppError';

/**
 * URL-friendly slug from a country name. "Côte d'Ivoire" → "cote-divoire".
 */
const generateSlug = (name: string): string =>
    name
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')   // strip accents: é -> e
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .trim();

/**
 * Defence-in-depth scrub of the admin-authored HTML body.
 *
 * Only an authenticated super_admin can reach this, so this is not the
 * primary trust boundary — but a stored <script> would execute for every
 * visitor of the public page, which is far too costly a blast radius to
 * leave to "the author is trusted". Strips executable vectors while
 * leaving all presentational markup the editor produces untouched.
 */
const sanitizeContent = (html: string): string => {
    if (!html) return '';
    return html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, '')
        .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe\s*>/gi, '')
        .replace(/<object\b[^>]*>[\s\S]*?<\/object\s*>/gi, '')
        .replace(/<embed\b[^>]*>/gi, '')
        // inline event handlers:  onclick="…"  onerror='…'  onload=…
        .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
        // javascript: / data:text/html in href & src
        .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1="#"')
        .replace(/(href|src)\s*=\s*("|')\s*data:text\/html[^"']*\2/gi, '$1="#"');
};

/**
 * Create a visa guide.
 * A country can only have one guide per category — the compound unique
 * index enforces it, and we pre-check so the client gets a readable
 * message instead of a raw E11000.
 */
const createVisaGuide = async (payload: Partial<IVisaGuide>): Promise<IVisaGuide> => {
    const countrySlug = generateSlug(payload.country || '');
    if (!countrySlug) {
        throw new AppError(400, 'Country name must contain at least one letter or number');
    }

    const duplicate = await VisaGuide.findOne({
        category: payload.category,
        countrySlug,
    });
    if (duplicate) {
        throw new AppError(
            409,
            `A ${payload.category} visa for "${payload.country}" already exists. Edit the existing entry instead.`
        );
    }

    return VisaGuide.create({
        ...payload,
        countrySlug,
        content: sanitizeContent(payload.content || ''),
    });
};

/**
 * Admin list — every guide, active or not, with filters + pagination.
 */
const getAllVisaGuides = async (
    filters: IVisaGuideFilters,
    paginationOptions: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }
) => {
    const { searchTerm, category, isActive } = filters;
    const { page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = paginationOptions;

    const conditions: Record<string, unknown>[] = [];

    if (searchTerm) {
        conditions.push({
            $or: [
                { country: { $regex: searchTerm, $options: 'i' } },
                { countryBn: { $regex: searchTerm, $options: 'i' } },
                { visaType: { $regex: searchTerm, $options: 'i' } },
            ],
        });
    }
    if (category) conditions.push({ category });
    if (isActive !== undefined) conditions.push({ isActive });

    const whereCondition = conditions.length > 0 ? { $and: conditions } : {};
    const skip = (page - 1) * limit;
    const sortConfig: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [data, total] = await Promise.all([
        VisaGuide.find(whereCondition).sort(sortConfig).skip(skip).limit(limit).lean(),
        VisaGuide.countDocuments(whereCondition),
    ]);

    return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
};

/**
 * Public country list for the client-side search dropdown.
 * Returns only active guides and only the fields the picker needs, so a
 * page of full HTML bodies never crosses the wire just to fill a combobox.
 */
const getPublicCountries = async (category?: TVisaGuideCategory) => {
    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = category;

    return VisaGuide.find(where)
        .select('country countryBn countrySlug flag category visaType processingTime')
        .sort({ order: 1, country: 1 })
        .lean();
};

/**
 * Public detail page. Inactive guides 404 rather than render — flipping
 * the toggle off in the admin must actually take the page down.
 */
const getPublicVisaGuide = async (
    category: TVisaGuideCategory,
    countrySlug: string
): Promise<IVisaGuide> => {
    const guide = await VisaGuide.findOne({
        category,
        countrySlug: countrySlug.toLowerCase(),
        isActive: true,
    }).lean();

    if (!guide) throw new AppError(404, 'Visa guide not found');
    return guide;
};

const getVisaGuideById = async (id: string): Promise<IVisaGuide> => {
    const guide = await VisaGuide.findById(id).lean();
    if (!guide) throw new AppError(404, 'Visa guide not found');
    return guide;
};

/**
 * Update. Fields are whitelisted — `countrySlug` is server-managed and
 * only recomputed when the country name itself changes.
 */
const updateVisaGuide = async (
    id: string,
    payload: Partial<IVisaGuide>
): Promise<IVisaGuide | null> => {
    const guide = await VisaGuide.findById(id);
    if (!guide) throw new AppError(404, 'Visa guide not found');

    const updateData: Partial<IVisaGuide> = {};
    const passthrough: (keyof IVisaGuide)[] = [
        'category', 'country', 'countryBn', 'flag',
        'visaType', 'processingTime', 'processingFee', 'embassyFee',
        'validity', 'stayDuration', 'entryType',
        'isActive', 'order', 'metaTitle', 'metaDescription',
    ];
    for (const key of passthrough) {
        if (payload[key] !== undefined) {
            (updateData as Record<string, unknown>)[key] = payload[key];
        }
    }
    if (payload.content !== undefined) {
        updateData.content = sanitizeContent(payload.content);
    }

    // Renaming the country (or moving it to the other category) changes
    // the public URL, so re-derive the slug and re-check uniqueness
    // against the *target* category — not the one it currently sits in.
    const nextCategory = updateData.category ?? guide.category;
    if (updateData.country && updateData.country !== guide.country) {
        updateData.countrySlug = generateSlug(updateData.country);
    }
    const nextSlug = updateData.countrySlug ?? guide.countrySlug;

    if (nextCategory !== guide.category || nextSlug !== guide.countrySlug) {
        const clash = await VisaGuide.findOne({
            category: nextCategory,
            countrySlug: nextSlug,
            _id: { $ne: id },
        });
        if (clash) {
            throw new AppError(
                409,
                `A ${nextCategory} visa for "${updateData.country || guide.country}" already exists.`
            );
        }
    }

    return VisaGuide.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Flip the public visibility switch and return the new state.
 * Reads the current value server-side rather than trusting a client-sent
 * boolean, so two admins toggling at once can't desync the row.
 */
const toggleVisaGuideStatus = async (id: string): Promise<IVisaGuide | null> => {
    const guide = await VisaGuide.findById(id);
    if (!guide) throw new AppError(404, 'Visa guide not found');

    guide.isActive = !guide.isActive;
    await guide.save();
    return guide;
};

const deleteVisaGuide = async (id: string): Promise<IVisaGuide | null> => {
    const guide = await VisaGuide.findById(id);
    if (!guide) throw new AppError(404, 'Visa guide not found');
    return VisaGuide.findByIdAndDelete(id);
};

export const VisaGuideService = {
    createVisaGuide,
    getAllVisaGuides,
    getPublicCountries,
    getPublicVisaGuide,
    getVisaGuideById,
    updateVisaGuide,
    toggleVisaGuideStatus,
    deleteVisaGuide,
};
