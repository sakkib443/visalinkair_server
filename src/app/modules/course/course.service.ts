// ===================================================================
// Visalink Air - Course Service
// Business logic for Course + CourseCategory
// কোর্স ও কোর্স ক্যাটাগরির বিজনেস লজিক
// ===================================================================

import { Course, CourseCategory } from './course.model';
import { ICourse, ICourseCategory, ICourseFilters } from './course.interface';
import AppError from '../../utils/AppError';

/**
 * Generate URL-friendly slug from a title/name.
 * বাংলা টাইটেলে ASCII কিছুই থাকে না — তখন slug খালি হয়ে যেত আর unique
 * index-এ দ্বিতীয় কোর্সটাই আটকে যেত। তাই খালি হলে একটা fallback বসানো হয়।
 */
const generateSlug = (input: string, fallback = 'item'): string => {
    const slug = input
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

    return slug || fallback;
};

/**
 * একই slug থাকলে -2, -3 ... করে ইউনিক slug বের করে।
 * excludeId থাকলে নিজের ডকুমেন্টটাকে সংঘর্ষ হিসেবে ধরা হয় না (edit-এর সময়)।
 */
const makeUniqueSlug = async (
    model: typeof Course | typeof CourseCategory,
    base: string,
    excludeId?: string
): Promise<string> => {
    let slug = base;
    let counter = 2;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const query: Record<string, unknown> = { slug };
        if (excludeId) query._id = { $ne: excludeId };

        const existing = await (model as typeof Course).findOne(query).select('_id').lean();
        if (!existing) return slug;

        slug = `${base}-${counter}`;
        counter += 1;
    }
};

/**
 * `availableSeats` মডেলে virtual হিসেবে আছে, কিন্তু `.lean()` virtual চালায় না
 * (তার জন্য mongoose-lean-virtuals প্লাগইন লাগে, যেটা এই প্রজেক্টে নেই)।
 * তাই lean রেজাল্টে ফিল্ডটা এখানে হাতে বসিয়ে দেওয়া হয়, যাতে ক্লায়েন্ট
 * সবসময় একই আকারের ডাটা পায় — lean হোক বা না হোক।
 */
const withSeats = <T extends { totalSeats?: number; enrolledCount?: number }>(
    course: T
): T & { availableSeats: number } => ({
    ...course,
    availableSeats: Math.max(0, (course.totalSeats || 0) - (course.enrolledCount || 0)),
});

// ===================================================================
//                        COURSE CATEGORIES
// ===================================================================

/**
 * Create a category (admin — কোর্স ফর্মের উপর থেকেই ডাইনামিকভাবে তৈরি হয়)
 */
const createCategory = async (
    payload: Partial<ICourseCategory>
): Promise<ICourseCategory> => {
    const name = (payload.name || '').trim();

    // একই নামের ক্যাটাগরি দুবার তৈরি হলে ড্রপডাউনে ডুপ্লিকেট দেখাত —
    // তাই নাম ধরে (case-insensitive) আগেই আটকে দেওয়া হচ্ছে।
    const duplicate = await CourseCategory.findOne({
        name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    }).lean();
    if (duplicate) {
        throw new AppError(409, 'A category with this name already exists');
    }

    const slug = await makeUniqueSlug(CourseCategory, generateSlug(name, 'category'));
    const category = await CourseCategory.create({ ...payload, name, slug });
    return category;
};

/**
 * Get all categories.
 * includeInactive শুধু অ্যাডমিনের জন্য — ভিজিটর কেবল active গুলোই পায়।
 */
const getAllCategories = async (includeInactive = false): Promise<ICourseCategory[]> => {
    const where = includeInactive ? {} : { isActive: true };
    return CourseCategory.find(where).sort({ order: 1, name: 1 }).lean();
};

const getCategoryById = async (id: string): Promise<ICourseCategory> => {
    const category = await CourseCategory.findById(id).lean();
    if (!category) throw new AppError(404, 'Category not found');
    return category;
};

const updateCategory = async (
    id: string,
    payload: Partial<ICourseCategory>
): Promise<ICourseCategory | null> => {
    const category = await CourseCategory.findById(id);
    if (!category) throw new AppError(404, 'Category not found');

    // Whitelist — `slug` সার্ভার নিজে বানায়, `_id`/timestamps কখনোই
    // রিকোয়েস্ট বডি থেকে সেট হতে দেওয়া যাবে না।
    const allowedFields: (keyof ICourseCategory)[] = [
        'name', 'description', 'icon', 'isActive', 'order',
    ];

    const updateData: Partial<ICourseCategory> = {};
    for (const field of allowedFields) {
        if (payload[field] !== undefined) {
            (updateData as Record<string, unknown>)[field] = payload[field];
        }
    }

    if (payload.name && payload.name.trim() !== category.name) {
        const name = payload.name.trim();
        const duplicate = await CourseCategory.findOne({
            _id: { $ne: id },
            name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
        }).lean();
        if (duplicate) {
            throw new AppError(409, 'A category with this name already exists');
        }
        updateData.name = name;
        updateData.slug = await makeUniqueSlug(
            CourseCategory,
            generateSlug(name, 'category'),
            id
        );
    }

    return CourseCategory.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
};

/**
 * Delete a category.
 * কোনো কোর্স ওই ক্যাটাগরিতে থাকলে ডিলিট আটকে দেওয়া হয় — নাহলে ওই
 * কোর্সগুলোর category রেফারেন্স ভেঙে যেত আর লিস্টে ক্যাটাগরি ফাঁকা দেখাত।
 */
const deleteCategory = async (id: string): Promise<ICourseCategory | null> => {
    const category = await CourseCategory.findById(id);
    if (!category) throw new AppError(404, 'Category not found');

    const usedBy = await Course.countDocuments({ category: id });
    if (usedBy > 0) {
        throw new AppError(
            400,
            `This category is used by ${usedBy} course${usedBy > 1 ? 's' : ''}. Move or delete those courses first.`
        );
    }

    return CourseCategory.findByIdAndDelete(id);
};

// ===================================================================
//                             COURSES
// ===================================================================

/**
 * ক্যাটাগরি আইডিটা সত্যিই আছে কিনা দেখে নেওয়া — না দেখলে মুছে ফেলা
 * ক্যাটাগরির আইডি দিয়েও কোর্স সেভ হয়ে যেত আর populate-এ null আসত।
 */
const assertCategoryExists = async (categoryId: string): Promise<void> => {
    const exists = await CourseCategory.exists({ _id: categoryId });
    if (!exists) throw new AppError(404, 'Selected category no longer exists');
};

/**
 * Create a new course
 */
const createCourse = async (payload: Partial<ICourse>): Promise<ICourse> => {
    await assertCategoryExists(String(payload.category));

    const slug = await makeUniqueSlug(Course, generateSlug(payload.title || '', 'course'));

    // অনলাইন কোর্সে লোকেশনের কোনো মানে নেই — আগে অফলাইন বেছে লোকেশন
    // লিখে পরে অনলাইন করলে পুরোনো লেখাটা যেন সাথে সেভ না হয়।
    const courseData: Partial<ICourse> = { ...payload, slug };
    if (courseData.courseType === 'online') {
        courseData.location = '';
    }

    const course = await Course.create(courseData);
    return course.populate('category', 'name slug icon');
};

/**
 * Get all courses with filters and pagination
 */
const getAllCourses = async (
    filters: ICourseFilters,
    paginationOptions: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }
) => {
    const {
        searchTerm, isActive, isFeatured, category,
        courseType, status, level, minPrice, maxPrice,
    } = filters;
    const { page = 1, limit = 200, sortBy = 'order', sortOrder = 'asc' } = paginationOptions;

    const conditions: Record<string, unknown>[] = [];

    if (searchTerm) {
        conditions.push({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { shortDescription: { $regex: searchTerm, $options: 'i' } },
                { instructor: { $regex: searchTerm, $options: 'i' } },
                { location: { $regex: searchTerm, $options: 'i' } },
            ],
        });
    }

    if (isActive !== undefined) conditions.push({ isActive });
    if (isFeatured !== undefined) conditions.push({ isFeatured });
    if (category) conditions.push({ category });
    if (courseType) conditions.push({ courseType });
    if (status) conditions.push({ status });
    if (level) conditions.push({ level });
    if (minPrice !== undefined) conditions.push({ price: { $gte: minPrice } });
    if (maxPrice !== undefined) conditions.push({ price: { $lte: maxPrice } });

    const whereCondition = conditions.length > 0 ? { $and: conditions } : {};
    const skip = (page - 1) * limit;
    const sortConfig: Record<string, 1 | -1> = {};
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const courses = await Course.find(whereCondition)
        .populate('category', 'name slug icon')
        .sort(sortConfig)
        .skip(skip)
        .limit(limit)
        .lean();

    const total = await Course.countDocuments(whereCondition);

    return {
        data: courses.map(withSeats),
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get single course by ID.
 * ভিজিটর কেবল active কোর্স দেখে; অ্যাডমিন ড্যাশবোর্ড includeInactive পাঠায়
 * যাতে বন্ধ করে রাখা কোর্সও এডিট ফর্মে লোড করা যায়।
 */
const getCourseById = async (id: string, includeInactive = false): Promise<ICourse> => {
    const course = await Course.findById(id)
        .populate('category', 'name slug icon')
        .lean();

    if (!course || (!includeInactive && !course.isActive)) {
        throw new AppError(404, 'Course not found');
    }
    return withSeats(course) as ICourse;
};

/**
 * Get course by slug (public detail page)
 */
const getCourseBySlug = async (slug: string): Promise<ICourse> => {
    const course = await Course.findOne({ slug, isActive: true })
        .populate('category', 'name slug icon')
        .lean();

    if (!course) throw new AppError(404, 'Course not found');
    return withSeats(course) as ICourse;
};

/**
 * Update course
 */
const updateCourse = async (
    id: string,
    payload: Partial<ICourse>
): Promise<ICourse | null> => {
    const course = await Course.findById(id);
    if (!course) throw new AppError(404, 'Course not found');

    if (payload.category !== undefined) {
        await assertCategoryExists(String(payload.category));
    }

    // Whitelist: শুধু এই ফিল্ডগুলোই রিকোয়েস্ট বডি থেকে সেট হতে পারে।
    // `slug` সার্ভার নিজে হিসাব করে (নিচে), আর `_id`/timestamps কখনোই নয়।
    const allowedFields: (keyof ICourse)[] = [
        'title', 'image', 'gallery',
        'category',
        'shortDescription', 'longDescription',
        'courseType', 'location',
        'totalSeats', 'enrolledCount',
        'duration', 'startDate', 'classSchedule',
        'instructor', 'instructorTitle',
        'price', 'oldPrice', 'currency',
        'level', 'language', 'tags',
        'metaTitle', 'metaDescription',
        'status', 'isActive', 'isFeatured', 'order',
    ];

    const updateData: Partial<ICourse> = {};
    for (const field of allowedFields) {
        if (payload[field] !== undefined) {
            (updateData as Record<string, unknown>)[field] = payload[field];
        }
    }

    // courseType না পাঠালে সেভ করা মানটাই কার্যকর থাকে — সেই অবস্থায় ফাঁকা
    // লোকেশন পাঠিয়ে অফলাইন কোর্সকে লোকেশনহীন করে ফেলা যাবে না।
    const effectiveType = updateData.courseType ?? course.courseType;
    const effectiveLocation =
        updateData.location !== undefined ? updateData.location : course.location;

    if (effectiveType === 'offline' && !String(effectiveLocation || '').trim()) {
        throw new AppError(400, 'Location is required for an offline course');
    }

    // অনলাইনে ফিরে গেলে পুরোনো ঠিকানা মুছে যাবে
    if (effectiveType === 'online') {
        updateData.location = '';
    }

    // Slug টাইটেল বদলালে নতুন করে বানানো হয় (সার্ভার-কম্পিউটেড, ক্লায়েন্ট থেকে নয়)
    if (payload.title && payload.title !== course.title) {
        updateData.slug = await makeUniqueSlug(
            Course,
            generateSlug(payload.title, 'course'),
            id
        );
    }

    return Course.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).populate('category', 'name slug icon');
};

/**
 * Delete course
 */
const deleteCourse = async (id: string): Promise<ICourse | null> => {
    const course = await Course.findById(id);
    if (!course) throw new AppError(404, 'Course not found');
    return Course.findByIdAndDelete(id);
};

/**
 * Get active courses (public listing)
 */
const getActiveCourses = async (): Promise<ICourse[]> => {
    const courses = await Course.find({ isActive: true })
        .populate('category', 'name slug icon')
        .sort({ order: 1, createdAt: -1 })
        .lean();
    return courses.map(withSeats) as ICourse[];
};

/**
 * Get featured courses (homepage)
 */
const getFeaturedCourses = async (): Promise<ICourse[]> => {
    const courses = await Course.find({ isActive: true, isFeatured: true })
        .populate('category', 'name slug icon')
        .sort({ order: 1 })
        .lean();
    return courses.map(withSeats) as ICourse[];
};

export const CourseService = {
    // Categories
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
    // Courses
    createCourse,
    getAllCourses,
    getCourseById,
    getCourseBySlug,
    updateCourse,
    deleteCourse,
    getActiveCourses,
    getFeaturedCourses,
};
