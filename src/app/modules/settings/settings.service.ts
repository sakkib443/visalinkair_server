// ===================================================================
// Visalink Air - Settings Service
// Singleton: শুধু একটাই document থাকবে — find করে না পেলে create করবে
// ===================================================================

import { Settings } from './settings.model';
import { ISettings } from './settings.interface';

const DEFAULTS: Partial<ISettings> = {
    contactPhone: '+8801738886644',
    contactPhoneAlt: '',
    contactEmail: 'info@visalinkair.com',
    whatsappNumber: '8801738886644',
    address: 'House 25, Road - 11, DIT Project, Marul Badda, Badda, Dhaka-1214',
    addressBn: 'বাসা ২৫, রোড - ১১, ডিআইটি প্রজেক্ট, মেরুল বাড্ডা, বাড্ডা, ঢাকা-১২১৪',

    // Working Hours
    workingDays: 'Sat - Thu: Open',
    workingDaysBn: 'শনি - বৃহঃ: খোলা',
    workingHours: '9:30 AM - 8:30 PM',
    workingHoursBn: 'সকাল ৯:৩০ - রাত ৮:৩০',

    // Map
    mapEmbedUrl: 'https://maps.google.com/maps?q=Marul%20Badda%2C%20Badda%2C%20Dhaka-1214%2C%20Bangladesh&t=&z=15&ie=UTF8&iwloc=&output=embed',
    mapLabel: 'MARUL BADDA, DHAKA',
    mapLabelBn: 'মেরুল বাড্ডা, ঢাকা',

    // Stats
    visaSuccessRate: '98%',
    countriesCount: '50+',
    happyClientsCount: '10K+',

    // Banner under the navbar on every visa details page
    visaBannerImage:
        'https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1353&q=80',

    social: {
        facebook: 'https://facebook.com/visalinkair',
        instagram: '',
        twitter: '',
        youtube: '',
        linkedin: '',
        tiktok: '',
    },
};

/**
 * Get the singleton settings document. Create with defaults if missing.
 */
const getSettings = async (): Promise<ISettings> => {
    let doc = await Settings.findOne();
    if (!doc) {
        doc = await Settings.create(DEFAULTS);
    }
    return doc;
};

/**
 * Update settings. Always operates on the singleton.
 */
const updateSettings = async (
    payload: Partial<ISettings>
): Promise<ISettings> => {
    let doc = await Settings.findOne();
    if (!doc) {
        doc = await Settings.create({ ...DEFAULTS, ...payload });
        return doc;
    }
    // Merge social separately so partial updates don't wipe other fields
    if (payload.social) {
        doc.social = { ...doc.social, ...payload.social };
    }
    const { social: _ignore, ...rest } = payload as Record<string, unknown>;
    Object.assign(doc, rest);
    await doc.save();
    return doc;
};

export const SettingsService = { getSettings, updateSettings };
