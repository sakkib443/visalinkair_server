// ===================================================================
// Visalink Air - Visa Guide Interface
// A "Visa Guide" is one admin-authored, rich-text page describing how a
// Bangladeshi passport holder applies for a visa to one country, under
// one category (tourist | student). The client-side country search and
// the public details page are both driven entirely by this collection.
// ভিসা গাইড মডিউলের TypeScript interface definitions
// ===================================================================

import { Model, Types } from 'mongoose';

export type TVisaGuideCategory = 'tourist' | 'student';

/**
 * IVisaGuide - Main Visa Guide Interface
 */
export interface IVisaGuide {
    _id?: Types.ObjectId;

    // ==================== Identity ====================
    category: TVisaGuideCategory;   // 'tourist' | 'student'
    country: string;                // "Singapore"
    countryBn?: string;             // "সিঙ্গাপুর"
    countrySlug: string;            // "singapore" — server-generated
    flag?: string;                  // 🇸🇬 emoji or image URL

    // ==================== Summary fields ====================
    // Rendered as the "Summary" block above the rich content, and used
    // for the card/table rows in the admin list.
    visaType?: string;              // "Tourist Visa (E-Visa)"
    processingTime?: string;        // "07 to 10 working days"
    processingFee?: string;         // "BDT 6,500 (Without Airport Transfer)"
    embassyFee?: string;            // "BDT 3,000"
    validity?: string;              // "30 days from issue"
    stayDuration?: string;          // "Up to 30 days"
    entryType?: string;             // "Single Entry" | "Multiple Entry"

    // ==================== Body ====================
    // Rich HTML authored in the admin split-screen editor. Rendered
    // verbatim on the public page under the `.visa-content` stylesheet
    // so the live preview and the real page are pixel-identical.
    content: string;

    // ==================== Status ====================
    isActive: boolean;              // false hides it from the public site entirely
    order: number;

    // ==================== SEO ====================
    metaTitle?: string;
    metaDescription?: string;

    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * IVisaGuideFilters - Query filters for the admin list
 */
export interface IVisaGuideFilters {
    searchTerm?: string;
    category?: TVisaGuideCategory;
    isActive?: boolean;
}

export interface VisaGuideModel extends Model<IVisaGuide> {
    findByCountry(
        category: TVisaGuideCategory,
        countrySlug: string
    ): Promise<IVisaGuide | null>;
}
