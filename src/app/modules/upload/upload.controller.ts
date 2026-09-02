// ===================================================================
// Visalink Air Backend - Upload Controller
// Handle all image upload operations
//
// ফাইল এখন নিজের হোস্টিংয়ে জমা হয় (utils/fileStorage)। response shape
// আগের Cloudinary version-এর মতোই — { data: { url, filename } } — তাই
// ফ্রন্ট-এন্ডে কোনো পরিবর্তন লাগে না। শুধু url এখন relative (/uploads/...)।
// ===================================================================

import { Request, Response, NextFunction } from 'express';
import {
    uploadSingleImage,
    uploadWebsiteImages,
    uploadCategoryIcon,
    uploadPlatformIcon,
    uploadAvatar,
    uploadSoftwareImages,
    uploadDownloadFile,
    uploadApplicationDocument,
    saveImage,
    saveImages,
    archiveUrl,
    documentUrl,
    deleteByUrl,
} from '../../utils/fileStorage';

// আপলোড middleware-গুলো callback-style, আর ডিস্কে লেখা async — এই helper
// দুটোকে জুড়ে দেয় এবং ভাঙা ছবি/ডিস্ক error ধরে একই ফরম্যাটে জবাব দেয়।
type Handler = (req: Request, res: Response) => Promise<void>;

// multer-এর ডিফল্ট মেসেজ ("File too large") থেকে ইউজার বুঝতে পারে না কত
// পর্যন্ত চলবে, তাই সীমাটা মেসেজেই বলে দেওয়া হয়।
const uploadErrorMessage = (err: any, label: string): string => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
        const mb = err.field === 'avatar' || err.field === 'icon' ? 5 : 10;
        return `File is too large. Maximum size is ${mb}MB.`;
    }
    if (err?.code === 'LIMIT_FILE_COUNT' || err?.code === 'LIMIT_UNEXPECTED_FILE') {
        return 'Too many files, or the file field name is unexpected.';
    }
    return err?.message || `${label} failed`;
};

const withUpload =
    (middleware: any, label: string, handler: Handler) =>
        async (req: Request, res: Response, _next: NextFunction) => {
            middleware(req, res, async (err: any) => {
                if (err) {
                    return res.status(400).json({
                        success: false,
                        message: uploadErrorMessage(err, label),
                    });
                }

                try {
                    await handler(req, res);
                } catch (error: any) {
                    // sharp ভাঙা/অসমর্থিত ছবিতে throw করে, ডিস্ক ভরে গেলেও এখানে আসে।
                    console.error(`${label} error:`, error);
                    res.status(500).json({
                        success: false,
                        message: error?.message || `${label} failed`,
                    });
                }
            });
        };

const noFile = (res: Response, message: string) => {
    res.status(400).json({ success: false, message });
};

// ==================== Single Image Upload ====================
export const uploadImage = withUpload(uploadSingleImage, 'Image upload', async (req, res) => {
    if (!req.file) return noFile(res, 'No image file provided');

    const saved = await saveImage(req.file, 'general');

    res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: saved,
    });
});

// ==================== Multiple Images Upload ====================
export const uploadImages = withUpload(uploadWebsiteImages, 'Images upload', async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) return noFile(res, 'No image files provided');

    const saved = await saveImages(files, 'websites');

    res.status(200).json({
        success: true,
        message: 'Images uploaded successfully',
        data: saved,
    });
});

// ==================== Avatar Upload ====================
export const uploadUserAvatar = withUpload(uploadAvatar, 'Avatar upload', async (req, res) => {
    if (!req.file) return noFile(res, 'No avatar file provided');

    const saved = await saveImage(req.file, 'avatars');

    res.status(200).json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: saved,
    });
});

// ==================== Category Icon Upload ====================
export const uploadCategoryImage = withUpload(uploadCategoryIcon, 'Category icon upload', async (req, res) => {
    if (!req.file) return noFile(res, 'No icon file provided');

    const saved = await saveImage(req.file, 'categories');

    res.status(200).json({
        success: true,
        message: 'Category icon uploaded successfully',
        data: saved,
    });
});

// ==================== Platform Icon Upload ====================
export const uploadPlatformImage = withUpload(uploadPlatformIcon, 'Platform icon upload', async (req, res) => {
    if (!req.file) return noFile(res, 'No icon file provided');

    const saved = await saveImage(req.file, 'platforms');

    res.status(200).json({
        success: true,
        message: 'Platform icon uploaded successfully',
        data: saved,
    });
});

// ==================== Software Screenshots Upload ====================
export const uploadSoftwareScreenshots = withUpload(uploadSoftwareImages, 'Screenshots upload', async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) return noFile(res, 'No screenshot files provided');

    const saved = await saveImages(files, 'software');

    res.status(200).json({
        success: true,
        message: 'Screenshots uploaded successfully',
        data: saved,
    });
});

// ==================== ZIP File Upload (Download Files) ====================
export const uploadZipFile = withUpload(uploadDownloadFile, 'ZIP file upload', async (req, res) => {
    if (!req.file) return noFile(res, 'No ZIP file provided');

    res.status(200).json({
        success: true,
        message: 'ZIP file uploaded successfully',
        data: {
            url: archiveUrl(req.file),
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
        },
    });
});

// ==================== Visa Application Document Upload ====================
// PDF বা ছবি — দুটোই গ্রহণ করে (ব্যাংক স্টেটমেন্ট সাধারণত PDF)।
export const uploadDocument = withUpload(
    uploadApplicationDocument,
    'Document upload',
    async (req, res) => {
        if (!req.file) return noFile(res, 'No document provided');

        res.status(200).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                url: documentUrl(req.file),
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
            },
        });
    }
);

// ==================== Delete Image ====================
export const removeImage = async (req: Request, res: Response) => {
    try {
        const { url } = req.body;

        if (!url || typeof url !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'URL is required',
            });
        }

        const deleted = await deleteByUrl(url);

        if (deleted) {
            res.status(200).json({
                success: true,
                message: 'File deleted successfully',
            });
        } else {
            // deleteByUrl আমাদের /uploads/ এর বাইরের URL (যেমন পুরোনো
            // Cloudinary link) ছুঁতে অস্বীকার করে — তখন এখানেই আসে।
            res.status(400).json({
                success: false,
                message: 'Invalid URL or file could not be deleted',
            });
        }
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
        });
    }
};
