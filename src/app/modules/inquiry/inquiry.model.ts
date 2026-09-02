// ===================================================================
// Visalink Air — Inquiry (generic lead capture)
// One collection for every submission from the public site:
// Study Abroad, Passport, Banking, Career, Course, "Contact us" — all
// land here so admins have a single unified queue.
// ===================================================================

import { Schema, model, Document, Types } from 'mongoose';

const inquirySchema = new Schema(
    {
        // Which service the visitor was on when they submitted.
        // Free-form so future new services need zero schema changes.
        service: { type: String, required: true, lowercase: true, trim: true, index: true },
        serviceLabel: { type: String, default: '' }, // human-readable snapshot

        // Contact details
        name: { type: String, required: true, trim: true, maxlength: 120 },
        email: { type: String, trim: true, lowercase: true, default: '' },
        phone: { type: String, required: true, trim: true, maxlength: 40 },
        subject: { type: String, default: '', trim: true, maxlength: 200 },
        message: { type: String, default: '', trim: true, maxlength: 4000 },

        // Free-form extra fields — Career adds "position", Course adds "batch", etc.
        extra: { type: Schema.Types.Mixed, default: {} },

        // Admin workflow
        status: {
            type: String,
            enum: ['new', 'contacted', 'converted', 'closed', 'spam'],
            default: 'new',
            index: true,
        },
        adminNote: { type: String, default: '' },

        // Assignment (any admin can pick it up)
        assignedTo: { type: Types.ObjectId, ref: 'User', default: null },
        assignedToName: { type: String, default: '' },

        // Where did it come from?
        source: { type: String, default: 'website' }, // website, whatsapp, phone, walk-in
        pageUrl: { type: String, default: '' },
        userAgent: { type: String, default: '' },
    },
    { timestamps: true }
);

inquirySchema.index({ createdAt: -1 });
inquirySchema.index({ service: 1, status: 1, createdAt: -1 });

export interface IInquiry extends Document {
    _id: Types.ObjectId;
    service: string;
    serviceLabel: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    extra: Record<string, unknown>;
    status: 'new' | 'contacted' | 'converted' | 'closed' | 'spam';
    adminNote: string;
    assignedTo: Types.ObjectId | null;
    assignedToName: string;
    source: string;
    pageUrl: string;
    userAgent: string;
    createdAt: Date;
    updatedAt: Date;
}

export const Inquiry = model<IInquiry>('Inquiry', inquirySchema);
