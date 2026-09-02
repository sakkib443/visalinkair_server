// ===================================================================
// Visalink Air — Remark
// One remark record per Inquiry. The first remark (date + message) is
// the primary follow-up; every subsequent conversation the admin has
// with the client is appended to `followUps` as { date, message }.
// The first remark can NOT be deleted individually — only the whole
// record can be removed, or a follow-up entry cleared. Both fields
// (date + message) are edit-able through PATCH.
// ===================================================================

import { Schema, model, Document, Types } from 'mongoose';

const followUpSchema = new Schema(
    {
        // When the admin plans to follow up again (or when this
        // follow-up conversation actually happened — the field is
        // used as a scheduled date, but the admin may back-fill it).
        date: { type: Date, required: true },
        message: { type: String, required: true, trim: true, maxlength: 4000 },
        createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const remarkSchema = new Schema(
    {
        // Which inquiry this remark is attached to. Unique — the admin
        // opens a single remark record per inquiry and keeps appending
        // follow-ups to it, rather than piling up sibling remarks.
        inquiryId: {
            type: Schema.Types.ObjectId,
            ref: 'Inquiry',
            required: true,
            unique: true,
            index: true,
        },

        // Denormalised so the remarks lists never have to join back to
        // the inquiries collection just to render a row.
        service: { type: String, required: true, lowercase: true, trim: true, index: true },
        inquiryDate: { type: Date, required: true },
        inquirySnapshot: {
            name: { type: String, default: '' },
            phone: { type: String, default: '' },
            email: { type: String, default: '' },
            subject: { type: String, default: '' },
        },

        // First / primary remark.
        nextRemarkDate: { type: Date, required: true, index: true },
        message: { type: String, required: true, trim: true, maxlength: 4000 },

        // Zero or more follow-ups appended over time.
        followUps: { type: [followUpSchema], default: [] },
    },
    { timestamps: true }
);

// Common list queries: by service, and by nextRemarkDate within a range.
remarkSchema.index({ service: 1, nextRemarkDate: -1 });
remarkSchema.index({ nextRemarkDate: 1 });

export interface IFollowUp {
    _id?: Types.ObjectId;
    date: Date;
    message: string;
    createdAt?: Date;
}

export interface IRemark extends Document {
    _id: Types.ObjectId;
    inquiryId: Types.ObjectId;
    service: string;
    inquiryDate: Date;
    inquirySnapshot: {
        name: string;
        phone: string;
        email: string;
        subject: string;
    };
    nextRemarkDate: Date;
    message: string;
    followUps: IFollowUp[];
    createdAt: Date;
    updatedAt: Date;
}

export const Remark = model<IRemark>('Remark', remarkSchema);
