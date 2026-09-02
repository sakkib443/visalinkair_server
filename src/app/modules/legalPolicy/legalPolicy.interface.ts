// ===================================================================
// Visalink Air - Legal Policy Interface
// Privacy Policy ও Refund & Cancellation Policy — admin dashboard থেকে manage হবে
// ===================================================================

import { Document, Model } from 'mongoose';

// Bilingual text helper
export interface IBilingualText {
    en: string;
    bn: string;
}

// Policy types
export type PolicyType = 'privacy' | 'refund';

// Main document
export interface ILegalPolicy extends Document {
    type: PolicyType;
    title: IBilingualText;
    content: IBilingualText;
    createdAt: Date;
    updatedAt: Date;
}

export type LegalPolicyModel = Model<ILegalPolicy>;
