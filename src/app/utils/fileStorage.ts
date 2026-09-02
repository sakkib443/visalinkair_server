// ===================================================================
// Visalink Air Backend - Local File Storage
// নিজের হোস্টিংয়ে ফাইল আপলোড (আগে Cloudinary ছিল)।
//
// ছবি memory-তে নিয়ে sharp দিয়ে resize + webp করে ডিস্কে লেখা হয় —
// Cloudinary এর `quality: auto:good` যা করত, সেটার বদলি। ZIP-জাতীয় বড়
// ফাইল সরাসরি ডিস্কে stream হয় (memory-তে ধরে রাখা হয় না)।
//
// সব ফাংশন DB-র জন্য relative URL ফেরত দেয় (/uploads/...), পুরো URL নয়।
// ===================================================================

import crypto from 'crypto';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import config from '../config';

// আপলোড রুট — প্রোডাকশনে persistent volume-এ mount করা থাকতে হবে।
export const UPLOAD_DIR = path.resolve(config.upload.dir);
export const PUBLIC_PATH = config.upload.public_path;

// ছবির সর্বোচ্চ মাপ — এর চেয়ে বড় হলে ছোট করা হয় (ছোট হলে বড় করা হয় না)।
const MAX_IMAGE_DIMENSION = 1920;
const WEBP_QUALITY = 82;

const ensureDir = async (dir: string): Promise<void> => {
    await fs.mkdir(dir, { recursive: true });
};

// নিরাপদ, ইউনিক ফাইলনেম। originalname ইউজারের দেওয়া — এখান থেকে
// path traversal ("../../etc/passwd") ঠেকাতে basename নিয়ে বাকি সব
// অক্ষর ছেঁটে ফেলা হয়।
const buildFilename = (originalName: string, ext: string): string => {
    const base =
        path
            .basename(originalName)
            .replace(/\.[^.]+$/, '')
            .replace(/[^a-zA-Z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 40)
            .toLowerCase() || 'file';

    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    return `${unique}-${base}${ext}`;
};

// ==================== File Filters ====================

// HEIC/HEIF হলো iPhone-এর ডিফল্ট ফরম্যাট — এটা বাদ থাকায় মোবাইল থেকে তোলা
// ছবি সরাসরি আপলোড করা যেত না। libvips-এ heif ডিকোডার আছে, আর saveImage
// যেভাবেই হোক সব ছবি webp-এ রূপান্তর করে, তাই ব্রাউজার HEIC চিনতে না
// পারলেও সমস্যা নেই — সার্ভার থেকে webp হয়েই ফেরত যায়।
const ALLOWED_IMAGE_MIMES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/avif',
    'image/heic',
    'image/heif',
];

// HEIC ফাইলে ব্রাউজার/OS প্রায়ই mimetype ফাঁকা বা application/octet-stream
// পাঠায়। তখন extension দেখে সিদ্ধান্ত নেওয়া হয় — ভুল হলে sharp নিজেই
// পরে throw করবে, তাই এটা ঢিলে করে দেওয়া নিরাপদ।
const IMAGE_EXT_RE = /\.(jpe?g|png|gif|webp|avif|heic|heif)$/i;

const imageFileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
    const mime = (file.mimetype || '').toLowerCase();
    if (ALLOWED_IMAGE_MIMES.includes(mime) || IMAGE_EXT_RE.test(file.originalname || '')) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Only JPG, PNG, GIF, WEBP, AVIF, HEIC are allowed. Got: ${file.mimetype}`));
    }
};

const archiveFileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/x-rar-compressed',
        'application/x-7z-compressed',
        'application/gzip',
        'application/x-tar',
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only ZIP, RAR, 7z, TAR, GZ files are allowed'));
    }
};

// Supporting documents for a visa application: passport scans, bank statements,
// NOC letters and the like. Real applicants send PDFs as often as photos, so this
// filter accepts both — unlike imageFileFilter, which is images only.
const documentFileFilter = (_req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
        'application/pdf',
    ];
    const mime = (file.mimetype || '').toLowerCase();
    if (allowedMimes.includes(mime) || /\.(jpe?g|png|webp|heic|heif|pdf)$/i.test(file.originalname || '')) {
        cb(null, true);
    } else {
        cb(new Error(`Only PDF, JPG, PNG, WEBP or HEIC are allowed. Got: ${file.mimetype}`));
    }
};

// ==================== Multer Middlewares (images → memory) ====================
// ছবিগুলো sharp দিয়ে প্রসেস করতে হয়, তাই আগে memory-তে নেওয়া হয়।
// limit ছোট (২–৫MB) বলে RAM-এ চাপ পড়ে না।

const memory = multer.memoryStorage();
const imageUpload = (maxBytes: number) => multer({
    storage: memory,
    limits: { fileSize: maxBytes },
    fileFilter: imageFileFilter,
});

// আধুনিক ফোনের একটা ছবিই ৫–৮MB হয়ে যায়, তাই আগের ৫MB সীমা বাস্তবে
// অনেক আসল ছবিকেই আটকে দিত। sharp যেহেতু সবকিছু ১৯২০px/webp-এ নামিয়ে
// আনে, ডিস্কে জমা ফাইল ছোটই থাকে — শুধু ঢোকার মুখটা চওড়া করা হলো।
export const uploadWebsiteImages = imageUpload(10 * 1024 * 1024).array('images', 10);
export const uploadCategoryIcon = imageUpload(5 * 1024 * 1024).single('icon');
export const uploadPlatformIcon = imageUpload(5 * 1024 * 1024).single('icon');
export const uploadAvatar = imageUpload(5 * 1024 * 1024).single('avatar');
export const uploadSoftwareImages = imageUpload(10 * 1024 * 1024).array('images', 10);
export const uploadSingleImage = imageUpload(10 * 1024 * 1024).single('image');

// ==================== Multer Middleware (archives → disk) ====================
// ৫০MB পর্যন্ত ZIP — memory-তে না নিয়ে সরাসরি ডিস্কে stream করা হয়।

const archiveStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path.join(UPLOAD_DIR, 'downloads');
        ensureDir(dir)
            .then(() => cb(null, dir))
            .catch((err) => cb(err, dir));
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.zip';
        cb(null, buildFilename(file.originalname, ext));
    },
});

export const uploadDownloadFile = multer({
    storage: archiveStorage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: archiveFileFilter,
}).single('file');

// ==================== Multer Middleware (visa documents → disk) ====================
// PDF-ও আসে, তাই sharp দিয়ে প্রসেস না করে সরাসরি ডিস্কে stream করা হয়।
// A PDF cannot go through sharp, so these stream straight to disk untouched —
// which also keeps a scanned passport legible rather than re-compressed.

const documentStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path.join(UPLOAD_DIR, 'documents');
        ensureDir(dir)
            .then(() => cb(null, dir))
            .catch((err) => cb(err, dir));
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
        cb(null, buildFilename(file.originalname, ext));
    },
});

export const uploadApplicationDocument = multer({
    storage: documentStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: documentFileFilter,
}).single('document');

// ==================== Save Helpers ====================

export type SavedFile = {
    url: string;
    filename: string;
};

/**
 * একটি ছবি প্রসেস করে ডিস্কে লেখে এবং relative URL ফেরত দেয়।
 * GIF অ্যানিমেশন হারাতে পারে বলে GIF যেমন আছে তেমনই রাখা হয়।
 */
export const saveImage = async (file: Express.Multer.File, folder: string): Promise<SavedFile> => {
    const dir = path.join(UPLOAD_DIR, folder);
    await ensureDir(dir);

    const isGif = file.mimetype === 'image/gif';
    const filename = buildFilename(file.originalname, isGif ? '.gif' : '.webp');
    const dest = path.join(dir, filename);

    if (isGif) {
        await fs.writeFile(dest, file.buffer);
    } else {
        await sharp(file.buffer)
            // মোবাইলে তোলা ছবির EXIF orientation ঠিক করে (নাহলে উল্টো দেখায়)।
            .rotate()
            .resize({
                width: MAX_IMAGE_DIMENSION,
                height: MAX_IMAGE_DIMENSION,
                fit: 'inside',
                withoutEnlargement: true,
            })
            .webp({ quality: WEBP_QUALITY })
            .toFile(dest);
    }

    return { url: `${PUBLIC_PATH}/${folder}/${filename}`, filename };
};

/** একাধিক ছবি সেভ করে। যেকোনো একটা fail করলে পুরোটাই throw করে। */
export const saveImages = async (files: Express.Multer.File[], folder: string): Promise<SavedFile[]> =>
    Promise.all(files.map((file) => saveImage(file, folder)));

/** ডিস্কে stream হয়ে যাওয়া archive ফাইলের relative URL. */
export const archiveUrl = (file: Express.Multer.File): string => `${PUBLIC_PATH}/downloads/${file.filename}`;

export const documentUrl = (file: Express.Multer.File): string => `${PUBLIC_PATH}/documents/${file.filename}`;

// ==================== Delete Helper ====================

/**
 * URL → UPLOAD_DIR-এর ভেতরের relative path।
 * আমাদের /uploads/ prefix ছাড়া কিছু (যেমন পুরোনো Cloudinary URL) হলে null।
 */
const toRelativePath = (url: string): string | null => {
    let pathname = url;

    if (/^https?:\/\//i.test(url)) {
        try {
            pathname = new URL(url).pathname;
        } catch {
            return null;
        }
    }

    if (!pathname.startsWith(`${PUBLIC_PATH}/`)) return null;

    try {
        return decodeURIComponent(pathname.slice(PUBLIC_PATH.length + 1));
    } catch {
        return null;
    }
};

/**
 * URL ধরে ফাইল মুছে দেয়। URL ইউজারের দেওয়া, তাই resolve করার পর
 * সেটা সত্যিই UPLOAD_DIR-এর ভেতরে কি না যাচাই করা হয় — এই গার্ড ছাড়া
 * "/uploads/../../app/dist/server.js" দিয়ে সার্ভারের ফাইল মোছা যেত।
 */
export const deleteByUrl = async (url: string): Promise<boolean> => {
    const rel = toRelativePath(url);
    if (!rel) return false;

    const root = path.resolve(UPLOAD_DIR);
    const abs = path.resolve(root, rel);
    if (abs !== root && !abs.startsWith(root + path.sep)) return false;

    try {
        await fs.unlink(abs);
        return true;
    } catch (error: any) {
        // ফাইল আগেই নেই — DB পরিষ্কার করার দিক থেকে এটা সফলই ধরা হয়।
        if (error?.code === 'ENOENT') return true;
        console.error('Error deleting file:', error);
        return false;
    }
};
