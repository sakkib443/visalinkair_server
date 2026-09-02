// ===================================================================
// Visalink Air - Contact & Social Settings Model (singleton document)
// ===================================================================

import { Schema, model } from 'mongoose';
import { ISettings, SettingsModel } from './settings.interface';

const socialSchema = new Schema(
    {
        facebook: { type: String, default: '', trim: true },
        instagram: { type: String, default: '', trim: true },
        twitter: { type: String, default: '', trim: true },
        youtube: { type: String, default: '', trim: true },
        linkedin: { type: String, default: '', trim: true },
        tiktok: { type: String, default: '', trim: true },
    },
    { _id: false }
);

const settingsSchema = new Schema<ISettings, SettingsModel>(
    {
        // Contact
        contactPhone: { type: String, required: true, trim: true },
        contactPhoneAlt: { type: String, default: '', trim: true },
        contactEmail: { type: String, required: true, trim: true, lowercase: true },
        whatsappNumber: { type: String, required: true, trim: true },

        // Mobile payment (manual) "Send Money" numbers
        bkashNumber: { type: String, default: '', trim: true },
        nagadNumber: { type: String, default: '', trim: true },
        rocketNumber: { type: String, default: '', trim: true },

        address: { type: String, default: '', trim: true },
        addressBn: { type: String, default: '', trim: true },

        // Working Hours
        workingDays: { type: String, default: 'Sat - Thu: Open', trim: true },
        workingDaysBn: { type: String, default: 'শনি - বৃহঃ: খোলা', trim: true },
        workingHours: { type: String, default: '9:30 AM - 8:30 PM', trim: true },
        workingHoursBn: { type: String, default: 'সকাল ৯:৩০ - রাত ৮:৩০', trim: true },

        // Map
        mapEmbedUrl: { type: String, default: 'https://maps.google.com/maps?q=Marul%20Badda%2C%20Badda%2C%20Dhaka-1214%2C%20Bangladesh&t=&z=15&ie=UTF8&iwloc=&output=embed', trim: true },
        mapLabel: { type: String, default: 'MARUL BADDA, DHAKA', trim: true },
        mapLabelBn: { type: String, default: 'মেরুল বাড্ডা, ঢাকা', trim: true },

        // Stats
        visaSuccessRate: { type: String, default: '98%', trim: true },
        countriesCount: { type: String, default: '50+', trim: true },
        happyClientsCount: { type: String, default: '10K+', trim: true },

        // Banner shown under the navbar on every visa details page
        visaBannerImage: {
            type: String,
            trim: true,
            default:
                'https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1353&q=80',
        },

        // Social
        social: { type: socialSchema, default: () => ({}) },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Settings = model<ISettings, SettingsModel>('Settings', settingsSchema);
