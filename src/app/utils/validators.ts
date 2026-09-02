// ===================================================================
// Visalink Air Backend - Shared Zod validators
// ===================================================================

import { z } from 'zod';
import config from '../config';

const isAbsoluteUrl = (value: string): boolean => {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

const isUploadPath = (value: string): boolean => value.startsWith(`${config.upload.public_path}/`);

/**
 * ছবি/ভিডিওর URL যাচাই করে।
 *
 * আমাদের নিজের আপলোড DB-তে site-relative path হিসেবে জমা থাকে
 * (/uploads/general/x.webp) — পুরো URL নয়, যাতে ডোমেইন বদলালেও লিংক না ভাঙে।
 * কিন্তু seed করা বা বাইরের ছবি (unsplash, i.ibb.co) এখনো পুরো URL। তাই
 * এখানে দুটোই গ্রহণ করা হয়।
 *
 * খেয়াল রাখবেন: এটা শুধু media ফিল্ডের জন্য। embassy website-এর মতো
 * সত্যিকারের বাইরের লিংকে z.string().url() ই থাকা উচিত।
 */
export const mediaUrl = (message = 'Invalid image URL', requiredError?: string) =>
    z
        .string(requiredError ? { required_error: requiredError } : undefined)
        .refine((value) => isUploadPath(value) || isAbsoluteUrl(value), { message });
