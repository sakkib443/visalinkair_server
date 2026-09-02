// ===================================================================
// Visalink Air - Home Content Model
// Section-based documents: প্রতিটি সেকশনের জন্য আলাদা document
// ===================================================================

import { Schema, model } from 'mongoose';
import { IHomeContent, HomeContentModel } from './homeContent.interface';

const bilingualSchema = new Schema(
    {
        en: { type: String, default: '', trim: true },
        bn: { type: String, default: '', trim: true },
    },
    { _id: false }
);

const serviceItemSchema = new Schema(
    {
        title: { type: bilingualSchema, default: () => ({}) },
        subtitle: { type: bilingualSchema, default: () => ({}) },
        description: { type: bilingualSchema, default: () => ({}) },
        icon: { type: String, default: '' },
        image: { type: String, default: '' },
        color: { type: String, default: '#1D7EDD' },
        stats: { type: bilingualSchema, default: () => ({}) },
        href: { type: String, default: '/' },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { _id: false }
);

const partnerItemSchema = new Schema(
    {
        name: { type: String, default: '' },
        icon: { type: String, default: 'LuPlane' },
        // আসল লোগো ছবি। খালি থাকলে `icon` দিয়েই আগের মতো আঁকা হয়।
        image: { type: String, default: '' },
        color: { type: String, default: 'primary' },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const whyChooseCardSchema = new Schema(
    {
        title: { type: bilingualSchema, default: () => ({}) },
        description: { type: bilingualSchema, default: () => ({}) },
        icon: { type: String, default: '🎯' },
        color: { type: String, default: '#1D7EDD' },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const statItemSchema = new Schema(
    {
        value: { type: String, default: '' },
        label: { type: bilingualSchema, default: () => ({}) },
        color: { type: String, default: '#1D7EDD' },
        order: { type: Number, default: 0 },
    },
    { _id: false }
);

const homeContentSchema = new Schema<IHomeContent, HomeContentModel>(
    {
        section: {
            type: String,
            required: true,
            unique: true,
            enum: ['hero', 'services', 'partners', 'consultation', 'whyChooseUs'],
        },
        data: { type: Schema.Types.Mixed, required: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

// Index for fast lookups
homeContentSchema.index({ section: 1 });

export const HomeContent = model<IHomeContent, HomeContentModel>('HomeContent', homeContentSchema);
