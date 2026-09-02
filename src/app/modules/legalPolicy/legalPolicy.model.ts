// ===================================================================
// Visalink Air - Legal Policy Model
// type-based documents: privacy / refund — প্রতিটির জন্য আলাদা document
// ===================================================================

import { Schema, model } from 'mongoose';
import { ILegalPolicy, LegalPolicyModel } from './legalPolicy.interface';

const bilingualSchema = new Schema(
    {
        en: { type: String, default: '' },
        bn: { type: String, default: '' },
    },
    { _id: false }
);

const legalPolicySchema = new Schema<ILegalPolicy, LegalPolicyModel>(
    {
        type: {
            type: String,
            required: true,
            unique: true,
            enum: ['privacy', 'refund'],
        },
        title: { type: bilingualSchema, default: () => ({}) },
        content: { type: bilingualSchema, default: () => ({}) },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// `type` is already indexed via `unique: true` above — no extra index needed.

export const LegalPolicy = model<ILegalPolicy, LegalPolicyModel>('LegalPolicy', legalPolicySchema);
