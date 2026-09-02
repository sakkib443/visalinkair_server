// ===================================================================
// visalinkair LMS - Blog Service
// Business logic for Blog module
// ব্লগ মডিউলের বিজনেস লজিক
// ===================================================================

import { Types } from 'mongoose';
import { Blog, BlogComment } from './blog.model';
import { IBlog, IBlogFilters, IBlogComment } from './blog.interface';
import AppError from '../../utils/AppError';
import { User } from '../user/user.model';
// NotificationService removed - module does not exist yet

/**
 * Generate URL-friendly slug from title
 */
const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// ===================================================================
// Auto-SEO helpers
//
// The admin can type Meta Title / Description / Keywords by hand; if
// they leave a field blank, we derive a sensible default so every post
// still ships proper OG/Twitter/head metadata. Called on both create
// and update — never overwrites a value the admin actually typed.
// ===================================================================

/** Strip HTML tags + collapse whitespace so a rich-text `content` can
 *  seed a meta description without embedded markup. */
const stripHtml = (html: string): string =>
    (html || '')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ')
        .replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#\d+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

/** Naïve English stop-word list — enough to filter obvious noise words
 *  when we derive keywords from title + content. */
const STOP_WORDS = new Set([
    'a','an','the','and','or','but','if','then','for','of','to','in','on','at','by','with','from','as','is','are','was','were','be','been','being','it','its','this','that','these','those','you','your','we','our','i','my','me','he','she','they','their','them','so','not','no','do','does','did','can','could','should','would','will','shall','may','might','have','has','had','also','just','than','very','too','only','more','most','some','any','each','all','one','two','three',
]);

/**
 * Build up to `max` unique keyword phrases from a post's own text.
 * We prefer explicit tags first (highest-signal), then fall back to
 * the most-frequent non-stop words from the title + excerpt.
 */
const deriveKeywords = (
    { title, excerpt, tags }: { title?: string; excerpt?: string; tags?: string[] },
    max = 8
): string[] => {
    const out = new Set<string>();
    (tags || []).forEach((t) => { const s = String(t).trim().toLowerCase(); if (s) out.add(s); });
    if (out.size >= max) return [...out].slice(0, max);

    const bag = `${title || ''} ${excerpt || ''}`.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
    const freq: Record<string, number> = {};
    for (const word of bag.split(/\s+/)) {
        if (word.length < 4 || STOP_WORDS.has(word)) continue;
        freq[word] = (freq[word] || 0) + 1;
    }
    Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .forEach(([w]) => { if (out.size < max) out.add(w); });

    return [...out].slice(0, max);
};

/** Fill in any empty SEO field from title / excerpt / content / tags.
 *  Admin-typed values are never overwritten — the check is on
 *  emptiness, not on absence. */
const applyAutoSeo = <T extends {
    title?: string; excerpt?: string; content?: string; tags?: string[];
    metaTitle?: string; metaDescription?: string; metaKeywords?: string[];
}>(payload: T): T => {
    const p: T = { ...payload };
    const trimmed = (v?: string) => (typeof v === 'string' ? v.trim() : '');
    const contentPlain = stripHtml(p.content || '');

    if (!trimmed(p.metaTitle) && trimmed(p.title)) {
        // 70-char SEO ceiling — clip at word boundary if we overshoot.
        p.metaTitle = p.title!.length > 70
            ? p.title!.slice(0, 67).replace(/\s+\S*$/, '') + '…'
            : p.title;
    }
    if (!trimmed(p.metaDescription)) {
        const source = trimmed(p.excerpt) || contentPlain;
        if (source) {
            p.metaDescription = source.length > 158
                ? source.slice(0, 155).replace(/\s+\S*$/, '') + '…'
                : source;
        }
    }
    if (!p.metaKeywords || p.metaKeywords.length === 0) {
        const kw = deriveKeywords({
            title: p.title,
            excerpt: p.excerpt || contentPlain.slice(0, 500),
            tags: p.tags,
        });
        if (kw.length) p.metaKeywords = kw;
    }
    return p;
};

/**
 * Create a new blog
 * নতুন ব্লগ তৈরি করা
 */
const createBlog = async (payload: Partial<IBlog>, userId: string, userRole: string): Promise<IBlog> => {
    // Generate slug from title
    let slug = generateSlug(payload.title || '');

    // Check if slug already exists, if so append a number
    let existingBlog = await Blog.findOne({ slug });
    let counter = 1;
    while (existingBlog) {
        slug = `${generateSlug(payload.title || '')}-${counter}`;
        existingBlog = await Blog.findOne({ slug });
        counter++;
    }

    // Auto-fill any empty SEO field before we build the persist payload.
    // The admin's explicit values (if any) are preserved; only blanks are
    // derived from title / excerpt / content / tags.
    const withSeo = applyAutoSeo(payload);

    // Whitelist only user-settable fields from the payload. Auto-managed stat
    // fields (totalViews, likeCount, likedBy, commentCount, shareCount,
    // readingTime, wordCount, publishedAt) must NOT be set from the request body.
    const blogData: Partial<IBlog> = {
        title: withSeo.title,
        titleBn: withSeo.titleBn,
        excerpt: withSeo.excerpt,
        excerptBn: withSeo.excerptBn,
        content: withSeo.content,
        contentBn: withSeo.contentBn,
        thumbnail: withSeo.thumbnail,
        images: withSeo.images,
        videoUrl: withSeo.videoUrl,
        category: withSeo.category,
        tags: withSeo.tags,
        status: withSeo.status,
        isFeatured: withSeo.isFeatured,
        isPopular: withSeo.isPopular,
        allowComments: withSeo.allowComments,
        metaTitle: withSeo.metaTitle,
        metaDescription: withSeo.metaDescription,
        metaKeywords: withSeo.metaKeywords,
        slug,
        author: new Types.ObjectId(userId),
        authorRole: 'super_admin',
    };

    const blog = await Blog.create(blogData);

    // TODO: Add notification when notification module is created
    // if (blog.status === 'published') {
    //     const author = await User.findById(userId);
    //     if (author) { ... }
    // }

    return blog;
};

/**
 * Get all blogs with filters and pagination
 * ফিল্টার ও পেজিনেশন সহ সব ব্লগ পাওয়া
 */
const getAllBlogs = async (
    filters: IBlogFilters,
    paginationOptions: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }
) => {
    const {
        searchTerm,
        category,
        status,
        author,
        authorRole,
        isFeatured,
        isPopular,
        tags,
    } = filters;

    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = paginationOptions;

    // Build query conditions
    const conditions: any[] = [];

    // Search term - search in title, content, tags
    if (searchTerm) {
        conditions.push({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { titleBn: { $regex: searchTerm, $options: 'i' } },
                { content: { $regex: searchTerm, $options: 'i' } },
                { excerpt: { $regex: searchTerm, $options: 'i' } },
                { tags: { $in: [new RegExp(searchTerm, 'i')] } },
            ],
        });
    }

    // Category filter
    if (category) {
        conditions.push({ category: category });
    }

    // Status filter
    if (status) {
        conditions.push({ status: status });
    }

    // Author filter
    if (author) {
        conditions.push({ author: author });
    }

    // Author role filter
    if (authorRole) {
        conditions.push({ authorRole: authorRole });
    }

    // Featured filter
    if (isFeatured !== undefined) {
        conditions.push({ isFeatured: isFeatured });
    }

    // Popular filter
    if (isPopular !== undefined) {
        conditions.push({ isPopular: isPopular });
    }

    // Tags filter
    if (tags && tags.length > 0) {
        conditions.push({ tags: { $in: tags } });
    }

    // Combine all conditions
    const whereCondition = conditions.length > 0 ? { $and: conditions } : {};

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Sort configuration
    const sortConfig: any = {};
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const blogs = await Blog.find(whereCondition)
        .populate('category', 'name nameEn icon')
        .populate('author', 'firstName lastName avatar')
        .sort(sortConfig)
        .skip(skip)
        .limit(limit)
        .lean();

    // Get total count
    const total = await Blog.countDocuments(whereCondition);

    return {
        data: blogs,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get single blog by ID
 * ID দিয়ে একটি ব্লগ পাওয়া
 */
const getBlogById = async (id: string): Promise<IBlog | any | null> => {
    const blog = await Blog.findById(id)
        .populate('category', 'name nameEn icon')
        .populate('author', 'firstName lastName avatar email')
        .lean();

    if (!blog) {
        throw new AppError(404, 'Blog not found');
    }

    return blog;
};

/**
 * Get blog by slug (public access)
 * Slug দিয়ে ব্লগ পাওয়া (public access এর জন্য)
 */
const getBlogBySlug = async (slug: string): Promise<IBlog | any | null> => {
    const blog = await Blog.findOne({ slug, status: 'published' })
        .populate('category', 'name nameEn icon')
        .populate('author', 'firstName lastName avatar')
        .lean();

    if (!blog) {
        throw new AppError(404, 'Blog not found');
    }

    // Increment view count
    await Blog.findByIdAndUpdate(blog._id, { $inc: { totalViews: 1 } });

    // Get related blogs
    const relatedBlogs = await Blog.find({
        _id: { $ne: blog._id },
        status: 'published',
        $or: [
            { category: blog.category },
            { tags: { $in: blog.tags } },
        ],
    })
        .populate('author', 'firstName lastName avatar')
        .limit(4)
        .lean();

    return {
        ...blog,
        relatedBlogs,
    };
};

/**
 * Update blog
 * ব্লগ আপডেট করা
 */
const updateBlog = async (
    id: string,
    payload: Partial<IBlog>,
    userId: string,
    userRole: string
): Promise<IBlog | null> => {
    const blog = await Blog.findById(id);

    if (!blog) {
        throw new AppError(404, 'Blog not found');
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== userId && userRole !== 'super_admin') {
        throw new AppError(403, 'You are not authorized to update this blog');
    }

    // Whitelist only user-settable fields from the payload. Auto-managed stat
    // fields (totalViews, likeCount, likedBy, commentCount, shareCount,
    // readingTime, wordCount) and author/authorRole must NOT be updatable from
    // the request body. slug and publishedAt are derived below.
    const updateData: Partial<IBlog> = {};
    if (payload.title !== undefined) updateData.title = payload.title;
    if (payload.titleBn !== undefined) updateData.titleBn = payload.titleBn;
    if (payload.excerpt !== undefined) updateData.excerpt = payload.excerpt;
    if (payload.excerptBn !== undefined) updateData.excerptBn = payload.excerptBn;
    if (payload.content !== undefined) updateData.content = payload.content;
    if (payload.contentBn !== undefined) updateData.contentBn = payload.contentBn;
    if (payload.thumbnail !== undefined) updateData.thumbnail = payload.thumbnail;
    if (payload.images !== undefined) updateData.images = payload.images;
    if (payload.videoUrl !== undefined) updateData.videoUrl = payload.videoUrl;
    if (payload.category !== undefined) updateData.category = payload.category;
    if (payload.tags !== undefined) updateData.tags = payload.tags;
    if (payload.status !== undefined) updateData.status = payload.status;
    if (payload.isFeatured !== undefined) updateData.isFeatured = payload.isFeatured;
    if (payload.isPopular !== undefined) updateData.isPopular = payload.isPopular;
    if (payload.allowComments !== undefined) updateData.allowComments = payload.allowComments;
    if (payload.metaTitle !== undefined) updateData.metaTitle = payload.metaTitle;
    if (payload.metaDescription !== undefined) updateData.metaDescription = payload.metaDescription;
    if (payload.metaKeywords !== undefined) updateData.metaKeywords = payload.metaKeywords;

    // Auto-fill any SEO field the admin cleared. `applyAutoSeo` looks at the
    // merged post (existing values overlaid with this update) so if the
    // admin blanks out metaDescription we re-derive from the new content /
    // excerpt, not the stale one on disk.
    const merged = {
        title: updateData.title ?? blog.title,
        excerpt: updateData.excerpt ?? blog.excerpt,
        content: updateData.content ?? blog.content,
        tags: updateData.tags ?? blog.tags,
        metaTitle: updateData.metaTitle ?? blog.metaTitle,
        metaDescription: updateData.metaDescription ?? blog.metaDescription,
        metaKeywords: updateData.metaKeywords ?? blog.metaKeywords,
    };
    const seo = applyAutoSeo(merged);
    if (seo.metaTitle && !merged.metaTitle) updateData.metaTitle = seo.metaTitle;
    if (seo.metaDescription && !merged.metaDescription) updateData.metaDescription = seo.metaDescription;
    if (seo.metaKeywords && (!merged.metaKeywords || merged.metaKeywords.length === 0)) {
        updateData.metaKeywords = seo.metaKeywords;
    }

    // If title is being updated, update slug too
    if (payload.title && payload.title !== blog.title) {
        let newSlug = generateSlug(payload.title);
        const existingBlog = await Blog.findOne({ slug: newSlug, _id: { $ne: id } });
        if (existingBlog) {
            newSlug = `${newSlug}-${Date.now()}`;
        }
        updateData.slug = newSlug;
    }

    // Set publishedAt if status is being changed to published
    if (payload.status === 'published' && blog.status !== 'published') {
        updateData.publishedAt = new Date();
    }

    const updatedBlog = await Blog.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).populate('category', 'name nameEn icon').populate('author', 'firstName lastName avatar');

    return updatedBlog;
};

/**
 * Delete blog
 * ব্লগ ডিলিট করা
 */
const deleteBlog = async (id: string, userId: string, userRole: string): Promise<IBlog | null> => {
    const blog = await Blog.findById(id);

    if (!blog) {
        throw new AppError(404, 'Blog not found');
    }

    // Check if user is the author or admin
    if (blog.author.toString() !== userId && userRole !== 'super_admin') {
        throw new AppError(403, 'You are not authorized to delete this blog');
    }

    // Delete all comments associated with the blog
    await BlogComment.deleteMany({ blog: id });

    const deletedBlog = await Blog.findByIdAndDelete(id);
    return deletedBlog;
};

/**
 * Get featured blogs
 * ফিচার্ড ব্লগ পাওয়া
 */
const getFeaturedBlogs = async (limit: number = 6): Promise<IBlog[]> => {
    const blogs = await Blog.find({ isFeatured: true, status: 'published' })
        .populate('category', 'name nameEn icon')
        .populate('author', 'firstName lastName avatar')
        .sort({ publishedAt: -1 })
        .limit(limit);

    return blogs;
};

/**
 * Get popular blogs
 * জনপ্রিয় ব্লগ পাওয়া (by views)
 */
const getPopularBlogs = async (limit: number = 6): Promise<IBlog[]> => {
    const blogs = await Blog.find({ status: 'published' })
        .populate('category', 'name nameEn icon')
        .populate('author', 'firstName lastName avatar')
        .sort({ totalViews: -1, likeCount: -1 })
        .limit(limit);

    return blogs;
};

/**
 * Get recent blogs
 * সাম্প্রতিক ব্লগ পাওয়া
 */
const getRecentBlogs = async (limit: number = 6): Promise<IBlog[]> => {
    const blogs = await Blog.find({ status: 'published' })
        .populate('category', 'name nameEn icon')
        .populate('author', 'firstName lastName avatar')
        .sort({ publishedAt: -1 })
        .limit(limit);

    return blogs;
};

/**
 * Get blogs by category
 * ক্যাটাগরি অনুযায়ী ব্লগ পাওয়া
 */
const getBlogsByCategory = async (
    categoryId: string,
    paginationOptions: { page?: number; limit?: number }
) => {
    const { page = 1, limit = 10 } = paginationOptions;
    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ category: categoryId, status: 'published' })
        .populate('category', 'name nameEn icon')
        .populate('author', 'firstName lastName avatar')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Blog.countDocuments({ category: categoryId, status: 'published' });

    return {
        data: blogs,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Get blogs by author
 * লেখক অনুযায়ী ব্লগ পাওয়া
 */
const getBlogsByAuthor = async (
    authorId: string,
    paginationOptions: { page?: number; limit?: number },
    includeAll: boolean = false
) => {
    const { page = 1, limit = 10 } = paginationOptions;
    const skip = (page - 1) * limit;

    const condition = includeAll
        ? { author: authorId }
        : { author: authorId, status: 'published' };

    const blogs = await Blog.find(condition)
        .populate('category', 'name nameEn icon')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Blog.countDocuments(condition);

    return {
        data: blogs,
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Toggle like for a blog
 * ব্লগে লাইক টগল করা
 */
const toggleLike = async (id: string, userId: string): Promise<{ isLiked: boolean; likeCount: number }> => {
    const blog = await Blog.findById(id);

    if (!blog) {
        throw new AppError(404, 'Blog not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const likedBy = blog.likedBy || [];
    const isAlreadyLiked = likedBy.some(likedUserId => likedUserId.equals(userObjectId));

    if (isAlreadyLiked) {
        // Unlike
        await Blog.findByIdAndUpdate(id, {
            $pull: { likedBy: userObjectId },
            $inc: { likeCount: -1 }
        });

        const updated = await Blog.findById(id).select('likeCount');
        return { isLiked: false, likeCount: Math.max(0, updated?.likeCount || 0) };
    } else {
        // Like
        await Blog.findByIdAndUpdate(id, {
            $addToSet: { likedBy: userObjectId },
            $inc: { likeCount: 1 }
        });

        const updated = await Blog.findById(id).select('likeCount');
        return { isLiked: true, likeCount: updated?.likeCount || 0 };
    }
};

/**
 * Increment share count
 * শেয়ার কাউন্ট বাড়ানো
 */
const incrementShareCount = async (id: string): Promise<void> => {
    await Blog.findByIdAndUpdate(id, { $inc: { shareCount: 1 } });
};

// ==================== Comment Methods ====================

/**
 * Add comment to blog
 * ব্লগে কমেন্ট করা
 */
const addComment = async (
    blogId: string,
    userId: string,
    content: string,
    parentCommentId?: string
): Promise<IBlogComment> => {
    const blog = await Blog.findById(blogId);

    if (!blog) {
        throw new AppError(404, 'Blog not found');
    }

    if (!blog.allowComments) {
        throw new AppError(400, 'Comments are disabled for this blog');
    }

    const commentData: Partial<IBlogComment> = {
        blog: new Types.ObjectId(blogId),
        user: new Types.ObjectId(userId),
        content,
    };

    if (parentCommentId) {
        commentData.parentComment = new Types.ObjectId(parentCommentId);
    }

    const comment = await BlogComment.create(commentData);

    // Update comment count
    await Blog.findByIdAndUpdate(blogId, { $inc: { commentCount: 1 } });

    // Populate user info
    await comment.populate('user', 'firstName lastName avatar');

    return comment;
};

/**
 * Get comments for a blog
 * ব্লগের কমেন্ট পাওয়া
 */
const getComments = async (blogId: string): Promise<IBlogComment[]> => {
    const comments = await BlogComment.find({ blog: blogId, isApproved: true, parentComment: { $exists: false } })
        .populate('user', 'firstName lastName avatar')
        .sort({ createdAt: -1 });

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
            const replies = await BlogComment.find({ parentComment: comment._id, isApproved: true })
                .populate('user', 'firstName lastName avatar')
                .sort({ createdAt: 1 });

            return {
                ...comment.toObject(),
                replies,
            };
        })
    );

    return commentsWithReplies as any;
};

/**
 * Delete comment
 * কমেন্ট ডিলিট করা
 */
const deleteComment = async (
    commentId: string,
    userId: string,
    userRole: string
): Promise<void> => {
    const comment = await BlogComment.findById(commentId);

    if (!comment) {
        throw new AppError(404, 'Comment not found');
    }

    // Check if user is the commenter or admin
    if (comment.user.toString() !== userId && userRole !== 'super_admin') {
        throw new AppError(403, 'You are not authorized to delete this comment');
    }

    // Delete replies too
    await BlogComment.deleteMany({ parentComment: commentId });
    await BlogComment.findByIdAndDelete(commentId);

    // Update comment count
    await Blog.findByIdAndUpdate(comment.blog, { $inc: { commentCount: -1 } });
};

export const BlogService = {
    createBlog,
    getAllBlogs,
    getBlogById,
    getBlogBySlug,
    updateBlog,
    deleteBlog,
    getFeaturedBlogs,
    getPopularBlogs,
    getRecentBlogs,
    getBlogsByCategory,
    getBlogsByAuthor,
    toggleLike,
    incrementShareCount,
    addComment,
    getComments,
    deleteComment,
};
