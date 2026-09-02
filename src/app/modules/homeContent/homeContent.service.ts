// ===================================================================
// Visalink Air - Home Content Service
// CRUD for homepage section content — section-based singleton documents
// ===================================================================

import { HomeContent } from './homeContent.model';
import { IHomeContent, SectionName } from './homeContent.interface';

// ─── Default Data (current hardcoded values) ──────────────────────────

const DEFAULTS: Record<SectionName, any> = {
    hero: {
        // Background pictures only — the four that ship in /public. Admins
        // replace these from Dashboard → Home Page → Hero.
        slides: [
            { image: '/hero.jpg', order: 0 },
            { image: '/2.jpg', order: 1 },
            { image: '/3.jpg', order: 2 },
            { image: '/4.jpg', order: 3 },
        ],
        slideSeconds: 4,
    },
    services: {
        tagText: { en: 'OUR SERVICES', bn: 'আমাদের সেবা' },
        heading: { en: 'WHAT WE', bn: 'আমরা যা' },
        headingHighlight: { en: 'OFFER', bn: 'অফার করি' },
        description: { en: 'Comprehensive travel and immigration solutions tailored to your needs', bn: 'আপনার প্রয়োজন অনুযায়ী সম্পূর্ণ ভ্রমণ ও ইমিগ্রেশন সমাধান' },
        items: [
            {
                title: { en: 'Visa Processing', bn: 'ভিসা প্রসেসিং' },
                subtitle: { en: 'Immigration', bn: 'ইমিগ্রেশন' },
                description: { en: 'Expert visa processing for all countries with high success rate', bn: 'উচ্চ সাফল্যের হারে সব দেশের ভিসা প্রসেসিং' },
                icon: 'LuTicket',
                image: 'https://images.unsplash.com/photo-1544016768-982d1554f0b9?w=800&fit=crop',
                color: '#1D7EDD',
                stats: { en: '10K+ Processed', bn: '১০K+ প্রসেস' },
                href: '/visa',
                order: 1,
                isActive: true,
            },
            {
                title: { en: 'Flight Booking', bn: 'ফ্লাইট বুকিং' },
                subtitle: { en: 'Air Travel', bn: 'বিমান ভ্রমণ' },
                description: { en: 'Best deals on domestic and international flights', bn: 'দেশি ও আন্তর্জাতিক ফ্লাইটে সেরা ডিল' },
                icon: 'LuPlane',
                image: 'https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=800',
                color: '#EF8C2C',
                stats: { en: '5K+ Booked', bn: '৫K+ বুকড' },
                href: '/contact',
                order: 2,
                isActive: true,
            },
            {
                title: { en: 'Hotel Reservation', bn: 'হোটেল রিজার্ভেশন' },
                subtitle: { en: 'Accommodation', bn: 'থাকার ব্যবস্থা' },
                description: { en: 'Premium hotel bookings worldwide at competitive prices', bn: 'সাশ্রয়ী মূল্যে বিশ্বব্যাপী প্রিমিয়াম হোটেল বুকিং' },
                icon: 'LuBed',
                image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=800',
                color: '#10B981',
                stats: { en: '2K+ Reserved', bn: '২K+ রিজার্ভড' },
                href: '/hotel',
                order: 3,
                isActive: true,
            },
            {
                title: { en: 'Tour Packages', bn: 'ট্যুর প্যাকেজ' },
                subtitle: { en: 'Adventure', bn: 'অ্যাডভেঞ্চার' },
                description: { en: 'Curated tour packages for unforgettable travel experiences', bn: 'অবিস্মরণীয় ভ্রমণ অভিজ্ঞতার জন্য পরিকল্পিত ট্যুর প্যাকেজ' },
                icon: 'LuMapPin',
                image: 'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg?auto=compress&cs=tinysrgb&w=800',
                color: '#8B5CF6',
                stats: { en: '500+ Tours', bn: '৫০০+ ট্যুর' },
                href: '/tour',
                order: 4,
                isActive: true,
            },
            {
                title: { en: 'Hajj & Umrah', bn: 'হজ্জ ও উমরাহ' },
                subtitle: { en: 'Pilgrimage', bn: 'তীর্থযাত্রা' },
                description: { en: 'Complete Hajj and Umrah packages with guided services', bn: 'গাইডেড সেবাসহ সম্পূর্ণ হজ্জ ও উমরাহ প্যাকেজ' },
                icon: 'LuMoon',
                image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&fit=crop',
                color: '#F59E0B',
                stats: { en: '1K+ Pilgrims', bn: '১K+ হাজী' },
                href: '/hajj-umrah',
                order: 5,
                isActive: true,
            },
            {
                title: { en: 'Study Abroad', bn: 'বিদেশে পড়াশোনা' },
                subtitle: { en: 'Education', bn: 'শিক্ষা' },
                description: { en: 'Study abroad consultancy with university placement support', bn: 'বিশ্ববিদ্যালয় প্লেসমেন্ট সহায়তাসহ বিদেশে পড়াশোনার পরামর্শ' },
                icon: 'LuGraduationCap',
                image: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
                color: '#EC4899',
                stats: { en: '300+ Students', bn: '৩০০+ শিক্ষার্থী' },
                href: '/study-abroad',
                order: 6,
                isActive: true,
            },
        ],
        bottomCTAText: { en: 'View All Services', bn: 'সব সেবা দেখুন' },
        bottomCTALink: '/contact',
        isActive: true,
    },
    partners: {
        items: [
            { name: 'G-FLY GLOBAL', icon: 'LuPlane', color: 'primary', order: 1 },
            { name: 'TRAVERSE', icon: 'LuCompass', color: 'secondary', order: 2 },
            { name: 'TRIPZONE', icon: 'LuGlobe', color: '#3590CF', order: 3 },
            { name: 'BORCELLE', icon: 'LuMap', color: 'red', order: 4 },
            { name: 'TRAVEL TRUST', icon: 'LuShieldCheck', color: 'green', order: 5 },
        ],
        isActive: true,
    },
    consultation: {
        tagText: { en: 'IMMIGRATION CONSULTING', bn: 'ইমিগ্রেশন কনসাল্টিং' },
        heading: { en: 'EXPERT IMMIGRATION', bn: 'বিশেষজ্ঞ ইমিগ্রেশন' },
        headingHighlight: { en: 'CONSULTING', bn: 'কনসাল্টিং' },
        headingEnd: { en: 'SERVICE', bn: 'সেবা' },
        description: { en: 'Get professional guidance from our experienced immigration consultants for a smooth visa journey.', bn: 'মসৃণ ভিসা যাত্রার জন্য আমাদের অভিজ্ঞ ইমিগ্রেশন পরামর্শদাতাদের কাছ থেকে পেশাদার নির্দেশনা পান।' },
        experienceTitle: { en: '10+ Years Of Experience', bn: '১০+ বছরের অভিজ্ঞতা' },
        experienceDesc: { en: 'Our team of experts has over a decade of experience in immigration consulting, ensuring you get the best guidance.', bn: 'আমাদের বিশেষজ্ঞ দল ইমিগ্রেশন কনসাল্টিং এ এক দশকেরও বেশি অভিজ্ঞতা রাখে।' },
        experienceImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=200&fit=crop',
        mainImage1: '/images/img01.png',
        mainImage2: '/images/img02.png',
        ctaText: { en: 'Explore More', bn: 'আরও জানুন' },
        ctaLink: '/contact',
        agentCount: '200+',
        agentLabel: { en: 'Real Agents', bn: 'এজেন্ট' },
        isActive: true,
    },
    whyChooseUs: {
        tagText: { en: 'WHY VISALINK AIR', bn: 'কেন ভিসাপ্রো' },
        heading: { en: 'WHY CHOOSE', bn: 'কেন বাছবেন' },
        headingHighlight: { en: 'US', bn: 'আমাদের' },
        description: { en: 'We provide comprehensive immigration and travel services with a proven track record of success.', bn: 'আমরা সফলতার প্রমাণিত ট্র্যাক রেকর্ড সহ ব্যাপক ইমিগ্রেশন ও ভ্রমণ সেবা প্রদান করি।' },
        cards: [
            { title: { en: 'Expert Guidance', bn: 'বিশেষজ্ঞ গাইডেন্স' }, description: { en: 'Our certified consultants provide personalized guidance for your visa application.', bn: 'আমাদের সার্টিফাইড পরামর্শদাতারা আপনার ভিসা আবেদনের জন্য ব্যক্তিগত নির্দেশনা প্রদান করেন।' }, icon: '🎯', color: '#1D7EDD', order: 1 },
            { title: { en: 'Fast Processing', bn: 'দ্রুত প্রসেসিং' }, description: { en: 'Quick and efficient visa processing with minimal waiting time.', bn: 'ন্যূনতম অপেক্ষার সময়ে দ্রুত ও কার্যকর ভিসা প্রসেসিং।' }, icon: '⚡', color: '#EF8C2C', order: 2 },
            { title: { en: '24/7 Support', bn: '২৪/৭ সাপোর্ট' }, description: { en: 'Round-the-clock customer support for all your queries.', bn: 'আপনার সকল প্রশ্নের জন্য সার্বক্ষণিক কাস্টমার সাপোর্ট।' }, icon: '💬', color: '#10B981', order: 3 },
            { title: { en: 'Affordable Prices', bn: 'সাশ্রয়ী মূল্য' }, description: { en: 'Competitive pricing with no hidden charges.', bn: 'কোনো লুকানো চার্জ ছাড়াই প্রতিযোগিতামূলক মূল্য।' }, icon: '💰', color: '#8B5CF6', order: 4 },
            { title: { en: '50+ Countries', bn: '৫০+ দেশ' }, description: { en: 'We process visas for over 50 countries worldwide.', bn: 'আমরা বিশ্বের ৫০টিরও বেশি দেশের ভিসা প্রসেস করি।' }, icon: '🌏', color: '#3590CF', order: 5 },
            { title: { en: '98% Success Rate', bn: '৯৮% সাফল্যের হার' }, description: { en: 'Our high success rate speaks for our expertise.', bn: 'আমাদের উচ্চ সাফল্যের হার আমাদের দক্ষতার প্রমাণ।' }, icon: '✅', color: '#EF4444', order: 6 },
        ],
        stats: [
            { value: '10+', label: { en: 'Years Experience', bn: 'বছরের অভিজ্ঞতা' }, color: '#1D7EDD', order: 1 },
            { value: '10K+', label: { en: 'Visas Processed', bn: 'ভিসা প্রসেস' }, color: '#EF8C2C', order: 2 },
            { value: '98%', label: { en: 'Success Rate', bn: 'সাফল্যের হার' }, color: '#10B981', order: 3 },
            { value: '50+', label: { en: 'Countries Covered', bn: 'দেশ কভারেজ' }, color: '#8B5CF6', order: 4 },
            { value: '24/7', label: { en: 'Customer Support', bn: 'কাস্টমার সাপোর্ট' }, color: '#3590CF', order: 5 },
        ],
        isActive: true,
    },
};

// ─── Field whitelists (per section) ───────────────────────────────────
// The `data` field is Schema.Types.Mixed, so Mongoose performs no shape
// validation. To prevent mass-assignment of arbitrary properties from the
// raw request body, we copy ONLY the fields defined in each section's schema.

const SERVICE_ITEM_FIELDS = [
    'title', 'subtitle', 'description', 'icon', 'image', 'color', 'stats', 'href', 'order', 'isActive',
] as const;

// `image` — পার্টনারের আসল লোগো। খালি থাকলে ফ্রন্ট-এন্ড আগের মতোই
// `icon` দিয়ে আঁকে, তাই পুরোনো ডেটা অক্ষত থাকে।
const PARTNER_ITEM_FIELDS = ['name', 'icon', 'image', 'color', 'order'] as const;

const WHY_CHOOSE_CARD_FIELDS = ['title', 'description', 'icon', 'color', 'order'] as const;

const STAT_ITEM_FIELDS = ['value', 'label', 'color', 'order'] as const;

// One background picture behind the hero
const HERO_SLIDE_FIELDS = ['image', 'order'] as const;

const SECTION_FIELDS: Record<SectionName, readonly string[]> = {
    // The hero is a picture slider and nothing else. The badge / heading /
    // button fields that used to live here were never rendered by the Hero
    // component, so they only ever stored values nothing read — removed.
    // The search card below the pictures is driven by the visa/hotel/tour
    // data, not by page content, so it is not editable here either.
    hero: ['slides', 'slideSeconds'],
    services: [
        'tagText', 'heading', 'headingHighlight', 'description', 'items',
        'bottomCTAText', 'bottomCTALink', 'isActive',
    ],
    partners: ['items', 'isActive'],
    consultation: [
        'tagText', 'heading', 'headingHighlight', 'headingEnd', 'description',
        'experienceTitle', 'experienceDesc', 'experienceImage', 'mainImage1',
        'mainImage2', 'ctaText', 'ctaLink', 'agentCount', 'agentLabel', 'isActive',
    ],
    whyChooseUs: [
        'tagText', 'heading', 'headingHighlight', 'description', 'cards', 'stats', 'isActive',
    ],
};

// Pick only the allowed keys from a plain object.
const pickFields = (input: any, allowed: readonly string[]): Record<string, any> => {
    const out: Record<string, any> = {};
    if (!input || typeof input !== 'object') return out;
    for (const key of allowed) {
        if (input[key] !== undefined) {
            out[key] = input[key];
        }
    }
    return out;
};

// Sanitize each item of an array against the allowed item fields.
const pickItems = (value: any, allowed: readonly string[]): Record<string, any>[] => {
    if (!Array.isArray(value)) return [];
    return value.map((item) => pickFields(item, allowed));
};

/**
 * Build an explicit, whitelisted data object for a section. Only fields
 * defined in that section's schema are copied from the raw input; nested
 * array items are likewise restricted to their own allowed fields.
 */
const sanitizeSectionData = (section: SectionName, input: any): Record<string, any> => {
    const data = pickFields(input, SECTION_FIELDS[section]);

    if (section === 'hero') {
        if (data.slides !== undefined) {
            // Drop blank rows: the editor adds an empty one when you click
            // "Add by URL", and an empty slide would render as a black panel.
            data.slides = pickItems(data.slides, HERO_SLIDE_FIELDS)
                .filter((s) => s.image)
                .map((s, i) => ({ ...s, order: i }));
        }
    }
    if (section === 'services' && data.items !== undefined) {
        data.items = pickItems(data.items, SERVICE_ITEM_FIELDS);
    }
    if (section === 'partners' && data.items !== undefined) {
        data.items = pickItems(data.items, PARTNER_ITEM_FIELDS);
    }
    if (section === 'whyChooseUs') {
        if (data.cards !== undefined) data.cards = pickItems(data.cards, WHY_CHOOSE_CARD_FIELDS);
        if (data.stats !== undefined) data.stats = pickItems(data.stats, STAT_ITEM_FIELDS);
    }

    return data;
};

// ─── Get all sections ─────────────────────────────────────────────────
const getAllSections = async (): Promise<IHomeContent[]> => {
    let docs = await HomeContent.find().lean();

    // Auto-seed missing sections
    const existing = new Set(docs.map((d: any) => d.section));
    const missing = (Object.keys(DEFAULTS) as SectionName[]).filter(
        (s) => !existing.has(s)
    );

    if (missing.length > 0) {
        const toInsert = missing.map((s) => ({ section: s, data: DEFAULTS[s] }));
        await HomeContent.insertMany(toInsert);
        docs = await HomeContent.find().lean();
    }

    return docs as unknown as IHomeContent[];
};

// ─── Get single section ───────────────────────────────────────────────
const getSection = async (section: SectionName): Promise<IHomeContent> => {
    let doc = await HomeContent.findOne({ section });
    if (!doc) {
        doc = await HomeContent.create({ section, data: DEFAULTS[section] || {} });
    }
    return doc;
};

// ─── Update section ───────────────────────────────────────────────────
const updateSection = async (
    section: SectionName,
    input: any
): Promise<IHomeContent> => {
    // Whitelist: only fields defined in this section's schema are persisted.
    const data = sanitizeSectionData(section, input);

    let doc = await HomeContent.findOne({ section });
    if (!doc) {
        doc = await HomeContent.create({ section, data });
        return doc;
    }
    doc.data = data as IHomeContent['data'];
    doc.markModified('data');
    await doc.save();
    return doc;
};

// ─── Seed all defaults ────────────────────────────────────────────────
const seedDefaults = async (): Promise<IHomeContent[]> => {
    const sections = Object.keys(DEFAULTS) as SectionName[];
    for (const section of sections) {
        const exists = await HomeContent.findOne({ section });
        if (!exists) {
            await HomeContent.create({ section, data: DEFAULTS[section] });
        }
    }
    return HomeContent.find().lean() as unknown as IHomeContent[];
};

export const HomeContentService = {
    getAllSections,
    getSection,
    updateSection,
    seedDefaults,
};
