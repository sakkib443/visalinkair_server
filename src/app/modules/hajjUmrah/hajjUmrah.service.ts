import { IHajjUmrah, IHajjUmrahFilters } from './hajjUmrah.interface';
import { HajjUmrah } from './hajjUmrah.model';
import AppError from '../../utils/AppError';

const generateSlug = (name: string): string => {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// Whitelist: only these schema-defined fields may be set from the request body.
// `slug` is generated server-side; `_id`/timestamps are managed by Mongoose.
// This prevents arbitrary mass-assignment from the raw client payload.
const ALLOWED_FIELDS: (keyof IHajjUmrah)[] = [
    'name', 'nameBn', 'type', 'subtitle', 'subtitleBn', 'image',
    'duration', 'durationBn', 'price', 'oldPrice', 'currency', 'groupSize',
    'bookings', 'departureDate', 'departureDates', 'hotel', 'hotelBn',
    'distance', 'distanceBn', 'meals', 'mealsBn', 'description', 'descriptionBn',
    'longDescription', 'longDescriptionBn', 'features', 'featuresBn', 'excludes',
    'excludesBn', 'tags', 'isPopular', 'status', 'isActive', 'isFeatured',
    'order', 'metaTitle', 'metaDescription',
];

const pickAllowedFields = (payload: Partial<IHajjUmrah>): Partial<IHajjUmrah> => {
    const data: Partial<IHajjUmrah> = {};
    for (const field of ALLOWED_FIELDS) {
        if (payload[field] !== undefined) {
            (data as Record<string, unknown>)[field] = payload[field];
        }
    }
    return data;
};

const createPackage = async (payload: IHajjUmrah): Promise<IHajjUmrah> => {
    const data = pickAllowedFields(payload) as IHajjUmrah;
    let slug = generateSlug(data.name);
    const existing = await HajjUmrah.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;
    data.slug = slug;
    return await HajjUmrah.create(data);
};

const getAllPackages = async (filters: IHajjUmrahFilters, page = 1, limit = 200) => {
    const query: any = {};
    if (filters.searchTerm) {
        query.$or = [
            { name: { $regex: filters.searchTerm, $options: 'i' } },
            { nameBn: { $regex: filters.searchTerm, $options: 'i' } },
            { hotel: { $regex: filters.searchTerm, $options: 'i' } },
        ];
    }
    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.isFeatured !== undefined) query.isFeatured = filters.isFeatured;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        HajjUmrah.find(query).sort({ order: 1, createdAt: -1 }).skip(skip).limit(limit).lean(),
        HajjUmrah.countDocuments(query),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

const getPackageById = async (id: string): Promise<IHajjUmrah> => {
    const pkg = await HajjUmrah.findById(id).lean();
    if (!pkg) throw new AppError(404, 'Package not found');
    return pkg;
};

const getPackageBySlug = async (slug: string): Promise<IHajjUmrah> => {
    const pkg = await HajjUmrah.findOne({ slug }).lean();
    if (!pkg) throw new AppError(404, 'Package not found');
    return pkg;
};

const updatePackage = async (id: string, payload: Partial<IHajjUmrah>): Promise<IHajjUmrah> => {
    const data = pickAllowedFields(payload);
    if (data.name) data.slug = generateSlug(data.name);
    const pkg = await HajjUmrah.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
    if (!pkg) throw new AppError(404, 'Package not found');
    return pkg;
};

const deletePackage = async (id: string): Promise<IHajjUmrah> => {
    const pkg = await HajjUmrah.findByIdAndDelete(id).lean();
    if (!pkg) throw new AppError(404, 'Package not found');
    return pkg;
};

const getActivePackages = async () => {
    return await HajjUmrah.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
};

const getFeaturedPackages = async () => {
    return await HajjUmrah.find({ isActive: true, isFeatured: true }).sort({ order: 1 }).lean();
};

const getByType = async (type: string) => {
    return await HajjUmrah.find({ isActive: true, type }).sort({ order: 1, createdAt: -1 }).lean();
};

export const HajjUmrahService = {
    createPackage,
    getAllPackages,
    getPackageById,
    getPackageBySlug,
    updatePackage,
    deletePackage,
    getActivePackages,
    getFeaturedPackages,
    getByType,
};
